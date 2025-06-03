using AutoMapper;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Application.Interfaces;
using BudgetTracker.Domain.Entities;
using BudgetTracker.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BudgetTracker.Application.Services
{
    public class GoalService : IGoalService
    {
        private readonly IGoalRepository _goalRepository;
        private readonly ITransactionRepository _transactionRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly INotificationService _notificationService;

        public GoalService(
            IGoalRepository goalRepository,
            ITransactionRepository transactionRepository,
            ICategoryRepository categoryRepository,
            IUserRepository userRepository,
            IMapper mapper,
            INotificationService notificationService)
        {
            _goalRepository = goalRepository;
            _transactionRepository = transactionRepository;
            _categoryRepository = categoryRepository;
            _userRepository = userRepository;
            _mapper = mapper;
            _notificationService = notificationService;
        }

        public async Task<List<GoalDto>> GetUserGoalsAsync(string userId)
        {
            var goals = await _goalRepository.GetGoalsWithWalletByUserIdAsync(userId);
            var now = DateTime.UtcNow;
            var goalDtos = new List<GoalDto>();

            foreach (var goal in goals)

                ////////////////
            {
                var currentAmount = await _transactionRepository.SumTransactionsAsync(
                goal.Type, goal.CategoryId, goal.WalletId ?? 0, goal.StartDate, goal.EndDate);

                ////////////////

                var dto = _mapper.Map<GoalDto>(goal);
                dto.CurrentAmount = currentAmount;

                var category = await _categoryRepository.GetCategoryByIdAsync(goal.CategoryId);
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

            await _goalRepository.AddGoalAsync(goal);
            await CheckGoalStatusForUser(userId);

            return _mapper.Map<GoalDto>(goal);
        }

        public async Task<GoalDto> UpdateGoalAsync(int id, string userId, GoalUpdateDto dto)
        {
            var goal = await _goalRepository.GetGoalByIdAndUserAsync(id, userId);
            if (goal == null) throw new Exception("Goal not found");

            _mapper.Map(dto, goal);
            goal.UpdatedAt = DateTime.UtcNow;

            await _goalRepository.UpdateGoalAsync(goal);
            await CheckGoalStatusForUser(userId);

            return _mapper.Map<GoalDto>(goal);
        }

        public async Task<bool> DeleteGoalAsync(int id, string userId)
        {
            var success = await _goalRepository.DeleteGoalAsync(id, userId);
            if (success)
                await CheckGoalStatusForUser(userId);
            return success;
        }

        public async Task CheckGoalStatusesAndTriggerNotifications()
        {
            var goals = await _goalRepository.GetActiveGoalsWithWalletAndEndDateAsync();
            var groupedByUser = goals.GroupBy(g => g.UserId);

            foreach (var group in groupedByUser)
{
    var userId = group.Key; // <-- get the userId from the group key
    var user = await _userRepository.GetByIdAsync(userId);
    if (user != null)
        await EvaluateAndNotifyForGoals(group.ToList(), user);
}

        }

        public async Task CheckGoalStatusForUser(string userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return;

            var goals = await _goalRepository.GetActiveGoalsWithWalletByUserIdAsync(userId);
            await EvaluateAndNotifyForGoals(goals, user);
        }

        private async Task EvaluateAndNotifyForGoals(List<Goal> goals, ApplicationUser user)
        {
            var now = DateTime.UtcNow;
            var threshold = user.NotificationThreshold;

            foreach (var goal in goals)
            {
                var transactions = await _transactionRepository.GetTransactionsForGoalProgressAsync(goal);
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
