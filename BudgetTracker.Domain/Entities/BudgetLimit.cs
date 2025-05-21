using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace BudgetTracker.Domain.Entities
{
    public class BudgetLimit
    {
        public int Id { get; set; }
        public string? UserId { get; set; }

        [Required]
        public string Category { get; set; } = string.Empty;

        [Required]
        public decimal LimitAmount { get; set; }

        public DateTime EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
    }
}
