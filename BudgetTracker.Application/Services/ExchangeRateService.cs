using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using BudgetTracker.Application.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace BudgetTracker.Application.Services
{
    public class ExchangeRateService : IExchangeRateService
    {
        private readonly IMemoryCache _cache;
        private readonly HttpClient _httpClient;
        private readonly ILogger<ExchangeRateService> _logger;
        private const string BaseCurrency = "BAM";
        private const string ApiKey = "b1c1239022e6a3e8260feb60";

        public ExchangeRateService(IMemoryCache cache, ILogger<ExchangeRateService> logger)
        {
            _cache = cache;
            _logger = logger;
            _httpClient = new HttpClient();
        }

        public async Task<decimal> GetExchangeRateAsync(string targetCurrency)
        {
            if (targetCurrency.ToUpper() == BaseCurrency)
            {
                _logger.LogInformation("Requested exchange rate for base currency {BaseCurrency}, returning 1.", BaseCurrency);
                return 1m;
            }

            string cacheKey = $"rate_{targetCurrency.ToUpper()}";
            if (_cache.TryGetValue(cacheKey, out decimal cachedRate))
            {
                _logger.LogInformation("Cache hit for exchange rate {CacheKey}: {Rate}", cacheKey, cachedRate);
                return cachedRate;
            }

            string url = $"https://v6.exchangerate-api.com/v6/{ApiKey}/latest/{BaseCurrency}";

            try
            {
                _logger.LogInformation("Fetching exchange rate from API for target currency {TargetCurrency}", targetCurrency.ToUpper());
                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);

                _logger.LogDebug("Exchange Rate API response: {Response}", json);

                var root = doc.RootElement;

                if (root.GetProperty("result").GetString() != "success")
                {
                    _logger.LogError("Exchange API did not return success.");
                    throw new Exception("Exchange API did not return success.");
                }

                var rates = root.GetProperty("conversion_rates");

                if (!rates.TryGetProperty(targetCurrency.ToUpper(), out var rateElement))
                {
                    var message = $"Currency '{targetCurrency}' not found in conversion_rates.";
                    _logger.LogError(message);
                    throw new Exception(message);
                }

                var rate = rateElement.GetDecimal();
                _cache.Set(cacheKey, rate, TimeSpan.FromHours(12));

                _logger.LogInformation("Fetched exchange rate BAM → {TargetCurrency} = {Rate}", targetCurrency.ToUpper(), rate);
                return rate;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exchange rate fetch failed.");
                throw new Exception("Currency conversion failed.");
            }
        }
    }
}
