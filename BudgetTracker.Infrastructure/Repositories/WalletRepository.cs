using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BudgetTracker.Domain.Entities;
using BudgetTracker.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BudgetTracker.Infrastructure.Repositories
{
    public class WalletRepository : IWalletRepository
    {
        private readonly BudgetDbContext _context;

        public WalletRepository(BudgetDbContext context)
        {
            _context = context;
        }

        public async Task<List<Wallet>> GetWalletsByUserAsync(string userId)
        {
            return await _context.Wallets
                .Where(w => w.UserId == userId)
                .Include(w => w.Transactions)
                .ToListAsync();
        }

        public async Task<Wallet> GetWalletByIdAsync(int id, string userId)
        {
            return await _context.Wallets
                .Include(w => w.Transactions)
                .FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);
        }

        public async Task AddWalletAsync(Wallet wallet)
        {
            await _context.Wallets.AddAsync(wallet);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateWalletAsync(Wallet wallet)
        {
            _context.Wallets.Update(wallet);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteWalletAsync(Wallet wallet)
        {
            _context.Wallets.Remove(wallet);
            await _context.SaveChangesAsync();
        }
    }
}
