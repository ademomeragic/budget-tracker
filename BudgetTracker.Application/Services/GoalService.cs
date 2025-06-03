using AutoMapper;
using BudgetTracker.Application.Dtos;
using BudgetTracker.Application.Interfaces;
using BudgetTracker.Domain.Entities;
using BudgetTracker.Domain.Interfaces;
using Microsoft.Extensions.Logging;
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
        private readonly ILogger<GoalService> _logger;

        public GoalService(
            IGoalRepository goalRepository,
            ITransactionRepository transactionRepository,
            ICategoryRepository categoryRepository,
            IUserRepository userRepository,
            IMapper mapper,
            INotificationService notificationService,
            ILogger<GoalService> logger)
        {
            _goalRepository = goalRepository;
            _transactionRepository = transactionRepository;
            _categoryRepository = categoryRepository;
            _userRepository = userRepository;
            _mapper = mapper;
            _notificationService = notificationService;
            _logger = logger;
        }

        public async Task<List<GoalDto>> GetUserGoalsAsync(string userId)
        {
            try
            {
                _logger.LogInformation("Fetching goals for user {UserId}", userId);

                var goals = await _goalRepository.GetGoalsWithWalletByUserIdAsync(userId);
                var now = DateTime.UtcNow;
                var goalDtos = new List<GoalDto>();

                foreach (var goal in goals)
                {
                    var currentAmount = await _transactionRepository.SumTransactionsAsync(
                        goal.Type, goal.CategoryId, goal.WalletId ?? 0, goal.StartDate, goal.EndDate);

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

                _logger.LogInformation("Returning {Count} goals for user {UserId}", goalDtos.Count, userId);
                return goalDtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching goals for user {UserId}", userId);
                throw;
            }
        }

        public async Task<GoalDto> CreateGoalAsync(string userId, GoalCreateDto dto)
        {
            try
            {
                _logger.LogInformation("Creating goal for user {UserId}", userId);

                var goal = _mapper.Map<Goal>(dto);
                goal.UserId = userId;
                goal.CreatedAt = DateTime.UtcNow;

                await _goalRepository.AddGoalAsync(goal);
                await CheckGoalStatusForUser(userId);

                _logger.LogInformation("Created goal {GoalName} for user {UserId}", goal.Name, userId);
                return _mapper.Map<GoalDto>(goal);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating goal for user {UserId}", userId);
                throw;
            }
        }

        public async Task<GoalDto> UpdateGoalAsync(int id, string userId, GoalUpdateDto dto)
        {
            try
            {
                _logger.LogInformation("Updating goal {GoalId} for user {UserId}", id, userId);

                var goal = await _goalRepository.GetGoalByIdAndUserAsync(id, userId);
                if (goal == null)
                {
                    _logger.LogWarning("Goal {GoalId} not found for user {UserId}", id, userId);
                    throw new Exception("Goal not found");
                }

                _mapper.Map(dto, goal);
                goal.UpdatedAt = DateTime.UtcNow;

                await _goalRepository.UpdateGoalAsync(goal);
                await CheckGoalStatusForUser(userId);

                _logger.LogInformation("Updated goal {GoalId} for user {UserId}", id, userId);
                return _mapper.Map<GoalDto>(goal);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating goal {GoalId} for user {UserId}", id, userId);
                throw;
            }
        }

        public async Task<bool> DeleteGoalAsync(int id, string userId)
        {
            try
            {
                _logger.LogInformation("Deleting goal {GoalId} for user {UserId}", id, userId);

                var success = await _goalRepository.DeleteGoalAsync(id, userId);
                if (success)
                {
                    _logger.LogInformation("Deleted goal {GoalId} for user {UserId}", id, userId);
                    await CheckGoalStatusForUser(userId);
                }
                else
                {
                    _logger.LogWarning("Failed to delete goal {GoalId} for user {UserId}", id, userId);
                }
                return success;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting goal {GoalId} for user {UserId}", id, userId);
                throw;
            }
        }

        public async Task CheckGoalStatusesAndTriggerNotifications()
        {
            _logger.LogInformation("Checking goal statuses for all users");

            try
            {
                var goals = await _goalRepository.GetActiveGoalsWithWalletAndEndDateAsync();
                var groupedByUser = goals.GroupBy(g => g.UserId);

                foreach (var group in groupedByUser)
                {
                    var userId = group.Key;
                    var user = await _userRepository.GetByIdAsync(userId);
                    if (user != null)
                    {
                        await EvaluateAndNotifyForGoals(group.ToList(), user);
                        _logger.LogInformation("Checked goals and notifications sent for user {UserId}", userId);
                    }
                    else
                    {
                        _logger.LogWarning("User {UserId} not found during goal status check", userId);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking goal statuses and triggering notifications");
                throw;
            }
        }

        public async Task CheckGoalStatusForUser(string userId)
        {
            try
            {
                _logger.LogInformation("Checking goal statuses for user {UserId}", userId);

                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    _logger.LogWarning("User {UserId} not found during single user goal status check", userId);
                    return;
                }

                var goals = await _goalRepository.GetActiveGoalsWithWalletByUserIdAsync(userId);
                await EvaluateAndNotifyForGoals(goals, user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking goal status for user {UserId}", userId);
                throw;
            }
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
                    _logger.LogInformation("Sending deadline warning for goal {GoalName} to user {UserId}", goal.Name, user.Id);
                    await _notificationService.CreateNotificationAsync(user.Id,
                        $"Your goal '{goal.Name}' is nearing its deadline.");
                }

                if (user.EnableNearLimitWarnings && progress >= (threshold / 100m) && progress < 1m)
                {
                    _logger.LogInformation("Sending near-limit warning for goal {GoalName} to user {UserId}", goal.Name, user.Id);
                    await _notificationService.CreateNotificationAsync(user.Id,
                        $"You're over {threshold}% of your goal '{goal.Name}'.");
                }

                if (user.EnableExceededWarnings && progress >= 1m && goal.Type == "expense")
                {
                    _logger.LogInformation("Sending exceeded warning for goal {GoalName} to user {UserId}", goal.Name, user.Id);
                    await _notificationService.CreateNotificationAsync(user.Id,
                        $"You've exceeded your expense goal '{goal.Name}'.");
                }

                if (user.EnableIncomeCongrats && progress >= 1m && goal.Type == "income")
                {
                    _logger.LogInformation("Sending income congrats for goal {GoalName} to user {UserId}", goal.Name, user.Id);
                    await _notificationService.CreateNotificationAsync(user.Id,
                        $"Congratulations! You've reached your income goal '{goal.Name}'.");
                }
            }
        }
    }
}
