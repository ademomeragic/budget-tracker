using System.Text.Json;
using System.Text.Json.Serialization;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Application.Interfaces;
using BudgetTracker.Domain.Entities;
using BudgetTracker.Infrastructure;  // adjust namespace to your DbContext
using Microsoft.EntityFrameworkCore;

namespace BudgetTracker.Infrastructure.Services
{
    public class ExchangeRateService : IExchangeRateService
    {
        private readonly BudgetDbContext _context;
        private readonly HttpClient _httpClient;

        public ExchangeRateService(BudgetDbContext context, HttpClient httpClient)
        {
            _context = context;
            _httpClient = httpClient;
        }

public async Task UpdateExchangeRatesAsync(string baseCurrency = "BAM")
{
    var url = $"https://v6.exchangerate-api.com/v6/9289263f882e08e7fb118d9a/latest/{baseCurrency}";

    Console.WriteLine("Fetching from: " + url);

    var response = await _httpClient.GetAsync(url);

    if (!response.IsSuccessStatusCode)
    {
        // You can log warning here if you have a logger
        return;
    }

    var json = await response.Content.ReadAsStringAsync();
    var data = JsonSerializer.Deserialize<ExchangeRateApiResponse>(json);

    if (data == null || data.ConversionRates == null) return;

    foreach (var kvp in data.ConversionRates)
    {
        var existing = await _context.ExchangeRates
            .FirstOrDefaultAsync(e => e.BaseCurrency == baseCurrency && e.TargetCurrency == kvp.Key);

        if (existing == null)
        {
            _context.ExchangeRates.Add(new ExchangeRate
            {
                BaseCurrency = baseCurrency,
                TargetCurrency = kvp.Key,
                Rate = kvp.Value,
                LastUpdated = DateTime.UtcNow
            });
        }
        else
        {
            existing.Rate = kvp.Value;
            existing.LastUpdated = DateTime.UtcNow;
        }
    }

    await _context.SaveChangesAsync();
}


        public async Task<decimal?> ConvertCurrencyAsync(string fromCurrency, string toCurrency, decimal amount)
        {
            if (fromCurrency == toCurrency) return amount;

            var baseCurrency = "BAM"; // Your system's base currency

            decimal? fromRate = 1m;
            if (fromCurrency != baseCurrency)
            {
                var fromExchangeRate = await GetRateAsync(baseCurrency, fromCurrency);
                if (fromExchangeRate == null) return null;
                fromRate = fromExchangeRate.Rate;
            }

            decimal? toRate = 1m;
            if (toCurrency != baseCurrency)
            {
                var toExchangeRate = await GetRateAsync(baseCurrency, toCurrency);
                if (toExchangeRate == null) return null;
                toRate = toExchangeRate.Rate;
            }

            if (fromRate == null || toRate == null) return null;

            var amountInBase = amount / fromRate.Value;
            var convertedAmount = amountInBase * toRate.Value;

            return Math.Round(convertedAmount, 2);
        }

        public async Task<ExchangeRateDto?> GetRateAsync(string baseCurrency, string targetCurrency)
        {
            var rate = await _context.ExchangeRates
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.BaseCurrency == baseCurrency && e.TargetCurrency == targetCurrency);

            if (rate == null) return null;

            return new ExchangeRateDto
            {
                BaseCurrency = rate.BaseCurrency,
                TargetCurrency = rate.TargetCurrency,
                Rate = rate.Rate,
                LastUpdated = rate.LastUpdated
            };
        }

        public async Task<List<ExchangeRateDto>> GetAllRatesAsync(string baseCurrency)
        {
            var rates = await _context.ExchangeRates
                .Where(e => e.BaseCurrency == baseCurrency)
                .AsNoTracking()
                .ToListAsync();

            return rates.Select(r => new ExchangeRateDto
            {
                BaseCurrency = r.BaseCurrency,
                TargetCurrency = r.TargetCurrency,
                Rate = r.Rate,
                LastUpdated = r.LastUpdated
            }).ToList();
        }

        private class ExchangeRateApiResponse
    {
        [JsonPropertyName("result")]
        public string Result { get; set; } = string.Empty;

        [JsonPropertyName("base_code")]
        public string BaseCode { get; set; } = string.Empty;

        [JsonPropertyName("conversion_rates")]
        public Dictionary<string, decimal> ConversionRates { get; set; } = new();
    }
    }
}
