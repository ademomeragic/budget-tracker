import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { FiTrash2, FiEdit, FiArrowLeft, FiPlus, FiMinus } from "react-icons/fi";
import {
  MdAccountBalanceWallet,
  MdSavings,
  MdShowChart,
  MdTrendingDown,
} from "react-icons/md";
import "./wallet.css";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A28DFF",
  "#FF6B6B",
];

type Transaction = {
  id: number;
  amount: number;
  description: string;
  date: string;
  category: string;
  type: "income" | "expense";
};

type Wallet = {
  id: number;
  name: string;
  balance: number;
  initialBalance: number;
  type: "account" | "savings";
  transactions: Transaction[];
};

export default function Wallet() {
  const [currency, setCurrency] = useState("BAM");
  const [conversionRate, setConversionRate] = useState(1);
  const [wallets, setWallets] = useState<Wallet[]>([
    {
      id: 1,
      name: "Main Card ",
      balance: 1250,
      initialBalance: 1000,
      type: "account",
      transactions: [
        {
          id: 1,
          amount: 200,
          description: "Salary",
          date: "2023-05-01",
          category: "Salary",
          type: "income",
        },
        {
          id: 2,
          amount: -50,
          description: "Groceries",
          date: "2023-05-02",
          category: "Food",
          type: "expense",
        },
        {
          id: 3,
          amount: -30,
          description: "Dinner",
          date: "2023-05-03",
          category: "Food",
          type: "expense",
        },
        {
          id: 4,
          amount: 100,
          description: "Freelance",
          date: "2023-05-05",
          category: "Work",
          type: "income",
        },
      ],
    },
    {
      id: 2,
      name: "Savings",
      balance: 3500,
      initialBalance: 3000,
      type: "savings",
      transactions: [
        {
          id: 1,
          amount: 500,
          description: "Initial deposit",
          date: "2023-01-01",
          category: "Deposit",
          type: "income",
        },
        {
          id: 2,
          amount: 100,
          description: "Monthly savings",
          date: "2023-02-01",
          category: "Savings",
          type: "income",
        },
      ],
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [currentWallet, setCurrentWallet] = useState<Wallet | null>(null);
  const [currentTransaction, setCurrentTransaction] = useState<
    Partial<Transaction>
  >({
    amount: 0,
    description: "",
    date: new Date().toISOString().split("T")[0],
    category: "",
    type: "expense",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingTransaction, setIsEditingTransaction] = useState(false);

  // Calculate totals
  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  const convertedBalance = totalBalance * conversionRate;

  // Prepare data for pie chart
  const pieData = wallets.map((wallet) => ({
    name: wallet.name,
    value: wallet.balance,
  }));

  const handleSaveWallet = () => {
    if (!currentWallet?.name) return;

    const walletData: Wallet = {
      id: currentWallet.id || Date.now(),
      name: currentWallet.name,
      balance: currentWallet.balance || 0,
      initialBalance: currentWallet.initialBalance || 0,
      type: currentWallet.type,
      transactions: currentWallet.transactions || [],
    };

    if (isEditing) {
      setWallets(wallets.map((w) => (w.id === walletData.id ? walletData : w)));
    } else {
      setWallets([...wallets, walletData]);
    }

    setShowModal(false);
    setCurrentWallet(null);
  };

  const handleEditWallet = (wallet: Wallet) => {
    setCurrentWallet({ ...wallet });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDeleteWallet = (id: number) => {
    if (wallets.length <= 1) {
      alert("You must have at least one wallet");
      return;
    }
    setWallets(wallets.filter((wallet) => wallet.id !== id));
  };

  const handleAddWallet = () => {
    setCurrentWallet({
      id: 0,
      name: "",
      balance: 0,
      initialBalance: 0,
      type: "account",
      transactions: [],
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleViewWalletDetails = (wallet: Wallet) => {
    setCurrentWallet(wallet);
  };

  const handleBackToList = () => {
    setCurrentWallet(null);
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value;
    setCurrency(newCurrency);

    switch (newCurrency) {
      case "USD":
        setConversionRate(0.56);
        break;
      case "EUR":
        setConversionRate(0.51);
        break;
      default:
        setConversionRate(1);
    }
  };

  const handleSaveTransaction = () => {
    if (
      !currentWallet ||
      !currentTransaction.description ||
      !currentTransaction.amount
    )
      return;

    const transactionData: Transaction = {
      id: currentTransaction.id || Date.now(),
      amount:
        Number(currentTransaction.amount) *
        (currentTransaction.type === "expense" ? -1 : 1),
      description: currentTransaction.description,
      date: currentTransaction.date || new Date().toISOString().split("T")[0],
      category: currentTransaction.category || "Other",
      type: currentTransaction.type || "expense",
    };

    const updatedWallet = { ...currentWallet };

    if (isEditingTransaction) {
      // Find and replace the transaction
      const transactionIndex = updatedWallet.transactions.findIndex(
        (t) => t.id === transactionData.id
      );
      if (transactionIndex >= 0) {
        // First remove the old transaction amount from balance
        updatedWallet.balance -=
          updatedWallet.transactions[transactionIndex].amount;
        // Then update the transaction and add the new amount
        updatedWallet.transactions[transactionIndex] = transactionData;
        updatedWallet.balance += transactionData.amount;
      }
    } else {
      // Add new transaction
      updatedWallet.transactions.push(transactionData);
      updatedWallet.balance += transactionData.amount;
    }

    // Update the wallet in the main list
    setWallets(
      wallets.map((w) => (w.id === updatedWallet.id ? updatedWallet : w))
    );
    setCurrentWallet(updatedWallet);
    setShowTransactionModal(false);
    setCurrentTransaction({
      amount: 0,
      description: "",
      date: new Date().toISOString().split("T")[0],
      category: "",
      type: "expense",
    });
  };

  const handleAddTransaction = () => {
    setIsEditingTransaction(false);
    setCurrentTransaction({
      amount: 0,
      description: "",
      date: new Date().toISOString().split("T")[0],
      category: "",
      type: "expense",
    });
    setShowTransactionModal(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setIsEditingTransaction(true);
    setCurrentTransaction({
      id: transaction.id,
      amount: Math.abs(transaction.amount),
      description: transaction.description,
      date: transaction.date,
      category: transaction.category,
      type: transaction.type,
    });
    setShowTransactionModal(true);
  };

  const handleDeleteTransaction = (transactionId: number) => {
    if (!currentWallet) return;

    const transaction = currentWallet.transactions.find(
      (t) => t.id === transactionId
    );
    if (!transaction) return;

    const updatedWallet = {
      ...currentWallet,
      balance: currentWallet.balance - transaction.amount,
      transactions: currentWallet.transactions.filter(
        (t) => t.id !== transactionId
      ),
    };

    setWallets(
      wallets.map((w) => (w.id === updatedWallet.id ? updatedWallet : w))
    );
    setCurrentWallet(updatedWallet);
  };

  // Calculate wallet statistics
  const getWalletStats = (wallet: Wallet) => {
    const incomes = wallet.transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = wallet.transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const netChange = incomes - expenses;
    const growth =
      ((wallet.balance - wallet.initialBalance) / wallet.initialBalance) * 100;

    return { incomes, expenses, netChange, growth };
  };

  // Prepare data for transaction history chart
  const getTransactionHistoryData = (wallet: Wallet) => {
    const history: { date: string; income: number; expense: number }[] = [];

    wallet.transactions.forEach((transaction) => {
      const existingEntry = history.find(
        (item) => item.date === transaction.date
      );

      if (existingEntry) {
        if (transaction.type === "income") {
          existingEntry.income += transaction.amount;
        } else {
          existingEntry.expense += Math.abs(transaction.amount);
        }
      } else {
        history.push({
          date: transaction.date,
          income: transaction.type === "income" ? transaction.amount : 0,
          expense:
            transaction.type === "expense" ? Math.abs(transaction.amount) : 0,
        });
      }
    });

    return history.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  // Prepare data for category breakdown
  const getCategoryData = (wallet: Wallet) => {
    const categories: Record<string, number> = {};

    wallet.transactions
      .filter((t) => t.type === "expense")
      .forEach((transaction) => {
        categories[transaction.category] =
          (categories[transaction.category] || 0) +
          Math.abs(transaction.amount);
      });

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  return (
    <div className="wallet-page">
      {!currentWallet ? (
        <>
          {/* Balance Section */}
          <div className="balance-section">
            <h1>Balance</h1>
            <div className="balance-display">
              <p
                className={`balance-amount ${
                  totalBalance >= 0 ? "positive" : "negative"
                }`}
              >
                {totalBalance >= 0 ? "+" : ""}
                {convertedBalance.toFixed(2).replace(".", ",")} {currency}
              </p>
              <div className="currency-selector">
                <select value={currency} onChange={handleCurrencyChange}>
                  <option value="BAM">BAM ▼</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
            <p className="conversion-note">
              {conversionRate !== 1 && (
                <>
                  ≈ {totalBalance.toFixed(2).replace(".", ",")} BAM
                  <br />
                  (1 BAM = {(1 / conversionRate).toFixed(4)} {currency})
                </>
              )}
            </p>
          </div>

          {/* Accounts Section */}
          <div className="accounts-section">
            <div className="section-header">
              <h2>
                <MdAccountBalanceWallet /> My Accounts
              </h2>
              <button className="add-btn" onClick={handleAddWallet}>
                <FiPlus /> Add Account
              </button>
            </div>
            {wallets
              .filter((w) => w.type === "account")
              .map((wallet) => (
                <div
                  key={wallet.id}
                  className="account-card"
                  onClick={() => handleViewWalletDetails(wallet)}
                >
                  <div className="account-info">
                    <span className="account-name">{wallet.name} </span>
                    <span className="account-balance">
                      {(wallet.balance * conversionRate)
                        .toFixed(2)
                        .replace(".", ",")}{" "}
                      {currency}
                    </span>
                  </div>
                  <div className="wallet-actions">
                    <button
                      className="edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditWallet(wallet);
                      }}
                    >
                      <FiEdit />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWallet(wallet.id);
                      }}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Savings Section */}
          <div className="savings-section">
            <div className="section-header">
              <h2>
                <MdSavings /> Savings
              </h2>
              <button className="add-btn" onClick={handleAddWallet}>
                <FiPlus /> Add Savings
              </button>
            </div>
            {wallets
              .filter((w) => w.type === "savings")
              .map((wallet) => (
                <div
                  key={wallet.id}
                  className="savings-card"
                  onClick={() => handleViewWalletDetails(wallet)}
                >
                  <div className="savings-info">
                    <span className="savings-name">{wallet.name} </span>
                    <span className="savings-balance">
                      {(wallet.balance * conversionRate)
                        .toFixed(2)
                        .replace(".", ",")}{" "}
                      {currency}
                    </span>
                  </div>
                  <div className="wallet-actions">
                    <button
                      className="edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditWallet(wallet);
                      }}
                    >
                      <FiEdit />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWallet(wallet.id);
                      }}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Pie Chart Section */}
          <div className="chart-section">
            <h2>Balance Distribution</h2>
            <div className="pie-chart-container">
              <PieChart width={400} height={300}>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    `${(Number(value) * conversionRate).toFixed(
                      2
                    )} ${currency}`,
                    "Balance",
                  ]}
                />
                <Legend />
              </PieChart>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Wallet Detail View */}
          <div className="wallet-detail-header">
            <button className="back-button" onClick={handleBackToList}>
              <FiArrowLeft /> Back to Wallets
            </button>
            <h1>{currentWallet.name}</h1>
            <div className="wallet-detail-actions">
              <button
                className="edit-btn"
                onClick={() => handleEditWallet(currentWallet)}
              >
                <FiEdit /> Edit Wallet
              </button>
              <button
                className="delete-btn"
                onClick={() => handleDeleteWallet(currentWallet.id)}
              >
                <FiTrash2 /> Delete Wallet
              </button>
            </div>
          </div>

          <div className="wallet-summary">
            <div className="wallet-balance-card">
              <h3>Current Balance</h3>
              <p
                className={`balance-amount ${
                  currentWallet.balance >= 0 ? "positive" : "negative"
                }`}
              >
                {(currentWallet.balance * conversionRate).toFixed(2)} {currency}
              </p>
              <p className="initial-balance">
                Initial:{" "}
                {(currentWallet.initialBalance * conversionRate).toFixed(2)}{" "}
                {currency}
              </p>
            </div>

            <div className="wallet-stats">
              <div className="stat-card income">
                <MdShowChart className="stat-icon" />
                <div>
                  <h4>Income</h4>
                  <p>
                    {(
                      getWalletStats(currentWallet).incomes * conversionRate
                    ).toFixed(2)}{" "}
                    {currency}
                  </p>
                </div>
              </div>
              <div className="stat-card expense">
                <MdTrendingDown className="stat-icon" />
                <div>
                  <h4>Expenses</h4>
                  <p>
                    {(
                      getWalletStats(currentWallet).expenses * conversionRate
                    ).toFixed(2)}{" "}
                    {currency}
                  </p>
                </div>
              </div>
              <div className="stat-card net">
                <MdAccountBalanceWallet className="stat-icon" />
                <div>
                  <h4>Net Change</h4>
                  <p
                    className={
                      getWalletStats(currentWallet).netChange >= 0
                        ? "positive"
                        : "negative"
                    }
                  >
                    {getWalletStats(currentWallet).netChange >= 0 ? "+" : ""}
                    {(
                      getWalletStats(currentWallet).netChange * conversionRate
                    ).toFixed(2)}{" "}
                    {currency}
                  </p>
                </div>
              </div>
              <div className="stat-card growth">
                <MdSavings className="stat-icon" />
                <div>
                  <h4>Growth</h4>
                  <p
                    className={
                      getWalletStats(currentWallet).growth >= 0
                        ? "positive"
                        : "negative"
                    }
                  >
                    {getWalletStats(currentWallet).growth.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="wallet-detail-content">
            <div className="transactions-section">
              <div className="section-header">
                <h2>Transactions</h2>
                <button className="add-btn" onClick={handleAddTransaction}>
                  <FiPlus /> Add Transaction
                </button>
              </div>

              <div className="transactions-list">
                {currentWallet.transactions.length === 0 ? (
                  <p className="no-transactions">No transactions yet</p>
                ) : (
                  currentWallet.transactions
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                    .map((transaction) => (
                      <div
                        key={transaction.id}
                        className={`transaction-card ${transaction.type}`}
                      >
                        <div className="transaction-info">
                          <span className="transaction-date">
                            {new Date(transaction.date).toLocaleDateString()}
                          </span>
                          <span className="transaction-description">
                            {transaction.description}
                            {transaction.category && (
                              <span className="transaction-category">
                                {transaction.category}
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="transaction-amount">
                          <span className={`amount ${transaction.type}`}>
                            {transaction.type === "income" ? "+" : "-"}
                            {(
                              Math.abs(transaction.amount) * conversionRate
                            ).toFixed(2)}{" "}
                            {currency}
                          </span>
                          <div className="transaction-actions">
                            <button
                              className="edit-btn"
                              onClick={() => handleEditTransaction(transaction)}
                            >
                              <FiEdit />
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() =>
                                handleDeleteTransaction(transaction.id)
                              }
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="analytics-section">
              <div className="chart-container">
                <h3>Transaction History</h3>
                <BarChart
                  width={500}
                  height={300}
                  data={getTransactionHistoryData(currentWallet)}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [
                      `${Number(value).toFixed(2)} ${currency}`,
                      value === "income" ? "Income" : "Expense",
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#00C49F" name="Income" />
                  <Bar dataKey="expense" fill="#FF8042" name="Expense" />
                </BarChart>
              </div>

              <div className="chart-container">
                <h3>Expense Categories</h3>
                <PieChart width={400} height={300}>
                  <Pie
                    data={getCategoryData(currentWallet)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {getCategoryData(currentWallet).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      `${(Number(value) * conversionRate).toFixed(
                        2
                      )} ${currency}`,
                      "Amount",
                    ]}
                  />
                  <Legend />
                </PieChart>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Wallet Modal */}
      {showModal && currentWallet && (
        <div className="modal-overlay">
          <div className="wallet-modal">
            <h3>{isEditing ? "Edit Wallet" : "Create New Wallet"}</h3>
            <div className="modal-form">
              <div className="form-group">
                <label>Wallet Name</label>
                <input
                  type="text"
                  value={currentWallet.name}
                  onChange={(e) =>
                    setCurrentWallet({ ...currentWallet, name: e.target.value })
                  }
                  placeholder="e.g. Main Card"
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  value={currentWallet.type}
                  onChange={(e) =>
                    setCurrentWallet({
                      ...currentWallet,
                      type: e.target.value as "account" | "savings",
                    })
                  }
                >
                  <option value="account">Account</option>
                  <option value="savings">Savings</option>
                </select>
              </div>
              <div className="form-group">
                <label>Initial Balance</label>
                <input
                  type="number"
                  value={currentWallet.initialBalance}
                  onChange={(e) =>
                    setCurrentWallet({
                      ...currentWallet,
                      initialBalance: Number(e.target.value),
                      balance: Number(e.target.value),
                    })
                  }
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div className="modal-buttons">
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setShowModal(false);
                    setCurrentWallet(null);
                  }}
                >
                  Cancel
                </button>
                <button className="confirm-btn" onClick={handleSaveWallet}>
                  {isEditing ? "Save Changes" : "Create Wallet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div className="modal-overlay">
          <div className="wallet-modal">
            <h3>
              {isEditingTransaction
                ? "Edit Transaction"
                : "Add New Transaction"}
            </h3>
            <div className="modal-form">
              <div className="form-group">
                <label>Type</label>
                <div className="type-toggle">
                  <button
                    className={`toggle-btn ${
                      currentTransaction.type === "income" ? "active" : ""
                    }`}
                    onClick={() =>
                      setCurrentTransaction({
                        ...currentTransaction,
                        type: "income",
                      })
                    }
                  >
                    <FiPlus /> Income
                  </button>
                  <button
                    className={`toggle-btn ${
                      currentTransaction.type === "expense" ? "active" : ""
                    }`}
                    onClick={() =>
                      setCurrentTransaction({
                        ...currentTransaction,
                        type: "expense",
                      })
                    }
                  >
                    <FiMinus /> Expense
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  value={currentTransaction.amount}
                  onChange={(e) =>
                    setCurrentTransaction({
                      ...currentTransaction,
                      amount: Number(e.target.value),
                    })
                  }
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={currentTransaction.description}
                  onChange={(e) =>
                    setCurrentTransaction({
                      ...currentTransaction,
                      description: e.target.value,
                    })
                  }
                  placeholder="e.g. Groceries"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={currentTransaction.category}
                  onChange={(e) =>
                    setCurrentTransaction({
                      ...currentTransaction,
                      category: e.target.value,
                    })
                  }
                  placeholder="e.g. Food"
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={currentTransaction.date}
                  onChange={(e) =>
                    setCurrentTransaction({
                      ...currentTransaction,
                      date: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-buttons">
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setShowTransactionModal(false);
                    setCurrentTransaction({
                      amount: 0,
                      description: "",
                      date: new Date().toISOString().split("T")[0],
                      category: "",
                      type: "expense",
                    });
                  }}
                >
                  Cancel
                </button>
                <button className="confirm-btn" onClick={handleSaveTransaction}>
                  {isEditingTransaction ? "Save Changes" : "Add Transaction"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
