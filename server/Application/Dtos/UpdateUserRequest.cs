namespace Application.Dtos
{
    public class UpdateUserRequest
    {
        public int Id { get; set; }  
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
    }
}
