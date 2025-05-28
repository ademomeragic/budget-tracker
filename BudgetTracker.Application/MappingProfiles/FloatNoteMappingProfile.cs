using AutoMapper;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Domain.Entities;

namespace BudgetTracker.Api.MappingProfiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<FloatNote, FloatNoteDto>().ReverseMap();
        }
    }
}
