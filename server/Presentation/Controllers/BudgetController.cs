using Microsoft.AspNetCore.Mvc;
using Application.Interfaces;
using System.Threading.Tasks;
using AutoMapper;
using Domain.Entities;
using Application.Dtos;
using Application.Services;

namespace Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BudgetController : ControllerBase
    {
        private readonly IBudgetService _budgetService;
        private readonly ICategoryService _categoryService;
        private readonly IMapper _mapper;

        public BudgetController(IBudgetService budgetService, ICategoryService categoryService, IMapper mapper)
        {
            _budgetService = budgetService;
            _categoryService = categoryService;
            _mapper = mapper;
        }

         [HttpGet]
        public async Task<IActionResult> GetAllBudgets()
        {
            var budgets = await _budgetService.GetAllAsync();
            return Ok(budgets);
        }



        // GET: api/budget/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var budget = await _budgetService.GetByIdAsync(id);
            if (budget == null)
                return NotFound();

            var budgetResponse = _mapper.Map<BudgetResponse>(budget); // Map to BudgetResponse
            return Ok(budgetResponse);
        }

// POST: api/budget
[HttpPost]
public async Task<IActionResult> Create([FromBody] CreateBudgetRequest request)
{
    if (request.CategoryId == null || request.CategoryId <= 0)
    {
        return BadRequest("CategoryId must be a valid positive number.");
    }

    // Check if the Category exists in the database
    var category = await _categoryService.GetByIdAsync(request.CategoryId.Value);
    if (category == null)
    {
        return BadRequest("Category not found.");
    }

    try
    {
        // Create the budget using the service
        var createdBudget = await _budgetService.AddAsync(request);

        // Map created Budget to BudgetResponse for response
        var createdBudgetResponse = _mapper.Map<BudgetResponse>(createdBudget);

        // Return the created budget as a response
        return CreatedAtAction(nameof(GetById), new { id = createdBudget.Id }, createdBudgetResponse);
    }
    catch (Exception ex)
    {
        // Handle any exception that occurs during budget creation
        return StatusCode(500, "An error occurred while creating the budget: " + ex.Message);
    }
}



        // PUT: api/budget/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBudget(int id, [FromBody] UpdateBudgetRequest request)
        {
            if (id != request.Id) 
                return BadRequest("ID mismatch.");

            var existing = await _budgetService.GetByIdAsync(id);
            if (existing == null) 
                return NotFound();

            // Map the UpdateBudgetRequest to a Budget entity
            var budgetToUpdate = _mapper.Map<Budget>(request);  // Convert UpdateBudgetRequest to Budget entity

            await _budgetService.UpdateAsync(request);  // Pass the UpdateBudgetRequest DTO to the service
            
            return NoContent();  // Successfully updated
        }

        // GET: api/budget/remaining/{id}
        [HttpGet("remaining/{id}")]
        public async Task<IActionResult> GetRemainingBudget(int id)
        {
            var remaining = await _budgetService.CalculateRemainingBudget(id);
            return Ok(new { remainingBudget = remaining });
        }

        // GET: api/budget/near-limit/{id}?threshold=80
        [HttpGet("near-limit/{id}")]
        public async Task<IActionResult> IsNearBudgetLimit(int id, [FromQuery] decimal threshold)
        {
            var isNear = await _budgetService.IsNearBudgetLimit(id, threshold);
            return Ok(new { isNearLimit = isNear });
        }

        // DELETE: api/budget/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var budget = await _budgetService.GetByIdAsync(id);
                if (budget == null)
                {
                    return NotFound(new { message = "Budget not found." });
                }

                await _budgetService.DeleteAsync(id);
                return NoContent(); // Return 204 No Content
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"An error occurred while deleting the budget: {ex.Message}" });
            }
        }

    }
}
