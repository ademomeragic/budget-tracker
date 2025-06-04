using Xunit;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using BudgetTracker.Domain.Entities;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Application.Interfaces;
using BudgetTracker.Infrastructure.Services;
using BudgetTracker.Infrastructure;

public class RecurringTransactionServiceTests
{
    private BudgetDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<BudgetDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new BudgetDbContext(options);
    }

    [Fact]
    public async Task GetUserRecurringAsync_ReturnsUserRecurringTransactions()
    {
        var db = GetDbContext();
        db.RecurringTransactions.Add(new RecurringTransaction
        {
            UserId = "user1",
            Amount = 100,
            Frequency = "monthly",
            Wallet = new Wallet(),
            Category = new Category()
        });
        await db.SaveChangesAsync();

        var mockMapper = new Mock<IMapper>();
        mockMapper.Setup(m => m.Map<List<RecurringTransactionDto>>(It.IsAny<List<RecurringTransaction>>()))
            .Returns(new List<RecurringTransactionDto> { new RecurringTransactionDto { Amount = 100 } });

        var service = new RecurringTransactionService(db, mockMapper.Object, Mock.Of<ITransactionService>());

        var result = await service.GetUserRecurringAsync("user1");

        Assert.Single(result);
        Assert.Equal(100, result[0].Amount);
    }

    [Fact]
    public async Task AddRecurringAsync_CreatesNewRecurringTransaction()
    {
        var db = GetDbContext();
        var service = new RecurringTransactionService(db, Mock.Of<IMapper>(), Mock.Of<ITransactionService>());

        var dto = new RecurringTransactionDto
        {
            Amount = 200,
            Description = "Gym",
            Type = "expense",
            WalletId = 1,
            CategoryId = 2,
            NextRunDate = DateTime.Today,
            Frequency = "weekly"
        };

        await service.AddRecurringAsync("user2", dto);

        var rec = await db.RecurringTransactions.FirstOrDefaultAsync(r => r.UserId == "user2");
        Assert.NotNull(rec);
        Assert.Equal(200, rec.Amount);
        Assert.Equal("Gym", rec.Description);
    }

    [Fact]
    public async Task UpdateRecurringAsync_UpdatesIfExists()
    {
        var db = GetDbContext();
        db.RecurringTransactions.Add(new RecurringTransaction
        {
            Id = 1,
            UserId = "user3",
            Amount = 50,
            Frequency = "daily"
        });
        await db.SaveChangesAsync();

        var service = new RecurringTransactionService(db, Mock.Of<IMapper>(), Mock.Of<ITransactionService>());

        var dto = new RecurringTransactionDto
        {
            Amount = 75,
            Description = "Updated",
            Type = "income",
            WalletId = 1,
            CategoryId = 2,
            NextRunDate = DateTime.Today,
            Frequency = "weekly"
        };

        await service.UpdateRecurringAsync("user3", 1, dto);
        var updated = await db.RecurringTransactions.FindAsync(1);

        Assert.Equal(75, updated.Amount);
        Assert.Equal("Updated", updated.Description);
        Assert.Equal("weekly", updated.Frequency);
    }

    [Fact]
    public async Task DeleteRecurringAsync_RemovesEntityIfExists()
    {
        var db = GetDbContext();
        db.RecurringTransactions.Add(new RecurringTransaction
        {
            Id = 10,
            UserId = "user4"
        });
        await db.SaveChangesAsync();

        var service = new RecurringTransactionService(db, Mock.Of<IMapper>(), Mock.Of<ITransactionService>());
        await service.DeleteRecurringAsync("user4", 10);

        var result = await db.RecurringTransactions.FindAsync(10);
        Assert.Null(result);
    }

    [Fact]
    public async Task RunDueRecurringTransactionsAsync_CreatesTransactionsAndUpdatesDates()
    {
        // Arrange
        var db = GetDbContext();
        var due = new RecurringTransaction
        {
            Id = 5,
            UserId = "user5",
            Amount = 100,
            Description = "Netflix",
            Type = "expense",
            WalletId = 1,
            CategoryId = 1,
            NextRunDate = DateTime.Today.AddDays(-1),
            Frequency = "daily"
        };
        db.RecurringTransactions.Add(due);
        await db.SaveChangesAsync();

        var mockTransactionService = new Mock<ITransactionService>();
        mockTransactionService
            .Setup(ts => ts.CreateTransactionAsync(It.IsAny<string>(), It.IsAny<TransactionDto>()))
            .ReturnsAsync(new TransactionDto());

        var service = new RecurringTransactionService(db, Mock.Of<IMapper>(), mockTransactionService.Object);

        // Act
        await service.RunDueRecurringTransactionsAsync("user5");

        // Assert
        var updated = await db.RecurringTransactions.FindAsync(5);
        Assert.Equal(DateTime.Today, updated.NextRunDate.AddDays(-1)); // Means it was incremented by 1 day
        mockTransactionService.Verify(ts => ts.CreateTransactionAsync("user5", It.IsAny<TransactionDto>()), Times.Once);
    }
}
