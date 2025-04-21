using Application.Dtos;
using Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface ICategoryService
    {
        Task<CategoryResponse> GetByIdAsync(int id);
        Task<IEnumerable<CategoryResponse>> GetAllAsync();
        Task<CategoryResponse> AddAsync(CreateCategoryRequest createCategoryRequest);
        Task UpdateAsync(UpdateCategoryRequest category);
        Task DeleteAsync(int id);
    }
}
