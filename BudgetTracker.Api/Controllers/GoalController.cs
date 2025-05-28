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
    public class GoalController : ControllerBase
    {
        private readonly IGoalService _service;
        private readonly IExchangeRateService _exchangeRateService;

        public GoalController(IGoalService service, IExchangeRateService exchangeRateService)
        {
            _service = service;
            _exchangeRateService = exchangeRateService;
        }

        [HttpGet]
        public async Task<IActionResult> GetGoals([FromQuery] string? currency = null)
        {
            var userId = User.GetUserId();
            var goals = await _service.GetUserGoalsAsync(userId);

            var response = await ConvertIfRequested(goals, currency);
            return Ok(response);
        }

        [HttpPost]
        public async Task<IActionResult> CreateGoal([FromBody] GoalCreateDto dto)
        {
            var userId = User.GetUserId();
            var created = await _service.CreateGoalAsync(userId, dto);
            return Ok(created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGoal(int id, [FromBody] GoalUpdateDto dto)
        {
            var userId = User.GetUserId();
            var updated = await _service.UpdateGoalAsync(id, userId, dto);
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGoal(int id)
        {
            var userId = User.GetUserId();
            var result = await _service.DeleteGoalAsync(id, userId);
            if (!result) return NotFound();
            return NoContent();
        }

        // Currency conversion
        private async Task<object> ConvertIfRequested(IEnumerable<GoalDto> goals, string? currency)
        {
            if (string.IsNullOrWhiteSpace(currency) || currency.ToUpper() == "BAM")
            {
                return goals;
            }

            try
            {
                var rate = await _exchangeRateService.GetExchangeRateAsync(currency.ToUpper());

                return goals.Select(g => new
                {
                    g.Id,
                    g.Name,
                    g.Type,
                    g.CategoryId,
                    g.CategoryName,
                    g.WalletId,
                    OriginalTarget = g.TargetAmount,
                    OriginalCurrent = g.CurrentAmount,
                    ConvertedTarget = Math.Round(g.TargetAmount * rate, 2),
                    ConvertedCurrent = Math.Round(g.CurrentAmount * rate, 2),
                    Currency = currency.ToUpper(),
                    g.StartDate,
                    g.EndDate
                });
            }
            catch (Exception ex)
            {
                return new { error = $"Conversion failed: {ex.Message}" };
            }
        }
    }
}
