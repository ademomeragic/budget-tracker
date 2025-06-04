using BudgetTracker.Application.Interfaces;
using BudgetTracker.Infrastructure.Services;
using Microsoft.Extensions.Caching.Memory;
using Moq;
using Moq.Protected;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace BudgetTracker.Tests.Services
{
    public class ExchangeRateServiceTests
    {
        private IMemoryCache GetMemoryCache()
        {
            return new MemoryCache(new MemoryCacheOptions());
        }

        private HttpClient GetMockedHttpClient(decimal exchangeRate)
        {
            var responseJson = JsonSerializer.Serialize(new
            {
                result = "success",
                conversion_rates = new Dictionary<string, decimal>
                {
                    { "USD", exchangeRate },
                    { "EUR", 0.51m }
                }
            });

            var mockHandler = new Mock<HttpMessageHandler>();

            mockHandler.Protected()
                .Setup<Task<HttpResponseMessage>>("SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent(responseJson, Encoding.UTF8, "application/json")
                });

            return new HttpClient(mockHandler.Object);
        }

        [Fact]
        public async Task GetExchangeRateAsync_ReturnsCachedRate_IfPresent()
        {
            // Arrange
            var cache = GetMemoryCache();
            cache.Set("rate_USD", 1.75m);

            var service = new ExchangeRateService(cache);
            typeof(ExchangeRateService)
                .GetField("_httpClient", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)!
                .SetValue(service, new HttpClient()); // won't be used

            // Act
            var result = await service.GetExchangeRateAsync("USD");

            // Assert
            Assert.Equal(1.75m, result);
        }

        [Fact]
        public async Task GetExchangeRateAsync_FetchesAndCachesRate_IfNotInCache()
        {
            // Arrange
            var cache = GetMemoryCache();
            var httpClient = GetMockedHttpClient(1.65m);
            var service = new ExchangeRateService(cache);

            typeof(ExchangeRateService)
                .GetField("_httpClient", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)!
                .SetValue(service, httpClient);

            // Act
            var result = await service.GetExchangeRateAsync("USD");

            // Assert
            Assert.Equal(1.65m, result);

            // Confirm it's cached
            Assert.True(cache.TryGetValue("rate_USD", out decimal cached));
            Assert.Equal(1.65m, cached);
        }

        [Fact]
        public async Task GetExchangeRateAsync_Returns1ForBaseCurrency()
        {
            var service = new ExchangeRateService(GetMemoryCache());
            var result = await service.GetExchangeRateAsync("BAM");
            Assert.Equal(1m, result);
        }

        [Fact]
        public async Task GetExchangeRateAsync_ThrowsException_WhenCurrencyMissing()
        {
            var badResponse = JsonSerializer.Serialize(new
            {
                result = "success",
                conversion_rates = new Dictionary<string, decimal>() // no currencies
            });

            var handler = new Mock<HttpMessageHandler>();
            handler.Protected()
                .Setup<Task<HttpResponseMessage>>("SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent(badResponse, Encoding.UTF8, "application/json")
                });

            var client = new HttpClient(handler.Object);
            var service = new ExchangeRateService(GetMemoryCache());
            typeof(ExchangeRateService)
                .GetField("_httpClient", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)!
                .SetValue(service, client);

            await Assert.ThrowsAsync<Exception>(() =>
                service.GetExchangeRateAsync("XYZ")
            );
        }

        [Fact]
        public async Task GetExchangeRateAsync_ThrowsException_OnBadApiResponse()
        {
            var badJson = "{\"result\":\"error\"}";

            var handler = new Mock<HttpMessageHandler>();
            handler.Protected()
                .Setup<Task<HttpResponseMessage>>("SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent(badJson, Encoding.UTF8, "application/json")
                });

            var service = new ExchangeRateService(GetMemoryCache());
            typeof(ExchangeRateService)
                .GetField("_httpClient", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)!
                .SetValue(service, new HttpClient(handler.Object));

            await Assert.ThrowsAsync<Exception>(() =>
                service.GetExchangeRateAsync("USD")
            );
        }
    }
}
