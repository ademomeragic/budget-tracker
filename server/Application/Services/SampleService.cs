using Application.Interfaces;

namespace Application.Services
{
    public class SampleService : ISampleService
    {
        public string GetMessage() => "Hello from SampleService!";
    }
}
