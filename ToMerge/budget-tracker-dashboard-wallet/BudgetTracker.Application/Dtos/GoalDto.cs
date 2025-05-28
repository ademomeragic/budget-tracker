using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BudgetTracker.Application.Dtos
{
    public class GoalDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = "";
        public int? WalletId { get; set; }
        public decimal TargetAmount { get; set; }
        public decimal CurrentAmount { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsActive { get; set; }
        public string Type { get; set; } = "expense";

        // For Notifications
        public bool IsNearDeadline { get; set; } = false;
        public bool IsNearLimit { get; set; } = false;
        public bool IsCrossed { get; set; } = false;
        public bool IsSuccessful { get; set; } = false;

    }

}
