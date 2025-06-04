using BudgetTracker.Application.Interfaces;
using BudgetTracker.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
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
    public class ChatGPTServiceTests
    {
        private readonly string _fakeApiKey = "sk-test-123456789";
        private readonly IConfiguration _config;

        public ChatGPTServiceTests()
        {
            var inMemorySettings = new Dictionary<string, string> {
                { "OpenAI:ApiKey", _fakeApiKey }
            };

            _config = new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings!)
                .Build();
        }

        private HttpClient GetMockedHttpClient(string fakeReply)
        {
            var mockHandler = new Mock<HttpMessageHandler>();

            var mockResponseJson = JsonSerializer.Serialize(new
            {
                choices = new[]
                {
                    new
                    {
                        message = new
                        {
                            content = fakeReply
                        }
                    }
                }
            });

            mockHandler.Protected()
                .Setup<Task<HttpResponseMessage>>("SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent(mockResponseJson, Encoding.UTF8, "application/json")
                });

            return new HttpClient(mockHandler.Object);
        }

        [Fact]
        public async Task GetChatReplyAsync_ReturnsExpectedMessage()
        {
            // Arrange
            string expectedReply = "Budget at least 20% of income for savings.";
            var httpClient = GetMockedHttpClient(expectedReply);

            var service = new ChatGPTService(_config)
            {
                // Can't do, will have to inject mock 
            };

            // Inject mock via private field using reflection
            typeof(ChatGPTService)
                .GetField("_httpClient", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)!
                .SetValue(service, httpClient);

            // Act
            var result = await service.GetChatReplyAsync("Give me budgeting tips.");

            // Assert
            Assert.NotNull(result);
            Assert.Contains("Budget", result);
        }

        [Fact]
        public async Task GetChatReplyAsync_ThrowsException_OnApiFailure()
        {
            // Arrange
            var handler = new Mock<HttpMessageHandler>();
            handler.Protected()
                .Setup<Task<HttpResponseMessage>>("SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.Unauthorized,
                    Content = new StringContent("Unauthorized")
                });

            var client = new HttpClient(handler.Object);

            var service = new ChatGPTService(_config);
            typeof(ChatGPTService)
                .GetField("_httpClient", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)!
                .SetValue(service, client);

            // Act & Assert
            await Assert.ThrowsAsync<HttpRequestException>(() =>
                service.GetChatReplyAsync("Any tips?")
            );
        }

        [Fact]
        public void Constructor_ThrowsException_WhenApiKeyIsMissing()
        {
            // Arrange
            var badConfig = new ConfigurationBuilder().Build();

            // Act & Assert
            var ex = Assert.Throws<ArgumentNullException>(() => new ChatGPTService(badConfig));
            Assert.Contains("OpenAI:ApiKey", ex.Message);
        }
    }
}
