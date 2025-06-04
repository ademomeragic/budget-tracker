using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BudgetTracker.Domain.Entities;

namespace BudgetTracker.Domain.Interfaces
{
    public interface IWalletRepository
    {
        Task<List<Wallet>> GetWalletsByUserAsync(string userId);
        Task<Wallet> GetWalletByIdAsync(int id, string userId);
        Task AddWalletAsync(Wallet wallet);
        Task UpdateWalletAsync(Wallet wallet);
        Task DeleteWalletAsync(Wallet wallet);
    }
}
