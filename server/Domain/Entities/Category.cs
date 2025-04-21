namespace Domain.Entities
{
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; } // E.g., "Groceries", "Utilities", "Entertainment"
        
        public List<Budget> Budgets { get; set; }
        public List<Transaction> Transactions { get; set; }
    }
}
