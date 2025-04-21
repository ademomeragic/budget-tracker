using Application.Interfaces;
using Application.Dtos;  // Add the namespace for your DTOs
using AutoMapper;
using Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly IRepository<Category> _categoryRepository;
        private readonly IMapper _mapper; // Add AutoMapper to the service

        public CategoryService(IRepository<Category> categoryRepository, IMapper mapper)
        {
            _categoryRepository = categoryRepository;
            _mapper = mapper;
        }

        // Get a category by ID and return as DTO
        public async Task<CategoryResponse> GetByIdAsync(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null) return null;

            // Use AutoMapper to map Category to CategoryResponseDTO
            return _mapper.Map<CategoryResponse>(category);
        }

        // Get all categories and return as a list of DTOs
        public async Task<IEnumerable<CategoryResponse>> GetAllAsync()
        {
            var categories = await _categoryRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<CategoryResponse>>(categories);
        }

public async Task<CategoryResponse> AddAsync(CreateCategoryRequest createCategoryRequest)
{
    // Map CreateCategoryRequest to Category entity
    var category = _mapper.Map<Category>(createCategoryRequest);

    // Add the category to the repository
    await _categoryRepository.AddAsync(category);

    // Commit the changes to the database
    await _categoryRepository.SaveChangesAsync();

    // Re-fetch the category from the database to ensure the Id is populated
    var createdCategory = await _categoryRepository.GetByIdAsync(category.Id);

    // If the category is still null or the ID is not populated, debug the database insertion
    if (createdCategory == null)
    {
        throw new Exception("Category creation failed. Could not fetch the created category.");
    }

    // Map the created category to CategoryResponse and return it
    return _mapper.Map<CategoryResponse>(createdCategory);
}



        // Update an existing category (from UpdateCategoryDTO)
        public async Task UpdateAsync(UpdateCategoryRequest updateCategory)
        {
            var category = await _categoryRepository.GetByIdAsync(updateCategory.Id);
            if (category == null) throw new Exception("Category not found.");

            // Map UpdateCategoryDTO to Category entity
            _mapper.Map(updateCategory, category);
            await _categoryRepository.UpdateAsync(category);
            await _categoryRepository.SaveChangesAsync();
        }

        // Delete a category by ID
        public async Task DeleteAsync(int id)
        {
            await _categoryRepository.DeleteAsync(id);
            await _categoryRepository.SaveChangesAsync();
        }
    }
}
