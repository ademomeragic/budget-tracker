namespace Application.Dtos
{
    public class CreateTransactionRequest
    {
        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public int CategoryId { get; set; } // Assuming each transaction has a category
        public int BudgetId { get; set; } // Assuming each transaction belongs to a budget
        public DateTime Date { get; set; }
    }
}
