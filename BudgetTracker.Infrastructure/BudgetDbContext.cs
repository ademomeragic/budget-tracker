using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BudgetTracker.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;


namespace BudgetTracker.Infrastructure
{
    public class BudgetDbContext : IdentityDbContext<ApplicationUser>
    {
        public DbSet<BudgetLimit> BudgetLimits { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Wallet> Wallets { get; set; }
        public BudgetDbContext(DbContextOptions<BudgetDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        }
    }

}
