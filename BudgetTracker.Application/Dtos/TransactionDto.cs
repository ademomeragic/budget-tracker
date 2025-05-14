using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BudgetTracker.Application.Dtos
{
    public class TransactionDto
    {
        public decimal Amount { get; set; }
        public string Date { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // "income" or "expense"
        public string Category { get; set; } = string.Empty;
    }
}
