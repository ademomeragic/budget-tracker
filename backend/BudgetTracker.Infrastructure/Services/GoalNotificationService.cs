using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Threading;
using System.Threading.Tasks;
using BudgetTracker.Application.Interfaces;
using Microsoft.Extensions.Logging;

public class GoalNotificationService : BackgroundService
{
    protected readonly IServiceProvider _serviceProvider;
    private readonly ILogger<GoalNotificationService> _logger;

    public GoalNotificationService(IServiceProvider serviceProvider, ILogger<GoalNotificationService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var goalService = scope.ServiceProvider.GetRequiredService<IGoalService>();

                await goalService.CheckGoalStatusesAndTriggerNotifications();

                _logger.LogInformation("Goal check complete at: {time}", DateTimeOffset.Now);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while checking goals");
            }

            await Task.Delay(TimeSpan.FromHours(1), stoppingToken); // adjust interval here
        }
    }
}
