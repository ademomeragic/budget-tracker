using AutoMapper;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Application.Interfaces;
using BudgetTracker.Domain.Entities;
using BudgetTracker.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BudgetTracker.Application.Services
{
    public class FloatNoteService : IFloatNoteService
    {
        private readonly IFloatNoteRepository _floatNoteRepository;
        private readonly IMapper _mapper;

        public FloatNoteService(IFloatNoteRepository floatNoteRepository, IMapper mapper)
        {
            _floatNoteRepository = floatNoteRepository;
            _mapper = mapper;
        }

        public async Task<List<FloatNoteDto>> GetUserNotesAsync(string userId)
        {
            var now = DateTime.UtcNow;
            var notes = await _floatNoteRepository.GetUserNotesAsync(userId, now);
            return _mapper.Map<List<FloatNoteDto>>(notes);
        }

        public async Task<FloatNoteDto> CreateNoteAsync(string userId, FloatNoteDto dto)
        {
            var entity = _mapper.Map<FloatNote>(dto);
            entity.UserId = userId;
            entity.CreatedAt = DateTime.UtcNow;
            await _floatNoteRepository.CreateNoteAsync(entity);
            return _mapper.Map<FloatNoteDto>(entity);
        }

        public async Task<bool> DeleteNoteAsync(int id, string userId)
        {
            return await _floatNoteRepository.DeleteNoteAsync(id, userId);
        }
    }
}
