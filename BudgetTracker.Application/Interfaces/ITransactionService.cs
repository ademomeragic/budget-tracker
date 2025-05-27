using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BudgetTracker.Application.Dtos;

namespace BudgetTracker.Application.Interfaces
{
    public interface ITransactionService
{
    Task<List<TransactionDto>> GetUserTransactionsAsync(string userId, int month, int year, string? targetCurrency = null);
    Task<TransactionDto> CreateTransactionAsync(string userId, TransactionDto dto);
    Task<TransactionDto> UpdateTransactionAsync(int id, string userId, TransactionDto dto);
    Task<List<TransactionDto>> GetWalletTransactionsAsync(int walletId, string userId, string? targetCurrency = null);
    Task<List<TransactionDto>> GetAllUserTransactionsAsync(string userId, string? targetCurrency = null);
    Task<bool> DeleteTransactionAsync(int id, string userId);
}

}

