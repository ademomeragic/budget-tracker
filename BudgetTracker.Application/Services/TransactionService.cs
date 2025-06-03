using AutoMapper;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Application.Interfaces;
using BudgetTracker.Domain.Entities;
using BudgetTracker.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BudgetTracker.Application.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly ITransactionRepository _transactionRepository;
        private readonly IMapper _mapper;
        private readonly IGoalService _goalService;
        private readonly ILogger<TransactionService> _logger;

        public TransactionService(
            ITransactionRepository transactionRepository, 
            IMapper mapper, 
            IGoalService goalService,
            ILogger<TransactionService> logger)
        {
            _transactionRepository = transactionRepository;
            _mapper = mapper;
            _goalService = goalService;
            _logger = logger;
        }

        public async Task<List<TransactionDto>> GetUserTransactionsAsync(string userId, int month, int year)
        {
            _logger.LogInformation("Fetching transactions for user {UserId} for {Month}/{Year}", userId, month, year);
            var userTransactions = await _transactionRepository.GetTransactionsByUserAsync(userId);
            var filtered = userTransactions
                .Where(t => t.Date.Month == month && t.Date.Year == year)
                .OrderByDescending(t => t.Date)
                .ToList();

            _logger.LogInformation("Found {Count} transactions for user {UserId} in {Month}/{Year}", filtered.Count, userId, month, year);
            return _mapper.Map<List<TransactionDto>>(filtered);
        }

        public async Task<List<TransactionDto>> GetWalletTransactionsAsync(int walletId, string userId)
        {
            _logger.LogInformation("Fetching transactions for wallet {WalletId} and user {UserId}", walletId, userId);
            var transactions = await _transactionRepository.GetTransactionsByWalletAsync(walletId, userId);
            var ordered = transactions.OrderByDescending(t => t.Date).ToList();
            _logger.LogInformation("Found {Count} transactions for wallet {WalletId}", ordered.Count, walletId);
            return _mapper.Map<List<TransactionDto>>(ordered);
        }

        public async Task<List<TransactionDto>> GetAllUserTransactionsAsync(string userId)
        {
            _logger.LogInformation("Fetching all transactions for user {UserId}", userId);
            var transactions = await _transactionRepository.GetTransactionsByUserAsync(userId);
            var ordered = transactions.OrderByDescending(t => t.Date).ToList();
            _logger.LogInformation("Found {Count} total transactions for user {UserId}", ordered.Count, userId);
            return _mapper.Map<List<TransactionDto>>(ordered);
        }

        public async Task<TransactionDto> CreateTransactionAsync(string userId, TransactionDto dto)
        {
            _logger.LogInformation("Creating new transaction for user {UserId}", userId);
            var transaction = _mapper.Map<Transaction>(dto);

            var wallet = await _transactionRepository.GetWalletByIdAsync(transaction.WalletId, userId);
            if (wallet == null)
            {
                _logger.LogWarning("Wallet {WalletId} not found or unauthorized for user {UserId}", transaction.WalletId, userId);
                throw new Exception("Wallet not found or unauthorized");
            }

            if (transaction.Type == "income")
            {
                wallet.Balance += transaction.Amount;
                _logger.LogInformation("Income transaction: added {Amount} to wallet {WalletId}. New balance: {Balance}", transaction.Amount, wallet.Id, wallet.Balance);
            }
            else if (transaction.Type == "expense")
            {
                wallet.Balance -= transaction.Amount;
                _logger.LogInformation("Expense transaction: subtracted {Amount} from wallet {WalletId}. New balance: {Balance}", transaction.Amount, wallet.Id, wallet.Balance);
            }

            await _transactionRepository.AddTransactionAsync(transaction);
            await _transactionRepository.UpdateWalletAsync(wallet);

            _logger.LogInformation("Transaction created with ID {TransactionId}", transaction.Id);

            await _goalService.CheckGoalStatusForUser(userId);

            return _mapper.Map<TransactionDto>(transaction);
        }

        public async Task<TransactionDto> UpdateTransactionAsync(int id, string userId, TransactionDto dto)
        {
            _logger.LogInformation("Updating transaction {TransactionId} for user {UserId}", id, userId);

            var oldTransaction = await _transactionRepository.GetTransactionByIdAsync(id, userId);
            if (oldTransaction == null)
            {
                _logger.LogWarning("Transaction {TransactionId} not found for user {UserId}", id, userId);
                throw new Exception("Transaction not found");
            }

            var wallet = await _transactionRepository.GetWalletByIdAsync(oldTransaction.WalletId, userId);
            if (wallet == null)
            {
                _logger.LogWarning("Wallet {WalletId} not found or unauthorized for user {UserId}", oldTransaction.WalletId, userId);
                throw new Exception("Wallet not found or unauthorized");
            }

            // Revert old transaction effect on wallet balance
            if (oldTransaction.Type == "income")
            {
                wallet.Balance -= oldTransaction.Amount;
                _logger.LogInformation("Reverting old income transaction: subtracted {Amount} from wallet {WalletId}. New balance: {Balance}", oldTransaction.Amount, wallet.Id, wallet.Balance);
            }
            else if (oldTransaction.Type == "expense")
            {
                wallet.Balance += oldTransaction.Amount;
                _logger.LogInformation("Reverting old expense transaction: added {Amount} to wallet {WalletId}. New balance: {Balance}", oldTransaction.Amount, wallet.Id, wallet.Balance);
            }

            _mapper.Map(dto, oldTransaction);

            // Apply new transaction effect on wallet balance
            if (oldTransaction.Type == "income")
            {
                wallet.Balance += oldTransaction.Amount;
                _logger.LogInformation("Applying new income transaction: added {Amount} to wallet {WalletId}. New balance: {Balance}", oldTransaction.Amount, wallet.Id, wallet.Balance);
            }
            else if (oldTransaction.Type == "expense")
            {
                wallet.Balance -= oldTransaction.Amount;
                _logger.LogInformation("Applying new expense transaction: subtracted {Amount} from wallet {WalletId}. New balance: {Balance}", oldTransaction.Amount, wallet.Id, wallet.Balance);
            }

            await _transactionRepository.UpdateTransactionAsync(oldTransaction);
            await _transactionRepository.UpdateWalletAsync(wallet);

            _logger.LogInformation("Transaction {TransactionId} updated", oldTransaction.Id);

            await _goalService.CheckGoalStatusForUser(userId);

            return _mapper.Map<TransactionDto>(oldTransaction);
        }

        public async Task<bool> DeleteTransactionAsync(int id, string userId)
        {
            _logger.LogInformation("Deleting transaction {TransactionId} for user {UserId}", id, userId);

            var transaction = await _transactionRepository.GetTransactionByIdAsync(id, userId);
            if (transaction == null)
            {
                _logger.LogWarning("Transaction {TransactionId} not found for user {UserId}", id, userId);
                return false;
            }

            var wallet = await _transactionRepository.GetWalletByIdAsync(transaction.WalletId, userId);
            if (wallet == null)
            {
                _logger.LogWarning("Wallet {WalletId} not found or unauthorized for user {UserId}", transaction.WalletId, userId);
                throw new Exception("Wallet not found or unauthorized");
            }

            if (transaction.Type == "income")
            {
                wallet.Balance -= transaction.Amount;
                _logger.LogInformation("Reverting income transaction: subtracted {Amount} from wallet {WalletId}. New balance: {Balance}", transaction.Amount, wallet.Id, wallet.Balance);
            }
            else if (transaction.Type == "expense")
            {
                wallet.Balance += transaction.Amount;
                _logger.LogInformation("Reverting expense transaction: added {Amount} to wallet {WalletId}. New balance: {Balance}", transaction.Amount, wallet.Id, wallet.Balance);
            }

            await _transactionRepository.DeleteTransactionAsync(transaction);
            await _transactionRepository.UpdateWalletAsync(wallet);

            _logger.LogInformation("Transaction {TransactionId} deleted", transaction.Id);

            await _goalService.CheckGoalStatusForUser(userId);

            return true;
        }
    }
}
