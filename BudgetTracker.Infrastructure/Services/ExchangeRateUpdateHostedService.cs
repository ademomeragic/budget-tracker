using System;
using System.Threading;
using System.Threading.Tasks;
using BudgetTracker.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

public class ExchangeRateUpdateHostedService : IHostedService, IDisposable
{
    private readonly IServiceProvider _serviceProvider;
    private Timer _timer;

    public ExchangeRateUpdateHostedService(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        // Run the update method immediately, then every 24 hours
        _timer = new Timer(async _ =>
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var exchangeRateService = scope.ServiceProvider.GetRequiredService<IExchangeRateService>();
                await exchangeRateService.UpdateExchangeRatesAsync();
            }
            catch (Exception ex)
            {
                // Log the exception (optional, depends on your logging setup)
                Console.WriteLine($"Error updating exchange rates: {ex.Message}");
            }
        },
        null,
        TimeSpan.Zero,           // Start immediately
        TimeSpan.FromHours(24)); // Repeat every 24 hours

        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        _timer?.Change(Timeout.Infinite, 0); // Stop the timer
        return Task.CompletedTask;
    }

    public void Dispose()
    {
        _timer?.Dispose();
    }
}
