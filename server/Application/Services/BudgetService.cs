using Application.Interfaces;
using Application.Dtos;  // Add the namespace for your DTOs
using AutoMapper;
using Domain.Entities;
using Microsoft.Extensions.Logging; // Add this namespace
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using System;

namespace Application.Services
{
    public class BudgetService : IBudgetService
    {
        private readonly IRepository<Budget> _budgetRepository;
        private readonly IRepository<Transaction> _transactionRepository;
        private readonly IRepository<Category> _categoryRepository;  // Add repository for Category
        private readonly IMapper _mapper; // Add AutoMapper to the service
        private readonly ILogger<BudgetService> _logger;

        public BudgetService(IRepository<Budget> budgetRepository, 
                             IRepository<Transaction> transactionRepository,
                             IRepository<Category> categoryRepository,  // Inject ICategoryRepository
                             IMapper mapper, 
                            ILogger<BudgetService> logger) // Inject IMapper
        {
            _budgetRepository = budgetRepository;
            _transactionRepository = transactionRepository;
            _categoryRepository = categoryRepository;  // Initialize the category repository
            _mapper = mapper;
            _logger = logger;
        }

        // Get a budget by ID and return as Task<Budget> (not BudgetResponse)
        public async Task<Budget> GetByIdAsync(int id)
        {
            var budget = await _budgetRepository.GetByIdAsync(id);
            if (budget == null) return null;
            return budget; // Return Budget entity
        }

        // Get all budgets and return as a list of BudgetResponse DTOs
        public async Task<IEnumerable<BudgetResponse>> GetAllAsync()
        {
            var budgets = await _budgetRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<BudgetResponse>>(budgets);
        }

// Add the logger to your AddAsync method
        public async Task<BudgetResponse> AddAsync(CreateBudgetRequest createBudgetRequest)
        {
            if (createBudgetRequest.CategoryId.HasValue && createBudgetRequest.CategoryId.Value > 0)
            {
                var category = await _categoryRepository.GetByIdAsync(createBudgetRequest.CategoryId.Value);
                if (category == null)
                {
                    _logger.LogError("Category not found for ID: {CategoryId}", createBudgetRequest.CategoryId);
                    throw new Exception("Category not found.");
                }

                var budget = _mapper.Map<Budget>(createBudgetRequest);
                budget.Category = category;

                try
                {
                    await _budgetRepository.AddAsync(budget);
                    await _budgetRepository.SaveChangesAsync();

                    var createdBudget = await _budgetRepository.GetByIdAsync(budget.Id);

                    if (createdBudget == null)
                    {
                        _logger.LogError("Budget creation failed for ID: {BudgetId}", budget.Id);
                        throw new Exception("Budget creation failed.");
                    }

                    return _mapper.Map<BudgetResponse>(createdBudget);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred while creating the budget.");
                    throw new Exception("An error occurred while creating the budget.", ex);
                }
            }
            else
            {
                _logger.LogError("Invalid CategoryId: {CategoryId}", createBudgetRequest.CategoryId);
                throw new Exception("CategoryId must be a valid positive number.");
            }
        }



        // Update an existing budget (from UpdateBudgetDTO)
        public async Task UpdateAsync(UpdateBudgetRequest updateBudgetDTO)
        {
            var budget = await _budgetRepository.GetByIdAsync(updateBudgetDTO.Id);
            if (budget == null) throw new Exception("Budget not found.");

            // Map UpdateBudgetDTO to Budget entity
            _mapper.Map(updateBudgetDTO, budget);
            await _budgetRepository.UpdateAsync(budget);
            await _budgetRepository.SaveChangesAsync();
        }

        // Delete a budget by ID
        public async Task DeleteAsync(int id)
{
    var budget = await _budgetRepository.GetByIdAsync(id);
    if (budget == null)
    {
        throw new Exception("Budget not found.");
    }

    await _budgetRepository.DeleteAsync(id);

    // Commit the changes to the database
    await _budgetRepository.SaveChangesAsync();
}

        // Calculate remaining budget
        public async Task<decimal> CalculateRemainingBudget(int budgetId)
        {
            var budget = await _budgetRepository.GetByIdAsync(budgetId);
            if (budget == null) throw new Exception("Budget not found.");

            var totalSpent = (await _transactionRepository.GetAllAsync())
                .Where(t => t.BudgetId == budgetId)
                .Sum(t => t.Amount);

            return budget.Amount - totalSpent;
        }

        // Check if user is nearing the budget limit
        public async Task<bool> IsNearBudgetLimit(int budgetId, decimal thresholdPercentage)
        {
            var remainingBudget = await CalculateRemainingBudget(budgetId);
            var budget = await _budgetRepository.GetByIdAsync(budgetId);
            if (budget == null) throw new Exception("Budget not found.");

            decimal threshold = budget.Amount * (thresholdPercentage / 100);

            return remainingBudget <= threshold;
        }
    }
}
