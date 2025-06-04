using BudgetTracker.Application.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BudgetTracker.Application.Interfaces
{
    public interface IRecurringTransactionService
    {
        Task<List<RecurringTransactionDto>> GetUserRecurringAsync(string userId);
        Task AddRecurringAsync(string userId, RecurringTransactionDto dto);
        Task RunDueRecurringTransactionsAsync(string userId);
        Task UpdateRecurringAsync(string userId, int id, RecurringTransactionDto dto);
        Task DeleteRecurringAsync(string userId, int id);

    }

}
