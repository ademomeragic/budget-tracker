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
        public string UserId { get; set; } = string.Empty;
        public ApplicationUser? User { get; set; }
    }
}

