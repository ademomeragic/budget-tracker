using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BudgetTracker.Domain.Entities;
using BudgetTracker.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BudgetTracker.Infrastructure.Repositories
{
    public class TransactionRepository : ITransactionRepository
    {
        private readonly BudgetDbContext _context;

        public TransactionRepository(BudgetDbContext context)
        {
            _context = context;
        }

public async Task<List<Transaction>> GetTransactionsByUserAsync(string userId)
{
    return await _context.Transactions
        .Where(t => t.Wallet.UserId == userId)
        .Include(t => t.Category)
        .Include(t => t.Wallet)
        .ToListAsync();
}

public async Task<List<Transaction>> GetTransactionsByWalletAsync(int walletId, string userId)
{
    return await _context.Transactions
        .Where(t => t.WalletId == walletId && t.Wallet.UserId == userId) 
        .Include(t => t.Category)
        .Include(t => t.Wallet) 
        .ToListAsync();
}

public async Task<Transaction> GetTransactionByIdAsync(int id, string userId)
{
    return await _context.Transactions
        .Include(t => t.Wallet)  
        .FirstOrDefaultAsync(t => t.Id == id && t.Wallet.UserId == userId);
}


        public async Task AddTransactionAsync(Transaction transaction)
        {
            await _context.Transactions.AddAsync(transaction);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateTransactionAsync(Transaction transaction)
        {
            _context.Transactions.Update(transaction);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteTransactionAsync(Transaction transaction)
        {
            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();
        }

        public async Task<Wallet> GetWalletByIdAsync(int walletId, string userId)
        {
            return await _context.Wallets
                .FirstOrDefaultAsync(w => w.Id == walletId && w.UserId == userId);
        }

        public async Task UpdateWalletAsync(Wallet wallet)
        {
            _context.Wallets.Update(wallet);
            await _context.SaveChangesAsync();
        }

        public async Task<decimal> SumTransactionsAsync(string type, int? categoryId, int walletId, DateTime? start, DateTime? end)
        {
            var query = _context.Transactions.AsQueryable();

            query = query.Where(t => t.Type == type && t.WalletId == walletId);

            if (categoryId.HasValue)
                query = query.Where(t => t.CategoryId == categoryId.Value);

            if (start.HasValue)
                query = query.Where(t => t.Date >= start.Value);

            if (end.HasValue)
                query = query.Where(t => t.Date <= end.Value);

            return await query.SumAsync(t => t.Amount);
        }

        public async Task<List<Transaction>> GetTransactionsForGoalProgressAsync(Goal goal)
        {
            var query = _context.Transactions.AsQueryable();

            query = query.Where(t => t.Type == goal.Type && t.WalletId == goal.WalletId);

            if (goal.CategoryId != null)
                query = query.Where(t => t.CategoryId == goal.CategoryId);

            if (goal.StartDate != null)
                query = query.Where(t => t.Date >= goal.StartDate);

            if (goal.EndDate != null)
                query = query.Where(t => t.Date <= goal.EndDate);

            return await query.ToListAsync();
        }
    }
}
