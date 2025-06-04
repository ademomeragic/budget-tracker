using BudgetTracker.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;

[ApiController]
[Route("api/receipt")]
public class ReceiptController : ControllerBase
{
    private readonly GoogleVisionService _visionService;

    public ReceiptController(GoogleVisionService visionService)
    {
        _visionService = visionService;
    }

    [HttpPost("parse")]
    public async Task<IActionResult> ParseReceipt(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            using var stream = file.OpenReadStream();
            var (rawText, error) = await _visionService.ExtractTextFromImageAsync(stream);

            if (error != null)
                return StatusCode(500, error);

            var amountMatch = Regex.Match(rawText, @"(?:TOTAL|UKUPNO|Uplaćeno|Gotovina)[:\s]*([\d]+,[\d]{2})", RegexOptions.IgnoreCase);
            var amount = amountMatch.Success
                ? decimal.Parse(amountMatch.Groups[1].Value.Replace(",", "."))
                : 0;

            var dateMatch = Regex.Match(rawText, @"\b(\d{2}\.\d{2}\.\d{4})\b");
            var date = dateMatch.Success
                ? DateTime.ParseExact(dateMatch.Groups[1].Value, "dd.MM.yyyy", null)
                : DateTime.Now;

            var lines = rawText.Split('\n').Select(l => l.Trim()).Where(l => !string.IsNullOrWhiteSpace(l)).ToList();
            string description = lines.FirstOrDefault(line => line.Contains("kaciga", StringComparison.OrdinalIgnoreCase))
                                 ?? lines.ElementAtOrDefault(0)
                                 ?? "Unknown";

            return Ok(new
            {
                amount,
                date = date.ToString("yyyy-MM-dd"),
                description,
                type = "expense"
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine("❌ Receipt OCR Error: " + ex.ToString());
            return StatusCode(500, "Unexpected error while parsing receipt.");
        }
    }

}
