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
    public class WalletMappingProfile : Profile
    {
        public WalletMappingProfile()
        {
            CreateMap<Wallet, WalletDto>();
            CreateMap<WalletCreateDto, Wallet>();
            CreateMap<WalletUpdateDto, Wallet>();
        }
    }
}

