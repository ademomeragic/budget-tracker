using AutoMapper;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Application.Interfaces;
using BudgetTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BudgetTracker.Infrastructure.Services
{
    public class GoalService : IGoalService
    {
        private readonly BudgetDbContext _context;
        private readonly IMapper _mapper;
        private readonly INotificationService _notificationService;

        public GoalService(BudgetDbContext context, IMapper mapper, INotificationService notificationService)
        {
            _context = context;
            _mapper = mapper;
            _notificationService = notificationService;
        }

        public async Task<List<GoalDto>> GetUserGoalsAsync(string userId)
        {
            var goals = await _context.Goals
                .Include(g => g.Wallet)
                .Where(g => g.Wallet.UserId == userId)
                .ToListAsync();

            var goalDtos = new List<GoalDto>();
            var now = DateTime.UtcNow;

            foreach (var goal in goals)
            {
                var currentAmount = await _context.Transactions
                    .Where(t =>
                        t.Type == goal.Type &&
                        t.CategoryId == goal.CategoryId &&
                        t.WalletId == goal.WalletId &&
                        t.Date >= goal.StartDate &&
                        t.Date <= goal.EndDate)
                    .SumAsync(t => (decimal?)t.Amount) ?? 0;


                var dto = _mapper.Map<GoalDto>(goal);
                dto.CurrentAmount = currentAmount;

                var category = await _context.Categories.FindAsync(goal.CategoryId);
                dto.CategoryName = category?.Name ?? "Unknown";

                dto.IsNearLimit = currentAmount >= 0.8m * goal.TargetAmount;
                dto.IsCrossed = currentAmount >= goal.TargetAmount;
                dto.IsNearDeadline = goal.EndDate.HasValue && (goal.EndDate.Value - now).TotalDays <= 3;
                dto.IsSuccessful = dto.IsCrossed && goal.Type == "income";

                goalDtos.Add(dto);
            }

            return goalDtos;
        }

        public async Task<GoalDto> CreateGoalAsync(string userId, GoalCreateDto dto)
        {
            var goal = _mapper.Map<Goal>(dto);
            goal.UserId = userId;
            goal.CreatedAt = DateTime.UtcNow;

            _context.Goals.Add(goal);
            await _context.SaveChangesAsync();

            await CheckGoalStatusForUser(userId);

            return _mapper.Map<GoalDto>(goal);
        }

        public async Task<GoalDto> UpdateGoalAsync(int id, string userId, GoalUpdateDto dto)
        {
            var goal = await _context.Goals.FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId);
            if (goal == null) throw new Exception("Goal not found");

            _mapper.Map(dto, goal);
            goal.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            await CheckGoalStatusForUser(userId);

            return _mapper.Map<GoalDto>(goal);
        }

        public async Task<bool> DeleteGoalAsync(int id, string userId)
        {
            var goal = await _context.Goals.FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId);
            if (goal == null) return false;

            _context.Goals.Remove(goal);
            await _context.SaveChangesAsync();

            await CheckGoalStatusForUser(userId);

            return true;
        }

        public async Task CheckGoalStatusesAndTriggerNotifications()
        {
            var goals = await _context.Goals
                .Include(g => g.Wallet)
                .Where(g => g.IsActive && g.EndDate != null && g.Wallet != null)
                .ToListAsync();

            var groupedByUser = goals.GroupBy(g => g.UserId);

            foreach (var group in groupedByUser)
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == group.Key);
                if (user == null) continue;

                await EvaluateAndNotifyForGoals(group.ToList(), user);
            }
        }

        public async Task CheckGoalStatusForUser(string userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return;

            var goals = await _context.Goals
                .Include(g => g.Wallet)
                .Where(g => g.IsActive && g.UserId == userId && g.EndDate != null)
                .ToListAsync();

            await EvaluateAndNotifyForGoals(goals, user);
        }

        private async Task EvaluateAndNotifyForGoals(List<Goal> goals, ApplicationUser user)
        {
            var now = DateTime.UtcNow;
            var threshold = user.NotificationThreshold;

            foreach (var goal in goals)
            {
                var transactions = await _context.Transactions
                    .Where(t =>
                        t.Type == "expense" &&
                        t.CategoryId == goal.CategoryId &&
                        t.WalletId == goal.WalletId &&
                        t.Date >= goal.StartDate &&
                        t.Date <= goal.EndDate)
                    .ToListAsync();

                var currentAmount = transactions.Sum(t => t.Amount);
                var progress = currentAmount / goal.TargetAmount;

                if (user.EnableDeadlineWarnings && goal.EndDate.HasValue && (goal.EndDate.Value - now).TotalDays <= 3)
                {
                    await _notificationService.CreateNotificationAsync(user.Id,
                        $"Your goal '{goal.Name}' is nearing its deadline.");
                }

                if (user.EnableNearLimitWarnings && progress >= (threshold / 100m) && progress < 1m)
                {
                    await _notificationService.CreateNotificationAsync(user.Id,
                        $"You're over {threshold}% of your goal '{goal.Name}'.");
                }

                if (user.EnableExceededWarnings && progress >= 1m && goal.Type == "expense")
                {
                    await _notificationService.CreateNotificationAsync(user.Id,
                        $"You've exceeded your expense goal '{goal.Name}'.");
                }

                if (user.EnableIncomeCongrats && progress >= 1m && goal.Type == "income")
                {
                    await _notificationService.CreateNotificationAsync(user.Id,
                        $"Congratulations! You've reached your income goal '{goal.Name}'.");
                }
            }
        }
    }
}
