using System.Collections.Generic;
using System.Threading.Tasks;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BudgetTracker.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExchangeRateController : ControllerBase
    {
        private readonly IExchangeRateService _exchangeRateService;

        public ExchangeRateController(IExchangeRateService exchangeRateService)
        {
            _exchangeRateService = exchangeRateService;
        }

        [HttpGet]
        public async Task<ActionResult<List<ExchangeRateDto>>> GetRates([FromQuery] string baseCurrency = "BAM")
        {
            var rates = await _exchangeRateService.GetAllRatesAsync(baseCurrency);
            return Ok(rates);
        }

        [HttpGet("convert")]
        public async Task<ActionResult<decimal?>> Convert([FromQuery] string from, [FromQuery] string to, [FromQuery] decimal amount)
        {
            var convertedAmount = await _exchangeRateService.ConvertCurrencyAsync(from, to, amount);
            if (convertedAmount == null) return NotFound("Conversion rate not found");
            return Ok(convertedAmount);
        }

        [HttpPost("update")]
        public async Task<IActionResult> UpdateRates([FromQuery] string baseCurrency = "BAM")
        {
            await _exchangeRateService.UpdateExchangeRatesAsync(baseCurrency);
            return NoContent();
        }
    }
}
