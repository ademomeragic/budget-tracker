using BudgetTracker.Application.Dtos;
using BudgetTracker.Application.Interfaces;
using BudgetTracker.Api.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BudgetTracker.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class WalletController : ControllerBase
    {
        private readonly IWalletService _walletService;

        public WalletController(IWalletService walletService)
        {
            _walletService = walletService;
        }

        [HttpGet]
        public async Task<IActionResult> GetWallets()
        {
            var userId = User.GetUserId();
            var wallets = await _walletService.GetUserWalletsAsync(userId);
            return Ok(wallets);
        }

        [HttpPost]
        public async Task<IActionResult> CreateWallet([FromBody] WalletCreateDto dto)
        {
            var userId = User.GetUserId();
            var wallet = await _walletService.CreateWalletAsync(userId, dto);
            return Ok(wallet);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateWallet(int id, [FromBody] WalletUpdateDto dto)
        {
            var userId = User.GetUserId();
            var wallet = await _walletService.UpdateWalletAsync(id, userId, dto);
            return Ok(wallet);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWallet(int id)
        {
            var userId = User.GetUserId();
            var success = await _walletService.DeleteWalletAsync(id, userId);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
