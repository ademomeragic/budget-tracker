namespace Domain.Entities
{
public class Budget
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public decimal SpendingLimit { get; set; } // Optional custom limit for alerts
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    // Category
    public int CategoryId { get; set; }
    public Category Category { get; set; }

    // Foreign key to User (one user can have many budgets)
    public int UserId { get; set; }
    public User User { get; set; }

    public List<Transaction> Transactions { get; set; }
}
}