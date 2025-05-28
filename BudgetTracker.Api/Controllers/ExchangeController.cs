using BudgetTracker.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BudgetTracker.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ExchangeController : ControllerBase
    {
        private readonly IExchangeRateService _exchangeRateService;

        public ExchangeController(IExchangeRateService exchangeRateService)
        {
            _exchangeRateService = exchangeRateService;
        }

        [HttpGet("{targetCurrency}")]
        public async Task<IActionResult> GetExchangeRate(string targetCurrency)
        {
            try
            {
                var rate = await _exchangeRateService.GetExchangeRateAsync(targetCurrency.ToUpper());
                return Ok(new
                {
                    baseCurrency = "BAM",
                    targetCurrency = targetCurrency.ToUpper(),
                    rate
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
