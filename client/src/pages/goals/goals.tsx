import { useState, useEffect } from 'react';
import './goals.css'; 

interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  category: string;
}

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'manual' | 'scan'>('manual');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Sample categories data
  const categories = [
    'Food', 'Dining', 'Transportation', 'Housing', 'Entertainment', 'Shopping', 'Other'
  ];

  // Add new expense
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const newExpense: Expense = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      description,
      date: new Date().toISOString(),
      category: selectedCategory || determineCategory(description)
    };
    setExpenses([...expenses, newExpense]);
    setAmount('');
    setDescription('');
    setSelectedCategory('');
  };

  // Determine category based on description
  const determineCategory = (desc: string): string => {
    const lowerDesc = desc.toLowerCase();
    if (lowerDesc.includes('coffee') || lowerDesc.includes('grocery')) return 'Food';
    if (lowerDesc.includes('restaurant')) return 'Dining';
    if (lowerDesc.includes('fuel') || lowerDesc.includes('gas')) return 'Transportation';
    if (lowerDesc.includes('rent')) return 'Housing';
    if (lowerDesc.includes('movie') || lowerDesc.includes('netflix')) return 'Entertainment';
    return 'Other';
  };

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="container">
      <header className="header">
        <h1>Expense Tracker</h1>
        <div className="total-card">
          <span className="card-title">Total Expenses</span>
          <span className="card-value">${totalExpenses.toFixed(2)}</span>
        </div>
      </header>

      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'manual' ? 'active' : ''}`}
          onClick={() => setActiveTab('manual')}
        >
          Manual Entry
        </button>
        <button 
          className={`tab-button ${activeTab === 'scan' ? 'active' : ''}`}
          onClick={() => setActiveTab('scan')}
        >
          Scan Receipt
        </button>
      </div>

      {activeTab === 'manual' ? (
        <form onSubmit={handleAddExpense} className="expense-form">
          <div className="form-group">
            <label htmlFor="amount">Amount ($)</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category (optional)</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Auto-detect</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="primary">
            Add Expense
          </button>
        </form>
      ) : (
        <div className="scanner-container">
          <div className="scanner-placeholder">
            <p>Click to scan receipt</p>
          </div>
          <button 
            className="secondary"
            onClick={() => console.log('Launch camera/scanner')}
          >
            Open Scanner
          </button>
        </div>
      )}

      <div className="dashboard-cards">
        <div className="card">
          <span className="card-title">This Month</span>
          <span className="card-value">${
            expenses
              .filter(e => new Date(e.date).getMonth() === new Date().getMonth())
              .reduce((sum, e) => sum + e.amount, 0)
              .toFixed(2)
          }</span>
        </div>
        <div className="card">
          <span className="card-title">Most Spent Category</span>
          <span className="card-value">Food</span>
        </div>
        <div className="card">
          <span className="card-title">Daily Average</span>
          <span className="card-value">${
            (expenses.reduce((sum, e) => sum + e.amount, 0) / 30).toFixed(2)
          }</span>
        </div>
      </div>

      <div className="expense-list">
        <h2>Recent Expenses</h2>
        {expenses.length === 0 ? (
          <p>No expenses recorded yet</p>
        ) : (
          expenses.slice().reverse().map(expense => (
            <div key={expense.id} className="expense-item">
              <div className="expense-info">
                <h3>{expense.description}</h3>
                <span>{new Date(expense.date).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="expense-amount">${expense.amount.toFixed(2)}</span>
                <span className={`expense-category category-${expense.category}`}>
                  {expense.category}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="chart-container">
        <h2>Spending Breakdown</h2>
        {/* Chart would be implemented with a library like Chart.js */}
        <div style={{ height: '300px', background: '#f1f3f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Expense chart would appear here</p>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracker;