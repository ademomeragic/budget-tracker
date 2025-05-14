using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Domain.Entities;

namespace BudgetTracker.Application.MappingProfiles
{
    public class BudgetLimitMappingProfile : Profile
    {
        public BudgetLimitMappingProfile()
        {
            CreateMap<BudgetLimit, BudgetLimitDto>().ReverseMap();
            CreateMap<BudgetLimit, BudgetLimitCreateDto>().ReverseMap();
            CreateMap<BudgetLimit, BudgetLimitUpdateDto>().ReverseMap();
        }
    }
}

