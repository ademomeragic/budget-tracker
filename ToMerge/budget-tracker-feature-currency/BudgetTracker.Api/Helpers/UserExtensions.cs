﻿using System.Security.Claims;

namespace BudgetTracker.Api.Helpers
{
    public static class UserExtensions
    {
        public static string GetUserId(this ClaimsPrincipal user)
        {
            return user.FindFirstValue(ClaimTypes.NameIdentifier);
        }
    }
}

