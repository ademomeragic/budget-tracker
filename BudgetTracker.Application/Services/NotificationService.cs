using AutoMapper;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Application.Interfaces;
using BudgetTracker.Domain.Entities;
using BudgetTracker.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BudgetTracker.Application.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly IMapper _mapper;

        public NotificationService(INotificationRepository notificationRepository, IMapper mapper)
        {
            _notificationRepository = notificationRepository;
            _mapper = mapper;
        }

        public async Task CreateNotificationAsync(string userId, string message)
        {
            var notification = new Notification
            {
                UserId = userId,
                Message = message,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };

            await _notificationRepository.AddNotificationAsync(notification);
        }

        public async Task<List<NotificationDto>> GetUserNotificationsAsync(string userId)
        {
            var notifications = await _notificationRepository.GetNotificationsByUserIdAsync(userId);
            return _mapper.Map<List<NotificationDto>>(notifications);
        }

        public async Task MarkAsReadAsync(int notificationId)
        {
            var notification = await _notificationRepository.GetNotificationByIdAsync(notificationId);
            if (notification != null)
            {
                notification.IsRead = true;
                await _notificationRepository.UpdateNotificationAsync(notification);
            }
        }

        public async Task DeleteNotificationAsync(int notificationId)
        {
            var notification = await _notificationRepository.GetNotificationByIdAsync(notificationId);
            if (notification != null)
            {
                await _notificationRepository.DeleteNotificationAsync(notification);
            }
        }
    }
}
