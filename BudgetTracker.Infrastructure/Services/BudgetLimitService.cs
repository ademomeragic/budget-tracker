using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using AutoMapper;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Application.Interfaces;
using BudgetTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BudgetTracker.Infrastructure.Services
{
    public class BudgetLimitService : IBudgetLimitService
    {
        private readonly BudgetDbContext _context;
        private readonly IMapper _mapper;

        public BudgetLimitService(BudgetDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<BudgetLimitDto>> GetAllLimitsAsync()
        {
            var limits = await _context.BudgetLimits.ToListAsync();
            return _mapper.Map<List<BudgetLimitDto>>(limits);
        }

        public async Task<BudgetLimitDto?> GetLimitByIdAsync(int id)
        {
            var limit = await _context.BudgetLimits.FindAsync(id);
            return limit == null ? null : _mapper.Map<BudgetLimitDto>(limit);
        }
        public async Task<IEnumerable<BudgetLimitDto>> GetLimitsByUserIdAsync(string userId)
        {
            var limits = await _context.BudgetLimits
                .Where(l => l.UserId == userId)
                .ToListAsync();

            return _mapper.Map<IEnumerable<BudgetLimitDto>>(limits);
        }
        public async Task<BudgetLimitDto> CreateLimitAsync(BudgetLimitCreateDto dto, string userId)
        {
            var limit = _mapper.Map<BudgetLimit>(dto);

            limit.UserId = userId;

            _context.BudgetLimits.Add(limit);
            await _context.SaveChangesAsync();

            return _mapper.Map<BudgetLimitDto>(limit);
        }


        public async Task<bool> UpdateLimitAsync(int id, BudgetLimitUpdateDto dto)
        {
            var existing = await _context.BudgetLimits.FindAsync(id);
            if (existing == null) return false;

            _mapper.Map(dto, existing);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteLimitAsync(int id)
        {
            var limit = await _context.BudgetLimits.FindAsync(id);
            if (limit == null) return false;

            _context.BudgetLimits.Remove(limit);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
