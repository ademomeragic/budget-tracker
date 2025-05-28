using AutoMapper;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Application.Interfaces;
using BudgetTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BudgetTracker.Infrastructure.Services
{
    public class FloatNoteService : IFloatNoteService
    {
        private readonly BudgetDbContext _context;
        private readonly IMapper _mapper;

        public FloatNoteService(BudgetDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<FloatNoteDto>> GetUserNotesAsync(string userId)
        {
            var now = DateTime.UtcNow;
            var notes = await _context.FloatNotes
                .Where(n => n.UserId == userId && (n.DisplayUntil == null || n.DisplayUntil > now))
                .ToListAsync();
            return _mapper.Map<List<FloatNoteDto>>(notes);
        }

        public async Task<FloatNoteDto> CreateNoteAsync(string userId, FloatNoteDto dto)
        {
            var entity = _mapper.Map<FloatNote>(dto);
            entity.UserId = userId;
            entity.CreatedAt = DateTime.UtcNow;
            _context.FloatNotes.Add(entity);
            await _context.SaveChangesAsync();
            return _mapper.Map<FloatNoteDto>(entity);
        }

        public async Task<bool> DeleteNoteAsync(int id, string userId)
        {
            var note = await _context.FloatNotes.FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);
            if (note == null) return false;
            _context.FloatNotes.Remove(note);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
