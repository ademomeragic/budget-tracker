using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BudgetTracker.Application.Dtos;

namespace BudgetTracker.Application.Interfaces
{
    public interface ICategoryService
    {
        Task<List<CategoryDto>> GetAllCategoriesAsync(string type, string userId);
        Task<CategoryDto> CreateCategoryAsync(CategoryCreateDto dto, string userId);
        Task<bool> DeleteCategoryAsync(int id, string userId);
    }
}

