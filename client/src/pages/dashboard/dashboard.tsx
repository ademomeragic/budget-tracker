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
  FiChevronLeft,
  FiChevronRight,
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
import api from "../../api/api";

// Types
type TransactionType = "income" | "expense";
type TimeRange = "week" | "month" | "year";

interface Transaction {
  id: number;
  amount: number;
  date: string | Date;
  description: string;
  type: TransactionType;
  category: string;
}

interface Category {
  id: number;
  name: string;
  type: string;
}

interface Wallet {
  id: number;
  name: string;
}

interface MonthData {
  transactions: Transaction[];
  weeks: string[];
  year: number;
  month: number;
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

const initialData: Record<string, MonthData> = {
  "MAR 25": {
    transactions: [],
    weeks: ["Mar 01-04", "Mar 04-11", "Mar 11-18", "Mar 18-25", "Mar 25-31"],
    year: 2025,
    month: 3,
  },
  "APR 25": {
    transactions: [],
    weeks: ["Apr 01-04", "Apr 04-11", "Apr 11-18", "Apr 18-25", "Apr 25-30"],
    year: 2025,
    month: 4,
  },
  "MAY 25": {
    transactions: [],
    weeks: ["May 01-04", "May 04-11", "May 11-18", "May 18-25", "May 25-31"],
    year: 2025,
    month: 5,
  },
  "JUN 25": {
    transactions: [],
    weeks: ["Jun 01-08", "Jun 08-15", "Jun 15-22", "Jun 22-29", "Jun 29-30"],
    year: 2025,
    month: 6,
  },
  "JUL 25": {
    transactions: [],
    weeks: ["Jul 01-06", "Jul 06-13", "Jul 13-20", "Jul 20-27", "Jul 27-31"],
    year: 2025,
    month: 7,
  },
};

const monthNames = Object.keys(initialData);

export default function Dashboard() {
  // Original transaction state and handlers
  const [activeMonthIndex, setActiveMonthIndex] = useState(2);
  const [monthlyData, setMonthlyData] = useState(initialData);
  const [newTransaction, setNewTransaction] = useState({
    amount: "",
    date: "",
    description: "",
    type: "income" as "income" | "expense",
  });
  const [showForm, setShowForm] = useState(false);
  const [dateError, setDateError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(1);
  const [selectedWalletId, setSelectedWalletId] = useState<number>(1);

  // New dashboard state
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const activeMonth = monthNames[activeMonthIndex];
  const currentMonthData = monthlyData[activeMonth];
  const monthName = activeMonth.split(" ")[0];
  const year = currentMonthData.year;

  // Original transaction functions
  const fetchTransactions = async () => {
    const { month, year } = currentMonthData;
    try {
      const res = await api.get(`/transaction?month=${month}&year=${year}`);
      const parsed = res.data.map((txn: any) => ({
        ...txn,
        date: new Date(txn.date),
      }));
      setMonthlyData((prev) => ({
        ...prev,
        [activeMonth]: {
          ...prev[activeMonth],
          transactions: parsed,
        },
      }));
    } catch (err) {
      console.error("❌ Failed to fetch transactions", err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [activeMonthIndex]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get(`/category?type=${newTransaction.type}`);
        setCategories(res.data);
        if (res.data.length > 0) setSelectedCategoryId(res.data[0].id);
      } catch (err) {
        console.error("❌ Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, [newTransaction.type]);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const res = await api.get("/wallet");
        setWallets(res.data);
        if (res.data.length > 0) setSelectedWalletId(res.data[0].id);
      } catch (err) {
        console.error("❌ Failed to fetch wallets", err);
      }
    };
    fetchWallets();
  }, []);

  const formatCurrency = (amount: number): string =>
    amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,") + " KM";

  const incomeTotal = currentMonthData.transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expensesTotal = currentMonthData.transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balanceTotal = incomeTotal - expensesTotal;

  // ADD DYNAMIC WIDGET DATA CALCULATIONS HERE
  const monthlyTrendData = Array.from({ length: 12 }, (_, monthIndex) => {
    const monthTransactions = currentMonthData.transactions.filter((txn) => {
      const date = new Date(txn.date);
      return date.getMonth() === monthIndex;
    });

    const income = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      name: new Date(0, monthIndex).toLocaleString("default", {
        month: "short",
      }),
      income,
      expenses,
      balance: income - expenses,
    };
  });

  const categoryData = currentMonthData.transactions
    .filter((t) => t.type === "expense")
    .reduce((acc: { [key: string]: number }, txn) => {
      const category = txn.category || "Uncategorized";
      acc[category] = (acc[category] || 0) + Math.abs(txn.amount);
      return acc;
    }, {});

  const pieChartData = Object.entries(categoryData)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

  const recentTransactions = [...currentMonthData.transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const validateDate = (dateString: string): boolean => {
    const selectedDate = new Date(dateString);
    return (
      selectedDate.getMonth() + 1 === currentMonthData.month &&
      selectedDate.getFullYear() === currentMonthData.year
    );
  };

  const handleAddTransaction = async () => {
    if (!newTransaction.amount || !newTransaction.date) return;
    if (!validateDate(newTransaction.date)) {
      setDateError(`Date must be in ${monthName} ${year}`);
      return;
    }
    setDateError("");
    try {
      const payload = {
        amount: parseFloat(newTransaction.amount),
        date: newTransaction.date,
        description: newTransaction.description,
        type: newTransaction.type,
        categoryId: selectedCategoryId,
        walletId: selectedWalletId,
      };
      await api.post("/transaction", payload);
      await fetchTransactions();
    } catch (err) {
      console.error("❌ Failed to add transaction", err);
    }
    setNewTransaction({
      amount: "",
      date: "",
      description: "",
      type: "income",
    });
    setShowForm(false);
  };

  const getTransactionsForWeek = (week: string) => {
    const [start, end] = week
      .split("-")
      .map((s) => parseInt(s.replace(/\D/g, "")));
    return currentMonthData.transactions.filter((txn) => {
      const day = new Date(txn.date).getDate();
      return day >= start && day <= end;
    });
  };

  const handleMonthChange = (direction: "prev" | "next") => {
    setActiveMonthIndex((prev) => {
      if (direction === "prev" && prev > 0) return prev - 1;
      if (direction === "next" && prev < monthNames.length - 1) return prev + 1;
      return prev;
    });
    setNewTransaction({
      amount: "",
      date: "",
      description: "",
      type: "income",
    });
    setShowForm(false);
    setDateError("");
  };

  const { min, max } = (() => {
    const month = currentMonthData.month;
    const daysInMonth = new Date(year, month, 0).getDate();
    return {
      min: `${year}-${month.toString().padStart(2, "0")}-01`,
      max: `${year}-${month.toString().padStart(2, "0")}-${daysInMonth
        .toString()
        .padStart(2, "0")}`,
    };
  })();

  // New dashboard functions (visual only)
  const getProgressPercentage = (goal: Goal): number => {
    return Math.min(100, (goal.saved / goal.target) * 100);
  };

  return (
    <div className="dashboard-container">
      {/* Month Navigation (original) */}
      <div className="month-navigation">
        <button
          className="nav-arrow"
          onClick={() => handleMonthChange("prev")}
          disabled={activeMonthIndex === 0}
        >
          <FiChevronLeft size={24} />
        </button>
        <h2>
          {monthName} {year}
        </h2>
        <button
          className="nav-arrow"
          onClick={() => handleMonthChange("next")}
          disabled={activeMonthIndex === monthNames.length - 1}
        >
          <FiChevronRight size={24} />
        </button>
      </div>
      {/* Summary Cards (new dashboard style) */}
      <div className="summary-cards">
        <div className="summary-card balance">
          <div className="card-header">
            <FiDollarSign className="card-icon" />
            <h3>Current Balance</h3>
          </div>
          <div className="card-value">{formatCurrency(balanceTotal)}</div>
          <div
            className={`card-trend ${
              balanceTotal >= 0 ? "positive" : "negative"
            }`}
          >
            {/* {balanceTotal >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
            <span>{balanceTotal >= 0 ? "Positive" : "Negative"} cash flow</span> */}
          </div>
        </div>

        <div className="summary-card income">
          <div className="card-header">
            <FiTrendingUp className="card-icon" />
            <h3>Income</h3>
          </div>
          <div className="card-value">{formatCurrency(incomeTotal)}</div>
          <div className="card-trend positive">
            {/* <FiTrendingUp />
            <span>+5% from last month</span> */}
          </div>
        </div>

        <div className="summary-card expenses">
          <div className="card-header">
            <FiTrendingDown className="card-icon card-icon-down" />
            <h3>Expenses</h3>
          </div>
          <div className="card-value">{formatCurrency(expensesTotal)}</div>
          <div className="card-trend negative">
            {/* <FiTrendingDown /> */}
            {/* <span>-3% from last month</span> */}
          </div>
        </div>
      </div>
      {/* Time Range Selector (new) */}
      {/* <div className="time-range-selector">
        <button
          className={`time-range-btn ${timeRange === "week" ? "active" : ""}`}
          onClick={() => setTimeRange("week")}
        >
          Week
        </button>
        <button
          className={`time-range-btn ${timeRange === "month" ? "active" : ""}`}
          onClick={() => setTimeRange("month")}
        >
          Month
        </button>
        <button
          className={`time-range-btn ${timeRange === "year" ? "active" : ""}`}
          onClick={() => setTimeRange("year")}
        >
          Year
        </button>
      </div> */}
      {/* Charts Row (new) */}
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
                data={pieChartData}
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
                {pieChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  padding: "10px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Original Transaction Form */}
      <button
        className="add-transaction-btn"
        onClick={() => setShowForm(!showForm)}
      >
        + Add Transaction
      </button>

      {showForm && (
        <div className="modal-overlay">
          <div className="transaction-modal">
            <div className="modal-header">
              <h2>Add New Transaction</h2>
              <button
                className="close-button"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>
            <div className="transaction-form">
              <div className="form-group">
                <label>Transaction Type</label>
                <select
                  value={newTransaction.type}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      type: e.target.value as "income" | "expense",
                    })
                  }
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      amount: e.target.value,
                    })
                  }
                  placeholder="0.00"
                  step="0.01"
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
                  min={min}
                  max={max}
                />
                {dateError && <div className="date-error">{dateError}</div>}
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
                  value={selectedCategoryId}
                  onChange={(e) =>
                    setSelectedCategoryId(parseInt(e.target.value))
                  }
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Wallet</label>
                <select
                  value={selectedWalletId}
                  onChange={(e) =>
                    setSelectedWalletId(parseInt(e.target.value))
                  }
                >
                  {wallets.map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </option>
                  ))}
                </select>
              </div>

              <button onClick={handleAddTransaction}>Add Transaction</button>
            </div>
          </div>
        </div>
      )}
      {/* Goals and Transactions Row (new) */}
      <div className="bottom-row">
        <div className="goals-container">
          <div className="section-header">
            <FiTarget className="section-icon" />
            <h3>Financial Goals</h3>
          </div>
          <div className="goals-list">
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
          </div>
        </div>
      </div>
    </div>
  );
}
