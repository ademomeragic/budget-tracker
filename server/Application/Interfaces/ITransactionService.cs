using Application.Dtos;
using Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface ITransactionService
    {
        Task<IEnumerable<TransactionResponse>> GetAllAsync();
        Task<TransactionResponse?> GetByIdAsync(int id);
        Task<TransactionResponse> AddAsync(CreateTransactionRequest request);
        Task UpdateAsync(UpdateTransactionRequest request);
        Task DeleteAsync(int id);
    }
}
