using Xunit;
using Moq;
using AutoMapper;
using BudgetTracker.Application.Interfaces;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Domain.Entities;
using BudgetTracker.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;
using BudgetTracker.Infrastructure;

public class TransactionServiceTests
{
    private readonly Mock<BudgetDbContext> _mockContext;
    private readonly Mock<IMapper> _mockMapper;
    private readonly Mock<IGoalService> _mockGoalService;
    private readonly TransactionService _service;

    public TransactionServiceTests()
    {
        var options = new DbContextOptionsBuilder<BudgetDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _mockContext = new Mock<BudgetDbContext>(options);
        _mockMapper = new Mock<IMapper>();
        _mockGoalService = new Mock<IGoalService>();

        var context = new BudgetDbContext(options);
        _service = new TransactionService(context, _mockMapper.Object, _mockGoalService.Object);
    }

    [Fact]
    public async Task CreateTransactionAsync_Income_AddsBalanceAndSaves()
    {
        // Arrange
        var userId = "user123";
        var wallet = new Wallet { Id = 1, UserId = userId, Balance = 100 };
        var dto = new TransactionDto
        {
            Amount = 50,
            Type = "income",
            WalletId = 1,
            Description = "Test Income",
            Date = DateTime.Today
        };
        var transaction = new Transaction
        {
            Amount = 50,
            Type = "income",
            WalletId = 1,
            Description = "Test Income",
            Date = DateTime.Today
        };

        var options = new DbContextOptionsBuilder<BudgetDbContext>()
            .UseInMemoryDatabase(databaseName: "TestDb_CreateIncome")
            .Options;
        var context = new BudgetDbContext(options);
        context.Wallets.Add(wallet);
        await context.SaveChangesAsync();

        var mapper = new Mock<IMapper>();
        mapper.Setup(m => m.Map<Transaction>(It.IsAny<TransactionDto>())).Returns(transaction);
        mapper.Setup(m => m.Map<TransactionDto>(It.IsAny<Transaction>())).Returns(dto);

        var goalService = new Mock<IGoalService>();
        var service = new TransactionService(context, mapper.Object, goalService.Object);

        // Act
        var result = await service.CreateTransactionAsync(userId, dto);

        // Assert
        Assert.Equal(150, wallet.Balance);
        Assert.Equal(dto.Amount, result.Amount);
        Assert.Single(context.Transactions);
    }

    [Fact]
    public async Task DeleteTransactionAsync_RemovesTransactionAndUpdatesBalance()
    {
        var userId = "user123";
        var wallet = new Wallet { Id = 1, UserId = userId, Balance = 200 };
        var transaction = new Transaction
        {
            Id = 1,
            WalletId = 1,
            Wallet = wallet,
            Amount = 50,
            Type = "expense",
            Date = DateTime.Today
        };

        var options = new DbContextOptionsBuilder<BudgetDbContext>()
            .UseInMemoryDatabase(databaseName: "TestDb_Delete")
            .Options;
        var context = new BudgetDbContext(options);
        context.Wallets.Add(wallet);
        context.Transactions.Add(transaction);
        await context.SaveChangesAsync();

        var mapper = new Mock<IMapper>();
        var goalService = new Mock<IGoalService>();
        var service = new TransactionService(context, mapper.Object, goalService.Object);

        var result = await service.DeleteTransactionAsync(1, userId);

        Assert.True(result);
        Assert.Equal(250, wallet.Balance); // Refund expense
        Assert.Empty(context.Transactions);
    }
}
