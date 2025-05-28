using BudgetTracker.Application.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BudgetTracker.Application.Interfaces
{
    interface IObjectiveService
    {
        Task<List<GoalDto>> GetUserGoalsAsync(string userId);
        Task<GoalDto> CreateGoalAsync(string userId, GoalCreateDto dto);
        Task<GoalDto> UpdateGoalAsync(int id, string userId, GoalUpdateDto dto);
        Task<bool> DeleteGoalAsync(int id, string userId);
    }
}
