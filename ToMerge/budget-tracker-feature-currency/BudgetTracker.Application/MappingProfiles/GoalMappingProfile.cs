using AutoMapper;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
public class GoalMappingProfile : Profile
{
    public GoalMappingProfile()
    {
        CreateMap<Goal, GoalDto>().ReverseMap();
        CreateMap<GoalCreateDto, Goal>();
        CreateMap<GoalUpdateDto, Goal>();
    }
}

