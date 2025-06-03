using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BudgetTracker.Domain.Entities;

namespace BudgetTracker.Domain.Interfaces
{
    public interface INotificationRepository
    {
        Task AddNotificationAsync(Notification notification);
        Task<List<Notification>> GetNotificationsByUserIdAsync(string userId);
        Task<Notification> GetNotificationByIdAsync(int notificationId);
        Task UpdateNotificationAsync(Notification notification);
        Task DeleteNotificationAsync(Notification notification);
    }
}
