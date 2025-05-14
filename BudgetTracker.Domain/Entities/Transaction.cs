using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BudgetTracker.Domain.Entities
{
    public class Transaction
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // "income" or "expense"
        public string Category { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public ApplicationUser? User { get; set; }
    }
}
