using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace BudgetTracker.Application.Dtos
{
    public class CreateNotificationDto
    {
        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Message { get; set; } = string.Empty;
    }
}

