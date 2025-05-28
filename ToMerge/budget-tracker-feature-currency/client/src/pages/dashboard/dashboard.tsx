import React, { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import api from "../../api/api";
import "./dashboard.css";
import NotificationList from "../../components/notification/NotificationList";

const ChevronLeftIcon = FiChevronLeft as unknown as React.FC<{ size?: number }>;
const ChevronRightIcon = FiChevronRight as unknown as React.FC<{
  size?: number;
}>;

interface Transaction {
  id: number;
  amount: number;
  date: string | Date;
  description: string;
  type: "income" | "expense";
  convertedAmount?: number; // for converted values from backend
  convertedCurrencyCode?: string; // currency code returned from backend
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

  // New state: selected target currency for conversion display
  const [targetCurrency, setTargetCurrency] = useState<string>("BAM");

  const activeMonth = monthNames[activeMonthIndex];
  const currentMonthData = monthlyData[activeMonth];
  const monthName = activeMonth.split(" ")[0];
  const year = currentMonthData.year;

  // Fetch transactions with targetCurrency param
  const fetchTransactions = async () => {
    const { month, year } = currentMonthData;
    try {
      const res = await api.get(
        `/transaction?month=${month}&year=${year}&targetCurrency=${targetCurrency}`
      );
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
  }, [activeMonthIndex, targetCurrency]);

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

  const formatCurrency = (amount: number, currencyCode = "BAM"): string =>
    amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,") + ` ${currencyCode}`;

  const incomeTotal = currentMonthData.transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + (t.convertedAmount ?? t.amount), 0);
  const expensesTotal = currentMonthData.transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + (t.convertedAmount ?? t.amount), 0);
  const balanceTotal = incomeTotal - expensesTotal;

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
        currencyCode: targetCurrency,
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

  return (
    <div className="dashboard-container">
      <div className="month-navigation">
        <button
          className="nav-arrow"
          onClick={() => handleMonthChange("prev")}
          disabled={activeMonthIndex === 0}
        >
          <ChevronLeftIcon size={24} />
        </button>

        <h2>
          {monthName} {year}
        </h2>

        {/* Currency selection dropdown */}
        <select
          value={targetCurrency}
          onChange={(e) => setTargetCurrency(e.target.value)}
          style={{ marginLeft: 20, padding: "4px 8px", fontSize: 16 }}
        >
          <option value="BAM">BAM</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          {/* add more currencies if needed */}
        </select>

        <button
          className="nav-arrow"
          onClick={() => handleMonthChange("next")}
          disabled={activeMonthIndex === monthNames.length - 1}
        >
          <ChevronRightIcon size={24} />
        </button>
      </div>

      <div className="balance-display">
        <h3>{monthName} Balance</h3>
        <p
          className={`balance-amount ${
            balanceTotal >= 0 ? "positive" : "negative"
          }`}
        >
          {formatCurrency(balanceTotal, targetCurrency)}
        </p>
      </div>
      <div className="summary">
        <div className="summary-item income">
          <h4>Income</h4>
          <p>{formatCurrency(incomeTotal, targetCurrency)}</p>
        </div>
        <div className="summary-item expenses">
          <h4>Expenses</h4>
          <p>{formatCurrency(expensesTotal, targetCurrency)}</p>
        </div>
      </div>

      <button className="add-transaction-btn" onClick={() => setShowForm(true)}>
        Add Transaction
      </button>

      {showForm && (
        <div className="transaction-form">
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

          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(parseInt(e.target.value))}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={selectedWalletId}
            onChange={(e) => setSelectedWalletId(parseInt(e.target.value))}
          >
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Amount"
            value={newTransaction.amount}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, amount: e.target.value })
            }
          />

          <input
            type="date"
            value={newTransaction.date}
            min={min}
            max={max}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, date: e.target.value })
            }
          />
          {dateError && <p className="error">{dateError}</p>}

          <input
            type="text"
            placeholder="Description"
            value={newTransaction.description}
            onChange={(e) =>
              setNewTransaction({
                ...newTransaction,
                description: e.target.value,
              })
            }
          />

          <button onClick={handleAddTransaction}>Add</button>
          <button onClick={() => setShowForm(false)}>Cancel</button>
        </div>
      )}

      <div className="calendar">
        {currentMonthData.weeks.map((week) => {
          const weekTransactions = getTransactionsForWeek(week);
          return (
            <div key={week} className="week-column">
              <h5>{week}</h5>
              {weekTransactions.map((txn) => (
                <div key={txn.id} className={`transaction ${txn.type}`}>
                  <span className="transaction-day">
                    {new Date(txn.date).getDate()}
                  </span>
                  <span className="transaction-desc">{txn.description}</span>
                  <span className="transaction-amount">
                    {txn.type === "income" ? "+" : "-"}
                    {txn.convertedAmount !== undefined &&
                    txn.convertedCurrencyCode
                      ? formatCurrency(
                          txn.convertedAmount,
                          txn.convertedCurrencyCode
                        )
                      : formatCurrency(txn.amount)}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <NotificationList />
    </div>
  );
}
