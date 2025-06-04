using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BudgetTracker.Application.Dtos
{
    public class RecurringTransactionDto
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public int WalletId { get; set; }
        public int CategoryId { get; set; }
        public DateTime NextRunDate { get; set; }
        public string Frequency { get; set; }
    }

}
