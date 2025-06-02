using BudgetTracker.Application.Dtos;
using BudgetTracker.Application.Interfaces;
using BudgetTracker.Api.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace BudgetTracker.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class WalletController : ControllerBase
    {
        private readonly IWalletService _walletService;
        private readonly IExchangeRateService _exchangeRateService;
        private readonly ILogger<WalletController> _logger;

        public WalletController(IWalletService walletService, IExchangeRateService exchangeRateService, ILogger<WalletController> logger)
        {
            _walletService = walletService;
            _exchangeRateService = exchangeRateService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetWallets([FromQuery] string? currency = null)
        {
            var userId = User.GetUserId();
            _logger.LogInformation($"Fetching wallets for userId: {userId}");

            var wallets = await _walletService.GetUserWalletsAsync(userId);
            var response = await ConvertIfRequested(wallets, currency);

            _logger.LogInformation($"Retrieved {wallets.Count()} wallets for userId: {userId}");
            return Ok(response);
        }

        [HttpPost]
        public async Task<IActionResult> CreateWallet([FromBody] WalletCreateDto dto)
        {
            var userId = User.GetUserId();
            _logger.LogInformation($"Creating wallet for userId: {userId}, Wallet Name: {dto.Name}");

            var wallet = await _walletService.CreateWalletAsync(userId, dto);
            _logger.LogInformation($"Wallet created for userId: {userId}, Wallet ID: {wallet.Id}");

            return Ok(wallet);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateWallet(int id, [FromBody] WalletUpdateDto dto)
        {
            var userId = User.GetUserId();
            _logger.LogInformation($"Updating wallet with id: {id} for userId: {userId}");

            var wallet = await _walletService.UpdateWalletAsync(id, userId, dto);
            _logger.LogInformation($"Wallet with id: {id} updated for userId: {userId}");

            return Ok(wallet);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWallet(int id)
        {
            var userId = User.GetUserId();
            _logger.LogInformation($"Deleting wallet with id: {id} for userId: {userId}");

            var success = await _walletService.DeleteWalletAsync(id, userId);
            if (!success)
            {
                _logger.LogWarning($"Wallet with id: {id} not found for userId: {userId}");
                return NotFound();
            }

            _logger.LogInformation($"Wallet with id: {id} successfully deleted for userId: {userId}");
            return NoContent();
        }

        [HttpPost("transfer")]
        public async Task<IActionResult> TransferBetweenWallets([FromBody] WalletTransferDto dto)
        {
            var userId = User.GetUserId();
            _logger.LogInformation($"Initiating transfer for userId: {userId}, From Wallet ID: {dto.FromWalletId}, To Wallet ID: {dto.ToWalletId}");

            try
            {
                await _walletService.TransferBetweenWalletsAsync(userId, dto);
                _logger.LogInformation($"Transfer successful for userId: {userId}, From Wallet ID: {dto.FromWalletId}, To Wallet ID: {dto.ToWalletId}");
                return Ok(new { message = "Transfer successful." });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Transfer failed for userId: {userId}, From Wallet ID: {dto.FromWalletId}, To Wallet ID: {dto.ToWalletId}. Error: {ex.Message}");
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
                _logger.LogInformation($"Currency conversion rate fetched for {currency.ToUpper()}: {rate}");

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
                _logger.LogError($"Currency conversion failed: {ex.Message}");
                return new { error = $"Conversion failed: {ex.Message}" };
            }
        }
    }
}
