using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using BudgetTracker.Application.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace BudgetTracker.Infrastructure.Services
{
    public class ExchangeRateService : IExchangeRateService
    {
        private readonly IMemoryCache _cache;
        private readonly HttpClient _httpClient;
        private const string BaseCurrency = "BAM";
        private const string ApiKey = "b1c1239022e6a3e8260feb60";

        public ExchangeRateService(IMemoryCache cache)
        {
            _cache = cache;
            _httpClient = new HttpClient();
        }

        public async Task<decimal> GetExchangeRateAsync(string targetCurrency)
        {
            if (targetCurrency.ToUpper() == BaseCurrency)
                return 1m;

            string cacheKey = $"rate_{targetCurrency.ToUpper()}";
            if (_cache.TryGetValue(cacheKey, out decimal cachedRate))
                return cachedRate;

            string url = $"https://v6.exchangerate-api.com/v6/{ApiKey}/latest/{BaseCurrency}";

            try
            {
                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);

                Console.WriteLine("💱 Exchange Rate API response:");
                Console.WriteLine(json);

                var root = doc.RootElement;

                if (root.GetProperty("result").GetString() != "success")
                    throw new Exception("Exchange API did not return success.");

                var rates = root.GetProperty("conversion_rates");

                if (!rates.TryGetProperty(targetCurrency.ToUpper(), out var rateElement))
                    throw new Exception($"Conversion failed: Currency '{targetCurrency}' not found in conversion_rates.");

                var rate = rateElement.GetDecimal();
                _cache.Set(cacheKey, rate, TimeSpan.FromHours(12));

                Console.WriteLine($"✅ Fetched exchange rate BAM → {targetCurrency.ToUpper()} = {rate}");
                return rate;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Exchange rate fetch failed: {ex.Message}");
                throw new Exception("Currency conversion failed.");
            }
        }
    }
}
