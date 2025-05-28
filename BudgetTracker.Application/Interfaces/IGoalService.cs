using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BudgetTracker.Application.Dtos;

namespace BudgetTracker.Application.Interfaces
{
    public interface IGoalService
    {
        Task<List<GoalDto>> GetUserGoalsAsync(string userId);
        Task<GoalDto> CreateGoalAsync(string userId, GoalCreateDto dto);
        Task<GoalDto> UpdateGoalAsync(int id, string userId, GoalUpdateDto dto);
        Task<bool> DeleteGoalAsync(int id, string userId);
        Task CheckGoalStatusesAndTriggerNotifications();
        Task CheckGoalStatusForUser(string userId);

    }
}
