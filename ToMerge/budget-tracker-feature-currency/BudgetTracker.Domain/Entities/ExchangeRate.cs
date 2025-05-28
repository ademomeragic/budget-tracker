using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BudgetTracker.Domain.Entities
{
    public class ExchangeRate
    {
        public int Id { get; set; }
        public string BaseCurrency { get; set; } = "BAM";   // The currency all rates are relative to
        public string TargetCurrency { get; set; } = string.Empty; // E.g. USD, EUR
        public decimal Rate { get; set; }                     // E.g. 1 USD = 1.79 BAM => Rate=1.79
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
}
