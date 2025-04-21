using AutoMapper;
using Domain.Entities;
using Application.Dtos;

namespace Application.Profiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Mapping for Budget
            CreateMap<Budget, BudgetResponse>()
                .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Category))
                .ForMember(dest => dest.Transactions, opt => opt.MapFrom(src => src.Transactions));

            CreateMap<CreateBudgetRequest, Budget>();
            CreateMap<UpdateBudgetRequest, Budget>();

            // Mapping for Transaction
            CreateMap<Transaction, TransactionResponse>();
            CreateMap<CreateTransactionRequest, Transaction>();
            CreateMap<UpdateTransactionRequest, Transaction>();

            // Mapping for Category
            CreateMap<Category, CategoryResponse>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id));  // Ensure Id is mapped correctly
            CreateMap<CreateCategoryRequest, Category>();
            CreateMap<UpdateCategoryRequest, Category>();

            // Mapping for User
            CreateMap<User, UserResponse>();
            CreateMap<CreateUserRequest, User>();
            CreateMap<UpdateUserRequest, User>();
        }
    }
}

