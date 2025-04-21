using BudgetTracker.Application.Dtos;
using BudgetTracker.Application.Interfaces;

namespace BudgetTracker.Application.Services
{
    public class AuthService : IAuthService
    {
        public async Task<AuthResult> RegisterAsync(RegisterModel model)
        {
            return await Task.FromResult(new AuthResult { Success = true, Message = "Registered successfully!" });
        }

        public async Task<AuthResult> LoginAsync(LoginModel model)
        {
            return await Task.FromResult(new AuthResult { Success = true, Token = "dummy-token" });
        }
    }
}
