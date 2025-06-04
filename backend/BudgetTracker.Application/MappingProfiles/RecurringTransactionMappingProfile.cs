using AutoMapper;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Domain.Entities;

namespace BudgetTracker.Application.MappingProfiles
{
    public class RecurringTransactionMappingProfile : Profile
    {
        public RecurringTransactionMappingProfile()
        {
            // Entity → DTO
            CreateMap<RecurringTransaction, RecurringTransactionDto>()
                .ForMember(dest => dest.Amount, opt => opt.MapFrom(src => src.Amount))
                .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type))
                .ForMember(dest => dest.WalletId, opt => opt.MapFrom(src => src.WalletId))
                .ForMember(dest => dest.CategoryId, opt => opt.MapFrom(src => src.CategoryId))
                .ForMember(dest => dest.NextRunDate, opt => opt.MapFrom(src => src.NextRunDate))
                .ForMember(dest => dest.Frequency, opt => opt.MapFrom(src => src.Frequency))
                .ForSourceMember(src => src.Wallet, opt => opt.DoNotValidate())
                .ForSourceMember(src => src.Category, opt => opt.DoNotValidate());

            // DTO → Entity (optional, but useful for Create/Update methods)
            CreateMap<RecurringTransactionDto, RecurringTransaction>()
                .ForMember(dest => dest.Id, opt => opt.Ignore()) // usually handled by DB
                .ForMember(dest => dest.UserId, opt => opt.Ignore()) // handled manually
                .ForMember(dest => dest.Wallet, opt => opt.Ignore()) // navigation
                .ForMember(dest => dest.Category, opt => opt.Ignore()); // navigation
        }
    }
}
