using BudgetTracker.Api.Helpers;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BudgetTracker.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class BudgetLimitController : ControllerBase
    {
        private readonly IBudgetLimitService _budgetLimitService;

        public BudgetLimitController(IBudgetLimitService budgetLimitService)
        {
            _budgetLimitService = budgetLimitService;
        }

        [HttpGet]
        public async Task<ActionResult<List<BudgetLimitDto>>> GetAll()
        {
            var userId = User.GetUserId();
            var limits = await _budgetLimitService.GetLimitsByUserIdAsync(userId);
            return Ok(limits);
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<BudgetLimitDto>> GetById(int id)
        {
            var limit = await _budgetLimitService.GetLimitByIdAsync(id);
            if (limit == null) return NotFound();
            return Ok(limit);
        }

        [HttpPost]
        public async Task<ActionResult<BudgetLimitDto>> Create([FromBody] BudgetLimitCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var userId = User.GetUserId();
            var created = await _budgetLimitService.CreateLimitAsync(dto, userId);

            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] BudgetLimitUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var result = await _budgetLimitService.UpdateLimitAsync(id, dto);
            if (!result) return NotFound();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _budgetLimitService.DeleteLimitAsync(id);
            if (!result) return NotFound();

            return NoContent();
        }
    }
}
