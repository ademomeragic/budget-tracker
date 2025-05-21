using BudgetTracker.Application.Dtos;
using BudgetTracker.Application.Interfaces;
using BudgetTracker.Api.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

        public TransactionController(ITransactionService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetTransactions([FromQuery] int month, [FromQuery] int year)
        {
            var userId = User.GetUserId();
            var transactions = await _service.GetUserTransactionsAsync(userId, month, year);
            return Ok(transactions);
        }

        [HttpGet("wallet/{walletId}")]
        public async Task<IActionResult> GetWalletTransactions(int walletId)
        {
            var userId = User.GetUserId();
            var txns = await _service.GetWalletTransactionsAsync(walletId, userId);
            return Ok(txns);
        }


        [HttpGet("all")]
        public async Task<IActionResult> GetAllUserTransactions()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var transactions = await _service.GetAllUserTransactionsAsync(userId);
            return Ok(transactions);
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
    }
}
