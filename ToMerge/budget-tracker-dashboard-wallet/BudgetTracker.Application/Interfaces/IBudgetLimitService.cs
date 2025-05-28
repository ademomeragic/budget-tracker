using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BudgetTracker.Application.Dtos;

namespace BudgetTracker.Application.Interfaces
{
    public interface IBudgetLimitService
    {
        Task<List<BudgetLimitDto>> GetAllLimitsAsync();
        Task<BudgetLimitDto?> GetLimitByIdAsync(int id);
        Task<IEnumerable<BudgetLimitDto>> GetLimitsByUserIdAsync(string userId);
        Task<BudgetLimitDto> CreateLimitAsync(BudgetLimitCreateDto dto, string UserId);
        Task<bool> UpdateLimitAsync(int id, BudgetLimitUpdateDto dto);
        Task<bool> DeleteLimitAsync(int id);
    }
}