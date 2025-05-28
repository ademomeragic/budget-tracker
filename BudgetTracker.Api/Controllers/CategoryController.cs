using BudgetTracker.Application.Dtos;
using BudgetTracker.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BudgetTracker.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _service;

        public CategoryController(ICategoryService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCategories([FromQuery] string type)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var categories = await _service.GetAllCategoriesAsync(type, userId);
            return Ok(categories);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] CategoryCreateDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var category = await _service.CreateCategoryAsync(dto, userId);
            return Ok(category);
        }
    }
}
