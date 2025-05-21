using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BudgetTracker.Application.Dtos
{
    public class FloatNoteCreateDto
    {
        public string Content { get; set; }
        public string Color { get; set; } // Optional: hex or named
        public DateTime Date { get; set; }
    }
}

