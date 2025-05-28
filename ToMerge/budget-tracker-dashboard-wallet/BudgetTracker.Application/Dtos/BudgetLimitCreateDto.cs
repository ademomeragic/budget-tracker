using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace BudgetTracker.Application.Dtos
{
    public class BudgetLimitCreateDto
    {
        [Required]
        public string Category { get; set; } = string.Empty;

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal LimitAmount { get; set; }

        [Required]
        public DateTime EffectiveFrom { get; set; }

        public DateTime? EffectiveTo { get; set; }
    }
}
