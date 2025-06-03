using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Application.Services;
using BudgetTracker.Domain.Entities;
using BudgetTracker.Domain.Interfaces;
using Moq;
using Xunit;
using BudgetTracker.Application.Interfaces;


public class WalletServiceTests
{
    private readonly Mock<IWalletRepository> _walletRepoMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly Mock<ITransactionService> _transactionServiceMock;
    private readonly WalletService _service;

    public WalletServiceTests()
    {
        _walletRepoMock = new Mock<IWalletRepository>();
        _mapperMock = new Mock<IMapper>();
        _transactionServiceMock = new Mock<ITransactionService>();
        _service = new WalletService(_walletRepoMock.Object, _mapperMock.Object, _transactionServiceMock.Object);
    }

    [Fact]
    public async Task GetUserWalletsAsync_ReturnsMappedWallets()
    {
        string userId = "user1";
        var wallets = new List<Wallet>
        {
            new Wallet { Id = 1, Name = "Wallet1" },
            new Wallet { Id = 2, Name = "Wallet2" }
        };
        var walletDtos = new List<WalletDto>
        {
            new WalletDto { Id = 1, Name = "Wallet1" },
            new WalletDto { Id = 2, Name = "Wallet2" }
        };

        _walletRepoMock.Setup(r => r.GetWalletsByUserAsync(userId)).ReturnsAsync(wallets);
        _mapperMock.Setup(m => m.Map<List<WalletDto>>(wallets)).Returns(walletDtos);

        var result = await _service.GetUserWalletsAsync(userId);

        Assert.Equal(walletDtos, result);
    }

    [Fact]
    public async Task CreateWalletAsync_MapsAndAddsWallet()
    {
        string userId = "user1";
        var createDto = new WalletCreateDto { Name = "NewWallet" };
        var wallet = new Wallet { Name = "NewWallet" };
        var walletDto = new WalletDto { Name = "NewWallet" };

        _mapperMock.Setup(m => m.Map<Wallet>(createDto)).Returns(wallet);
        _walletRepoMock.Setup(r => r.AddWalletAsync(wallet)).Returns(Task.CompletedTask);
        _mapperMock.Setup(m => m.Map<WalletDto>(wallet)).Returns(walletDto);

        var result = await _service.CreateWalletAsync(userId, createDto);

        Assert.Equal(userId, wallet.UserId);
        Assert.Equal(walletDto, result);
        _walletRepoMock.Verify(r => r.AddWalletAsync(wallet), Times.Once);
    }

    [Fact]
    public async Task UpdateWalletAsync_UpdatesAndReturnsWalletDto()
    {
        string userId = "user1";
        int walletId = 1;
        var wallet = new Wallet { Id = walletId, Name = "OldName" };
        var updateDto = new WalletUpdateDto { Name = "UpdatedName" };
        var walletDto = new WalletDto { Id = walletId, Name = "UpdatedName" };

        _walletRepoMock.Setup(r => r.GetWalletByIdAsync(walletId, userId)).ReturnsAsync(wallet);
        _mapperMock.Setup(m => m.Map(updateDto, wallet)).Callback<WalletUpdateDto, Wallet>((src, dest) => dest.Name = src.Name);
        _walletRepoMock.Setup(r => r.UpdateWalletAsync(wallet)).Returns(Task.CompletedTask);
        _mapperMock.Setup(m => m.Map<WalletDto>(wallet)).Returns(walletDto);

        var result = await _service.UpdateWalletAsync(walletId, userId, updateDto);

        Assert.Equal("UpdatedName", wallet.Name);
        Assert.Equal(walletDto, result);
        _walletRepoMock.Verify(r => r.UpdateWalletAsync(wallet), Times.Once);
    }

    [Fact]
    public async Task UpdateWalletAsync_ThrowsException_WhenWalletNotFound()
    {
        string userId = "user1";
        int walletId = 1;
        var updateDto = new WalletUpdateDto { Name = "UpdatedName" };

        _walletRepoMock.Setup(r => r.GetWalletByIdAsync(walletId, userId)).ReturnsAsync((Wallet)null);

        await Assert.ThrowsAsync<Exception>(() => _service.UpdateWalletAsync(walletId, userId, updateDto));
    }

    [Fact]
    public async Task DeleteWalletAsync_DeletesWalletAndReturnsTrue()
    {
        string userId = "user1";
        int walletId = 1;
        var wallet = new Wallet { Id = walletId };

        _walletRepoMock.Setup(r => r.GetWalletByIdAsync(walletId, userId)).ReturnsAsync(wallet);
        _walletRepoMock.Setup(r => r.DeleteWalletAsync(wallet)).Returns(Task.CompletedTask);

        var result = await _service.DeleteWalletAsync(walletId, userId);

        Assert.True(result);
        _walletRepoMock.Verify(r => r.DeleteWalletAsync(wallet), Times.Once);
    }

    [Fact]
    public async Task DeleteWalletAsync_ReturnsFalse_WhenWalletNotFound()
    {
        string userId = "user1";
        int walletId = 1;

        _walletRepoMock.Setup(r => r.GetWalletByIdAsync(walletId, userId)).ReturnsAsync((Wallet)null);

        var result = await _service.DeleteWalletAsync(walletId, userId);

        Assert.False(result);
        _walletRepoMock.Verify(r => r.DeleteWalletAsync(It.IsAny<Wallet>()), Times.Never);
    }

    [Fact]
    public async Task TransferBetweenWalletsAsync_PerformsTransferSuccessfully()
    {
        string userId = "user1";
        var transferDto = new WalletTransferDto
        {
            FromWalletId = 1,
            ToWalletId = 2,
            Amount = 50m
        };

        var fromWallet = new Wallet { Id = 1, Name = "FromWallet", Balance = 100m };
        var toWallet = new Wallet { Id = 2, Name = "ToWallet", Balance = 30m };

        _walletRepoMock.Setup(r => r.GetWalletByIdAsync(transferDto.FromWalletId, userId)).ReturnsAsync(fromWallet);
        _walletRepoMock.Setup(r => r.GetWalletByIdAsync(transferDto.ToWalletId, userId)).ReturnsAsync(toWallet);

        _transactionServiceMock
            .Setup(t => t.CreateTransactionAsync(userId, It.Is<TransactionDto>(tr => tr.Type == "expense" && tr.Amount == 50m && tr.WalletId == 1)))
            .ReturnsAsync(new TransactionDto());

        _transactionServiceMock
            .Setup(t => t.CreateTransactionAsync(userId, It.Is<TransactionDto>(tr => tr.Type == "income" && tr.Amount == 50m && tr.WalletId == 2)))
            .ReturnsAsync(new TransactionDto());

        var result = await _service.TransferBetweenWalletsAsync(userId, transferDto);

        Assert.True(result);

        _transactionServiceMock.Verify(t => t.CreateTransactionAsync(userId, It.IsAny<TransactionDto>()), Times.Exactly(2));
    }

    [Fact]
    public async Task TransferBetweenWalletsAsync_Throws_WhenFromAndToWalletAreSame()
    {
        var dto = new WalletTransferDto
        {
            FromWalletId = 1,
            ToWalletId = 1,
            Amount = 50m
        };

        await Assert.ThrowsAsync<ArgumentException>(() => _service.TransferBetweenWalletsAsync("user1", dto));
    }

    [Fact]
    public async Task TransferBetweenWalletsAsync_Throws_WhenWalletNotFound()
    {
        var dto = new WalletTransferDto
        {
            FromWalletId = 1,
            ToWalletId = 2,
            Amount = 50m
        };

        _walletRepoMock.Setup(r => r.GetWalletByIdAsync(dto.FromWalletId, "user1")).ReturnsAsync((Wallet)null);
        _walletRepoMock.Setup(r => r.GetWalletByIdAsync(dto.ToWalletId, "user1")).ReturnsAsync(new Wallet());

        await Assert.ThrowsAsync<Exception>(() => _service.TransferBetweenWalletsAsync("user1", dto));
    }

    [Fact]
    public async Task TransferBetweenWalletsAsync_Throws_WhenAmountNotPositive()
    {
        var dto = new WalletTransferDto
        {
            FromWalletId = 1,
            ToWalletId = 2,
            Amount = 0
        };

        _walletRepoMock.Setup(r => r.GetWalletByIdAsync(dto.FromWalletId, "user1")).ReturnsAsync(new Wallet());
        _walletRepoMock.Setup(r => r.GetWalletByIdAsync(dto.ToWalletId, "user1")).ReturnsAsync(new Wallet());

        await Assert.ThrowsAsync<ArgumentException>(() => _service.TransferBetweenWalletsAsync("user1", dto));
    }

    [Fact]
    public async Task TransferBetweenWalletsAsync_Throws_WhenInsufficientFunds()
    {
        var dto = new WalletTransferDto
        {
            FromWalletId = 1,
            ToWalletId = 2,
            Amount = 100
        };

        var fromWallet = new Wallet { Id = 1, Balance = 50m };
        var toWallet = new Wallet { Id = 2 };

        _walletRepoMock.Setup(r => r.GetWalletByIdAsync(dto.FromWalletId, "user1")).ReturnsAsync(fromWallet);
        _walletRepoMock.Setup(r => r.GetWalletByIdAsync(dto.ToWalletId, "user1")).ReturnsAsync(toWallet);

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.TransferBetweenWalletsAsync("user1", dto));
    }
}
