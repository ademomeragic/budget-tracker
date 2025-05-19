import "./dashboard.css";
import React, { useState, useEffect } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiPlus,
  FiTarget,
  FiPieChart,
  FiDollarSign,
  FiBell,
  FiCalendar,
  FiTrendingUp,
  FiTrendingDown,
  FiCreditCard,
  FiPocket,
  FiSettings,
} from "react-icons/fi";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

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

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  paid: boolean;
}

interface Category {
  name: string;
  amount: number;
  color: string;
}

// Sample data generation functions
const generateTransactions = (count: number): Transaction[] => {
  const categories = [
    "Food",
    "Housing",
    "Transport",
    "Entertainment",
    "Utilities",
    "Healthcare",
  ];
  const types: TransactionType[] = ["income", "expense"];
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
      id: `txn-${i}`,
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
      id: "goal-1",
      name: "Test 1",
      target: 0,
      saved: 0,
      deadline: "null",
      color: "#4ade80",
    },
    {
      id: "goal-2",
      name: "Test 2",
      target: 0,
      saved: 0,
      deadline: "null",
      color: "#60a5fa",
    },
    {
      id: "goal-3",
      name: "Test 3",
      target: 0,
      saved: 0,
      deadline: "null",
      color: "#a78bfa",
    },
  ];
};

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

const DashboardContent = () => {
  // State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
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
    setTransactions(generateTransactions(50));
    setGoals(generateGoals());
  }, []);

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
        txnDate.getMonth() === currentMonth &&
        txnDate.getFullYear() === currentYear
      );
    } else {
      // year
      return txnDate.getFullYear() === currentYear;
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
      return txnDate.getMonth() === i && txnDate.getFullYear() === currentYear;
    });

    const income = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      name: new Date(currentYear, i, 1).toLocaleString("default", {
        month: "short",
      }),
      income,
      expenses,
      balance: income - expenses,
    };
  });

  // Handlers
  const handleAddTransaction = () => {
    const newTxn: Transaction = {
      ...newTransaction,
      id: `txn-${Date.now()}`,
    };
    setTransactions([newTxn, ...transactions]);
    setShowTransactionForm(false);
    setNewTransaction({
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      description: "",
      type: "expense",
      category: "Food",
    });
  };

  const handleMonthChange = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 80) return "#4ade80";
    if (percentage >= 50) return "#60a5fa";
    if (percentage >= 30) return "#fbbf24";
    return "#f87171";
  };

  return (
    <div className="main-content">
      {/* Header */}
      <header className="header">
        <h1>Dashboard</h1>
        <div className="header-actions">
          <button
            className="primary-button"
            onClick={() => setShowTransactionForm(true)}
          >
            <FiPlus /> Add Transaction
          </button>
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
              <span>+12% from last {timeRange}</span>
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
              <span>-5% from last {timeRange}</span>
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
                <Tooltip />
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
              <button className="add-button">
                <FiPlus />
              </button>
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
                          width: `${Math.min(
                            100,
                            (goal.saved / goal.target) * 100
                          )}%`,
                          backgroundColor: goal.color,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="transactions-container">
            <div className="section-header">
              <FiCreditCard className="section-icon" />
              <h3>Recent Transactions</h3>
              <button className="view-all">View All</button>
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
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <div className="modal-overlay">
          <div className="transaction-modal">
            <div className="modal-header">
              <h2>Add New Transaction</h2>
              <button
                className="close-button"
                onClick={() => setShowTransactionForm(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Transaction Type</label>
                <div className="type-toggle">
                  <button
                    className={`toggle-btn ${
                      newTransaction.type === "income" ? "active" : ""
                    }`}
                    onClick={() =>
                      setNewTransaction({ ...newTransaction, type: "income" })
                    }
                  >
                    Income
                  </button>
                  <button
                    className={`toggle-btn ${
                      newTransaction.type === "expense" ? "active" : ""
                    }`}
                    onClick={() =>
                      setNewTransaction({ ...newTransaction, type: "expense" })
                    }
                  >
                    Expense
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>Date</label>
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
                <label>Description</label>
                <input
                  type="text"
                  value={newTransaction.description}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      description: e.target.value,
                    })
                  }
                  placeholder="What was this for?"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={newTransaction.category}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      category: e.target.value,
                    })
                  }
                >
                  <option value="Food">Food</option>
                  <option value="Housing">Housing</option>
                  <option value="Transport">Transport</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Income">Income</option>
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
                >
                  Add Transaction
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
                &times;
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
              <div className="goal-actions">
                <button className="action-button add-funds">Add Funds</button>
                <button className="action-button edit-goal">Edit Goal</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardContent;
