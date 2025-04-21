using BudgetTracker.Application.Dtos;
using Domain.Entities;

namespace BudgetTracker.Application.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResult> RegisterAsync(RegisterModel model);
        Task<AuthResult> LoginAsync(LoginModel model);
    }
}
