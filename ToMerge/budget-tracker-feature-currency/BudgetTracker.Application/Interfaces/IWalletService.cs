using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BudgetTracker.Application.Dtos;

namespace BudgetTracker.Application.Interfaces
{
    public interface IWalletService
    {
        Task<List<WalletDto>> GetUserWalletsAsync(string userId);
        Task<WalletDto> CreateWalletAsync(string userId, WalletCreateDto dto);
        Task<WalletDto> UpdateWalletAsync(int id, string userId, WalletUpdateDto dto);
        Task<bool> DeleteWalletAsync(int id, string userId);
        Task<bool> TransferBetweenWalletsAsync(string userId, WalletTransferDto dto);
        Task<decimal> GetConvertedWalletBalanceAsync(int walletId, string targetCurrency, string userId);
        Task<WalletDto> GetWalletByIdAsync(int walletId, string userId);
        


    }
}

