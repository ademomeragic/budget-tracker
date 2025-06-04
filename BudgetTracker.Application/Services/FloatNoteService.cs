using AutoMapper;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Application.Interfaces;
using BudgetTracker.Domain.Entities;
using BudgetTracker.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BudgetTracker.Application.Services
{
    public class FloatNoteService : IFloatNoteService
    {
        private readonly IFloatNoteRepository _floatNoteRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<FloatNoteService> _logger;

        public FloatNoteService(IFloatNoteRepository floatNoteRepository, IMapper mapper, ILogger<FloatNoteService> logger)
        {
            _floatNoteRepository = floatNoteRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<List<FloatNoteDto>> GetUserNotesAsync(string userId)
        {
            try
            {
                _logger.LogInformation("Fetching float notes for user {UserId}", userId);
                var now = DateTime.UtcNow;
                var notes = await _floatNoteRepository.GetUserNotesAsync(userId, now);
                var mappedNotes = _mapper.Map<List<FloatNoteDto>>(notes);
                _logger.LogInformation("Fetched {Count} notes for user {UserId}", mappedNotes.Count, userId);
                return mappedNotes;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching float notes for user {UserId}", userId);
                throw;
            }
        }

        public async Task<FloatNoteDto> CreateNoteAsync(string userId, FloatNoteDto dto)
        {
            try
            {
                _logger.LogInformation("Creating float note for user {UserId}", userId);
                var entity = _mapper.Map<FloatNote>(dto);
                entity.UserId = userId;
                entity.CreatedAt = DateTime.UtcNow;
                await _floatNoteRepository.CreateNoteAsync(entity);
                var result = _mapper.Map<FloatNoteDto>(entity);
                _logger.LogInformation("Created float note with ID {NoteId} for user {UserId}", entity.Id, userId);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating float note for user {UserId}", userId);
                throw;
            }
        }

        public async Task<bool> DeleteNoteAsync(int id, string userId)
        {
            try
            {
                _logger.LogInformation("Deleting float note with ID {NoteId} for user {UserId}", id, userId);
                var success = await _floatNoteRepository.DeleteNoteAsync(id, userId);
                if (success)
                    _logger.LogInformation("Deleted float note with ID {NoteId} for user {UserId}", id, userId);
                else
                    _logger.LogWarning("Failed to delete float note with ID {NoteId} for user {UserId} (note may not exist or belong to user)", id, userId);
                return success;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting float note with ID {NoteId} for user {UserId}", id, userId);
                throw;
            }
        }
    }
}
