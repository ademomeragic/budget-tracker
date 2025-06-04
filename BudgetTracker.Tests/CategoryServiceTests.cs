using Xunit;
using Moq;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.Linq;
using BudgetTracker.Application.Services;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Domain.Entities;
using BudgetTracker.Domain.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;
using BudgetTracker.Application.Interfaces;


public class CategoryServiceTests
{
    private readonly Mock<ICategoryRepository> _categoryRepoMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly CategoryService _service;

    public CategoryServiceTests()
    {
        _categoryRepoMock = new Mock<ICategoryRepository>();
        _mapperMock = new Mock<IMapper>();
        _service = new CategoryService(_categoryRepoMock.Object, _mapperMock.Object);
    }

    [Fact]
    public async Task GetAllCategoriesAsync_ReturnsMappedCategoryDtos()
    {
        // Arrange
        var type = "Expense";
        var userId = "user123";
        var categories = new List<Category>
        {
            new Category { Id = 1, Name = "Food", Type = type, UserId = userId },
            new Category { Id = 2, Name = "Transport", Type = type, UserId = userId }
        };
        var categoryDtos = new List<CategoryDto>
        {
            new CategoryDto { Id = 1, Name = "Food", Type = type },
            new CategoryDto { Id = 2, Name = "Transport", Type = type }
        };

        _categoryRepoMock
            .Setup(r => r.GetCategoriesByTypeAndUserAsync(type, userId))
            .ReturnsAsync(categories);

        _mapperMock
            .Setup(m => m.Map<List<CategoryDto>>(categories))
            .Returns(categoryDtos);

        // Act
        var result = await _service.GetAllCategoriesAsync(type, userId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(categoryDtos.Count, result.Count);
        Assert.Equal(categoryDtos[0].Name, result[0].Name);
        Assert.Equal(categoryDtos[1].Name, result[1].Name);
    }

    [Fact]
    public async Task CreateCategoryAsync_CreatesCategoryAndReturnsDto()
    {
        // Arrange
        var userId = "user123";
        var createDto = new CategoryCreateDto { Name = "Health", Type = "Expense" };
        var categoryEntity = new Category { Name = createDto.Name, Type = createDto.Type, UserId = userId };
        var categoryDto = new CategoryDto { Name = createDto.Name, Type = createDto.Type };

        _mapperMock
            .Setup(m => m.Map<Category>(createDto))
            .Returns(categoryEntity);

        _categoryRepoMock
            .Setup(r => r.AddCategoryAsync(It.Is<Category>(c => c.Name == createDto.Name && c.UserId == userId)))
            .Returns(Task.CompletedTask);

        _mapperMock
            .Setup(m => m.Map<CategoryDto>(categoryEntity))
            .Returns(categoryDto);

        // Act
        var result = await _service.CreateCategoryAsync(createDto, userId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(categoryDto.Name, result.Name);
        Assert.Equal(categoryDto.Type, result.Type);
    }
}
