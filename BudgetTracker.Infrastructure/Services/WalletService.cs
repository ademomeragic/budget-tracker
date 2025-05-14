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
    public class WalletService : IWalletService
    {
        private readonly BudgetDbContext _context;
        private readonly IMapper _mapper;

        public WalletService(BudgetDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<WalletDto>> GetUserWalletsAsync(string userId)
        {
            var wallets = await _context.Wallets
                .Where(w => w.UserId == userId)
                .ToListAsync();

            return _mapper.Map<List<WalletDto>>(wallets);
        }

        public async Task<WalletDto> CreateWalletAsync(string userId, WalletCreateDto dto)
        {
            var wallet = _mapper.Map<Wallet>(dto);
            wallet.UserId = userId;

            _context.Wallets.Add(wallet);
            await _context.SaveChangesAsync();

            return _mapper.Map<WalletDto>(wallet);
        }

        public async Task<WalletDto> UpdateWalletAsync(int id, string userId, WalletUpdateDto dto)
        {
            var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);
            if (wallet == null) throw new Exception("Wallet not found");

            _mapper.Map(dto, wallet);
            await _context.SaveChangesAsync();

            return _mapper.Map<WalletDto>(wallet);
        }

        public async Task<bool> DeleteWalletAsync(int id, string userId)
        {
            var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);
            if (wallet == null) return false;

            _context.Wallets.Remove(wallet);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
