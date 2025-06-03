using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BudgetTracker.Domain.Entities;
using BudgetTracker.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BudgetTracker.Infrastructure.Repositories
{
    public class FloatNoteRepository : IFloatNoteRepository
    {
        private readonly BudgetDbContext _context;

        public FloatNoteRepository(BudgetDbContext context)
        {
            _context = context;
        }

        public async Task<List<FloatNote>> GetUserNotesAsync(string userId, DateTime now)
        {
            return await _context.FloatNotes
                .Where(note => note.UserId == userId && note.CreatedAt <= now)
                .OrderByDescending(note => note.CreatedAt)
                .ToListAsync();
        }

        public async Task CreateNoteAsync(FloatNote note)
        {
            await _context.FloatNotes.AddAsync(note);
            await SaveChangesAsync();
        }

        public async Task<bool> DeleteNoteAsync(int id, string userId)
        {
            var note = await _context.FloatNotes
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

            if (note == null) return false;

            _context.FloatNotes.Remove(note);
            return await SaveChangesAsync();
        }

        public async Task<bool> SaveChangesAsync()
        {
            return (await _context.SaveChangesAsync()) > 0;
        }
    }
}
