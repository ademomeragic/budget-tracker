using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BudgetTracker.Domain.Entities;

namespace BudgetTracker.Domain.Interfaces
{
    public interface ICategoryRepository
    {
        Task<List<Category>> GetCategoriesByTypeAndUserAsync(string type, string userId);
        Task AddCategoryAsync(Category category);
        Task<bool> SaveChangesAsync();
        Task<Category> GetCategoryByIdAsync(int id);
    }
}
