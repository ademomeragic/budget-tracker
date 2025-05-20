import React, { useState, useEffect } from 'react';
import './goals.css';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  category: string;
}

const GoalsSection: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState<Omit<Goal, 'id'>>({
    name: '',
    targetAmount: 0,
    currentAmount: 0,
    targetDate: new Date(),
    category: 'General',
  });
  const [isAdding, setIsAdding] = useState(false);

  // Load goals from localStorage
  useEffect(() => {
    const savedGoals = localStorage.getItem('budgetGoals');
    if (savedGoals) {
      try {
        const parsedGoals = JSON.parse(savedGoals);
        const goalsWithDates = parsedGoals.map((goal: any) => ({
          ...goal,
          targetDate: new Date(goal.targetDate)
        }));
        setGoals(goalsWithDates);
      } catch (error) {
        console.error('Failed to parse saved goals', error);
      }
    }
  }, []);

  // Save goals to localStorage
  useEffect(() => {
    localStorage.setItem('budgetGoals', JSON.stringify(goals));
  }, [goals]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewGoal(prev => ({
      ...prev,
      [name]: name === 'targetAmount' || name === 'currentAmount' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewGoal(prev => ({
      ...prev,
      targetDate: new Date(e.target.value)
    }));
  };

  const addGoal = () => {
    if (!newGoal.name || newGoal.targetAmount <= 0) return;
    
    const goal: Goal = {
      ...newGoal,
      id: Date.now().toString(),
    };
    
    setGoals(prev => [...prev, goal]);
    setNewGoal({
      name: '',
      targetAmount: 0,
      currentAmount: 0,
      targetDate: new Date(),
      category: 'General',
    });
    setIsAdding(false);
  };

  const updateCurrentAmount = (id: string, amount: number) => {
    setGoals(prev =>
      prev.map(goal =>
        goal.id === id
          ? { ...goal, currentAmount: Math.min(amount, goal.targetAmount) }
          : goal
      )
    );
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
  };

  const calculatePercentage = (goal: Goal) => {
    return Math.round((goal.currentAmount / goal.targetAmount) * 100);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="goals-section">
      <div className="goals-header">
        <h2>Financial Goals</h2>
        <button 
          className="add-goal-btn"
          onClick={() => setIsAdding(true)}
        >
          + Add Goal
        </button>
      </div>

      {isAdding && (
        <div className="add-goal-form">
          <h3>Add New Goal</h3>
          <div className="form-group">
            <label>Goal Name</label>
            <input
              type="text"
              name="name"
              value={newGoal.name}
              onChange={handleInputChange}
              placeholder="e.g. Vacation, New Car"
            />
          </div>
          <div className="form-group">
            <label>Target Amount ($)</label>
            <input
              type="number"
              name="targetAmount"
              value={newGoal.targetAmount || ''}
              onChange={handleInputChange}
              min="0.01"
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label>Current Amount ($)</label>
            <input
              type="number"
              name="currentAmount"
              value={newGoal.currentAmount || ''}
              onChange={handleInputChange}
              min="0"
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label>Target Date</label>
            <input
              type="date"
              value={newGoal.targetDate.toISOString().split('T')[0]}
              onChange={handleDateChange}
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select
              name="category"
              value={newGoal.category}
              onChange={handleInputChange}
            >
              <option value="General">General</option>
              <option value="Travel">Travel</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Home">Home</option>
              <option value="Education">Education</option>
              <option value="Emergency">Emergency Fund</option>
            </select>
          </div>
          <div className="form-actions">
            <button className="cancel-btn" onClick={() => setIsAdding(false)}>
              Cancel
            </button>
            <button className="save-btn" onClick={addGoal}>
              Save Goal
            </button>
          </div>
        </div>
      )}

      <div className="goals-list">
        {goals.length === 0 ? (
          <p className="no-goals">No goals added yet. Add your first financial goal!</p>
        ) : (
          goals.map(goal => (
            <div key={goal.id} className="goal-card">
              <div className="goal-header">
                <h3>{goal.name}</h3>
                <span className="goal-category">{goal.category}</span>
                <button 
                  className="delete-goal"
                  onClick={() => deleteGoal(goal.id)}
                >
                  ×
                </button>
              </div>
              <div className="goal-details">
                <div className="amounts">
                  <span className="current">${goal.currentAmount.toFixed(2)}</span>
                  <span className="separator">/</span>
                  <span className="target">${goal.targetAmount.toFixed(2)}</span>
                  <span className="percentage">({calculatePercentage(goal)}%)</span>
                </div>
                <div className="target-date">
                  Target: {formatDate(goal.targetDate)}
                </div>
                <div className="update-amount">
                  <input
                    type="number"
                    placeholder="Add amount"
                    min="0"
                    step="0.01"
                    onChange={(e) => 
                      updateCurrentAmount(goal.id, parseFloat(e.target.value) || 0)
                    }
                  />
                  <button>Add</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GoalsSection;