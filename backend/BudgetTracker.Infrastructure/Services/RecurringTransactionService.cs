using BudgetTracker.Application.Dtos;
using BudgetTracker.Application.Interfaces;
using BudgetTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using AutoMapper;

namespace BudgetTracker.Infrastructure.Services
{
    public class RecurringTransactionService : IRecurringTransactionService
    {
        private readonly BudgetDbContext _context;
        private readonly IMapper _mapper;
        private readonly ITransactionService _transactionService;

        public RecurringTransactionService(
            BudgetDbContext context,
            IMapper mapper,
            ITransactionService transactionService)
        {
            _context = context;
            _mapper = mapper;
            _transactionService = transactionService;
        }

        public async Task<List<RecurringTransactionDto>> GetUserRecurringAsync(string userId)
        {
            var rec = await _context.RecurringTransactions
                .Include(r => r.Wallet)
                .Include(r => r.Category)
                .Where(r => r.UserId == userId)
                .ToListAsync();

            return _mapper.Map<List<RecurringTransactionDto>>(rec);
        }

        public async Task AddRecurringAsync(string userId, RecurringTransactionDto dto)
        {
            var entity = new RecurringTransaction
            {
                UserId = userId,
                Amount = dto.Amount,
                Description = dto.Description,
                Type = dto.Type,
                WalletId = dto.WalletId,
                CategoryId = dto.CategoryId,
                NextRunDate = dto.NextRunDate.Date,
                Frequency = dto.Frequency
            };

            _context.RecurringTransactions.Add(entity);
            await _context.SaveChangesAsync();
        }

        public async Task RunDueRecurringTransactionsAsync(string userId)
        {
            var today = DateTime.Today;

            var due = await _context.RecurringTransactions
                .Where(r => r.UserId == userId && r.NextRunDate <= today)
                .ToListAsync();

            foreach (var entry in due)
            {
                // Create normal transaction
                var transaction = new TransactionDto
                {
                    Amount = entry.Amount,
                    Description = entry.Description,
                    Type = entry.Type,
                    Date = today,
                    WalletId = entry.WalletId,
                    CategoryId = entry.CategoryId
                };

                await _transactionService.CreateTransactionAsync(userId, transaction);

                // Update next run date based on frequency
                entry.NextRunDate = entry.Frequency.ToLower() switch
                {
                    "daily" => entry.NextRunDate.AddDays(1),
                    "weekly" => entry.NextRunDate.AddDays(7),
                    "monthly" => entry.NextRunDate.AddMonths(1),
                    _ => entry.NextRunDate.AddMonths(1) // Default fallback
                };
            }

            await _context.SaveChangesAsync();
        }
        public async Task UpdateRecurringAsync(string userId, int id, RecurringTransactionDto dto)
        {
            var existing = await _context.RecurringTransactions
                .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

            if (existing == null) return;

            existing.Amount = dto.Amount;
            existing.Description = dto.Description;
            existing.Type = dto.Type;
            existing.WalletId = dto.WalletId;
            existing.CategoryId = dto.CategoryId;
            existing.NextRunDate = dto.NextRunDate.Date;
            existing.Frequency = dto.Frequency;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteRecurringAsync(string userId, int id)
        {
            var entity = await _context.RecurringTransactions
                .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

            if (entity == null) return;

            _context.RecurringTransactions.Remove(entity);
            await _context.SaveChangesAsync();
        }

    }
}
