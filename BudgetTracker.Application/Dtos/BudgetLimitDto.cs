using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BudgetTracker.Application.Dtos
{
    public class BudgetLimitDto
    {
        public int Id { get; set; }
        public string Category { get; set; } = string.Empty;
        public decimal LimitAmount { get; set; }
        public DateTime EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
    }
}
