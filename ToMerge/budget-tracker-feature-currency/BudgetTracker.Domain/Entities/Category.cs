using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BudgetTracker.Domain.Entities
{
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // "income" or "expense"
        public string? UserId { get; set; }
        public ApplicationUser? User { get; set; }

        public ICollection<Transaction>? Transactions { get; set; }
    }
}

