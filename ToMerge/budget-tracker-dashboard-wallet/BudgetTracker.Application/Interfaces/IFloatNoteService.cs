using BudgetTracker.Application.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BudgetTracker.Application.Interfaces
{
    public interface IFloatNoteService
    {
        Task<List<FloatNoteDto>> GetUserNotesAsync(string userId);
        Task<FloatNoteDto> CreateNoteAsync(string userId, FloatNoteDto dto);
        Task<bool> DeleteNoteAsync(int id, string userId);
    }
}
