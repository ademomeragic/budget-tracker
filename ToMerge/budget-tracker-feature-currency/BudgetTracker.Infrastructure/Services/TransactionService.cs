using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Application.Interfaces;
using BudgetTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BudgetTracker.Infrastructure.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly BudgetDbContext _context;
        private readonly IMapper _mapper;
        private readonly IGoalService _goalService;
        private readonly ITransactionService _transactionService;
        private readonly IExchangeRateService _exchangeRateService;

        public TransactionService(BudgetDbContext context, IMapper mapper, IGoalService goalService, IExchangeRateService exchangeRateService)
        {
            _context = context;
            _mapper = mapper;
            _goalService = goalService;
            _exchangeRateService = exchangeRateService;
        }

        

        public async Task<List<TransactionDto>> GetUserTransactionsAsync(string userId, int month, int year, string? targetCurrency = null)
        {
            var transactions = await _context.Transactions
                .Include(t => t.Wallet)
                .Where(t => t.Wallet.UserId == userId && t.Date.Month == month && t.Date.Year == year)
                .ToListAsync();

            var result = new List<TransactionDto>();

            foreach (var t in transactions)
            {
                var dto = _mapper.Map<TransactionDto>(t);
                dto.CurrencyCode = t.Wallet.CurrencyCode;

                if (!string.IsNullOrEmpty(targetCurrency) && targetCurrency != dto.CurrencyCode)
                {
                    dto.ConvertedAmount = await _exchangeRateService.ConvertCurrencyAsync(dto.CurrencyCode, targetCurrency, dto.Amount);
                    dto.ConvertedCurrencyCode = targetCurrency;
                }

                result.Add(dto);
            }

            return result;
        }

        public async Task<decimal?> ConvertTransactionAmountAsync(Transaction transaction, string targetCurrency)
{
    if (transaction == null) return null;

    // Get wallet's currency code (assumed to be loaded or load if needed)
    var wallet = await _context.Wallets.FindAsync(transaction.WalletId);
    if (wallet == null) return null;

    var convertedAmount = await _exchangeRateService.ConvertCurrencyAsync(wallet.CurrencyCode, targetCurrency, transaction.Amount);
    return convertedAmount;
}

        public async Task<List<TransactionDto>> GetWalletTransactionsAsync(int walletId, string userId, string? targetCurrency = null)
{
    var transactions = await _context.Transactions
        .Include(t => t.Wallet)
        .Where(t => t.Wallet.Id == walletId && t.Wallet.UserId == userId)
        .OrderByDescending(t => t.Date)
        .ToListAsync();

    var result = new List<TransactionDto>();

    foreach (var t in transactions)
    {
        result.Add(await MapAndConvertTransaction(t, targetCurrency));
    }

    return result;
}

public async Task<List<TransactionDto>> GetAllUserTransactionsAsync(string userId, string? targetCurrency = null)
{
    var transactions = await _context.Transactions
        .Include(t => t.Wallet)
        .Where(t => t.Wallet.UserId == userId)
        .OrderByDescending(t => t.Date)
        .ToListAsync();

    var result = new List<TransactionDto>();

    foreach (var t in transactions)
    {
        result.Add(await MapAndConvertTransaction(t, targetCurrency));
    }

    return result;
}

// ✅ New Private Helper Method
private async Task<TransactionDto> MapAndConvertTransaction(Transaction t, string? targetCurrency)
{
    var dto = _mapper.Map<TransactionDto>(t);
    dto.CurrencyCode = t.Wallet.CurrencyCode;

    if (!string.IsNullOrEmpty(targetCurrency) && targetCurrency != dto.CurrencyCode)
    {
        dto.ConvertedAmount = await _exchangeRateService.ConvertCurrencyAsync(dto.CurrencyCode, targetCurrency, dto.Amount);
        dto.ConvertedCurrencyCode = targetCurrency;
        Console.WriteLine($"Converted {dto.Amount} {dto.CurrencyCode} to {dto.ConvertedAmount} {targetCurrency}");
    }
    else
    {
        dto.ConvertedAmount = dto.Amount;
        dto.ConvertedCurrencyCode = dto.CurrencyCode;
        Console.WriteLine($"No conversion needed for {dto.Amount} {dto.CurrencyCode}");
    }

    return dto;
}




        public async Task<TransactionDto> CreateTransactionAsync(string userId, TransactionDto dto)
        {
            var transaction = _mapper.Map<Transaction>(dto);

            var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.Id == transaction.WalletId && w.UserId == userId);
            if (wallet == null) throw new Exception("Wallet not found or unauthorized");

            if (transaction.Type == "income")
                wallet.Balance += transaction.Amount;
            else if (transaction.Type == "expense")
                wallet.Balance -= transaction.Amount;

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            await _goalService.CheckGoalStatusForUser(userId);

            return _mapper.Map<TransactionDto>(transaction);
        }

        public async Task<TransactionDto> UpdateTransactionAsync(int id, string userId, TransactionDto dto)
        {
            var oldTransaction = await _context.Transactions
                .Include(t => t.Wallet)
                .FirstOrDefaultAsync(t => t.Id == id && t.Wallet.UserId == userId);

            if (oldTransaction == null) throw new Exception("Transaction not found");

            var wallet = oldTransaction.Wallet;

            if (oldTransaction.Type == "income")
                wallet.Balance -= oldTransaction.Amount;
            else if (oldTransaction.Type == "expense")
                wallet.Balance += oldTransaction.Amount;

            _mapper.Map(dto, oldTransaction);

            if (oldTransaction.Type == "income")
                wallet.Balance += oldTransaction.Amount;
            else if (oldTransaction.Type == "expense")
                wallet.Balance -= oldTransaction.Amount;

            await _context.SaveChangesAsync();

            await _goalService.CheckGoalStatusForUser(userId);

            return _mapper.Map<TransactionDto>(oldTransaction);
        }

        public async Task<bool> DeleteTransactionAsync(int id, string userId)
        {
            var transaction = await _context.Transactions
                .Include(t => t.Wallet)
                .FirstOrDefaultAsync(t => t.Id == id && t.Wallet.UserId == userId);

            if (transaction == null) return false;

            var wallet = transaction.Wallet;

            if (transaction.Type == "income")
                wallet.Balance -= transaction.Amount;
            else if (transaction.Type == "expense")
                wallet.Balance += transaction.Amount;

            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();

            await _goalService.CheckGoalStatusForUser(userId);

            return true;
        }
    }
}
