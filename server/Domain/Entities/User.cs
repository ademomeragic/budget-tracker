namespace Domain.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; } // Unique email for login/registration
        public string? PasswordHash { get; set; } // To store hashed password for authentication
        
        // One-to-many relationship: A user can have many budgets
        public List<Budget>? Budgets { get; set; }
    }
}
