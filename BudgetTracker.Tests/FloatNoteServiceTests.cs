using Xunit;
using Moq;
using AutoMapper;
using BudgetTracker.Application.Services;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Domain.Entities;
using BudgetTracker.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BudgetTracker.Application.Interfaces;


public class FloatNoteServiceTests
{
    private readonly Mock<IFloatNoteRepository> _floatNoteRepoMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly FloatNoteService _service;

    public FloatNoteServiceTests()
    {
        _floatNoteRepoMock = new Mock<IFloatNoteRepository>();
        _mapperMock = new Mock<IMapper>();
        _service = new FloatNoteService(_floatNoteRepoMock.Object, _mapperMock.Object);
    }

    [Fact]
    public async Task GetUserNotesAsync_ReturnsMappedNotes()
    {
        // Arrange
        var userId = "user123";
        var now = DateTime.UtcNow;

        var entities = new List<FloatNote>
        {
            new FloatNote { Id = 1, UserId = userId, Content = "Note 1" },
            new FloatNote { Id = 2, UserId = userId, Content = "Note 2" }
        };

        var dtos = new List<FloatNoteDto>
        {
            new FloatNoteDto { Id = 1, Content = "Note 1" },
            new FloatNoteDto { Id = 2, Content = "Note 2" }
        };

        _floatNoteRepoMock
            .Setup(r => r.GetUserNotesAsync(userId, It.IsAny<DateTime>()))
            .ReturnsAsync(entities);

        _mapperMock
            .Setup(m => m.Map<List<FloatNoteDto>>(entities))
            .Returns(dtos);

        // Act
        var result = await _service.GetUserNotesAsync(userId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(dtos.Count, result.Count);
        Assert.Equal(dtos[0].Content, result[0].Content);
        Assert.Equal(dtos[1].Content, result[1].Content);
    }

    [Fact]
    public async Task CreateNoteAsync_CreatesNoteAndReturnsDto()
    {
        // Arrange
        var userId = "user123";
        var inputDto = new FloatNoteDto { Content = "New note" };
        var entity = new FloatNote { Content = inputDto.Content, UserId = userId };
        var returnedDto = new FloatNoteDto { Content = inputDto.Content };

        _mapperMock
            .Setup(m => m.Map<FloatNote>(inputDto))
            .Returns(entity);

        _floatNoteRepoMock
            .Setup(r => r.CreateNoteAsync(It.Is<FloatNote>(n => n.Content == inputDto.Content && n.UserId == userId)))
            .Returns(Task.CompletedTask);

        _mapperMock
            .Setup(m => m.Map<FloatNoteDto>(entity))
            .Returns(returnedDto);

        // Act
        var result = await _service.CreateNoteAsync(userId, inputDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(returnedDto.Content, result.Content);
        _floatNoteRepoMock.Verify(r => r.CreateNoteAsync(It.IsAny<FloatNote>()), Times.Once);
    }

    [Fact]
    public async Task DeleteNoteAsync_DeletesNote_ReturnsTrue()
    {
        // Arrange
        var noteId = 1;
        var userId = "user123";

        _floatNoteRepoMock
            .Setup(r => r.DeleteNoteAsync(noteId, userId))
            .ReturnsAsync(true);

        // Act
        var result = await _service.DeleteNoteAsync(noteId, userId);

        // Assert
        Assert.True(result);
        _floatNoteRepoMock.Verify(r => r.DeleteNoteAsync(noteId, userId), Times.Once);
    }

    [Fact]
    public async Task DeleteNoteAsync_DeletesNote_ReturnsFalse_WhenNotDeleted()
    {
        // Arrange
        var noteId = 2;
        var userId = "user123";

        _floatNoteRepoMock
            .Setup(r => r.DeleteNoteAsync(noteId, userId))
            .ReturnsAsync(false);

        // Act
        var result = await _service.DeleteNoteAsync(noteId, userId);

        // Assert
        Assert.False(result);
        _floatNoteRepoMock.Verify(r => r.DeleteNoteAsync(noteId, userId), Times.Once);
    }
}
