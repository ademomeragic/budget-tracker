namespace Application.Dtos
{
    public class UpdateBudgetRequest
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public decimal SpendingLimit { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int CategoryId { get; set; }  // CategoryId can also be updated
    }
}
