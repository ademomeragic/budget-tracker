using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BudgetTracker.Application.Dtos
{
    public class GoalCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public int? WalletId { get; set; }
        public decimal TargetAmount { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Type { get; set; } = "expense";

    }

}
