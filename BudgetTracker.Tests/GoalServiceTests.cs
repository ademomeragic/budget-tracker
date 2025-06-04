using Xunit;
using Moq;
using AutoMapper;
using BudgetTracker.Application.Services;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Domain.Entities;
using BudgetTracker.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using BudgetTracker.Application.Interfaces;


public class GoalServiceTests
{
    private readonly Mock<IGoalRepository> _goalRepoMock;
    private readonly Mock<ITransactionRepository> _transactionRepoMock;
    private readonly Mock<ICategoryRepository> _categoryRepoMock;
    private readonly Mock<IUserRepository> _userRepoMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly Mock<INotificationService> _notificationServiceMock;

    private readonly GoalService _service;

    public GoalServiceTests()
    {
        _goalRepoMock = new Mock<IGoalRepository>();
        _transactionRepoMock = new Mock<ITransactionRepository>();
        _categoryRepoMock = new Mock<ICategoryRepository>();
        _userRepoMock = new Mock<IUserRepository>();
        _mapperMock = new Mock<IMapper>();
        _notificationServiceMock = new Mock<INotificationService>();

        _service = new GoalService(
            _goalRepoMock.Object,
            _transactionRepoMock.Object,
            _categoryRepoMock.Object,
            _userRepoMock.Object,
            _mapperMock.Object,
            _notificationServiceMock.Object);
    }

    [Fact]
    public async Task GetUserGoalsAsync_ReturnsMappedGoalDtos_WithCalculatedFields()
    {
        // Arrange
        string userId = "user1";
        var goals = new List<Goal>
        {
            new Goal { Id = 1, UserId = userId, CategoryId = 10, Type = "income", WalletId = 5, TargetAmount = 100, StartDate = DateTime.UtcNow.AddDays(-10), EndDate = DateTime.UtcNow.AddDays(5) }
        };

        _goalRepoMock.Setup(r => r.GetGoalsWithWalletByUserIdAsync(userId))
            .ReturnsAsync(goals);

        _transactionRepoMock.Setup(r => r.SumTransactionsAsync("income", 10, 5, It.IsAny<DateTime>(), It.IsAny<DateTime>()))
            .ReturnsAsync(90m);

        _categoryRepoMock.Setup(r => r.GetCategoryByIdAsync(10))
            .ReturnsAsync(new Category { Name = "Food" });

        _mapperMock.Setup(m => m.Map<GoalDto>(It.IsAny<Goal>()))
            .Returns<Goal>(goal => new GoalDto { Id = goal.Id, TargetAmount = goal.TargetAmount });

        // Act
        var result = await _service.GetUserGoalsAsync(userId);

        // Assert
        Assert.Single(result);
        var dto = result[0];
        Assert.Equal(90m, dto.CurrentAmount);
        Assert.Equal("Food", dto.CategoryName);
        Assert.False(dto.IsCrossed);
        Assert.True(dto.IsNearLimit); // 90 >= 80% of 100
        Assert.False(dto.IsSuccessful); // not crossed yet
    }

    [Fact]
    public async Task CreateGoalAsync_AddsGoal_AndChecksGoalStatus()
    {
        // Arrange
        string userId = "user1";
        var createDto = new GoalCreateDto { /* populate properties if needed */ };
        var goalEntity = new Goal { UserId = userId };

        _mapperMock.Setup(m => m.Map<Goal>(createDto)).Returns(goalEntity);
        _goalRepoMock.Setup(r => r.AddGoalAsync(goalEntity)).Returns(Task.CompletedTask);
        _mapperMock.Setup(m => m.Map<GoalDto>(goalEntity)).Returns(new GoalDto());

        _userRepoMock.Setup(u => u.GetByIdAsync(userId))
            .ReturnsAsync(new ApplicationUser());

        _goalRepoMock.Setup(g => g.GetActiveGoalsWithWalletByUserIdAsync(userId))
            .ReturnsAsync(new List<Goal>());

        // Act
        var result = await _service.CreateGoalAsync(userId, createDto);

        // Assert
        _goalRepoMock.Verify(r => r.AddGoalAsync(goalEntity), Times.Once);
        _notificationServiceMock.VerifyNoOtherCalls(); // No notifications since no goals
        Assert.NotNull(result);
    }

    [Fact]
    public async Task UpdateGoalAsync_ThrowsException_WhenGoalNotFound()
    {
        // Arrange
        int goalId = 1;
        string userId = "user1";
        var updateDto = new GoalUpdateDto();

        _goalRepoMock.Setup(r => r.GetGoalByIdAndUserAsync(goalId, userId))
            .ReturnsAsync((Goal)null);

        // Act & Assert
        await Assert.ThrowsAsync<Exception>(() => _service.UpdateGoalAsync(goalId, userId, updateDto));
    }

    [Fact]
    public async Task UpdateGoalAsync_UpdatesGoal_AndChecksGoalStatus()
    {
        // Arrange
        int goalId = 1;
        string userId = "user1";
        var updateDto = new GoalUpdateDto();
        var goal = new Goal { Id = goalId, UserId = userId };

        _goalRepoMock.Setup(r => r.GetGoalByIdAndUserAsync(goalId, userId))
            .ReturnsAsync(goal);

        _goalRepoMock.Setup(r => r.UpdateGoalAsync(goal)).Returns(Task.CompletedTask);

        _userRepoMock.Setup(u => u.GetByIdAsync(userId))
            .ReturnsAsync(new ApplicationUser());

        _goalRepoMock.Setup(g => g.GetActiveGoalsWithWalletByUserIdAsync(userId))
            .ReturnsAsync(new List<Goal>());

        // Act
        await _service.UpdateGoalAsync(goalId, userId, updateDto);

        // Assert
        _goalRepoMock.Verify(r => r.UpdateGoalAsync(goal), Times.Once);
    }

    [Fact]
    public async Task DeleteGoalAsync_DeletesGoal_AndChecksGoalStatus()
    {
        // Arrange
        int goalId = 1;
        string userId = "user1";

        _goalRepoMock.Setup(r => r.DeleteGoalAsync(goalId, userId))
            .ReturnsAsync(true);

        _userRepoMock.Setup(u => u.GetByIdAsync(userId))
            .ReturnsAsync(new ApplicationUser());

        _goalRepoMock.Setup(g => g.GetActiveGoalsWithWalletByUserIdAsync(userId))
            .ReturnsAsync(new List<Goal>());

        // Act
        var result = await _service.DeleteGoalAsync(goalId, userId);

        // Assert
        Assert.True(result);
        _goalRepoMock.Verify(r => r.DeleteGoalAsync(goalId, userId), Times.Once);
    }

    [Fact]
    public async Task CheckGoalStatusesAndTriggerNotifications_SendsNotificationsCorrectly()
    {
        // Arrange
        var userId = "user1";
        var now = DateTime.UtcNow;

        var goals = new List<Goal>
        {
            new Goal
            {
                UserId = userId,
                Name = "Goal1",
                Type = "income",
                TargetAmount = 100,
                EndDate = now.AddDays(2)
            }
        };

        var user = new ApplicationUser
        {
            Id = userId,
            NotificationThreshold = 80,
            EnableDeadlineWarnings = true,
            EnableNearLimitWarnings = true,
            EnableExceededWarnings = true,
            EnableIncomeCongrats = true
        };

        _goalRepoMock.Setup(r => r.GetActiveGoalsWithWalletAndEndDateAsync())
            .ReturnsAsync(goals);

        _userRepoMock.Setup(u => u.GetByIdAsync(userId))
            .ReturnsAsync(user);

        _transactionRepoMock.Setup(t => t.GetTransactionsForGoalProgressAsync(goals[0]))
            .ReturnsAsync(new List<Transaction> { new Transaction { Amount = 85m } });

        // Act
        await _service.CheckGoalStatusesAndTriggerNotifications();

        // Assert
        _notificationServiceMock.Verify(n => n.CreateNotificationAsync(userId, 
            It.Is<string>(msg => msg.Contains("nearing its deadline"))), Times.Once);

        _notificationServiceMock.Verify(n => n.CreateNotificationAsync(userId,
            It.Is<string>(msg => msg.Contains("over 80%"))), Times.Once);

        _notificationServiceMock.Verify(n => n.CreateNotificationAsync(userId,
            It.Is<string>(msg => msg.Contains("Congratulations"))), Times.Never); // progress < 1 for income here

        // Now test exceeded expense notification by modifying goal type and progress:
        goals[0].Type = "expense";
        _transactionRepoMock.Setup(t => t.GetTransactionsForGoalProgressAsync(goals[0]))
            .ReturnsAsync(new List<Transaction> { new Transaction { Amount = 105m } });

        await _service.CheckGoalStatusesAndTriggerNotifications();

        _notificationServiceMock.Verify(n => n.CreateNotificationAsync(userId,
            It.Is<string>(msg => msg.Contains("exceeded your expense goal"))), Times.Once);
    }
}
