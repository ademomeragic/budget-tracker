using Xunit;
using Moq;
using AutoMapper;
using System.Threading.Tasks;
using BudgetTracker.Infrastructure.Services;
using BudgetTracker.Application.Interfaces;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System;
using BudgetTracker.Infrastructure;

public class GoalServiceTests
{
    private readonly BudgetDbContext _context;
    private readonly Mock<IMapper> _mapperMock = new();
    private readonly Mock<INotificationService> _notificationServiceMock = new();

    public GoalServiceTests()
    {
        var options = new DbContextOptionsBuilder<BudgetDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new BudgetDbContext(options);
        _context.Database.EnsureCreated();
    }

    [Fact]
    public async Task CreateGoalAsync_Should_Add_Goal_And_Return_Dto()
    {
        // Arrange
        var userId = "user123";
        var goalCreateDto = new GoalCreateDto
        {
            Name = "Save for Laptop",
            CategoryId = 1,
            WalletId = 1,
            TargetAmount = 1000,
            Type = "income"
        };

        var goalEntity = new Goal { Id = 1, Name = goalCreateDto.Name, UserId = userId };
        var goalDto = new GoalDto { Id = 1, Name = goalCreateDto.Name };

        _mapperMock.Setup(m => m.Map<Goal>(goalCreateDto)).Returns(goalEntity);
        _mapperMock.Setup(m => m.Map<GoalDto>(goalEntity)).Returns(goalDto);

        var service = new GoalService(_context, _mapperMock.Object, _notificationServiceMock.Object);

        // Act
        var result = await service.CreateGoalAsync(userId, goalCreateDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Save for Laptop", result.Name);
        Assert.Single(_context.Goals);
    }

    [Fact]
    public async Task GetUserGoalsAsync_Should_Return_Correct_Goals()
    {
        // Arrange
        var userId = "testUser";
        var wallet = new Wallet { Id = 1, UserId = userId };
        var goal = new Goal
        {
            Id = 1,
            Name = "Test Goal",
            Wallet = wallet,
            WalletId = 1,
            CategoryId = 2,
            Type = "income",
            StartDate = DateTime.UtcNow.AddDays(-10),
            EndDate = DateTime.UtcNow.AddDays(10)
        };

        var category = new Category { Id = 2, Name = "Bonus" };
        _context.Wallets.Add(wallet);
        _context.Goals.Add(goal);
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        _context.Transactions.Add(new Transaction
        {
            WalletId = 1,
            CategoryId = 2,
            Type = "income",
            Amount = 200,
            Date = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();

        _mapperMock.Setup(m => m.Map<GoalDto>(It.IsAny<Goal>()))
                   .Returns((Goal g) => new GoalDto { Id = g.Id, Name = g.Name });

        var service = new GoalService(_context, _mapperMock.Object, _notificationServiceMock.Object);

        // Act
        var result = await service.GetUserGoalsAsync(userId);

        // Assert
        Assert.Single(result);
        Assert.Equal("Test Goal", result.First().Name);
    }

    [Fact]
    public async Task DeleteGoalAsync_Should_Remove_Existing_Goal()
    {
        // Arrange
        var userId = "u1";
        var goal = new Goal { Id = 1, UserId = userId };
        _context.Goals.Add(goal);
        await _context.SaveChangesAsync();

        var service = new GoalService(_context, _mapperMock.Object, _notificationServiceMock.Object);

        // Act
        var result = await service.DeleteGoalAsync(1, userId);

        // Assert
        Assert.True(result);
        Assert.Empty(_context.Goals);
    }

    [Fact]
    public async Task UpdateGoalAsync_Should_Modify_Goal_And_Return_Updated_Dto()
    {
        // Arrange
        var userId = "u2";
        var goal = new Goal { Id = 5, Name = "Old", UserId = userId };
        var dto = new GoalUpdateDto { Name = "New" };

        _context.Goals.Add(goal);
        await _context.SaveChangesAsync();

        _mapperMock.Setup(m => m.Map(dto, It.IsAny<Goal>()));
        _mapperMock.Setup(m => m.Map<GoalDto>(It.IsAny<Goal>())).Returns(new GoalDto { Name = "New" });

        var service = new GoalService(_context, _mapperMock.Object, _notificationServiceMock.Object);

        // Act
        var updated = await service.UpdateGoalAsync(5, userId, dto);

        // Assert
        Assert.Equal("New", updated.Name);
    }
}
