using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Application.Interfaces;
using BudgetTracker.Domain.Entities;
using BudgetTracker.Domain.Interfaces;

namespace BudgetTracker.Application.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly IMapper _mapper;

        public CategoryService(ICategoryRepository categoryRepository, IMapper mapper)
        {
            _categoryRepository = categoryRepository;
            _mapper = mapper;
        }

        public async Task<List<CategoryDto>> GetAllCategoriesAsync(string type, string userId)
        {
            var categories = await _categoryRepository.GetCategoriesByTypeAndUserAsync(type, userId);
            
            Console.WriteLine("Categories retrieved:");
            foreach (var c in categories)
            {
                Console.WriteLine($"{c.Name} ({c.Type}) - UserId: {c.UserId ?? "null"}");
            }

            return _mapper.Map<List<CategoryDto>>(categories);
        }

        public async Task<CategoryDto> CreateCategoryAsync(CategoryCreateDto dto, string userId)
        {
            var category = _mapper.Map<Category>(dto);
            category.UserId = userId;

            await _categoryRepository.AddCategoryAsync(category);
            return _mapper.Map<CategoryDto>(category);
        }
    }
}
