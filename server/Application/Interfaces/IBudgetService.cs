using Application.Dtos;
using Domain.Entities;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IBudgetService
    {
        Task<IEnumerable<BudgetResponse>> GetAllAsync();
        Task<Budget> GetByIdAsync(int id);
        
        // Accept CreateBudgetRequest as parameter
        Task<BudgetResponse> AddAsync(CreateBudgetRequest createBudgetRequest); 
        
        Task UpdateAsync(UpdateBudgetRequest request);
        
        Task DeleteAsync(int id);
        
        Task<decimal> CalculateRemainingBudget(int budgetId);
        
        Task<bool> IsNearBudgetLimit(int budgetId, decimal threshold);
    
    }
}
