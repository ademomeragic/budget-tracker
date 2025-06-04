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
        private readonly IExchangeRateService _exchangeRateService;

        public WalletController(IWalletService walletService, IExchangeRateService exchangeRateService)
        {
            _walletService = walletService;
            _exchangeRateService = exchangeRateService;
        }

        [HttpGet]
        public async Task<IActionResult> GetWallets([FromQuery] string? currency = null)
        {
            var userId = User.GetUserId();
            var wallets = await _walletService.GetUserWalletsAsync(userId);

            var response = await ConvertIfRequested(wallets, currency);
            return Ok(response);
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

        [HttpPost("transfer")]
        public async Task<IActionResult> TransferBetweenWallets([FromBody] WalletTransferDto dto)
        {
            var userId = User.GetUserId();
            try
            {
                await _walletService.TransferBetweenWalletsAsync(userId, dto);
                return Ok(new { message = "Transfer successful." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // Currency conversion
        private async Task<object> ConvertIfRequested(IEnumerable<WalletDto> wallets, string? currency)
        {
            if (string.IsNullOrWhiteSpace(currency) || currency.ToUpper() == "BAM")
            {
                return wallets;
            }

            try
            {
                var rate = await _exchangeRateService.GetExchangeRateAsync(currency.ToUpper());
                return wallets.Select(w => new
                {
                    w.Id,
                    w.Name,
                    OriginalBalance = w.Balance,
                    ConvertedBalance = Math.Round(w.Balance * rate, 2),
                    Currency = currency.ToUpper()
                });
            }
            catch (Exception ex)
            {
                return new { error = $"Conversion failed: {ex.Message}" };
            }
        }
    }
}
