using Xunit;
using Moq;
using AutoMapper;
using BudgetTracker.Application.Services;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Domain.Entities;
using BudgetTracker.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BudgetTracker.Application.Interfaces;


public class TransactionServiceTests
{
    private readonly Mock<ITransactionRepository> _transactionRepoMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly Mock<IGoalService> _goalServiceMock;
    private readonly TransactionService _service;

    public TransactionServiceTests()
    {
        _transactionRepoMock = new Mock<ITransactionRepository>();
        _mapperMock = new Mock<IMapper>();
        _goalServiceMock = new Mock<IGoalService>();
        _service = new TransactionService(_transactionRepoMock.Object, _mapperMock.Object, _goalServiceMock.Object);
    }

    [Fact]
    public async Task GetUserTransactionsAsync_ReturnsMappedFilteredTransactions()
    {
        string userId = "user1";
        int month = 6, year = 2025;
        var transactions = new List<Transaction>
        {
            new Transaction { Id = 1, Date = new DateTime(2025, 6, 15) },
            new Transaction { Id = 2, Date = new DateTime(2025, 5, 10) },
            new Transaction { Id = 3, Date = new DateTime(2025, 6, 5) }
        };
        var expectedFiltered = transactions.Where(t => t.Date.Month == month && t.Date.Year == year).OrderByDescending(t => t.Date).ToList();

        _transactionRepoMock.Setup(r => r.GetTransactionsByUserAsync(userId)).ReturnsAsync(transactions);
        _mapperMock.Setup(m => m.Map<List<TransactionDto>>(It.IsAny<List<Transaction>>()))
                   .Returns((List<Transaction> src) => src.Select(t => new TransactionDto { Id = t.Id, Date = t.Date }).ToList());

        var result = await _service.GetUserTransactionsAsync(userId, month, year);

        Assert.Equal(expectedFiltered.Count, result.Count);
        Assert.True(result.SequenceEqual(result.OrderByDescending(t => t.Date)));
        Assert.All(result, dto => Assert.Equal(month, dto.Date.Month));
    }

    [Fact]
    public async Task CreateTransactionAsync_UpdatesWalletBalanceAndCallsGoalCheck()
    {
        string userId = "user1";
        var dto = new TransactionDto { WalletId = 5, Amount = 100m, Type = "income" };
        var transaction = new Transaction { WalletId = 5, Amount = 100m, Type = "income" };
        var wallet = new Wallet { Id = 5, Balance = 200m };

        _mapperMock.Setup(m => m.Map<Transaction>(dto)).Returns(transaction);
        _transactionRepoMock.Setup(r => r.GetWalletByIdAsync(transaction.WalletId, userId)).ReturnsAsync(wallet);
        _transactionRepoMock.Setup(r => r.AddTransactionAsync(transaction)).Returns(Task.CompletedTask);
        _transactionRepoMock.Setup(r => r.UpdateWalletAsync(wallet)).Returns(Task.CompletedTask);
        _goalServiceMock.Setup(g => g.CheckGoalStatusForUser(userId)).Returns(Task.CompletedTask);
        _mapperMock.Setup(m => m.Map<TransactionDto>(transaction)).Returns(dto);

        var result = await _service.CreateTransactionAsync(userId, dto);

        Assert.Equal(300m, wallet.Balance); // 200 + 100 income
        _transactionRepoMock.Verify(r => r.AddTransactionAsync(transaction), Times.Once);
        _transactionRepoMock.Verify(r => r.UpdateWalletAsync(wallet), Times.Once);
        _goalServiceMock.Verify(g => g.CheckGoalStatusForUser(userId), Times.Once);
        Assert.Equal(dto, result);
    }

    [Fact]
    public async Task UpdateTransactionAsync_RevertsOldBalanceAndAppliesNewOne()
    {
        string userId = "user1";
        int transactionId = 1;
        var oldTransaction = new Transaction { Id = transactionId, WalletId = 5, Amount = 50m, Type = "expense" };
        var updatedDto = new TransactionDto { Id = transactionId, WalletId = 5, Amount = 80m, Type = "income" };
        var wallet = new Wallet { Id = 5, Balance = 100m };

        _transactionRepoMock.Setup(r => r.GetTransactionByIdAsync(transactionId, userId)).ReturnsAsync(oldTransaction);
        _transactionRepoMock.Setup(r => r.GetWalletByIdAsync(oldTransaction.WalletId, userId)).ReturnsAsync(wallet);
        _mapperMock.Setup(m => m.Map(updatedDto, oldTransaction)).Callback<TransactionDto, Transaction>((src, dest) =>
        {
            dest.Amount = src.Amount;
            dest.Type = src.Type;
            dest.WalletId = src.WalletId;
        });
        _transactionRepoMock.Setup(r => r.UpdateTransactionAsync(oldTransaction)).Returns(Task.CompletedTask);
        _transactionRepoMock.Setup(r => r.UpdateWalletAsync(wallet)).Returns(Task.CompletedTask);
        _goalServiceMock.Setup(g => g.CheckGoalStatusForUser(userId)).Returns(Task.CompletedTask);
        _mapperMock.Setup(m => m.Map<TransactionDto>(oldTransaction)).Returns(updatedDto);

        var result = await _service.UpdateTransactionAsync(transactionId, userId, updatedDto);

        // Wallet balance: 100 + 50 (revert old expense) + 80 (apply new income)
        Assert.Equal(230m, wallet.Balance);

        _transactionRepoMock.Verify(r => r.UpdateTransactionAsync(oldTransaction), Times.Once);
        _transactionRepoMock.Verify(r => r.UpdateWalletAsync(wallet), Times.Once);
        _goalServiceMock.Verify(g => g.CheckGoalStatusForUser(userId), Times.Once);

        Assert.Equal(updatedDto, result);
    }

    [Fact]
    public async Task DeleteTransactionAsync_AdjustsWalletAndReturnsTrue()
    {
        string userId = "user1";
        int transactionId = 1;
        var transaction = new Transaction { Id = transactionId, WalletId = 5, Amount = 100m, Type = "income" };
        var wallet = new Wallet { Id = 5, Balance = 500m };

        _transactionRepoMock.Setup(r => r.GetTransactionByIdAsync(transactionId, userId)).ReturnsAsync(transaction);
        _transactionRepoMock.Setup(r => r.GetWalletByIdAsync(transaction.WalletId, userId)).ReturnsAsync(wallet);
        _transactionRepoMock.Setup(r => r.DeleteTransactionAsync(transaction)).Returns(Task.CompletedTask);
        _transactionRepoMock.Setup(r => r.UpdateWalletAsync(wallet)).Returns(Task.CompletedTask);
        _goalServiceMock.Setup(g => g.CheckGoalStatusForUser(userId)).Returns(Task.CompletedTask);

        var result = await _service.DeleteTransactionAsync(transactionId, userId);

        Assert.True(result);
        Assert.Equal(400m, wallet.Balance); // 500 - 100 income
        _transactionRepoMock.Verify(r => r.DeleteTransactionAsync(transaction), Times.Once);
        _transactionRepoMock.Verify(r => r.UpdateWalletAsync(wallet), Times.Once);
        _goalServiceMock.Verify(g => g.CheckGoalStatusForUser(userId), Times.Once);
    }

    [Fact]
    public async Task DeleteTransactionAsync_ReturnsFalseIfTransactionNotFound()
    {
        string userId = "user1";
        int transactionId = 1;

        _transactionRepoMock.Setup(r => r.GetTransactionByIdAsync(transactionId, userId)).ReturnsAsync((Transaction)null);

        var result = await _service.DeleteTransactionAsync(transactionId, userId);

        Assert.False(result);
        _transactionRepoMock.Verify(r => r.DeleteTransactionAsync(It.IsAny<Transaction>()), Times.Never);
        _transactionRepoMock.Verify(r => r.UpdateWalletAsync(It.IsAny<Wallet>()), Times.Never);
        _goalServiceMock.Verify(g => g.CheckGoalStatusForUser(It.IsAny<string>()), Times.Never);
    }
}
