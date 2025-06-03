using AutoMapper;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Application.Interfaces;
using BudgetTracker.Domain.Entities;
using BudgetTracker.Domain.Interfaces;
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

        public TransactionService(
            ITransactionRepository transactionRepository, 
            IMapper mapper, 
            IGoalService goalService)
        {
            _transactionRepository = transactionRepository;
            _mapper = mapper;
            _goalService = goalService;
        }

        public async Task<List<TransactionDto>> GetUserTransactionsAsync(string userId, int month, int year)
        {
            var userTransactions = await _transactionRepository.GetTransactionsByUserAsync(userId);
            var filtered = userTransactions
                .Where(t => t.Date.Month == month && t.Date.Year == year)
                .OrderByDescending(t => t.Date)
                .ToList();

            return _mapper.Map<List<TransactionDto>>(filtered);
        }

        public async Task<List<TransactionDto>> GetWalletTransactionsAsync(int walletId, string userId)
        {
            var transactions = await _transactionRepository.GetTransactionsByWalletAsync(walletId, userId);
            return _mapper.Map<List<TransactionDto>>(transactions.OrderByDescending(t => t.Date).ToList());
        }

        public async Task<List<TransactionDto>> GetAllUserTransactionsAsync(string userId)
        {
            var transactions = await _transactionRepository.GetTransactionsByUserAsync(userId);
            return _mapper.Map<List<TransactionDto>>(transactions.OrderByDescending(t => t.Date).ToList());
        }

        public async Task<TransactionDto> CreateTransactionAsync(string userId, TransactionDto dto)
        {
            var transaction = _mapper.Map<Transaction>(dto);

            var wallet = await _transactionRepository.GetWalletByIdAsync(transaction.WalletId, userId);
            if (wallet == null) throw new Exception("Wallet not found or unauthorized");

            if (transaction.Type == "income")
                wallet.Balance += transaction.Amount;
            else if (transaction.Type == "expense")
                wallet.Balance -= transaction.Amount;

            await _transactionRepository.AddTransactionAsync(transaction);
            await _transactionRepository.UpdateWalletAsync(wallet);

            await _goalService.CheckGoalStatusForUser(userId);

            return _mapper.Map<TransactionDto>(transaction);
        }

        public async Task<TransactionDto> UpdateTransactionAsync(int id, string userId, TransactionDto dto)
        {
            var oldTransaction = await _transactionRepository.GetTransactionByIdAsync(id, userId);
            if (oldTransaction == null) throw new Exception("Transaction not found");

            var wallet = await _transactionRepository.GetWalletByIdAsync(oldTransaction.WalletId, userId);

            // Revert old transaction effect on wallet balance
            if (oldTransaction.Type == "income")
                wallet.Balance -= oldTransaction.Amount;
            else if (oldTransaction.Type == "expense")
                wallet.Balance += oldTransaction.Amount;

            _mapper.Map(dto, oldTransaction);

            // Apply new transaction effect on wallet balance
            if (oldTransaction.Type == "income")
                wallet.Balance += oldTransaction.Amount;
            else if (oldTransaction.Type == "expense")
                wallet.Balance -= oldTransaction.Amount;

            await _transactionRepository.UpdateTransactionAsync(oldTransaction);
            await _transactionRepository.UpdateWalletAsync(wallet);

            await _goalService.CheckGoalStatusForUser(userId);

            return _mapper.Map<TransactionDto>(oldTransaction);
        }

        public async Task<bool> DeleteTransactionAsync(int id, string userId)
        {
            var transaction = await _transactionRepository.GetTransactionByIdAsync(id, userId);
            if (transaction == null) return false;

            var wallet = await _transactionRepository.GetWalletByIdAsync(transaction.WalletId, userId);

            if (transaction.Type == "income")
                wallet.Balance -= transaction.Amount;
            else if (transaction.Type == "expense")
                wallet.Balance += transaction.Amount;

            await _transactionRepository.DeleteTransactionAsync(transaction);
            await _transactionRepository.UpdateWalletAsync(wallet);

            await _goalService.CheckGoalStatusForUser(userId);

            return true;
        }
    }
}
