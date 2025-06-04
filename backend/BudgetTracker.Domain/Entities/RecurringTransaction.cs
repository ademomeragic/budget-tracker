using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BudgetTracker.Domain.Entities
{
    public class RecurringTransaction
    {
        public int Id { get; set; }
        public string UserId { get; set; } = null!;

        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // "income" or "expense"

        public int WalletId { get; set; }
        public Wallet Wallet { get; set; } = null!;

        public int CategoryId { get; set; }
        public Category Category { get; set; } = null!;

        public DateTime NextRunDate { get; set; }
        public string Frequency { get; set; } = "Monthly"; // Enum-safe in the future
    }

}
