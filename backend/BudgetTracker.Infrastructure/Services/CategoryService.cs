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
            IQueryable<Category> query;

            if (type == "income" || type == "expense")
            {
                query = _context.Categories
                    .Where(c =>
                        (c.Type == type || c.Type == "both") &&
                        (c.UserId == userId || c.UserId == null));
            }
            else if (type == "both")
            {
                query = _context.Categories
                    .Where(c =>
                        (c.Type == "income" || c.Type == "expense" || c.Type == "both") &&
                        (c.UserId == userId || c.UserId == null));
            }
            else
            {
                return new List<CategoryDto>(); // Or throw an exception for unknown type
            }

            var categories = await query.ToListAsync();

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
    }
}
