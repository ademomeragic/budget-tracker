using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Application.Interfaces;
using BudgetTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BudgetTracker.Infrastructure.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly BudgetDbContext _context;
        private readonly IMapper _mapper;

        public CategoryService(BudgetDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<CategoryDto>> GetAllCategoriesAsync(string type, string userId)
        {
            var categories = await _context.Categories
                .Where(c =>
                    (c.Type == type || c.Type == "both") &&
                    (c.UserId == userId || c.UserId == null)
                )
                .ToListAsync();
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

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return _mapper.Map<CategoryDto>(category);
        }

        public async Task<bool> DeleteCategoryAsync(int id, string userId)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

            if (category == null)
                return false;

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return true;
        }

    }
}
