using Xunit;
using Moq;
using AutoMapper;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using BudgetTracker.Domain.Entities;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Application.Interfaces;
using BudgetTracker.Infrastructure.Services;
using BudgetTracker.Infrastructure;

public class WalletServiceTests
{
    private readonly IMapper _mapper;

    public WalletServiceTests()
    {
        var config = new MapperConfiguration(cfg =>
        {
            cfg.CreateMap<Wallet, WalletDto>().ReverseMap();
            cfg.CreateMap<WalletCreateDto, Wallet>();
            cfg.CreateMap<WalletUpdateDto, Wallet>();
        });

        _mapper = config.CreateMapper();
    }

    private BudgetDbContext GetInMemoryContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<BudgetDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;
        return new BudgetDbContext(options);
    }

    [Fact]
    public async Task CreateWalletAsync_CreatesAndReturnsWallet()
    {
        var context = GetInMemoryContext("CreateWalletDb");
        var mockTransactionService = new Mock<ITransactionService>();
        var service = new WalletService(context, _mapper, mockTransactionService.Object);

        var dto = new WalletCreateDto
        {
            Name = "Savings",
            Type = "savings",
            Balance = 500
        };

        var result = await service.CreateWalletAsync("user1", dto);

        Assert.NotNull(result);
        Assert.Equal("Savings", result.Name);
        Assert.Single(context.Wallets);
    }

    [Fact]
    public async Task GetUserWalletsAsync_ReturnsOnlyUserWallets()
    {
        var context = GetInMemoryContext("GetWalletsDb");
        context.Wallets.AddRange(
            new Wallet { Id = 1, UserId = "user1", Name = "One" },
            new Wallet { Id = 2, UserId = "user2", Name = "Two" }
        );
        await context.SaveChangesAsync();

        var mockTransactionService = new Mock<ITransactionService>();
        var service = new WalletService(context, _mapper, mockTransactionService.Object);

        var results = await service.GetUserWalletsAsync("user1");

        Assert.Single(results);
        Assert.Equal("One", results[0].Name);
    }

    [Fact]
    public async Task UpdateWalletAsync_UpdatesAndReturnsUpdatedDto()
    {
        var context = GetInMemoryContext("UpdateWalletDb");
        context.Wallets.Add(new Wallet { Id = 1, UserId = "user1", Name = "Old Name", Type = "account" });
        await context.SaveChangesAsync();

        var mockTransactionService = new Mock<ITransactionService>();
        var service = new WalletService(context, _mapper, mockTransactionService.Object);

        var dto = new WalletUpdateDto { Name = "Updated", Type = "account" };
        var result = await service.UpdateWalletAsync(1, "user1", dto);

        Assert.Equal("Updated", result.Name);
    }

    [Fact]
    public async Task DeleteWalletAsync_DeletesAndReturnsTrue()
    {
        var context = GetInMemoryContext("DeleteWalletDb");
        context.Wallets.Add(new Wallet { Id = 1, UserId = "user1", Name = "To Delete" });
        await context.SaveChangesAsync();

        var mockTransactionService = new Mock<ITransactionService>();
        var service = new WalletService(context, _mapper, mockTransactionService.Object);

        var result = await service.DeleteWalletAsync(1, "user1");

        Assert.True(result);
        Assert.Empty(context.Wallets);
    }

    [Fact]
    public async Task TransferBetweenWalletsAsync_CreatesTwoTransactions()
    {
        var context = GetInMemoryContext("TransferDb");
        context.Wallets.AddRange(
            new Wallet { Id = 1, UserId = "user1", Name = "Wallet A", Balance = 1000 },
            new Wallet { Id = 2, UserId = "user1", Name = "Wallet B", Balance = 200 }
        );
        await context.SaveChangesAsync();

        var mockTransactionService = new Mock<ITransactionService>();
        mockTransactionService.Setup(x => x.CreateTransactionAsync(It.IsAny<string>(), It.IsAny<TransactionDto>()))
            .ReturnsAsync(new TransactionDto());

        var service = new WalletService(context, _mapper, mockTransactionService.Object);

        var dto = new WalletTransferDto
        {
            FromWalletId = 1,
            ToWalletId = 2,
            Amount = 100
        };

        var result = await service.TransferBetweenWalletsAsync("user1", dto);

        Assert.True(result);
        mockTransactionService.Verify(x => x.CreateTransactionAsync("user1", It.IsAny<TransactionDto>()), Times.Exactly(2));
    }
}
