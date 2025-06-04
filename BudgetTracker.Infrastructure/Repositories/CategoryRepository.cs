using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BudgetTracker.Domain.Entities;
using BudgetTracker.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BudgetTracker.Infrastructure.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly BudgetDbContext _context;

        public CategoryRepository(BudgetDbContext context)
        {
            _context = context;
        }

        public async Task<Category> GetCategoryByIdAsync(int id)
        {
            return await _context.Categories.FindAsync(id);
        }

        public async Task<List<Category>> GetCategoriesByTypeAndUserAsync(string type, string userId)
        {
            return await _context.Categories
                .Where(c => c.Type == type && c.UserId == userId)
                .ToListAsync();
        }

        public async Task AddCategoryAsync(Category category)
        {
            await _context.Categories.AddAsync(category);
            await SaveChangesAsync();
        }

        public async Task<bool> SaveChangesAsync()
        {
            return (await _context.SaveChangesAsync()) > 0;
        }
    }
}
