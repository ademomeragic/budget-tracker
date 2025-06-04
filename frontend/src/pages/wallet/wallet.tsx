import React, { useEffect, useState } from "react";
import { FiTrash2, FiEdit } from "react-icons/fi";
import { MdAccountBalanceWallet, MdSavings } from "react-icons/md";
import {
  fetchWallets,
  addWallet,
  updateWallet,
  deleteWallet,
} from "../../api/wallet";
import api from "../../api/api";
import "./wallet.css";
import { useCurrency } from "../../context/CurrencyContext";
import AiAssistant from "../../components/aiassistant/aiassistant";

const TrashIcon = FiTrash2 as unknown as React.FC;
const EditIcon = FiEdit as unknown as React.FC;

interface Wallet {
  id: number;
  name: string;
  balance?: number;
  originalBalance: number;
  convertedBalance?: number;
  currency?: string;
  type: "account" | "savings";
}

export default function Wallet() {
  const { currency } = useCurrency();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [walletTransactions, setWalletTransactions] = useState<Record<number, any[]>>({});
  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [currentWallet, setCurrentWallet] = useState({ id: 0, name: "", type: "account", balance: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [transferFromWalletId, setTransferFromWalletId] = useState(0);
  const [transferToWalletId, setTransferToWalletId] = useState(0);
  const [transferAmount, setTransferAmount] = useState("");

  const loadWallets = async () => {
  try {
    const data = await fetchWallets();
console.log("Wallets from backend:", data);

    // Normalize balance structure
const normalized = data.map((w: any) => ({
  id: w.id,
  name: w.name,
  originalBalance: w.originalBalance ?? w.OriginalBalance ?? w.balance ?? w.Balance ?? 0,
  convertedBalance: w.convertedBalance ?? w.ConvertedBalance,
  currency: w.currency ?? w.Currency ?? "BAM",
  type: (w.type ?? w.Type ?? "").toLowerCase(),
}));




    setWallets(normalized);

    if (normalized.length > 0 && selectedWalletId === null) {
      setSelectedWalletId(normalized[0].id);
    }

    for (const wallet of normalized) {
      const res = await api.get(`/transaction/wallet/${wallet.id}?currency=${currency}`);
      setWalletTransactions((prev) => ({ ...prev, [wallet.id]: res.data }));
    }
  } catch (err) {
    console.error("Failed to load wallets or transactions", err);
  }
};


  useEffect(() => {
    loadWallets();
  }, [currency]);

  const selectedWallet = wallets.find(w => w.id === selectedWalletId);
  const selectedTransactions = selectedWalletId ? walletTransactions[selectedWalletId] || [] : [];

  const formatCurrency = (amount: number | undefined, symbol: string = "KM"): string => {
    if (typeof amount !== "number" || isNaN(amount)) return `0.00 ${symbol}`;
    return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,") + ` ${symbol}`;
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
       balance: (wallet.originalBalance ?? wallet.balance ?? 0).toString(),
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
      <div className="wallet-sections">
        {["account", "savings"].map((type) => (
          <div key={type} className={`wallet-section ${type}`}>
            <div className="section-header">
              <h2>{type === "account" ? <MdAccountBalanceWallet /> : <MdSavings />} {type === "account" ? "Accounts" : "Savings"}</h2>
              <button onClick={handleAddWallet}>+ Add</button>
            </div>
            {wallets.filter(w => w.type === type).map((wallet) => (
             <div key={wallet.id} className="wallet-card" onClick={() => setSelectedWalletId(wallet.id)}>
  <div className="wallet-info">
    <span className="wallet-name">{wallet.name}</span>
    <span className="wallet-balance">
      {formatCurrency(wallet.convertedBalance ?? wallet.originalBalance, wallet.currency ?? "KM")}
    </span>
  </div>
  <div className="wallet-card-actions">
    <button onClick={(e) => { e.stopPropagation(); handleEditWallet(wallet); }}><EditIcon /></button>
    <button onClick={(e) => { e.stopPropagation(); handleDeleteWallet(wallet.id); }}><TrashIcon /></button>
  </div>
</div>

            ))}
          </div>
        ))}
      </div>

      {selectedWallet && (
        <div className="wallet-transactions">
          <h4>Transactions for {selectedWallet.name}</h4>
          {selectedTransactions.length === 0 ? (
            <p>No transactions yet</p>
          ) : (
            <ul className="txn-list">
              {selectedTransactions.map((txn) => (
                <li key={txn.id} className={`txn-item ${txn.type}`}>
                  <div className="txn-left">
                    <span className="txn-date">{new Date(txn.date).toLocaleDateString()}</span>
                    <span className="txn-desc">{txn.description}</span>
                  </div>
                  <div className="txn-amount">
                    {txn.type === "income" ? "+" : "-"}
                    {formatCurrency(txn.convertedAmount ?? txn.amount ?? 0, txn.currency ?? "KM")}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <button className="add-wallet-btn" onClick={handleAddWallet}>+ Add Wallet</button>
      <button className="add-wallet-btn" style={{ marginTop: "10px", backgroundColor: "#4ade80" }} onClick={() => setShowTransferModal(true)}>Balance Budgets</button>

      {/* Wallet Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="wallet-modal">
            <h3>{isEditing ? "Edit Wallet" : "Create New Wallet"}</h3>
            <div className="modal-form">
              <div className="form-group">
                <label>Wallet Name</label>
                <input type="text" value={currentWallet.name} onChange={(e) => setCurrentWallet({ ...currentWallet, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={currentWallet.type} onChange={(e) => setCurrentWallet({ ...currentWallet, type: e.target.value as any })}>
                  <option value="account">Account</option>
                  <option value="savings">Savings</option>
                </select>
              </div>
              <div className="form-group">
                <label>Balance</label>
                <input type="number" value={currentWallet.balance} onChange={(e) => setCurrentWallet({ ...currentWallet, balance: e.target.value })} />
              </div>
              <div className="modal-buttons">
                <button onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
                <button onClick={handleSaveWallet}>{isEditing ? "Save Changes" : "Create Wallet"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="modal-overlay">
          <div className="wallet-modal">
            <h3>Balance Budgets</h3>
            <div className="modal-form">
              <div className="form-group">
                <label>From Wallet</label>
                <select value={transferFromWalletId} onChange={(e) => setTransferFromWalletId(Number(e.target.value))}>
                  <option value="">Select...</option>
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>To Wallet</label>
                <select value={transferToWalletId} onChange={(e) => setTransferToWalletId(Number(e.target.value))}>
                  <option value="">Select...</option>
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Amount</label>
                <input type="number" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} placeholder="Enter amount" />
              </div>

              <div className="modal-buttons">
                <button onClick={() => setShowTransferModal(false)}>Cancel</button>
                <button onClick={handleTransfer}>Transfer</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <AiAssistant />
    </div>
  );
}
