
namespace Application.Dtos
{
    public class BudgetResponse
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public decimal SpendingLimit { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }  // Category Name included in the response
        public List<TransactionResponse> Transactions { get; set; }  // Transactions related to the budget
        
        // Add Category as an object (assuming Category is a class)
        public CategoryResponse Category { get; set; }

 // Category details included
    }
}
