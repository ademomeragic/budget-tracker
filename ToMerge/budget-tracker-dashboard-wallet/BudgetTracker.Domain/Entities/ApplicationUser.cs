using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Identity;

namespace BudgetTracker.Domain.Entities
{
    public class ApplicationUser : IdentityUser
    {
        public int NotificationThreshold { get; set; } = 80; // default 80%

        public bool EnableDeadlineWarnings { get; set; } = true;
        public bool EnableNearLimitWarnings { get; set; } = true;
        public bool EnableExceededWarnings { get; set; } = true;
        public bool EnableIncomeCongrats { get; set; } = true;
    }
}

