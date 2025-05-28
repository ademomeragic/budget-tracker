using BudgetTracker.Application.Dtos;
using BudgetTracker.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;

    public ProfileController(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] UpdatePasswordDto dto)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null) return Unauthorized();

        var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);

        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok(new { message = "Password changed successfully" });
    }

    [HttpPut("notification-threshold")]
    public async Task<IActionResult> UpdateThreshold([FromBody] UpdateThresholdDto dto)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null) return Unauthorized();

        user.NotificationThreshold = dto.Threshold;
        await _userManager.UpdateAsync(user);

        return Ok(new { message = "Threshold updated" });
    }

    [HttpGet("settings")]
    public async Task<IActionResult> GetSettings()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null) return Unauthorized();

        return Ok(new { threshold = user.NotificationThreshold });
    }

    [HttpPut("notification-preferences")]
    public async Task<IActionResult> UpdatePreferences([FromBody] UpdateNotificationPreferencesDto dto)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null) return Unauthorized();

        user.EnableDeadlineWarnings = dto.DeadlineWarnings;
        user.EnableNearLimitWarnings = dto.NearLimitWarnings;
        user.EnableExceededWarnings = dto.ExceededWarnings;
        user.EnableIncomeCongrats = dto.IncomeCongratulations;

        await _userManager.UpdateAsync(user);

        return Ok(new { message = "Notification preferences updated." });
    }

}
