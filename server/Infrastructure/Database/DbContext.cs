using Microsoft.EntityFrameworkCore;
using Domain.Entities;

namespace Infrastructure
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Budget> Budgets { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Category> Categories { get; set; }

        // Configure the migrations assembly here
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlServer("Server=localhost,1433;Database=budget-tracker-sql;User Id=sa;Password=Password1;TrustServerCertificate=true;", 
                    b => b.MigrationsAssembly("Infrastructure"));
            }
        }

        // Configure entity relationships and avoid cascading deletes
        protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    // Budget and Category (Use Restrict instead of Cascade to avoid cascading issues)
    modelBuilder.Entity<Budget>()
        .HasOne(b => b.Category)
        .WithMany(c => c.Budgets)
        .HasForeignKey(b => b.CategoryId)
        .OnDelete(DeleteBehavior.Restrict) // Prevent cascading delete for this relation
        .IsRequired();

    // Budget and User (Ensure Restrict here too for safe delete handling)
    modelBuilder.Entity<Budget>()
        .HasOne(b => b.User)
        .WithMany(u => u.Budgets)
        .HasForeignKey(b => b.UserId)
        .OnDelete(DeleteBehavior.Restrict) // No cascade delete
        .IsRequired();

    // Transaction and Budget (Set to Cascade if you want deletion of Transactions when Budget is deleted)
    modelBuilder.Entity<Transaction>()
        .HasOne(t => t.Budget)
        .WithMany(b => b.Transactions)
        .HasForeignKey(t => t.BudgetId)
        .OnDelete(DeleteBehavior.Cascade) // Cascade delete for Transaction when Budget is deleted
        .IsRequired();

    // Transaction and Category (Use Restrict to avoid cascading issues)
    modelBuilder.Entity<Transaction>()
        .HasOne(t => t.Category)
        .WithMany(c => c.Transactions)
        .HasForeignKey(t => t.CategoryId)
        .OnDelete(DeleteBehavior.Restrict) // Prevent cascading delete for this relation
        .IsRequired();

    modelBuilder.Entity<Category>()
        .Property(c => c.Id)
        .ValueGeneratedOnAdd(); 
}

    }
}
