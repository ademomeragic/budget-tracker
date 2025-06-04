using AutoMapper;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Domain.Entities;
using BudgetTracker.Infrastructure;
using BudgetTracker.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace BudgetTracker.Tests.Services
{
    public class FloatNoteServiceTests
    {
        private FloatNoteService CreateService(out BudgetDbContext context, out Mock<IMapper> mapperMock)
        {
            var options = new DbContextOptionsBuilder<BudgetDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            context = new BudgetDbContext(options);
            mapperMock = new Mock<IMapper>();

            mapperMock.Setup(m => m.Map<List<FloatNoteDto>>(It.IsAny<List<FloatNote>>()))
                .Returns((List<FloatNote> notes) => notes.Select(n => new FloatNoteDto
                {
                    Id = n.Id,
                    Content = n.Content,
                    DisplayUntil = n.DisplayUntil
                }).ToList());

            mapperMock.Setup(m => m.Map<FloatNote>(It.IsAny<FloatNoteDto>()))
                .Returns((FloatNoteDto dto) => new FloatNote
                {
                    Content = dto.Content,
                    DisplayUntil = dto.DisplayUntil
                });

            mapperMock.Setup(m => m.Map<FloatNoteDto>(It.IsAny<FloatNote>()))
                .Returns((FloatNote note) => new FloatNoteDto
                {
                    Id = note.Id,
                    Content = note.Content,
                    DisplayUntil = note.DisplayUntil
                });

            return new FloatNoteService(context, mapperMock.Object);
        }

        [Fact]
        public async Task GetUserNotesAsync_ReturnsVisibleNotesOnly()
        {
            var service = CreateService(out var context, out var _);
            var now = DateTime.UtcNow;

            context.FloatNotes.AddRange(
                new FloatNote { Id = 1, UserId = "user123", Content = "Note 1", DisplayUntil = now.AddDays(1) },
                new FloatNote { Id = 2, UserId = "user123", Content = "Note 2", DisplayUntil = now.AddDays(-1) },
                new FloatNote { Id = 3, UserId = "user456", Content = "Note 3", DisplayUntil = now.AddDays(1) }
            );
            await context.SaveChangesAsync();

            var result = await service.GetUserNotesAsync("user123");

            Assert.Single(result);
            Assert.Equal("Note 1", result[0].Content);
        }

        [Fact]
        public async Task CreateNoteAsync_SavesCorrectly()
        {
            var service = CreateService(out var context, out var _);
            var dto = new FloatNoteDto { Content = "New note" };

            var result = await service.CreateNoteAsync("user123", dto);

            var saved = await context.FloatNotes.FirstOrDefaultAsync();
            Assert.NotNull(saved);
            Assert.Equal("user123", saved.UserId);
            Assert.Equal("New note", saved.Content);
            Assert.NotNull(result);
            Assert.Equal("New note", result.Content);
        }

        [Fact]
        public async Task DeleteNoteAsync_ReturnsTrueIfDeleted()
        {
            var service = CreateService(out var context, out var _);
            var note = new FloatNote { Id = 10, UserId = "user123", Content = "To delete" };
            context.FloatNotes.Add(note);
            await context.SaveChangesAsync();

            var result = await service.DeleteNoteAsync(10, "user123");

            Assert.True(result);
            Assert.Empty(context.FloatNotes);
        }

        [Fact]
        public async Task DeleteNoteAsync_ReturnsFalseIfNotFound()
        {
            var service = CreateService(out var context, out var _);

            var result = await service.DeleteNoteAsync(99, "user123");

            Assert.False(result);
        }
    }
}
