using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BudgetTracker.Domain.Entities;

namespace BudgetTracker.Domain.Interfaces
{
    public interface IFloatNoteRepository
    {
        Task<List<FloatNote>> GetUserNotesAsync(string userId, DateTime now);
        Task CreateNoteAsync(FloatNote note);
        Task<bool> DeleteNoteAsync(int id, string userId);
        Task<bool> SaveChangesAsync();
    }
}
