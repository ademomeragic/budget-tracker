using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Application.Interfaces;
using BudgetTracker.Domain.Entities;
using BudgetTracker.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace BudgetTracker.Application.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<CategoryService> _logger;

        public CategoryService(
            ICategoryRepository categoryRepository,
            IMapper mapper,
            ILogger<CategoryService> logger)
        {
            _categoryRepository = categoryRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<List<CategoryDto>> GetAllCategoriesAsync(string type, string userId)
        {
            try
            {
                var categories = await _categoryRepository.GetCategoriesByTypeAndUserAsync(type, userId);

                _logger.LogInformation("Retrieved {Count} categories for UserId={UserId}, Type={Type}", 
                    categories.Count, userId, type);

                return _mapper.Map<List<CategoryDto>>(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving categories for UserId={UserId}, Type={Type}", userId, type);
                throw;
            }
        }

        public async Task<CategoryDto> CreateCategoryAsync(CategoryCreateDto dto, string userId)
        {
            try
            {
                var category = _mapper.Map<Category>(dto);
                category.UserId = userId;

                await _categoryRepository.AddCategoryAsync(category);

                _logger.LogInformation("Created category '{CategoryName}' for UserId={UserId}", category.Name, userId);

                return _mapper.Map<CategoryDto>(category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating category for UserId={UserId}", userId);
                throw;
            }
        }
    }
}
