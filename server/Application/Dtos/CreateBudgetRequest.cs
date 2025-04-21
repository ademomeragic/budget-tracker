namespace Application.Dtos
{
    public class CreateBudgetRequest
    {
        public decimal Amount { get; set; }
        public decimal SpendingLimit { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int? CategoryId { get; set; }  // CategoryId is provided for the budget creation
        public int UserId { get; set; }

    }
}
