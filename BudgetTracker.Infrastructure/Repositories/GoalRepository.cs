using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BudgetTracker.Domain.Entities;
using BudgetTracker.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BudgetTracker.Infrastructure.Repositories
{
    public class GoalRepository : IGoalRepository
    {
        private readonly BudgetDbContext _context;

        public GoalRepository(BudgetDbContext context)
        {
            _context = context;
        }

        public async Task<List<Goal>> GetGoalsWithWalletByUserIdAsync(string userId)
        {
            return await _context.Goals
                .Include(g => g.Wallet)
                .Where(g => g.UserId == userId)
                .ToListAsync();
        }

        public async Task<Goal> GetGoalByIdAndUserAsync(int id, string userId)
        {
            return await _context.Goals
                .FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId);
        }

        public async Task AddGoalAsync(Goal goal)
        {
            await _context.Goals.AddAsync(goal);
            await SaveChangesAsync();
        }

        public async Task UpdateGoalAsync(Goal goal)
        {
            _context.Goals.Update(goal);
            await SaveChangesAsync();
        }

        public async Task<bool> DeleteGoalAsync(int id, string userId)
        {
            var goal = await _context.Goals.FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId);
            if (goal == null)
                return false;

            _context.Goals.Remove(goal);
            return await SaveChangesAsync();
        }

        public async Task<List<Goal>> GetActiveGoalsWithWalletAndEndDateAsync()
        {
            return await _context.Goals
                .Include(g => g.Wallet)
                .Where(g => g.EndDate != null)
                .ToListAsync();
        }

        public async Task<List<Goal>> GetActiveGoalsWithWalletByUserIdAsync(string userId)
        {
            return await _context.Goals
                .Include(g => g.Wallet)
                .Where(g => g.UserId == userId && g.EndDate != null)
                .ToListAsync();
        }

        public async Task<bool> SaveChangesAsync()
        {
            return (await _context.SaveChangesAsync()) > 0;
        }
    }
}
