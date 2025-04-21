namespace Application.Dtos
{
    public class UpdateTransactionRequest
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public DateTime Date { get; set; }
        public int BudgetId { get; set; }
        public int CategoryId { get; set; }
    }
}
