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

        public GoalController(IGoalService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetGoals()
        {
            var userId = User.GetUserId();
            var goals = await _service.GetUserGoalsAsync(userId);
            return Ok(goals);
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
    }
}
