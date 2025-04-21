using Application.Dtos;
using Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IUserService
    {
        Task<UserResponse> GetByIdAsync(int id);
        Task<IEnumerable<UserResponse>> GetAllAsync();
        Task AddAsync(CreateUserRequest user);
        Task UpdateAsync(UpdateUserRequest user);
        Task DeleteAsync(int id);
    }
}
