import React, { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { FiTrash2, FiEdit } from "react-icons/fi";
import "./wallet.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function Wallet() {
  const [currency, setCurrency] = useState("BAM");
  const [conversionRate, setConversionRate] = useState(1);
  const [wallets, setWallets] = useState([
    { id: 1, name: "Card", balance: 0, type: "account" },
    { id: 2, name: "Savings", balance: 0, type: "savings" },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [currentWallet, setCurrentWallet] = useState({
    id: 0,
    name: "",
    type: "account",
    balance: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  // Calculate totals
  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  const convertedBalance = totalBalance * conversionRate;

  // Prepare data for pie chart
  const pieData = wallets.map((wallet) => ({
    name: wallet.name,
    value: wallet.balance,
  }));

  const handleSaveWallet = () => {
    if (!currentWallet.name) return;

    const walletData = {
      id: currentWallet.id || Date.now(),
      name: currentWallet.name,
      balance: parseFloat(currentWallet.balance) || 0,
      type: currentWallet.type as "account" | "savings",
    };

    if (isEditing) {
      setWallets(wallets.map((w) => (w.id === walletData.id ? walletData : w)));
    } else {
      setWallets([...wallets, walletData]);
    }

    setShowModal(false);
    resetForm();
  };

  const handleEditWallet = (wallet: any) => {
    setCurrentWallet({
      id: wallet.id,
      name: wallet.name,
      type: wallet.type,
      balance: wallet.balance.toString(),
    });
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
    resetForm();
    setIsEditing(false);
    setShowModal(true);
  };

  const resetForm = () => {
    setCurrentWallet({
      id: 0,
      name: "",
      type: "account",
      balance: "",
    });
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

  return (
    <div className="wallet-page">
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
        <h2>My Accounts</h2>
        {wallets
          .filter((w) => w.type === "account")
          .map((wallet) => (
            <div key={wallet.id} className="account-card">
              <div className="account-info">
                <span className="account-name">{wallet.name}</span>
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
                  onClick={() => handleEditWallet(wallet)}
                >
                  <FiEdit />
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteWallet(wallet.id)}
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Savings Section */}
      <div className="savings-section">
        <h2>Savings</h2>
        {wallets
          .filter((w) => w.type === "savings")
          .map((wallet) => (
            <div key={wallet.id} className="savings-card">
              <div className="savings-info">
                {/* <span className="savings-change">
                  {wallet.balance >= 0 ? "+" : ""}
                  {(wallet.balance * conversionRate)
                    .toFixed(2)
                    .replace(".", ",")}{" "}
                  {currency}
                </span> */}
                <span className="savings-name">{wallet.name}</span>
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
                  onClick={() => handleEditWallet(wallet)}
                >
                  <FiEdit />
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteWallet(wallet.id)}
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
                `${(Number(value) * conversionRate).toFixed(2)} ${currency}`,
                "Balance",
              ]}
            />
            <Legend />
          </PieChart>
        </div>
      </div>

      <button className="add-wallet-btn" onClick={handleAddWallet}>
        + Add Wallet
      </button>

      {/* Wallet Modal */}
      {showModal && (
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
                      type: e.target.value as any,
                    })
                  }
                >
                  <option value="account">Account</option>
                  <option value="savings">Savings</option>
                </select>
              </div>
              <div className="form-group">
                <label>Balance</label>
                <input
                  type="number"
                  value={currentWallet.balance}
                  onChange={(e) =>
                    setCurrentWallet({
                      ...currentWallet,
                      balance: e.target.value,
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
                    resetForm();
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
    </div>
  );
}
