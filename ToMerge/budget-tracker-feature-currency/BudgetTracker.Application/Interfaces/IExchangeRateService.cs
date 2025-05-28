using System.Collections.Generic;
using System.Threading.Tasks;
using BudgetTracker.Application.Dtos;

namespace BudgetTracker.Application.Interfaces
{
    public interface IExchangeRateService
    {
        Task UpdateExchangeRatesAsync(string baseCurrency = "BAM");
        Task<decimal?> ConvertCurrencyAsync(string fromCurrency, string toCurrency, decimal amount);
        Task<ExchangeRateDto?> GetRateAsync(string baseCurrency, string targetCurrency);
        Task<List<ExchangeRateDto>> GetAllRatesAsync(string baseCurrency);
    }
}
