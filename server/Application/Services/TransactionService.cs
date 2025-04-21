using Application.Dtos;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly IRepository<Transaction> _transactionRepository;
        private readonly IMapper _mapper;

        public TransactionService(IRepository<Transaction> transactionRepository, IMapper mapper)
        {
            _transactionRepository = transactionRepository;
            _mapper = mapper;
        }

        public async Task<TransactionResponse?> GetByIdAsync(int id)
        {
            var transaction = await _transactionRepository.GetByIdAsync(id);
            return transaction == null ? null : _mapper.Map<TransactionResponse>(transaction);
        }

        public async Task<IEnumerable<TransactionResponse>> GetAllAsync()
        {
            var transactions = await _transactionRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<TransactionResponse>>(transactions);
        }

        public async Task<TransactionResponse> AddAsync(CreateTransactionRequest request)
        {
            var transaction = _mapper.Map<Transaction>(request);
            await _transactionRepository.AddAsync(transaction);
            await _transactionRepository.SaveChangesAsync();
            return _mapper.Map<TransactionResponse>(transaction);

        }

        public async Task UpdateAsync(UpdateTransactionRequest request)
        {
            var transaction = await _transactionRepository.GetByIdAsync(request.Id);
            if (transaction == null)
                throw new Exception("Transaction not found.");

            _mapper.Map(request, transaction);
            await _transactionRepository.UpdateAsync(transaction);
            await _transactionRepository.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            await _transactionRepository.DeleteAsync(id);
            await _transactionRepository.SaveChangesAsync();
        }

        public async Task<decimal> GetTotalSpentForBudget(int budgetId)
        {
            var transactions = await _transactionRepository.GetAllAsync();
            return transactions
                .Where(t => t.BudgetId == budgetId)
                .Sum(t => t.Amount);
        }
    }
}
