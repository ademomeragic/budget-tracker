using AutoMapper;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Domain.Entities;

public class TransactionMappingProfile : Profile
{
    public TransactionMappingProfile()
    {
        // From entity to DTO — direct DateTime mapping
        CreateMap<Transaction, TransactionDto>();

        // From DTO to entity — also direct DateTime mapping
        CreateMap<TransactionDto, Transaction>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CategoryId, opt => opt.MapFrom(src => src.CategoryId));
    }
}
