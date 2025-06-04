using Microsoft.AspNetCore.Mvc;
using BudgetTracker.Infrastructure.Services;

namespace BudgetTracker.API.Controllers
{
    [ApiController]
    [Route("api/documentai")]
    public class DocumentAiController : ControllerBase
    {
        private readonly DocumentAiReceiptParser _parser;

        public DocumentAiController(DocumentAiReceiptParser parser)
        {
            _parser = parser;
        }

        [HttpPost("parse")]
        public async Task<IActionResult> ParseDocument(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            // using var stream = file.OpenReadStream();
            var result = await _parser.ParseReceiptAsync(file.OpenReadStream(), file.FileName);

            return Ok(new { raw = result });
        }
    }
}
