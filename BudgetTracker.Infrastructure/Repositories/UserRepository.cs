using System.Threading.Tasks;
using BudgetTracker.Domain.Entities;
using BudgetTracker.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BudgetTracker.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly BudgetDbContext _context;

        public UserRepository(BudgetDbContext context)
        {
            _context = context;
        }

        public async Task<ApplicationUser> GetByIdAsync(string userId)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId);
        }

        public async Task UpdateAsync(ApplicationUser user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> SaveChangesAsync()
        {
            return (await _context.SaveChangesAsync()) > 0;
        }

  
    }
}
