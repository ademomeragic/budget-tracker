import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiTarget,
  FiCreditCard,
  FiX,
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

type TransactionType = "income" | "expense";
type TimeRange = "week" | "month" | "year";

interface TransactionRaw {
  id: number;
  amount: number;
  date: string;
  description: string;
  type: TransactionType;
  categoryId: number;
}

interface Transaction {
  id: number;
  amount: number;
  date: Date;
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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

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
  const [activeMonthIndex, setActiveMonthIndex] = useState(2);
  const [monthlyData, setMonthlyData] = useState(initialData);
  const [expensesForChart, setExpensesForChart] = useState<Transaction[]>([]);
  const [newTransaction, setNewTransaction] = useState({
    amount: "",
    date: "",
    description: "",
    type: "income" as TransactionType,
  });
  const [showForm, setShowForm] = useState(false);
  const [dateError, setDateError] = useState("");
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(1);
  const [selectedWalletId, setSelectedWalletId] = useState<number>(1);
  const [goals, setGoals] = useState<Goal[]>([]);

  const activeMonth = monthNames[activeMonthIndex];
  const currentMonthData = monthlyData[activeMonth];
  const monthName = activeMonth.split(" ")[0];
  const year = currentMonthData.year;

  const fetchCategories = async () => {
    try {
      const [expenseRes, incomeRes] = await Promise.all([
        api.get(`/Category?type=expense`),
        api.get(`/Category?type=income`)
      ]);
      setExpenseCategories(expenseRes.data);
      setIncomeCategories(incomeRes.data);
      if (expenseRes.data.length > 0) setSelectedCategoryId(expenseRes.data[0].id);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const fetchWallets = async () => {
    try {
      const res = await api.get("/wallet");
      setWallets(res.data);
      if (res.data.length > 0) setSelectedWalletId(res.data[0].id);
    } catch (err) {
      console.error("Failed to fetch wallets", err);
    }
  };

  const fetchTransactions = async () => {
    const { month, year } = currentMonthData;
    try {
      const res = await api.get<TransactionRaw[]>(`/Transaction?month=${month}&year=${year}`);
      
      const parsed = res.data.map((txn) => {
        const categories = txn.type === "expense" ? expenseCategories : incomeCategories;
        const categoryName = categories.find(c => c.id === txn.categoryId)?.name || "Uncategorized";
        return {
          ...txn,
          date: new Date(txn.date),
          category: categoryName,
        };
      });

      setMonthlyData(prev => ({
        ...prev,
        [activeMonth]: {
          ...prev[activeMonth],
          transactions: parsed,
        },
      }));
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    }
  };

  const fetchExpensesForChart = async () => {
    const { month, year } = currentMonthData;
    try {
      const res = await api.get<TransactionRaw[]>(
        `/Transaction?month=${month}&year=${year}&type=expense`
      );
      
      const parsed = res.data.map((txn) => {
        const categoryName = expenseCategories.find(c => c.id === txn.categoryId)?.name || "Uncategorized";
        return {
          ...txn,
          date: new Date(txn.date),
          category: categoryName,
        };
      });

      setExpensesForChart(parsed);
    } catch (err) {
      console.error("Failed to fetch expenses for chart", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();
      await fetchWallets();
      await fetchTransactions();
      await fetchExpensesForChart();
    };
    loadData();
  }, []);

  useEffect(() => {
    if (expenseCategories.length > 0) {
      fetchTransactions();
      fetchExpensesForChart();
    }
  }, [activeMonth, expenseCategories]);

  const formatCurrency = (amount: number): string =>
    amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,") + " KM";

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
      await fetchExpensesForChart();
    } catch (err) {
      console.error("Failed to add transaction", err);
    }
    setNewTransaction({
      amount: "",
      date: "",
      description: "",
      type: "income",
    });
    setShowForm(false);
  };

  const handleMonthChange = (direction: "prev" | "next") => {
    setActiveMonthIndex((prev) => {
      if (direction === "prev" && prev > 0) return prev - 1;
      if (direction === "next" && prev < monthNames.length - 1) return prev + 1;
      return prev;
    });
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

  const incomeTotal = currentMonthData.transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expensesTotal = currentMonthData.transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const balanceTotal = incomeTotal - expensesTotal;

  const categoryData = expensesForChart.reduce((acc: Record<string, number>, txn) => {
    const category = txn.category;
    acc[category] = (acc[category] || 0) + Math.abs(txn.amount);
    return acc;
  }, {});

  const pieChartData = Object.entries(categoryData)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

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

  const recentTransactions = [...currentMonthData.transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="dashboard-container">
      <div className="month-navigation">
        <button className="nav-arrow"
          onClick={() => handleMonthChange("prev")}
          disabled={activeMonthIndex === 0}
        >
          <FiChevronLeft size={24} />
        </button>
        <h2>{monthName} {year}</h2>
        <button className="nav-arrow"
          onClick={() => handleMonthChange("next")}
          disabled={activeMonthIndex === monthNames.length - 1}
        >
          <FiChevronRight size={24} />
        </button>
      </div>

      <div className="summary-cards">
        <div className="summary-card balance">
          <div className="card-header">
            <FiDollarSign className="card-icon" />
            <h3>Current Balance</h3>
          </div>
          <div className="card-value">{formatCurrency(balanceTotal)}</div>
        </div>

        <div className="summary-card income">
          <div className="card-header">
            <FiTrendingUp className="card-icon" />
            <h3>Income</h3>
          </div>
          <div className="card-value">{formatCurrency(incomeTotal)}</div>
        </div>

        <div className="summary-card expenses">
          <div className="card-header">
            <FiTrendingDown className="card-icon card-icon-down" />
            <h3>Expenses</h3>
          </div>
          <div className="card-value">{formatCurrency(expensesTotal)}</div>
        </div>
      </div>

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
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <button
        className="add-transaction-btn"
        onClick={() => setShowForm(!showForm)}
      >
        <FiPlus /> Add Transaction
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
                <FiX />
              </button>
            </div>
            <div className="transaction-form">
              <div className="form-group">
                <label>Transaction Type</label>
                <select
                  value={newTransaction.type}
                  onChange={(e) => {
                    const newType = e.target.value as TransactionType;
                    setNewTransaction({
                      ...newTransaction,
                      type: newType,
                    });
                    if (newType === "expense" && expenseCategories.length > 0) {
                      setSelectedCategoryId(expenseCategories[0].id);
                    } else if (incomeCategories.length > 0) {
                      setSelectedCategoryId(incomeCategories[0].id);
                    }
                  }}
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
                  onChange={(e) => setSelectedCategoryId(parseInt(e.target.value))}
                >
                  {newTransaction.type === "expense"
                    ? expenseCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))
                    : incomeCategories.map((cat) => (
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
                  onChange={(e) => setSelectedWalletId(parseInt(e.target.value))}
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