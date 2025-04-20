using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SampleController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get() => Ok("API is working!");
    }
}
