using BudgetTracker.Application.Dtos;
using BudgetTracker.Application.Interfaces;
using BudgetTracker.Api.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using BudgetTracker.Infrastructure.Services;

namespace BudgetTracker.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionController : ControllerBase
    {
        private readonly ITransactionService _service;
        private readonly IExchangeRateService _exchangeRateService;
        private readonly IRecurringTransactionService _recurringTransactionService;

        public TransactionController(
            ITransactionService service,
            IExchangeRateService exchangeRateService,
            IRecurringTransactionService recurringTransactionService)
        {
            _service = service;
            _exchangeRateService = exchangeRateService;
            _recurringTransactionService = recurringTransactionService;
        }

        [HttpGet]
        public async Task<ActionResult<List<object>>> GetTransactions([FromQuery] int month, [FromQuery] int year, [FromQuery] string? currency = null)
        {
            var userId = User.GetUserId();
            await _recurringTransactionService.RunDueRecurringTransactionsAsync(userId);

            var transactions = await _service.GetUserTransactionsAsync(userId, month, year);
            return await ConvertIfRequested(transactions, currency);
        }

        [HttpGet("wallet/{walletId}")]
        public async Task<ActionResult<List<object>>> GetWalletTransactions(int walletId, [FromQuery] string? currency = null)
        {
            var userId = User.GetUserId();
            var transactions = await _service.GetWalletTransactionsAsync(walletId, userId);
            return await ConvertIfRequested(transactions, currency);
        }

        [HttpGet("all")]
        public async Task<ActionResult<List<object>>> GetAllUserTransactions([FromQuery] string? currency = null)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var transactions = await _service.GetAllUserTransactionsAsync(userId);
            return await ConvertIfRequested(transactions, currency);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTransaction([FromBody] TransactionDto dto)
        {
            var userId = User.GetUserId();
            var result = await _service.CreateTransactionAsync(userId, dto);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTransaction(int id, [FromBody] TransactionDto dto)
        {
            var userId = User.GetUserId();
            var result = await _service.UpdateTransactionAsync(id, userId, dto);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTransaction(int id)
        {
            var userId = User.GetUserId();
            var success = await _service.DeleteTransactionAsync(id, userId);
            if (!success) return NotFound();
            return NoContent();
        }

        // Shared conversion logic
        private async Task<List<object>> ConvertIfRequested(IEnumerable<TransactionDto> transactions, string? currency)
        {
            if (string.IsNullOrWhiteSpace(currency) || currency.ToUpper() == "BAM")
            {
                return transactions.Cast<object>().ToList();
            }

            try
            {
                var rate = await _exchangeRateService.GetExchangeRateAsync(currency.ToUpper());

                return transactions.Select(t => new
                {
                    ConvertedAmount = Math.Round(t.Amount * rate, 2),
                    Currency = currency.ToUpper(),
                    t.Amount,
                    t.Description,
                    t.Type,
                    t.Date,
                    t.CategoryId,
                    t.WalletId
                }).Cast<object>().ToList(); // ✅ Must return a List<object>
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Currency conversion failed: {ex.Message}");
                return transactions.Cast<object>().ToList(); // ✅ No Ok() here
            }
        }

    }
}
