using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BudgetTracker.Application.Interfaces
{
    public interface IExchangeRateService
    {
        Task<decimal> GetExchangeRateAsync(string targetCurrency);
    }
}
