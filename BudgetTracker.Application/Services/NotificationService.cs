using AutoMapper;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Application.Interfaces;
using BudgetTracker.Domain.Entities;
using BudgetTracker.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BudgetTracker.Application.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            INotificationRepository notificationRepository,
            IMapper mapper,
            ILogger<NotificationService> logger)
        {
            _notificationRepository = notificationRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task CreateNotificationAsync(string userId, string message)
        {
            try
            {
                _logger.LogInformation("Creating notification for user {UserId} with message: {Message}", userId, message);

                var notification = new Notification
                {
                    UserId = userId,
                    Message = message,
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false
                };

                await _notificationRepository.AddNotificationAsync(notification);
                _logger.LogInformation("Notification created successfully for user {UserId}", userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating notification for user {UserId}", userId);
                throw;
            }
        }

        public async Task<List<NotificationDto>> GetUserNotificationsAsync(string userId)
        {
            try
            {
                _logger.LogInformation("Fetching notifications for user {UserId}", userId);

                var notifications = await _notificationRepository.GetNotificationsByUserIdAsync(userId);
                var dtos = _mapper.Map<List<NotificationDto>>(notifications);

                _logger.LogInformation("Fetched {Count} notifications for user {UserId}", dtos.Count, userId);
                return dtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching notifications for user {UserId}", userId);
                throw;
            }
        }

        public async Task MarkAsReadAsync(int notificationId)
        {
            try
            {
                _logger.LogInformation("Marking notification {NotificationId} as read", notificationId);

                var notification = await _notificationRepository.GetNotificationByIdAsync(notificationId);
                if (notification != null)
                {
                    notification.IsRead = true;
                    await _notificationRepository.UpdateNotificationAsync(notification);
                    _logger.LogInformation("Notification {NotificationId} marked as read", notificationId);
                }
                else
                {
                    _logger.LogWarning("Notification {NotificationId} not found when marking as read", notificationId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking notification {NotificationId} as read", notificationId);
                throw;
            }
        }

        public async Task DeleteNotificationAsync(int notificationId)
        {
            try
            {
                _logger.LogInformation("Deleting notification {NotificationId}", notificationId);

                var notification = await _notificationRepository.GetNotificationByIdAsync(notificationId);
                if (notification != null)
                {
                    await _notificationRepository.DeleteNotificationAsync(notification);
                    _logger.LogInformation("Notification {NotificationId} deleted", notificationId);
                }
                else
                {
                    _logger.LogWarning("Notification {NotificationId} not found when deleting", notificationId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting notification {NotificationId}", notificationId);
                throw;
            }
        }
    }
}
