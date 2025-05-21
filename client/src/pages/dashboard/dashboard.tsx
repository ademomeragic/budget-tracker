import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiTarget,
  FiCreditCard,
  FiX,
  FiType,
  FiCalendar,
  FiTag,
  FiInfo,
} from "react-icons/fi";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import "./dashboard.css";

// Types
type TransactionType = "income" | "expense";
type TimeRange = "week" | "month" | "year";

interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  type: TransactionType;
  category: string;
}

interface Goal {
  id: string;
  name: string;
  target: number;
  saved: number;
  deadline: string;
  color: string;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

const categories = [
  "Food",
  "Housing",
  "Transport",
  "Entertainment",
  "Utilities",
  "Healthcare",
  "Education",
  "Shopping",
  "Other",
];

const DashboardContent = () => {
  // State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Omit<Transaction, "id">>(
    {
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      description: "",
      type: "expense",
      category: "Food",
    }
  );
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // Initialize data
  useEffect(() => {
    // Load from localStorage if available
    const savedTransactions = localStorage.getItem("transactions");
    const savedGoals = localStorage.getItem("goals");

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    } else {
      // Generate sample data if none exists
      const sampleTransactions = generateTransactions(20);
      setTransactions(sampleTransactions);
      localStorage.setItem("transactions", JSON.stringify(sampleTransactions));
    }

    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    } else {
      const sampleGoals = generateGoals();
      setGoals(sampleGoals);
      localStorage.setItem("goals", JSON.stringify(sampleGoals));
    }
  }, []);

  // Save data when it changes
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("goals", JSON.stringify(goals));
  }, [goals]);

  // Data generation functions
  const generateTransactions = (count: number): Transaction[] => {
    const transactions: Transaction[] = [];
    const currentDate = new Date();

    for (let i = 0; i < count; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const date = new Date(currentDate);
      date.setDate(date.getDate() - daysAgo);

      const isIncome = Math.random() > 0.7;
      const type = isIncome ? "income" : "expense";
      const amount = isIncome
        ? Math.floor(Math.random() * 2000) + 500
        : Math.floor(Math.random() * 300) + 10;

      transactions.push({
        id: `txn-${Date.now()}-${i}`,
        amount,
        date: date.toISOString().split("T")[0],
        description: isIncome
          ? "Salary"
          : `${
              categories[Math.floor(Math.random() * categories.length)]
            } Expense`,
        type,
        category: isIncome
          ? "Income"
          : categories[Math.floor(Math.random() * categories.length)],
      });
    }

    return transactions;
  };

  const generateGoals = (): Goal[] => {
    return [
      {
        id: `goal-${Date.now()}-1`,
        name: "New Laptop",
        target: 1200,
        saved: 450,
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        color: "#4ade80",
      },
      {
        id: `goal-${Date.now()}-2`,
        name: "Vacation Fund",
        target: 2500,
        saved: 1200,
        deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        color: "#60a5fa",
      },
      {
        id: `goal-${Date.now()}-3`,
        name: "Emergency Fund",
        target: 5000,
        saved: 2300,
        deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        color: "#a78bfa",
      },
    ];
  };

  // Filter transactions by time range
  const filteredTransactions = transactions.filter((txn) => {
    const txnDate = new Date(txn.date);
    const now = new Date();

    if (timeRange === "week") {
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return txnDate >= oneWeekAgo;
    } else if (timeRange === "month") {
      return (
        txnDate.getMonth() === now.getMonth() &&
        txnDate.getFullYear() === now.getFullYear()
      );
    } else {
      return txnDate.getFullYear() === now.getFullYear();
    }
  });

  // Calculate totals
  const incomeTotal = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expensesTotal = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = incomeTotal - expensesTotal;

  // Spending by category
  const spendingByCategory = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const categoryData = Object.entries(spendingByCategory)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

  // Recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Monthly trend data
  const monthlyTrendData = Array.from({ length: 12 }, (_, i) => {
    const monthTransactions = transactions.filter((t) => {
      const txnDate = new Date(t.date);
      return (
        txnDate.getMonth() === i &&
        txnDate.getFullYear() === new Date().getFullYear()
      );
    });

    const income = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      name: new Date(new Date().getFullYear(), i, 1).toLocaleString("default", {
        month: "short",
      }),
      income,
      expenses,
      balance: income - expenses,
    };
  });

  // Handlers
  const handleAddTransaction = () => {
    if (!newTransaction.amount || !newTransaction.description) return;

    const newTxn: Transaction = {
      ...newTransaction,
      id: `txn-${Date.now()}`,
    };
    const updatedTransactions = [newTxn, ...transactions];
    setTransactions(updatedTransactions);
    setShowTransactionForm(false);
    setNewTransaction({
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      description: "",
      type: "expense",
      category: "Food",
    });
  };

  const handleAddGoal = () => {
    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      name: "New Goal",
      target: 1000,
      saved: 0,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
    setGoals([...goals, newGoal]);
    setSelectedGoal(newGoal);
  };

  const handleUpdateGoal = (updatedGoal: Goal) => {
    setGoals(
      goals.map((goal) => (goal.id === updatedGoal.id ? updatedGoal : goal))
    );
    setSelectedGoal(null);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getProgressPercentage = (goal: Goal): number => {
    return Math.min(100, (goal.saved / goal.target) * 100);
  };

  return (
    <div className="main-content">
      {/* Header */}
      <header className="header">
        <h1>Financial Dashboard</h1>
        <div className="header-actions">
          <div className="time-range-selector">
            <button
              className={`time-range-btn ${
                timeRange === "week" ? "active" : ""
              }`}
              onClick={() => setTimeRange("week")}
            >
              Week
            </button>
            <button
              className={`time-range-btn ${
                timeRange === "month" ? "active" : ""
              }`}
              onClick={() => setTimeRange("month")}
            >
              Month
            </button>
            <button
              className={`time-range-btn ${
                timeRange === "year" ? "active" : ""
              }`}
              onClick={() => setTimeRange("year")}
            >
              Year
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card balance">
            <div className="card-header">
              <FiDollarSign className="card-icon" />
              <h3>Current Balance</h3>
            </div>
            <div className="card-value">{formatCurrency(balance)}</div>
            <div
              className={`card-trend ${balance >= 0 ? "positive" : "negative"}`}
            >
              {balance >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
              <span>{balance >= 0 ? "Positive" : "Negative"} cash flow</span>
            </div>
          </div>

          <div className="summary-card income">
            <div className="card-header">
              <FiTrendingUp className="card-icon" />
              <h3>Income</h3>
            </div>
            <div className="card-value">{formatCurrency(incomeTotal)}</div>
            <div className="card-trend positive">
              <FiTrendingUp />
              <span>
                +{Math.floor(Math.random() * 20) + 5}% from last {timeRange}
              </span>
            </div>
          </div>

          <div className="summary-card expenses">
            <div className="card-header">
              <FiTrendingDown className="card-icon" />
              <h3>Expenses</h3>
            </div>
            <div className="card-value">{formatCurrency(expensesTotal)}</div>
            <div className="card-trend negative">
              <FiTrendingDown />
              <span>
                -{Math.floor(Math.random() * 10) + 1}% from last {timeRange}
              </span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="charts-row">
          <div className="chart-container">
            <div className="chart-header">
              <h3>Monthly Trend</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyTrendData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <div className="chart-header">
              <h3>Spending by Category</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Goals and Transactions Row */}
        <div className="bottom-row">
          <div className="goals-container">
            <div className="section-header">
              <FiTarget className="section-icon" />
              <h3>Financial Goals</h3>
            </div>
            <div className="goals-list">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className="goal-item"
                  onClick={() => setSelectedGoal(goal)}
                >
                  <div className="goal-info">
                    <h4>{goal.name}</h4>
                    <span className="goal-deadline">
                      Target: {formatCurrency(goal.target)} by{" "}
                      {new Date(goal.deadline).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="goal-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${getProgressPercentage(goal)}%`,
                          backgroundColor: goal.color,
                        }}
                      ></div>
                    </div>
                    <span className="progress-percentage">
                      {getProgressPercentage(goal).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
              {goals.length === 0 && (
                <div className="empty-state">
                  <p>No goals yet. Add your first financial goal!</p>
                </div>
              )}
            </div>
          </div>

          <div className="transactions-container">
            <div className="section-header">
              <FiCreditCard className="section-icon" />
              <h3>Recent Transactions</h3>
            </div>
            <div className="transactions-list">
              {recentTransactions.map((txn) => (
                <div key={txn.id} className={`transaction-item ${txn.type}`}>
                  <div className="transaction-icon">
                    {txn.type === "income" ? (
                      <FiTrendingUp />
                    ) : (
                      <FiTrendingDown />
                    )}
                  </div>
                  <div className="transaction-details">
                    <h4>{txn.description}</h4>
                    <span className="transaction-category">{txn.category}</span>
                    <span className="transaction-date">
                      {new Date(txn.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={`transaction-amount ${txn.type}`}>
                    {txn.type === "income" ? "+" : "-"}
                    {formatCurrency(txn.amount)}
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="empty-state">
                  <p>No transactions yet. Add your first transaction!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fab-container">
        {showAddMenu && (
          <div className="fab-menu">
            <button
              className="fab-menu-item"
              onClick={() => {
                setNewTransaction({
                  ...newTransaction,
                  type: "income",
                });
                setShowTransactionForm(true);
                setShowAddMenu(false);
              }}
            >
              <FiTrendingUp /> Add Income
            </button>
            <button
              className="fab-menu-item"
              onClick={() => {
                setNewTransaction({
                  ...newTransaction,
                  type: "expense",
                });
                setShowTransactionForm(true);
                setShowAddMenu(false);
              }}
            >
              <FiTrendingDown /> Add Expense
            </button>
            <button
              className="fab-menu-item"
              onClick={() => {
                handleAddGoal();
                setShowAddMenu(false);
              }}
            >
              <FiTarget /> Add Goal
            </button>
          </div>
        )}
        <button
          className="fab-button"
          onClick={() => setShowAddMenu(!showAddMenu)}
        >
          <FiPlus className={showAddMenu ? "rotate-45" : ""} />
        </button>
      </div>

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <div className="modal-overlay">
          <div className="transaction-modal">
            <div className="modal-header">
              <h2>
                {newTransaction.type === "income"
                  ? "Add Income"
                  : "Add Expense"}
              </h2>
              <button
                className="close-button"
                onClick={() => setShowTransactionForm(false)}
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>
                  <FiDollarSign /> Amount
                </label>
                <input
                  type="number"
                  value={newTransaction.amount || ""}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>
                  <FiCalendar /> Date
                </label>
                <input
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      date: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>
                  <FiType /> Description
                </label>
                <input
                  type="text"
                  value={newTransaction.description}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      description: e.target.value,
                    })
                  }
                  placeholder={
                    newTransaction.type === "income"
                      ? "Salary, Bonus, etc."
                      : "What was this expense for?"
                  }
                />
              </div>
              <div className="form-group">
                <label>
                  <FiTag /> Category
                </label>
                <select
                  value={newTransaction.category}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      category: e.target.value,
                    })
                  }
                >
                  {newTransaction.type === "income" ? (
                    <option value="Income">Income</option>
                  ) : (
                    categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="form-actions">
                <button
                  className="cancel-button"
                  onClick={() => setShowTransactionForm(false)}
                >
                  Cancel
                </button>
                <button
                  className="submit-button"
                  onClick={handleAddTransaction}
                  disabled={
                    !newTransaction.amount || !newTransaction.description
                  }
                >
                  Add {newTransaction.type === "income" ? "Income" : "Expense"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goal Detail Modal */}
      {selectedGoal && (
        <div className="modal-overlay">
          <div className="goal-modal">
            <div className="modal-header">
              <h2>{selectedGoal.name}</h2>
              <button
                className="close-button"
                onClick={() => setSelectedGoal(null)}
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="goal-progress-large">
                <div className="progress-circle">
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="#e0e0e0"
                      strokeWidth="8"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke={selectedGoal.color}
                      strokeWidth="8"
                      strokeDasharray={`${
                        (selectedGoal.saved / selectedGoal.target) * 340
                      } 340`}
                      transform="rotate(-90 60 60)"
                    />
                  </svg>
                  <div className="progress-text">
                    {Math.min(
                      100,
                      Math.round(
                        (selectedGoal.saved / selectedGoal.target) * 100
                      )
                    )}
                    %
                  </div>
                </div>
                <div className="goal-stats">
                  <div className="stat-item">
                    <span className="stat-label">Saved</span>
                    <span className="stat-value">
                      {formatCurrency(selectedGoal.saved)}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Target</span>
                    <span className="stat-value">
                      {formatCurrency(selectedGoal.target)}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Remaining</span>
                    <span className="stat-value">
                      {formatCurrency(selectedGoal.target - selectedGoal.saved)}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Deadline</span>
                    <span className="stat-value">
                      {new Date(selectedGoal.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>
                  <FiInfo /> Goal Name
                </label>
                <input
                  type="text"
                  value={selectedGoal.name}
                  onChange={(e) =>
                    setSelectedGoal({
                      ...selectedGoal,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  <FiDollarSign /> Target Amount
                </label>
                <input
                  type="number"
                  value={selectedGoal.target || ""}
                  onChange={(e) =>
                    setSelectedGoal({
                      ...selectedGoal,
                      target: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                  step="1"
                />
              </div>

              <div className="form-group">
                <label>
                  <FiDollarSign /> Saved Amount
                </label>
                <input
                  type="number"
                  value={selectedGoal.saved || ""}
                  onChange={(e) =>
                    setSelectedGoal({
                      ...selectedGoal,
                      saved: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                  max={selectedGoal.target}
                  step="1"
                />
              </div>

              <div className="form-group">
                <label>
                  <FiCalendar /> Deadline
                </label>
                <input
                  type="date"
                  value={selectedGoal.deadline}
                  onChange={(e) =>
                    setSelectedGoal({
                      ...selectedGoal,
                      deadline: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-actions">
                <button
                  className="cancel-button"
                  onClick={() => setSelectedGoal(null)}
                >
                  Cancel
                </button>
                <button
                  className="submit-button"
                  onClick={() => handleUpdateGoal(selectedGoal)}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardContent;
