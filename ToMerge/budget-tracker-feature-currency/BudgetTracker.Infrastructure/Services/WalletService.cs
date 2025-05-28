using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using AutoMapper;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Application.Interfaces;
using BudgetTracker.Application.Services;
using BudgetTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BudgetTracker.Infrastructure.Services
{
    public class WalletService : IWalletService
    {
        private readonly BudgetDbContext _context;
        private readonly IMapper _mapper;
        private readonly ITransactionService _transactionService;
        private readonly ICurrencyConversionService _currencyConverter;

        public WalletService(ICurrencyConversionService currencyConverter, BudgetDbContext context, IMapper mapper, ITransactionService transactionService, IExchangeRateService exchangeRateService)
        {
            _context = context;
            _mapper = mapper;
            _transactionService = transactionService;
            _currencyConverter = currencyConverter;
            _exchangeRateService = exchangeRateService;
        }

        public async Task<List<WalletDto>> GetUserWalletsAsync(string userId)
        {
            var wallets = await _context.Wallets
                .Where(w => w.UserId == userId)
                .ToListAsync();

            return _mapper.Map<List<WalletDto>>(wallets);
        }

        private readonly HashSet<string> ValidCurrencyCodes = new HashSet<string>
{
    "BAM", "USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD" // add more as needed
};
 public async Task<decimal> GetConvertedBalanceAsync(int walletId, string targetCurrency)
    {
        var wallet = await _context.Wallets.FindAsync(walletId);
        if (wallet == null) throw new Exception("Wallet not found");

        var converted = await _currencyConverter.ConvertAsync(wallet.CurrencyCode, targetCurrency, wallet.Balance);
        return converted ?? 0;
    }
private readonly IExchangeRateService _exchangeRateService;

        public async Task<WalletDto> CreateWalletAsync(string userId, WalletCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CurrencyCode) || !ValidCurrencyCodes.Contains(dto.CurrencyCode.ToUpper()))
            {
                dto.CurrencyCode = "BAM"; // fallback default
            }

            var wallet = _mapper.Map<Wallet>(dto);
            wallet.UserId = userId;

            _context.Wallets.Add(wallet);
            await _context.SaveChangesAsync();

            return _mapper.Map<WalletDto>(wallet);
        }
        
        public async Task<WalletDto> GetWalletByIdAsync(int id, string userId)
{
    var wallet = await _context.Wallets
        .FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);

    if (wallet == null) throw new Exception("Wallet not found");

    return _mapper.Map<WalletDto>(wallet);
}

public async Task<decimal> GetConvertedWalletBalanceAsync(int walletId, string userId, string targetCurrency)
{
    var wallet = await _context.Wallets
        .FirstOrDefaultAsync(w => w.Id == walletId && w.UserId == userId);

    if (wallet == null) throw new Exception("Wallet not found");

    // Example: Assuming you have injected IExchangeRateService as _exchangeRateService
    var convertedAmount = await _exchangeRateService.ConvertCurrencyAsync(wallet.CurrencyCode, targetCurrency, wallet.Balance);

    if (convertedAmount == null) throw new Exception("Conversion rate not found");

    return convertedAmount.Value;
}


public async Task<WalletDto> UpdateWalletAsync(int id, string userId, WalletUpdateDto dto)
        {
            var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);
            if (wallet == null) throw new Exception("Wallet not found");

            if (string.IsNullOrWhiteSpace(dto.CurrencyCode) || !ValidCurrencyCodes.Contains(dto.CurrencyCode.ToUpper()))
            {
                dto.CurrencyCode = wallet.CurrencyCode ?? "BAM";
            }

            _mapper.Map(dto, wallet);
            await _context.SaveChangesAsync();

            return _mapper.Map<WalletDto>(wallet);
        }


        public async Task<bool> DeleteWalletAsync(int id, string userId)
        {
            var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);
            if (wallet == null) return false;

            _context.Wallets.Remove(wallet);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<decimal> GetWalletBalanceAsync(int walletId, string targetCurrency)
{
    var wallet = await _context.Wallets.FindAsync(walletId);
    if (wallet == null) throw new Exception("Wallet not found");

    if (wallet.CurrencyCode == targetCurrency)
        return wallet.Balance;

    var converted = await _exchangeRateService.ConvertCurrencyAsync(wallet.CurrencyCode, targetCurrency, wallet.Balance);

    if (converted == null) throw new Exception("Conversion rate unavailable");

    return converted.Value;
}


        public async Task<bool> TransferBetweenWalletsAsync(string userId, WalletTransferDto dto)
        {
            if (dto.FromWalletId == dto.ToWalletId)
                throw new ArgumentException("Cannot transfer to the same wallet.");

            var fromWallet = await _context.Wallets
                .FirstOrDefaultAsync(w => w.Id == dto.FromWalletId && w.UserId == userId);
            var toWallet = await _context.Wallets
                .FirstOrDefaultAsync(w => w.Id == dto.ToWalletId && w.UserId == userId);

            if (fromWallet == null || toWallet == null)
                throw new Exception("Wallet(s) not found or do not belong to user.");

            if (dto.Amount <= 0)
                throw new ArgumentException("Transfer amount must be greater than zero.");

            if (fromWallet.Balance < dto.Amount)
                throw new InvalidOperationException("Insufficient funds.");

            // Create Expense Transaction for sender
            var expenseTransaction = new TransactionDto
            {
                Amount = dto.Amount,
                Date = DateTime.Now,
                Description = $"Transfer to {toWallet.Name}",
                Type = "expense",
                WalletId = fromWallet.Id,
                CategoryId = 999 // Default category or one defined as "Internal Transfer"
            };

            // Create Income Transaction for receiver
            var incomeTransaction = new TransactionDto
            {
                Amount = dto.Amount,
                Date = DateTime.Now,
                Description = $"Transfer from {fromWallet.Name}",
                Type = "income",
                WalletId = toWallet.Id,
                CategoryId = 998 // Same default category
            };

            await _transactionService.CreateTransactionAsync(userId, expenseTransaction);
            await _transactionService.CreateTransactionAsync(userId, incomeTransaction);

            return true;
        }


    }
}
