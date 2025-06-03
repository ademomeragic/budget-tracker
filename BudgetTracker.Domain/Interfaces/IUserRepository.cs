using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BudgetTracker.Domain.Entities;

namespace BudgetTracker.Domain.Interfaces
{
    public interface IUserRepository
    {
        Task<ApplicationUser?> GetByIdAsync(string userId);
        Task UpdateAsync(ApplicationUser user);
        Task<bool> SaveChangesAsync();

    }
}
