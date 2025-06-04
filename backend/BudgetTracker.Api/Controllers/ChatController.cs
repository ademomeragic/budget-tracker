using BudgetTracker.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BudgetTracker.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly IChatGptService _chatGptService;

        public ChatController(IChatGptService chatGptService)
        {
            _chatGptService = chatGptService;
        }

        [HttpPost("ask")]
        public async Task<IActionResult> Ask([FromBody] ChatRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
                return BadRequest("Message cannot be empty.");

            var reply = await _chatGptService.GetChatReplyAsync(request.Message);
            return Ok(new { response = reply });
        }
    }

    public class ChatRequest
    {
        public string Message { get; set; }
    }
}
