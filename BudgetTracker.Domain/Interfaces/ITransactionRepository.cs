using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BudgetTracker.Domain.Entities;

namespace BudgetTracker.Domain.Interfaces
{
    public interface ITransactionRepository
    {
        Task<List<Transaction>> GetTransactionsByUserAsync(string userId);
        Task<List<Transaction>> GetTransactionsByWalletAsync(int walletId, string userId);
        Task<Transaction> GetTransactionByIdAsync(int id, string userId);
        Task AddTransactionAsync(Transaction transaction);
        Task UpdateTransactionAsync(Transaction transaction);
        Task DeleteTransactionAsync(Transaction transaction);
        Task<Wallet> GetWalletByIdAsync(int walletId, string userId);
        Task UpdateWalletAsync(Wallet wallet);

        // For goal progress tracking
        Task<decimal> SumTransactionsAsync(string type, int? categoryId, int walletId, DateTime? start, DateTime? end);
        Task<List<Transaction>> GetTransactionsForGoalProgressAsync(Goal goal);
    }
}
