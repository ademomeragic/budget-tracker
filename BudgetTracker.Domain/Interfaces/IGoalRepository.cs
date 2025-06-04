using System.Collections.Generic;
using System.Threading.Tasks;
using BudgetTracker.Domain.Entities;

namespace BudgetTracker.Domain.Interfaces
{
    public interface IGoalRepository
    {
        Task<List<Goal>> GetGoalsWithWalletByUserIdAsync(string userId);
        Task<Goal> GetGoalByIdAndUserAsync(int id, string userId);
        Task AddGoalAsync(Goal goal);
        Task UpdateGoalAsync(Goal goal);
        Task<bool> DeleteGoalAsync(int id, string userId);
        Task<List<Goal>> GetActiveGoalsWithWalletAndEndDateAsync();
        Task<List<Goal>> GetActiveGoalsWithWalletByUserIdAsync(string userId);
        Task<bool> SaveChangesAsync();
    }
}
