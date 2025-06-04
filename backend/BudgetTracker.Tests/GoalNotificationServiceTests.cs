using System;
using System.Threading;
using System.Threading.Tasks;
using BudgetTracker.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace BudgetTracker.Tests.Services
{
    public class GoalNotificationServiceTests
    {
        [Fact]
        public async Task ExecuteAsync_CallsGoalServicePeriodically()
        {
            // Arrange
            var goalServiceMock = new Mock<IGoalService>();
            goalServiceMock
                .Setup(s => s.CheckGoalStatusesAndTriggerNotifications())
                .Returns(Task.CompletedTask)
                .Verifiable();

            var services = new ServiceCollection();
            services.AddSingleton(goalServiceMock.Object);

            var loggerMock = new Mock<ILogger<GoalNotificationService>>();
            var serviceProvider = services.BuildServiceProvider();

            var backgroundService = new TestableGoalNotificationService(serviceProvider, loggerMock.Object, TimeSpan.FromMilliseconds(100));

            // Act: run for 250ms (should trigger at least twice)
            using var cts = new CancellationTokenSource(300);
            await backgroundService.StartAsync(cts.Token);

            // Allow short delay for internal loop
            await Task.Delay(350);
            await backgroundService.StopAsync(cts.Token);

            // Assert
            goalServiceMock.Verify(s => s.CheckGoalStatusesAndTriggerNotifications(), Times.AtLeast(2));
        }

        private class TestableGoalNotificationService : GoalNotificationService
        {
            private readonly TimeSpan _interval;
            public TestableGoalNotificationService(IServiceProvider serviceProvider, ILogger<GoalNotificationService> logger, TimeSpan interval)
                : base(serviceProvider, logger)
            {
                _interval = interval;
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
                    }
                    catch { }

                    await Task.Delay(_interval, stoppingToken);
                }
            }
        }
    }
}
