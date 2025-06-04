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
    public class RecurringTransactionController : ControllerBase
    {
        private readonly IRecurringTransactionService _recurringService;

        public RecurringTransactionController(IRecurringTransactionService recurringService)
        {
            _recurringService = recurringService;
        }

        [HttpGet]
        public async Task<IActionResult> GetUserRecurring()
        {
            try
            {
                var userId = User.GetUserId();
                var rec = await _recurringService.GetUserRecurringAsync(userId);
                return Ok(rec);
            }
            catch (Exception ex)
            {
                Console.WriteLine("❌ RecurringTransaction GET failed: " + ex.Message);
                return StatusCode(500, $"Internal Server Error: {ex.Message}");
            }
        }


        [HttpPost]
        public async Task<IActionResult> CreateRecurring([FromBody] RecurringTransactionDto dto)
        {
            if (dto == null)
                return BadRequest("Missing recurring transaction data.");

            var userId = User.GetUserId();
            await _recurringService.AddRecurringAsync(userId, dto);
            return Ok(new { message = "Recurring transaction added successfully." });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRecurring(int id, [FromBody] RecurringTransactionDto dto)
        {
            var userId = User.GetUserId();
            await _recurringService.UpdateRecurringAsync(userId, id, dto);
            return Ok(new { message = "Recurring transaction updated successfully." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRecurring(int id)
        {
            var userId = User.GetUserId();
            await _recurringService.DeleteRecurringAsync(userId, id);
            return Ok(new { message = "Recurring transaction deleted successfully." });
        }

    }
}
