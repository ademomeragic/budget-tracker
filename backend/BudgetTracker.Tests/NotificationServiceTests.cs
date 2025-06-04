using Xunit;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Moq;
using AutoMapper;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Domain.Entities;
using BudgetTracker.Infrastructure.Services;
using System.Linq;
using BudgetTracker.Infrastructure;

public class NotificationServiceTests
{
    private BudgetDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<BudgetDbContext>()
            .UseInMemoryDatabase(databaseName: System.Guid.NewGuid().ToString())
            .Options;

        return new BudgetDbContext(options);
    }

    [Fact]
    public async Task CreateNotificationAsync_AddsNotification()
    {
        // Arrange
        var dbContext = GetDbContext();
        var mapper = new Mock<IMapper>();
        var service = new NotificationService(dbContext, mapper.Object);

        // Act
        await service.CreateNotificationAsync("user123", "Test message");

        // Assert
        var notification = await dbContext.Notifications.FirstOrDefaultAsync();
        Assert.NotNull(notification);
        Assert.Equal("user123", notification.UserId);
        Assert.Equal("Test message", notification.Message);
        Assert.False(notification.IsRead);
    }

    [Fact]
    public async Task GetUserNotificationsAsync_ReturnsMappedNotifications()
    {
        // Arrange
        var dbContext = GetDbContext();
        var mapper = new Mock<IMapper>();
        dbContext.Notifications.AddRange(new List<Notification>
        {
            new Notification { UserId = "user123", Message = "One", CreatedAt = System.DateTime.UtcNow },
            new Notification { UserId = "user123", Message = "Two", CreatedAt = System.DateTime.UtcNow.AddMinutes(-1) }
        });
        await dbContext.SaveChangesAsync();

        mapper.Setup(m => m.Map<List<NotificationDto>>(It.IsAny<List<Notification>>()))
              .Returns((List<Notification> source) =>
                  source.Select(n => new NotificationDto
                  {
                      Id = n.Id,
                      Message = n.Message,
                      IsRead = n.IsRead,
                      CreatedAt = n.CreatedAt
                  }).ToList());

        var service = new NotificationService(dbContext, mapper.Object);

        // Act
        var result = await service.GetUserNotificationsAsync("user123");

        // Assert
        Assert.Equal(2, result.Count);
        Assert.Contains(result, r => r.Message == "One");
        Assert.Contains(result, r => r.Message == "Two");
    }

    [Fact]
    public async Task MarkAsReadAsync_MarksNotificationAsRead()
    {
        // Arrange
        var dbContext = GetDbContext();
        var notification = new Notification
        {
            UserId = "user123",
            Message = "Unread",
            IsRead = false
        };
        dbContext.Notifications.Add(notification);
        await dbContext.SaveChangesAsync();

        var service = new NotificationService(dbContext, new Mock<IMapper>().Object);

        // Act
        await service.MarkAsReadAsync(notification.Id);

        // Assert
        var updated = await dbContext.Notifications.FindAsync(notification.Id);
        Assert.True(updated.IsRead);
    }

    [Fact]
    public async Task DeleteNotificationAsync_RemovesNotification()
    {
        // Arrange
        var dbContext = GetDbContext();
        var notification = new Notification
        {
            UserId = "user123",
            Message = "To be deleted"
        };
        dbContext.Notifications.Add(notification);
        await dbContext.SaveChangesAsync();

        var service = new NotificationService(dbContext, new Mock<IMapper>().Object);

        // Act
        await service.DeleteNotificationAsync(notification.Id);

        // Assert
        var deleted = await dbContext.Notifications.FindAsync(notification.Id);
        Assert.Null(deleted);
    }
}
