using BudgetTracker.Application.Dtos;
using BudgetTracker.Domain.Entities;
using BudgetTracker.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace BudgetTracker.Application.Services;

public interface ICurrencyConversionService
{
    Task<decimal?> ConvertAsync(string fromCurrency, string toCurrency, decimal amount);
}

public class CurrencyConversionService : ICurrencyConversionService
{
    private readonly BudgetDbContext _context;

    public CurrencyConversionService(BudgetDbContext context)
    {
        _context = context;
    }

    public async Task<decimal?> ConvertAsync(string fromCurrency, string toCurrency, decimal amount)
    {
        if (fromCurrency == toCurrency)
            return amount;

        var baseCurrency = "BAM"; // or make configurable later

        // Convert from fromCurrency to baseCurrency
        var fromRate = fromCurrency == baseCurrency
            ? 1
            : await _context.ExchangeRates
                .Where(e => e.BaseCurrency == baseCurrency && e.TargetCurrency == fromCurrency)
                .Select(e => (decimal?)e.Rate)
                .FirstOrDefaultAsync();

        var toRate = toCurrency == baseCurrency
            ? 1
            : await _context.ExchangeRates
                .Where(e => e.BaseCurrency == baseCurrency && e.TargetCurrency == toCurrency)
                .Select(e => (decimal?)e.Rate)
                .FirstOrDefaultAsync();

        if (fromRate == null || toRate == null)
            return null;

        decimal amountInBase = amount / fromRate.Value;
        decimal converted = amountInBase * toRate.Value;

        return Math.Round(converted, 2);
    }
}
