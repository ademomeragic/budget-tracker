import React, { useEffect, useState } from "react";
import { FiTrash2, FiEdit } from "react-icons/fi";
import {
  fetchWallets,
  addWallet,
  updateWallet,
  deleteWallet,
} from "../../api/wallet";
import api from "../../api/api";
import "./wallet.css";

const TrashIcon = FiTrash2 as unknown as React.FC;
const EditIcon = FiEdit as unknown as React.FC;

export default function Wallet() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [walletTransactions, setWalletTransactions] = useState<
    Record<number, any[]>
  >({});
  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);
  const [currency, setCurrency] = useState("BAM");
  const [conversionRate, setConversionRate] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [currentWallet, setCurrentWallet] = useState({
    id: 0,
    name: "",
    type: "account",
    balance: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [transferFromWalletId, setTransferFromWalletId] = useState(0);
  const [transferToWalletId, setTransferToWalletId] = useState(0);
  const [transferAmount, setTransferAmount] = useState("");

  const loadWallets = async () => {
    try {
      const data = await fetchWallets();
      setWallets(data);
      if (data.length > 0 && selectedWalletId === null) {
        setSelectedWalletId(data[0].id);
      }

      for (const wallet of data) {
        const res = await api.get(`/transaction/wallet/${wallet.id}`);
        setWalletTransactions((prev) => ({ ...prev, [wallet.id]: res.data }));
      }
    } catch (err) {
      console.error("Failed to load wallets or transactions", err);
    }
  };

  useEffect(() => {
    loadWallets();
  }, []);

  const selectedWallet = wallets.find((w) => w.id === selectedWalletId);
  const selectedTransactions = selectedWalletId
    ? walletTransactions[selectedWalletId] || []
    : [];

  const convertedBalance = selectedWallet
    ? selectedWallet.balance * conversionRate
    : 0;

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

  const handleAddWallet = () => {
    resetForm();
    setIsEditing(false);
    setShowModal(true);
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

  const handleSaveWallet = async () => {
    if (!currentWallet.name) return;
    const payload = {
      name: currentWallet.name,
      balance: parseFloat(currentWallet.balance) || 0,
      type: currentWallet.type as "account" | "savings",
    };

    try {
      if (isEditing) {
        await updateWallet(currentWallet.id, payload);
      } else {
        await addWallet(payload);
      }
      await loadWallets();
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error("Failed to save wallet", err);
    }
  };

  const handleDeleteWallet = async (id: number) => {
    if (wallets.length <= 1) {
      alert("You must have at least one wallet");
      return;
    }
    try {
      await deleteWallet(id);
      await loadWallets();
    } catch (err) {
      console.error("Failed to delete wallet", err);
    }
  };

  const resetForm = () => {
    setCurrentWallet({ id: 0, name: "", type: "account", balance: "" });
  };

  const handleTransfer = async () => {
    if (!transferFromWalletId || !transferToWalletId || !transferAmount) {
      alert("All fields are required.");
      return;
    }

    if (transferFromWalletId === transferToWalletId) {
      alert("Cannot transfer to the same wallet.");
      return;
    }

    try {
      await api.post("/wallet/transfer", {
        fromWalletId: transferFromWalletId,
        toWalletId: transferToWalletId,
        amount: parseFloat(transferAmount),
      });

      setShowTransferModal(false);
      setTransferAmount("");
      setTransferFromWalletId(0);
      setTransferToWalletId(0);
      await loadWallets();
    } catch (err) {
      console.error("Failed to transfer funds", err);
      alert("Transfer failed.");
    }
  };

  return (
    <div className="wallet-page">
      <div className="balance-section">
        <h1>Wallet Overview</h1>

        <div className="wallet-selector">
          <label>Select Wallet: </label>
          <select
            value={selectedWalletId || ""}
            onChange={(e) => setSelectedWalletId(Number(e.target.value))}
          >
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        {selectedWallet && (
          <div className="balance-display">
            <p
              className={`balance-amount ${
                selectedWallet.balance >= 0 ? "positive" : "negative"
              }`}
            >
              {convertedBalance.toFixed(2).replace(".", ",")} {currency}
            </p>
            <div className="currency-selector">
              <select value={currency} onChange={handleCurrencyChange}>
                <option value="BAM">BAM ▼</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div className="wallet-actions">
              <button onClick={() => handleEditWallet(selectedWallet)}>
                <EditIcon />
              </button>
              <button onClick={() => handleDeleteWallet(selectedWallet.id)}>
                <TrashIcon />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedWallet && (
        <div className="wallet-transactions">
          <h4>Transactions</h4>
          {selectedTransactions.length === 0 ? (
            <p>No transactions yet</p>
          ) : (
            <ul className="txn-list">
              {selectedTransactions.map((txn) => (
                <li key={txn.id} className="txn-item">
                  <div className="txn-left">
                    <span className="txn-date">
                      {new Date(txn.date).toLocaleDateString()}
                    </span>
                    <span className="txn-desc">{txn.description}</span>
                  </div>
                  <div className={`txn-amount ${txn.type}`}>
                    {txn.type === "income" ? "+" : "-"}
                    {(txn.amount * conversionRate).toFixed(2)} {currency}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <button className="add-wallet-btn" onClick={handleAddWallet}>
        + Add Wallet
      </button>
      <button
        className="add-wallet-btn"
        style={{ marginTop: "10px", backgroundColor: "#4ade80" }}
        onClick={() => setShowTransferModal(true)}
      >
        Balance Budgets
      </button>

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
                />
              </div>
              <div className="modal-buttons">
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button onClick={handleSaveWallet}>
                  {isEditing ? "Save Changes" : "Create Wallet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTransferModal && (
        <div className="modal-overlay">
          <div className="wallet-modal">
            <h3>Balance Budgets</h3>
            <div className="modal-form">
              <div className="form-group">
                <label>From Wallet</label>
                <select
                  value={transferFromWalletId}
                  onChange={(e) =>
                    setTransferFromWalletId(Number(e.target.value))
                  }
                >
                  <option value="">Select...</option>
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>To Wallet</label>
                <select
                  value={transferToWalletId}
                  onChange={(e) =>
                    setTransferToWalletId(Number(e.target.value))
                  }
                >
                  <option value="">Select...</option>
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>

              <div className="modal-buttons">
                <button onClick={() => setShowTransferModal(false)}>
                  Cancel
                </button>
                <button onClick={handleTransfer}>Transfer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
