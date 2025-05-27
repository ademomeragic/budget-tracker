using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BudgetTracker.Application.Dtos
{
    public class TransactionDto
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public int WalletId { get; set; }
        public string CurrencyCode { get; set; }  // Wallet currency
        public decimal? ConvertedAmount { get; set; }  // Converted to user’s preferred currency
        public string? ConvertedCurrencyCode { get; set; }
    }

}
