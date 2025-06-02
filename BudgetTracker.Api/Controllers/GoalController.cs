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
        private readonly ILogger<GoalController> _logger;

        public GoalController(
            IGoalService service,
            IExchangeRateService exchangeRateService,
            ILogger<GoalController> logger)
        {
            _service = service;
            _exchangeRateService = exchangeRateService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetGoals([FromQuery] string? currency = null)
        {
            var userId = User.GetUserId();
            _logger.LogInformation("Fetching goals for user {UserId}", userId);

            var goals = await _service.GetUserGoalsAsync(userId);
            var response = await ConvertIfRequested(goals, currency);

            return Ok(response);
        }

        [HttpPost]
        public async Task<IActionResult> CreateGoal([FromBody] GoalCreateDto dto)
        {
            var userId = User.GetUserId();
            _logger.LogInformation("Creating goal for user {UserId}: {@Dto}", userId, dto);

            var created = await _service.CreateGoalAsync(userId, dto);
            return Ok(created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGoal(int id, [FromBody] GoalUpdateDto dto)
        {
            var userId = User.GetUserId();
            _logger.LogInformation("Updating goal {GoalId} for user {UserId}", id, userId);

            var updated = await _service.UpdateGoalAsync(id, userId, dto);
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGoal(int id)
        {
            var userId = User.GetUserId();
            _logger.LogInformation("Deleting goal {GoalId} for user {UserId}", id, userId);

            var result = await _service.DeleteGoalAsync(id, userId);
            if (!result)
            {
                _logger.LogWarning("⚠️ Goal {GoalId} not found for user {UserId}", id, userId);
                return NotFound();
            }

            return NoContent();
        }

        private async Task<object> ConvertIfRequested(IEnumerable<GoalDto> goals, string? currency)
        {
            if (string.IsNullOrWhiteSpace(currency) || currency.ToUpper() == "BAM")
                return goals;

            try
            {
                var rate = await _exchangeRateService.GetExchangeRateAsync(currency.ToUpper());

                _logger.LogInformation("💱 Converting goals to {Currency} at rate {Rate}", currency.ToUpper(), rate);

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
                _logger.LogError(ex, "❌ Error occurred while converting goals to {Currency}", currency);
                return new { error = $"Conversion failed: {ex.Message}" };
            }
        }
    }
}
