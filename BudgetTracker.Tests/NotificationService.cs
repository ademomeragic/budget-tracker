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
using BudgetTracker.Application.Interfaces;


public class NotificationServiceTests
{
    private readonly Mock<INotificationRepository> _notificationRepoMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly NotificationService _service;

    public NotificationServiceTests()
    {
        _notificationRepoMock = new Mock<INotificationRepository>();
        _mapperMock = new Mock<IMapper>();
        _service = new NotificationService(_notificationRepoMock.Object, _mapperMock.Object);
    }

    [Fact]
    public async Task CreateNotificationAsync_CallsAddNotificationWithCorrectData()
    {
        string userId = "user1";
        string message = "Test message";

        Notification capturedNotification = null;
        _notificationRepoMock
            .Setup(r => r.AddNotificationAsync(It.IsAny<Notification>()))
            .Callback<Notification>(n => capturedNotification = n)
            .Returns(Task.CompletedTask);

        await _service.CreateNotificationAsync(userId, message);

        Assert.NotNull(capturedNotification);
        Assert.Equal(userId, capturedNotification.UserId);
        Assert.Equal(message, capturedNotification.Message);
        Assert.False(capturedNotification.IsRead);
        Assert.True((DateTime.UtcNow - capturedNotification.CreatedAt).TotalSeconds < 5);
    }

    [Fact]
    public async Task GetUserNotificationsAsync_MapsAndReturnsNotificationDtos()
    {
        string userId = "user1";
        var notifications = new List<Notification>
        {
            new Notification { Id = 1, UserId = userId, Message = "Msg1", IsRead = false, CreatedAt = DateTime.UtcNow }
        };
        var notificationDtos = new List<NotificationDto>
        {
            new NotificationDto { Id = 1, Message = "Msg1", IsRead = false }
        };

        _notificationRepoMock.Setup(r => r.GetNotificationsByUserIdAsync(userId))
            .ReturnsAsync(notifications);

        _mapperMock.Setup(m => m.Map<List<NotificationDto>>(notifications))
            .Returns(notificationDtos);

        var result = await _service.GetUserNotificationsAsync(userId);

        Assert.Equal(notificationDtos, result);
    }

    [Fact]
    public async Task MarkAsReadAsync_UpdatesNotificationIfFound()
    {
        int notificationId = 1;
        var notification = new Notification { Id = notificationId, IsRead = false };

        _notificationRepoMock.Setup(r => r.GetNotificationByIdAsync(notificationId))
            .ReturnsAsync(notification);

        _notificationRepoMock.Setup(r => r.UpdateNotificationAsync(notification))
            .Returns(Task.CompletedTask);

        await _service.MarkAsReadAsync(notificationId);

        Assert.True(notification.IsRead);
        _notificationRepoMock.Verify(r => r.UpdateNotificationAsync(notification), Times.Once);
    }

    [Fact]
    public async Task MarkAsReadAsync_DoesNothingIfNotificationNotFound()
    {
        int notificationId = 1;

        _notificationRepoMock.Setup(r => r.GetNotificationByIdAsync(notificationId))
            .ReturnsAsync((Notification)null);

        await _service.MarkAsReadAsync(notificationId);

        _notificationRepoMock.Verify(r => r.UpdateNotificationAsync(It.IsAny<Notification>()), Times.Never);
    }

    [Fact]
    public async Task DeleteNotificationAsync_DeletesNotificationIfFound()
    {
        int notificationId = 1;
        var notification = new Notification { Id = notificationId };

        _notificationRepoMock.Setup(r => r.GetNotificationByIdAsync(notificationId))
            .ReturnsAsync(notification);

        _notificationRepoMock.Setup(r => r.DeleteNotificationAsync(notification))
            .Returns(Task.CompletedTask);

        await _service.DeleteNotificationAsync(notificationId);

        _notificationRepoMock.Verify(r => r.DeleteNotificationAsync(notification), Times.Once);
    }

    [Fact]
    public async Task DeleteNotificationAsync_DoesNothingIfNotificationNotFound()
    {
        int notificationId = 1;

        _notificationRepoMock.Setup(r => r.GetNotificationByIdAsync(notificationId))
            .ReturnsAsync((Notification)null);

        await _service.DeleteNotificationAsync(notificationId);

        _notificationRepoMock.Verify(r => r.DeleteNotificationAsync(It.IsAny<Notification>()), Times.Never);
    }
}
