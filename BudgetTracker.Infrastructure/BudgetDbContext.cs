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
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Wallet> Wallets { get; set; }
        public DbSet<Category> Categories { get; set; }
        public BudgetDbContext(DbContextOptions<BudgetDbContext> options) : base(options) { }
        public DbSet<Goal> Goals { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<FloatNote> FloatNotes { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Transaction>()
                .HasOne(t => t.Wallet)
                .WithMany(w => w.Transactions)
                .HasForeignKey(t => t.WalletId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Goal>()
                .HasOne(g => g.Category)
                .WithMany()
                .HasForeignKey(g => g.CategoryId);

            modelBuilder.Entity<Goal>()
                .HasOne(g => g.Wallet)
                .WithMany()
                .HasForeignKey(g => g.WalletId)
                .IsRequired(false);


            modelBuilder.Entity<Category>()
                .HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.UserId)
                .IsRequired(false);

            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Salary", Type = "income", UserId = null },
                new Category { Id = 2, Name = "Freelance", Type = "income", UserId = null },
                new Category { Id = 3, Name = "Food", Type = "expense", UserId = null },
                new Category { Id = 4, Name = "Transport", Type = "expense", UserId = null },
                new Category { Id = 5, Name = "Groceries", Type = "expense", UserId = null },
                new Category { Id = 999, Name = "Internal Withdrawal", Type = "expense", UserId = null },
                new Category { Id = 998, Name = "Internal Deposit", Type = "income", UserId = null }
            );

        }

    }

}
