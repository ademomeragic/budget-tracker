using BudgetTracker.Application.Dtos;
using BudgetTracker.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;  

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<ProfileController> _logger;  

    public ProfileController(UserManager<ApplicationUser> userManager, ILogger<ProfileController> logger)
    {
        _userManager = userManager;
        _logger = logger;  
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] UpdatePasswordDto dto)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            _logger.LogWarning("User not found for change password.");
            return Unauthorized();
        }

        var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);

        if (!result.Succeeded)
        {
            _logger.LogError("Password change failed for user {UserId}.", user.Id);
            return BadRequest(result.Errors);
        }

        _logger.LogInformation("Password successfully changed for user {UserId}.", user.Id);
        return Ok(new { message = "Password changed successfully" });
    }

    [HttpPut("notification-threshold")]
    public async Task<IActionResult> UpdateThreshold([FromBody] UpdateThresholdDto dto)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            _logger.LogWarning("User not found for update threshold.");
            return Unauthorized();
        }

        user.NotificationThreshold = dto.Threshold;
        await _userManager.UpdateAsync(user);

        _logger.LogInformation("Notification threshold updated for user {UserId}.", user.Id);
        return Ok(new { message = "Threshold updated" });
    }

    [HttpGet("settings")]
    public async Task<IActionResult> GetSettings()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            _logger.LogWarning("User not found for getting settings.");
            return Unauthorized();
        }

        _logger.LogInformation("Retrieved settings for user {UserId}.", user.Id);
        return Ok(new { threshold = user.NotificationThreshold });
    }

    [HttpPut("notification-preferences")]
    public async Task<IActionResult> UpdatePreferences([FromBody] UpdateNotificationPreferencesDto dto)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            _logger.LogWarning("User not found for update notification preferences.");
            return Unauthorized();
        }

        user.EnableDeadlineWarnings = dto.DeadlineWarnings;
        user.EnableNearLimitWarnings = dto.NearLimitWarnings;
        user.EnableExceededWarnings = dto.ExceededWarnings;
        user.EnableIncomeCongrats = dto.IncomeCongratulations;

        await _userManager.UpdateAsync(user);

        _logger.LogInformation("Notification preferences updated for user {UserId}.", user.Id);
        return Ok(new { message = "Notification preferences updated." });
    }
}
