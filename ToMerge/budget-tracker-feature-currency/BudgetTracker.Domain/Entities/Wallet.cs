using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BudgetTracker.Domain.Entities
{
    public class Wallet
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Balance { get; set; }
        public string Type { get; set; } = "account"; // "account" or "savings"
        public string? UserId { get; set; }
        public ApplicationUser? User { get; set; }
        public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
        public string CurrencyCode { get; set; } = "BAM"; 

    }
}

