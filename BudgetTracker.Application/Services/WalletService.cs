using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Application.Interfaces;
using BudgetTracker.Domain.Entities;
using BudgetTracker.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace BudgetTracker.Application.Services
{
    public class WalletService : IWalletService
    {
        private readonly IWalletRepository _walletRepository;
        private readonly IMapper _mapper;
        private readonly ITransactionService _transactionService;
        private readonly ILogger<WalletService> _logger;

        public WalletService(
            IWalletRepository walletRepository,
            IMapper mapper,
            ITransactionService transactionService,
            ILogger<WalletService> logger)
        {
            _walletRepository = walletRepository;
            _mapper = mapper;
            _transactionService = transactionService;
            _logger = logger;
        }

        public async Task<List<WalletDto>> GetUserWalletsAsync(string userId)
        {
            _logger.LogInformation("Fetching wallets for user {UserId}", userId);
            var wallets = await _walletRepository.GetWalletsByUserAsync(userId);
            _logger.LogInformation("Found {Count} wallets for user {UserId}", wallets.Count, userId);
            return _mapper.Map<List<WalletDto>>(wallets);
        }

        public async Task<WalletDto> CreateWalletAsync(string userId, WalletCreateDto dto)
        {
            _logger.LogInformation("Creating wallet for user {UserId}", userId);
            var wallet = _mapper.Map<Wallet>(dto);
            wallet.UserId = userId;

            await _walletRepository.AddWalletAsync(wallet);
            _logger.LogInformation("Created wallet with ID {WalletId} for user {UserId}", wallet.Id, userId);

            return _mapper.Map<WalletDto>(wallet);
        }

        public async Task<WalletDto> UpdateWalletAsync(int id, string userId, WalletUpdateDto dto)
        {
            _logger.LogInformation("Updating wallet {WalletId} for user {UserId}", id, userId);
            var wallet = await _walletRepository.GetWalletByIdAsync(id, userId);
            if (wallet == null)
            {
                _logger.LogWarning("Wallet {WalletId} not found for user {UserId}", id, userId);
                throw new Exception("Wallet not found");
            }

            _mapper.Map(dto, wallet);
            await _walletRepository.UpdateWalletAsync(wallet);
            _logger.LogInformation("Updated wallet {WalletId} for user {UserId}", id, userId);

            return _mapper.Map<WalletDto>(wallet);
        }

        public async Task<bool> DeleteWalletAsync(int id, string userId)
        {
            _logger.LogInformation("Deleting wallet {WalletId} for user {UserId}", id, userId);
            var wallet = await _walletRepository.GetWalletByIdAsync(id, userId);
            if (wallet == null)
            {
                _logger.LogWarning("Wallet {WalletId} not found for user {UserId}", id, userId);
                return false;
            }

            await _walletRepository.DeleteWalletAsync(wallet);
            _logger.LogInformation("Deleted wallet {WalletId} for user {UserId}", id, userId);
            return true;
        }

        public async Task<bool> TransferBetweenWalletsAsync(string userId, WalletTransferDto dto)
        {
            _logger.LogInformation("Initiating transfer of {Amount} from wallet {FromWalletId} to wallet {ToWalletId} for user {UserId}",
                dto.Amount, dto.FromWalletId, dto.ToWalletId, userId);

            if (dto.FromWalletId == dto.ToWalletId)
            {
                _logger.LogWarning("Transfer attempt to the same wallet {WalletId} by user {UserId}", dto.FromWalletId, userId);
                throw new ArgumentException("Cannot transfer to the same wallet.");
            }

            var fromWallet = await _walletRepository.GetWalletByIdAsync(dto.FromWalletId, userId);
            var toWallet = await _walletRepository.GetWalletByIdAsync(dto.ToWalletId, userId);

            if (fromWallet == null || toWallet == null)
            {
                _logger.LogWarning("Wallet(s) not found or unauthorized for user {UserId}: FromWalletId={FromWalletId}, ToWalletId={ToWalletId}", 
                    userId, dto.FromWalletId, dto.ToWalletId);
                throw new Exception("Wallet(s) not found or do not belong to user.");
            }

            if (dto.Amount <= 0)
            {
                _logger.LogWarning("Invalid transfer amount {Amount} by user {UserId}", dto.Amount, userId);
                throw new ArgumentException("Transfer amount must be greater than zero.");
            }

            if (fromWallet.Balance < dto.Amount)
            {
                _logger.LogWarning("Insufficient funds in wallet {FromWalletId} for user {UserId}. Balance: {Balance}, Attempted transfer: {Amount}",
                    dto.FromWalletId, userId, fromWallet.Balance, dto.Amount);
                throw new InvalidOperationException("Insufficient funds.");
            }

            var expenseTransaction = new TransactionDto
            {
                Amount = dto.Amount,
                Date = DateTime.Now,
                Description = $"Transfer to {toWallet.Name}",
                Type = "expense",
                WalletId = fromWallet.Id,
                CategoryId = 999 // Default "Internal Transfer" category
            };

            var incomeTransaction = new TransactionDto
            {
                Amount = dto.Amount,
                Date = DateTime.Now,
                Description = $"Transfer from {fromWallet.Name}",
                Type = "income",
                WalletId = toWallet.Id,
                CategoryId = 999
            };

            await _transactionService.CreateTransactionAsync(userId, expenseTransaction);
            await _transactionService.CreateTransactionAsync(userId, incomeTransaction);

            _logger.LogInformation("Transfer completed: {Amount} from wallet {FromWalletId} to wallet {ToWalletId} for user {UserId}",
                dto.Amount, dto.FromWalletId, dto.ToWalletId, userId);

            return true;
        }
    }
}
