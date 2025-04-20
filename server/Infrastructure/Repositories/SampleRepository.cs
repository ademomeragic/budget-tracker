using Domain.Entities;

namespace Infrastructure.Repositories
{
    public class SampleRepository
    {
        public SampleEntity GetSample() => new SampleEntity { Id = 1, Name = "Test" };
    }
}
