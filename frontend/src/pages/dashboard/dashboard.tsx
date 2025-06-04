import React, { useState, useEffect } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
} from "react-icons/fi";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
} from "recharts";
import api, { withCurrency } from "../../api/api";
import { parseReceipt } from "../../api/api";
import { useCurrency } from "../../context/CurrencyContext";
import "./dashboard.css";
import AiAssistant from "../../components/aiassistant/aiassistant";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

type TransactionType = "income" | "expense";

interface Transaction {
  id: number;
  amount: number;
  convertedAmount?: number;
  currency?: string;
  date: string | Date;
  description: string;
  type: TransactionType;
  categoryId: number;
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
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  walletId: number;
  targetAmount: number;
  currentAmount: number;
  convertedTarget?: number;
  convertedCurrent?: number;
  currency?: string;
  startDate: string;
  endDate: string;
  type: string;
}


const initialData: Record<string, MonthData> = {
  "MAR 25": { transactions: [], weeks: ["Mar 01-04", "Mar 04-11", "Mar 11-18", "Mar 18-25", "Mar 25-31"], year: 2025, month: 3 },
  "APR 25": { transactions: [], weeks: ["Apr 01-04", "Apr 04-11", "Apr 11-18", "Apr 18-25", "Apr 25-30"], year: 2025, month: 4 },
  "MAY 25": { transactions: [], weeks: ["May 01-04", "May 04-11", "May 11-18", "May 18-25", "May 25-31"], year: 2025, month: 5 },
  "JUN 25": { transactions: [], weeks: ["Jun 01-08", "Jun 08-15", "Jun 15-22", "Jun 22-29", "Jun 29-30"], year: 2025, month: 6 },
  "JUL 25": { transactions: [], weeks: ["Jul 01-06", "Jul 06-13", "Jul 13-20", "Jul 20-27", "Jul 27-31"], year: 2025, month: 7 },
};

const monthNames = Object.keys(initialData);

export default function Dashboard() {
  const { currency } = useCurrency();
  const [activeMonthIndex, setActiveMonthIndex] = useState(2);
  const [monthlyData, setMonthlyData] = useState(initialData);
  const [newTransaction, setNewTransaction] = useState({
    amount: "",
    date: "",
    description: "",
    type: "income" as TransactionType,
  });
  const [showForm, setShowForm] = useState(false);
  const [dateError, setDateError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(1);
  const [selectedWalletId, setSelectedWalletId] = useState<number>(1);
  const activeMonth = monthNames[activeMonthIndex];
  const currentMonthData = monthlyData[activeMonth];
  const monthName = activeMonth.split(" ")[0];
  const year = currentMonthData.year;
  const [goalType, setGoalType] = useState<"expense" | "income">("expense");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);

const handleReceiptUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;
  setReceiptFile(file);
  setIsParsing(true);

  try {
    const parsed = await parseReceipt(file);
    setNewTransaction({
      amount: parsed.amount?.toString() || "",
      date: parsed.date || "",
      description: parsed.description || "",
      type: parsed.type || "expense",
    });
  } catch (err) {
    console.error("❌ Failed to parse receipt", err);
  } finally {
    setIsParsing(false);
  }
};

  const fetchTransactions = async () => {
    const { month, year } = currentMonthData;
    try {
      const res = await api.get(withCurrency(`/transaction?month=${month}&year=${year}`));
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

  useEffect(() => { fetchTransactions(); }, [activeMonthIndex, currency]);

useEffect(() => {
  const fetchCategories = async () => {
    try {
      const res = await api.get("/category?type=both"); // ← FIXED
      setCategories(res.data);
      if (res.data.length > 0) setSelectedCategoryId(res.data[0].id);
    } catch (err) {
      console.error("❌ Failed to fetch categories", err);
    }
  };
  fetchCategories();
}, []); 


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

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await api.get(withCurrency("/goal"));
        setGoals(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch goals", err);
      }
    };
    fetchGoals();
  }, [currency]);


  const formatCurrency = (amount: number, symbol: string = currency) =>
    amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,") + ` ${symbol}`;

  const incomeTotal = currentMonthData.transactions.filter(t => t.type === "income").reduce((sum, t) => sum + (t.convertedAmount ?? t.amount), 0);
  const expensesTotal = currentMonthData.transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + (t.convertedAmount ?? t.amount), 0);
  const balanceTotal = incomeTotal - expensesTotal;

  const monthlyTrendData = Array.from({ length: 12 }, (_, monthIndex) => {
    const monthTransactions = Object.values(monthlyData)
      .flatMap((m) => m.transactions)
      .filter((txn) => new Date(txn.date).getMonth() === monthIndex);

    const income = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + (t.convertedAmount ?? t.amount), 0);

    const expense = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + (t.convertedAmount ?? t.amount), 0);

    return {
      name: new Date(0, monthIndex).toLocaleString("default", { month: "short" }),
      income,
      expense,
      balance: income - expense,
    };
  });

  const validateDate = (dateString: string) => {
    const selectedDate = new Date(dateString);
    return selectedDate.getMonth() + 1 === currentMonthData.month && selectedDate.getFullYear() === currentMonthData.year;
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
    setNewTransaction({ amount: "", date: "", description: "", type: "income" });
    setShowForm(false);
  };
const pieChartData = currentMonthData.transactions
  .filter((t) => t.type === "expense")
  .reduce((acc: { [key: string]: number }, txn) => {
    const matchedCategory = categories.find((cat) => cat.id === txn.categoryId);
    const categoryName = matchedCategory ? matchedCategory.name : "Uncategorized";
    const amount = txn.convertedAmount ?? txn.amount;
    acc[categoryName] = (acc[categoryName] || 0) + Math.abs(amount);
    return acc;
  }, {});

  const pieData = Object.entries(pieChartData).map(([name, amount]) => ({ name, amount }));

  const { min, max } = (() => {
    const month = currentMonthData.month;
    const daysInMonth = new Date(year, month, 0).getDate();
    return {
      min: `${year}-${month.toString().padStart(2, "0")}-01`,
      max: `${year}-${month.toString().padStart(2, "0")}-${daysInMonth.toString().padStart(2, "0")}`,
    };
  })();
  const filteredGoals = goals.filter(goal => goal.type === goalType);


  return (
    <div className="dashboard-container">
      <div className="month-navigation">
        <button className="nav-arrow" onClick={() => setActiveMonthIndex((prev) => Math.max(prev - 1, 0))}>
          <FiChevronLeft size={24} />
        </button>
        <h2>{monthName} {year}</h2>
        <button className="nav-arrow" onClick={() => setActiveMonthIndex((prev) => Math.min(prev + 1, monthNames.length - 1))}>
          <FiChevronRight size={24} />
        </button>
      </div>

      <div className="summary-cards">
        <div className="summary-card balance">
          <div className="card-header"><FiDollarSign className="card-icon" /><h3>Current Balance</h3></div>
          <div className="card-value">{formatCurrency(balanceTotal)}</div>
        </div>
        <div className="summary-card income">
          <div className="card-header"><FiTrendingUp className="card-icon" /><h3>Income</h3></div>
          <div className="card-value">{formatCurrency(incomeTotal)}</div>
        </div>
        <div className="summary-card expenses">
          <div className="card-header"><FiTrendingDown className="card-icon" /><h3>Expenses</h3></div>
          <div className="card-value">{formatCurrency(expensesTotal)}</div>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-container">
          <div className="chart-header"><h3>Monthly Trend</h3></div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyTrendData}>
              <defs>
                <linearGradient id="trendColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="#8884d8"
                fill="url(#trendColor)"
              />
            </AreaChart>
          </ResponsiveContainer>

        </div>
        <div className="chart-container">
          <div className="chart-header"><h3>Spending by Category</h3></div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="amount" nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bottom-row">
        <div className="goals-container">
          <div className="goal-tabs">
              <button className={goalType === "expense" ? "active-tab" : ""} onClick={() => setGoalType("expense")}>
                Spending Goals
              </button>
              <button className={goalType === "income" ? "active-tab" : ""} onClick={() => setGoalType("income")}>
                Income Goals
              </button>
          </div>
          {filteredGoals.length === 0 ? (
            <p className="text-muted">No {goalType} goals yet.</p>
          ) : (
            <ul className="goal-list">
              {filteredGoals.map(goal => (
                <li key={goal.id} className="goal-item">
                  <strong>{goal.name}</strong> —{" "}
                  {formatCurrency(goal.convertedCurrent ?? goal.currentAmount, goal.currency ?? currency)} /{" "}
                  {formatCurrency(goal.convertedTarget ?? goal.targetAmount, goal.currency ?? currency)}
                  <span> ({goal.categoryName})</span>
                  <br />
                  <small>
                    {goal.startDate.split("T")[0]} → {goal.endDate.split("T")[0]}
                  </small>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="transactions-container">
          <h3>Recent Transactions</h3>
          {currentMonthData.transactions.slice(0, 5).map((txn) => (
            <div key={txn.id} className={`transaction-item ${txn.type}`}>
              <span>{txn.description}</span>
              <span>{formatCurrency(txn.convertedAmount ?? txn.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      <button className="add-transaction-btn floating" onClick={() => setShowForm(!showForm)}>
        + Add Transaction
      </button>

      {showForm && (
        <div className="modal-overlay">
          <div className="transaction-modal">
            <div className="modal-header">
              <h2>Add Transaction</h2>
              <button className="close-button" onClick={() => setShowForm(false)}>×</button>
            </div>
            <div className="transaction-form">
              <div className="form-group">
                <label>Type</label>
                <select value={newTransaction.type} onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value as TransactionType })}>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input type="number" value={newTransaction.amount} onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })} placeholder="Amount" />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={newTransaction.date} onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })} min={min} max={max} />
                {dateError && <div className="date-error">{dateError}</div>}
              </div>
              <div className="form-group">
                <label>Description</label>
                <input type="text" value={newTransaction.description} onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(parseInt(e.target.value))}>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Wallet</label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(parseInt(e.target.value))}
                >
                  {categories
                    .filter((cat) => cat.type === newTransaction.type) // ← just here
                    .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                  ))} 
                </select>
              </div>
              <div className="form-group">
                <label>Scan Receipt (Image Upload)</label>
                <input type="file" accept="image/*,application/pdf" onChange={handleReceiptUpload} />
                {receiptFile && <small>📎 {receiptFile.name}</small>}
                {isParsing && <div className="parsing-feedback">⏳ Parsing receipt...</div>}
              </div>

              <button onClick={handleAddTransaction}>Add Transaction</button>
            </div>
          </div>
        </div>
      )}
      <AiAssistant />
    </div>
  );
}
