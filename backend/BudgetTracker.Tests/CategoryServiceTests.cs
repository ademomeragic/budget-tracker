using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Application.Interfaces;
using BudgetTracker.Domain.Entities;
using BudgetTracker.Infrastructure;
using BudgetTracker.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace BudgetTracker.Tests.Services
{
    public class CategoryServiceTests
    {
        private readonly BudgetDbContext _context;
        private readonly IMapper _mapper;
        private readonly CategoryService _service;

        public CategoryServiceTests()
        {
            var options = new DbContextOptionsBuilder<BudgetDbContext>()
                .UseInMemoryDatabase(databaseName: "CategoryServiceTestDb")
                .Options;

            _context = new BudgetDbContext(options);

            var config = new MapperConfiguration(cfg =>
            {
                cfg.CreateMap<Category, CategoryDto>();
                cfg.CreateMap<CategoryCreateDto, Category>();
            });

            _mapper = config.CreateMapper();
            _service = new CategoryService(_context, _mapper);

            SeedDatabase().GetAwaiter().GetResult();
        }

        private async Task SeedDatabase()
        {
            _context.Categories.RemoveRange(_context.Categories);
            await _context.SaveChangesAsync();

            _context.Categories.AddRange(new List<Category>
            {
                new Category { Name = "Groceries", Type = "expense", UserId = null },
                new Category { Name = "Freelancing", Type = "income", UserId = null },
                new Category { Name = "BothType", Type = "both", UserId = null },
                new Category { Name = "UserSpecificIncome", Type = "income", UserId = "user123" },
                new Category { Name = "UserSpecificExpense", Type = "expense", UserId = "user123" }
            });

            await _context.SaveChangesAsync();
        }

        [Fact]
        public async Task GetAllCategoriesAsync_ReturnsCorrectIncomeCategories()
        {
            var result = await _service.GetAllCategoriesAsync("income", "user123");

            Assert.NotNull(result);
            Assert.All(result, c => Assert.Contains(c.Type, new[] { "income", "both" }));
            Assert.True(result.Any(c => c.Name == "UserSpecificIncome"));
        }

        [Fact]
        public async Task GetAllCategoriesAsync_ReturnsCorrectExpenseCategories()
        {
            var result = await _service.GetAllCategoriesAsync("expense", "user123");

            Assert.NotNull(result);
            Assert.All(result, c => Assert.Contains(c.Type, new[] { "expense", "both" }));
            Assert.True(result.Any(c => c.Name == "UserSpecificExpense"));
        }

        [Fact]
        public async Task GetAllCategoriesAsync_ReturnsAllTypes_WhenBothIsPassed()
        {
            var result = await _service.GetAllCategoriesAsync("both", "user123");

            Assert.NotNull(result);
            Assert.True(result.Any(c => c.Type == "income"));
            Assert.True(result.Any(c => c.Type == "expense"));
            Assert.True(result.Any(c => c.Type == "both"));
        }

        [Fact]
        public async Task GetAllCategoriesAsync_ReturnsEmptyList_OnUnknownType()
        {
            var result = await _service.GetAllCategoriesAsync("invalid_type", "user123");

            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Fact]
        public async Task CreateCategoryAsync_AddsNewCategorySuccessfully()
        {
            var newCategoryDto = new CategoryCreateDto
            {
                Name = "Gym Membership",
                Type = "expense"
            };

            var created = await _service.CreateCategoryAsync(newCategoryDto, "user123");

            Assert.NotNull(created);
            Assert.Equal("Gym Membership", created.Name);

            var allCategories = await _context.Categories.ToListAsync();
            Assert.Contains(allCategories, c => c.Name == "Gym Membership" && c.UserId == "user123");
        }
    }
}
