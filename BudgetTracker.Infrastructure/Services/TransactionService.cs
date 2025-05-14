using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
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

        public TransactionService(BudgetDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<TransactionDto>> GetUserTransactionsAsync(string userId, int month, int year)
        {
            var transactions = await _context.Transactions
                .Where(t => t.UserId == userId &&
                            t.Date.Month == month &&
                            t.Date.Year == year)
                .OrderByDescending(t => t.Date)
                .ToListAsync();

            return _mapper.Map<List<TransactionDto>>(transactions);
        }
        public async Task<List<TransactionDto>> GetAllUserTransactionsAsync(string userId)
        {
            var transactions = await _context.Transactions
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.Date)
                .ToListAsync();

            return _mapper.Map<List<TransactionDto>>(transactions);
        }


        public async Task<TransactionDto> CreateTransactionAsync(string userId, TransactionDto dto)
        {
            var transaction = _mapper.Map<Transaction>(dto);
            transaction.UserId = userId;

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return _mapper.Map<TransactionDto>(transaction);
        }

        public async Task<TransactionDto> UpdateTransactionAsync(int id, string userId, TransactionDto dto)
        {
            var transaction = await _context.Transactions
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (transaction == null) throw new Exception("Transaction not found");

            _mapper.Map(dto, transaction);
            await _context.SaveChangesAsync();

            return _mapper.Map<TransactionDto>(transaction);
        }

        public async Task<bool> DeleteTransactionAsync(int id, string userId)
        {
            var transaction = await _context.Transactions
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (transaction == null) return false;

            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
