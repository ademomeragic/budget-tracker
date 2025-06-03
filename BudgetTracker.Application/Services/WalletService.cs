using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Application.Interfaces;
using BudgetTracker.Domain.Entities;
using BudgetTracker.Domain.Interfaces;

namespace BudgetTracker.Application.Services
{
    public class WalletService : IWalletService
    {
        private readonly IWalletRepository _walletRepository;
        private readonly IMapper _mapper;
        private readonly ITransactionService _transactionService;

        public WalletService(
            IWalletRepository walletRepository,
            IMapper mapper,
            ITransactionService transactionService)
        {
            _walletRepository = walletRepository;
            _mapper = mapper;
            _transactionService = transactionService;
        }

        public async Task<List<WalletDto>> GetUserWalletsAsync(string userId)
        {
            var wallets = await _walletRepository.GetWalletsByUserAsync(userId);
            return _mapper.Map<List<WalletDto>>(wallets);
        }

        public async Task<WalletDto> CreateWalletAsync(string userId, WalletCreateDto dto)
        {
            var wallet = _mapper.Map<Wallet>(dto);
            wallet.UserId = userId;

            await _walletRepository.AddWalletAsync(wallet);
            return _mapper.Map<WalletDto>(wallet);
        }

        public async Task<WalletDto> UpdateWalletAsync(int id, string userId, WalletUpdateDto dto)
        {
            var wallet = await _walletRepository.GetWalletByIdAsync(id, userId);
            if (wallet == null) throw new Exception("Wallet not found");

            _mapper.Map(dto, wallet);
            await _walletRepository.UpdateWalletAsync(wallet);

            return _mapper.Map<WalletDto>(wallet);
        }

        public async Task<bool> DeleteWalletAsync(int id, string userId)
        {
            var wallet = await _walletRepository.GetWalletByIdAsync(id, userId);
            if (wallet == null) return false;

            await _walletRepository.DeleteWalletAsync(wallet);
            return true;
        }

        public async Task<bool> TransferBetweenWalletsAsync(string userId, WalletTransferDto dto)
        {
            if (dto.FromWalletId == dto.ToWalletId)
                throw new ArgumentException("Cannot transfer to the same wallet.");

            var fromWallet = await _walletRepository.GetWalletByIdAsync(dto.FromWalletId, userId);
            var toWallet = await _walletRepository.GetWalletByIdAsync(dto.ToWalletId, userId);

            if (fromWallet == null || toWallet == null)
                throw new Exception("Wallet(s) not found or do not belong to user.");

            if (dto.Amount <= 0)
                throw new ArgumentException("Transfer amount must be greater than zero.");

            if (fromWallet.Balance < dto.Amount)
                throw new InvalidOperationException("Insufficient funds.");

            // Create expense transaction for sender
            var expenseTransaction = new TransactionDto
            {
                Amount = dto.Amount,
                Date = DateTime.Now,
                Description = $"Transfer to {toWallet.Name}",
                Type = "expense",
                WalletId = fromWallet.Id,
                CategoryId = 999 // Default "Internal Transfer" category
            };

            // Create income transaction for receiver
            var incomeTransaction = new TransactionDto
            {
                Amount = dto.Amount,
                Date = DateTime.Now,
                Description = $"Transfer from {fromWallet.Name}",
                Type = "income",
                WalletId = toWallet.Id,
                CategoryId = 999 // Same default category
            };

            await _transactionService.CreateTransactionAsync(userId, expenseTransaction);
            await _transactionService.CreateTransactionAsync(userId, incomeTransaction);

            return true;
        }
    }
}
