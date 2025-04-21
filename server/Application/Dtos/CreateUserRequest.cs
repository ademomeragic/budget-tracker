namespace Application.Dtos
{
    public class CreateUserRequest
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; } // Ensure encryption in real use case
        public int Id { get; set; }
    }
}
