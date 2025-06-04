using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BudgetTracker.Application.Dtos
{
    public class WalletUpdateDto
    {
        public string Name { get; set; } = string.Empty;
        public decimal Balance { get; set; }
        public string Type { get; set; } = "account";
    }
}

