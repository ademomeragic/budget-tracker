using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BudgetTracker.Domain.Entities
{
    public class FloatNote
    {
        public int Id { get; set; }
        public string UserId { get; set; }

        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? DisplayUntil { get; set; } // If null, always visible

        public string Color { get; set; } = "yellow"; // Can be yellow, red, blue, green etc.
        public bool IsPinned { get; set; } = true; // Optional toggle to keep visible

        public ApplicationUser User { get; set; } = null!;
    }
}