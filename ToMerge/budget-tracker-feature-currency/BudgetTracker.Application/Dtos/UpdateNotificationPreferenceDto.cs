using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BudgetTracker.Application.Dtos
{
    public class UpdateNotificationPreferencesDto
    {
        public bool DeadlineWarnings { get; set; }
        public bool NearLimitWarnings { get; set; }
        public bool ExceededWarnings { get; set; }
        public bool IncomeCongratulations { get; set; }
    }

}
