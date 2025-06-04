import React, { useEffect, useState } from "react";
import {
  updatePassword,
  // updateThreshold, // 🔒 Commented out
  fetchUserSettings,
  // updateNotificationPreferences, // 🔒 Commented out
  fetchRecurringTransactions,
  createRecurringTransaction,
  deleteRecurringTransaction,
  updateRecurringTransaction,
} from "../../api/api";
import "./profile.css";
import { useCurrency } from "../../context/CurrencyContext";
import { fetchWallets } from "../../api/wallet";
import { fetchCategoriesByType } from "../../api/api";
import AiAssistant from "../../components/aiassistant/aiassistant";

const currencyOptions = [
  { code: "BAM", name: "Bosnian Convertible Mark (KM)", flag: "🇧🇦" },
  { code: "USD", name: "US Dollar ($)", flag: "🇺🇸" },
  { code: "EUR", name: "Euro (€)", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound (£)", flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen (¥)", flag: "🇯🇵" },
  { code: "CNY", name: "Chinese Yuan (¥)", flag: "🇨🇳" },
  { code: "INR", name: "Indian Rupee (₹)", flag: "🇮🇳" },
  { code: "CAD", name: "Canadian Dollar (C$)", flag: "🇨🇦" },
  { code: "AUD", name: "Australian Dollar (A$)", flag: "🇦🇺" },
  { code: "CHF", name: "Swiss Franc (CHF)", flag: "🇨🇭" },
  { code: "SEK", name: "Swedish Krona (kr)", flag: "🇸🇪" },
  { code: "NOK", name: "Norwegian Krone (kr)", flag: "🇳🇴" },
  { code: "DKK", name: "Danish Krone (kr)", flag: "🇩🇰" },
  { code: "PLN", name: "Polish Zloty (zł)", flag: "🇵🇱" },
  { code: "CZK", name: "Czech Koruna (Kč)", flag: "🇨🇿" },
  { code: "HUF", name: "Hungarian Forint (Ft)", flag: "🇭🇺" },
  { code: "TRY", name: "Turkish Lira (₺)", flag: "🇹🇷" },
  { code: "AED", name: "UAE Dirham (د.إ)", flag: "🇦🇪" },
  { code: "ZAR", name: "South African Rand (R)", flag: "🇿🇦" },
  { code: "BRL", name: "Brazilian Real (R$)", flag: "🇧🇷" },
  { code: "MXN", name: "Mexican Peso (MX$)", flag: "🇲🇽" },
  { code: "RUB", name: "Russian Ruble (₽)", flag: "🇷🇺" },
  { code: "KRW", name: "South Korean Won (₩)", flag: "🇰🇷" },
  { code: "SGD", name: "Singapore Dollar (S$)", flag: "🇸🇬" },
];

const ProfilePage = () => {
  const { currency, setCurrency } = useCurrency();
  const [wallets, setWallets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  // const [threshold, setThreshold] = useState(80); // 🔒 Commented out
  /*
  const [preferences, setPreferences] = useState({
    deadlineWarnings: true,
    nearLimitWarnings: true,
    exceededWarnings: true,
    incomeCongratulations: true,
  });
  */
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [recurringList, setRecurringList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [recForm, setRecForm] = useState({
    amount: "",
    description: "",
    type: "expense",
    walletId: 0,
    categoryId: 0,
    nextRunDate: "",
    frequency: "monthly",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const settings = await fetchUserSettings();
        // setThreshold(settings.threshold); // 🔒 Commented out
        // if (settings.preferences) setPreferences(settings.preferences); // 🔒
      } catch {
        setError("Failed to load settings.");
      }
      try {
        const rec = await fetchRecurringTransactions();
        console.log("✅ Recurring fetched:", rec);
        setRecurringList(rec);
      } catch (err: any){
         console.error("❌ Failed to fetch recurring transactions", err.response?.data || err.message || err);
      }
      try {
        const wallets = await fetchWallets();
        setWallets(wallets);
      } catch {
        console.error("Failed to fetch wallets");
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await fetchCategoriesByType(recForm.type as "income" | "expense");
        setCategories(cats);
        if (cats.length > 0) {
          setRecForm(prev => ({ ...prev, categoryId: cats[0].id }));
        }
      } catch {
        console.error("Failed to fetch categories");
      }
    };
    loadCategories();
  }, [recForm.type]);

  const handlePasswordChange = async () => {
    try {
      await updatePassword({ currentPassword, newPassword });
      setMessage("Password updated successfully.");
      setError("");
    } catch {
      setError("Error updating password.");
      setMessage("");
    }
  };

  /*
  const handleThresholdChange = async () => {
    try {
      await updateThreshold(threshold);
      setMessage("Notification threshold updated.");
      setError("");
    } catch {
      setError("Error updating threshold.");
      setMessage("");
    }
  };

  const handlePreferencesChange = async () => {
    try {
      await updateNotificationPreferences(preferences);
      setMessage("Notification preferences updated.");
      setError("");
    } catch {
      setError("Error updating preferences.");
      setMessage("");
    }
  };

  const toggle = (key: keyof typeof preferences) => {
    setPreferences({ ...preferences, [key]: !preferences[key] });
  };
  */

  const handleRecurringSubmit = async () => {
    try {
      const data = {
        ...recForm,
        type: recForm.type as "income" | "expense",
        amount: parseFloat(recForm.amount),
      };
      if (isEditing && editingId !== null) {
        await updateRecurringTransaction(editingId, data);
        setMessage("Recurring transaction updated.");
      } else {
        await createRecurringTransaction(data);
        setMessage("Recurring transaction created.");
      }
      setError("");
      setIsEditing(false);
      setEditingId(null);
      setRecForm({
        amount: "",
        description: "",
        type: "expense",
        walletId: 0,
        categoryId: 0,
        nextRunDate: "",
        frequency: "monthly",
      });
      const refreshed = await fetchRecurringTransactions();
      setRecurringList(refreshed);
    } catch {
      setError("Error saving recurring transaction.");
    }
  };

  const handleEdit = (r: any) => {
    setRecForm({
      amount: r.amount.toString(),
      description: r.description,
      type: r.type,
      walletId: r.walletId,
      categoryId: r.categoryId,
      nextRunDate: r.nextRunDate.split("T")[0],
      frequency: r.frequency,
    });
    setIsEditing(true);
    setEditingId(r.id);
  };

  const handleDelete = async (id: number) => {
    if (!id) {
      console.error("❌ Attempted to delete recurring transaction without valid ID");
      return;
    }
    console.log("🗑️ Deleting recurring transaction with ID:", id);
    await deleteRecurringTransaction(id);
    const refreshed = await fetchRecurringTransactions();
    setRecurringList(refreshed);
  };

  return (
    <div className="profile-container">
      <h2 className="profile-title">User Profile</h2>

      <div className="profile-section">
        <h3>Settings</h3>
        <div className="profile-form">
          {/* 
          <label>Notification Threshold (%)</label>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            min={10}
            max={100}
          />
          <button onClick={handleThresholdChange}>Update Threshold</button>
          */}

          <label>Preferred Currency</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="currency-dropdown">
            {currencyOptions.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.flag} {opt.code} — {opt.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/*
      <div className="profile-section">
        <h3>Notifications</h3>
        <div className="profile-form">
          {Object.entries(preferences).map(([key, value]) => (
            <label key={key}>
              <input type="checkbox" checked={value} onChange={() => toggle(key as keyof typeof preferences)} />
              {key.replace(/([A-Z])/g, " $1")}
            </label>
          ))}
          <button onClick={handlePreferencesChange}>Update Preferences</button>
        </div>
      </div>
      */}

      <div className="profile-section">
        <h3>Recurring Transactions</h3>
        <div className="profile-form">
          <label>Amount</label>
          <input type="number" placeholder="Amount" value={recForm.amount} onChange={(e) => setRecForm({ ...recForm, amount: e.target.value })} />

          <label>Description</label>
          <input type="text" placeholder="Description" value={recForm.description} onChange={(e) => setRecForm({ ...recForm, description: e.target.value })} />

          <label>Type</label>
          <select value={recForm.type} onChange={(e) => setRecForm({ ...recForm, type: e.target.value as "income" | "expense" })}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <label>Next Run Date</label>
          <input type="date" value={recForm.nextRunDate} onChange={(e) => setRecForm({ ...recForm, nextRunDate: e.target.value })} />

          <label>Frequency</label>
          <select value={recForm.frequency} onChange={(e) => setRecForm({ ...recForm, frequency: e.target.value })}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>

          <label>Wallet</label>
          <select value={recForm.walletId} onChange={(e) => setRecForm({ ...recForm, walletId: Number(e.target.value) })}>
            <option value="">Select Wallet</option>
            {wallets.map((wallet: any) => (
              <option key={wallet.id} value={wallet.id}>{wallet.name}</option>
            ))}
          </select>

          <label>Category</label>
          <select value={recForm.categoryId} onChange={(e) => setRecForm({ ...recForm, categoryId: Number(e.target.value) })}>
            <option value="">Select Category</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <button onClick={handleRecurringSubmit}>
            {isEditing ? "Update Recurring" : "Add Recurring"}
          </button>
        </div>

        {recurringList.length > 0 && (
          <div className="recurring-table-wrapper">
            <table className="recurring-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Next Run</th>
                  <th>Frequency</th>
                  <th>Wallet</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recurringList.map((r: any) => (
                  <tr key={r.id}>
                    <td>{r.type}</td>
                    <td>{r.amount}</td>
                    <td>{r.description}</td>
                    <td>{new Date(r.nextRunDate).toLocaleDateString()}</td>
                    <td>{r.frequency}</td>
                    <td>{wallets.find(w => w.id === r.walletId)?.name || r.walletId}</td>
                    <td>{categories.find(c => c.id === r.categoryId)?.name || r.categoryId}</td>
                    <td>
                      <button onClick={() => handleEdit(r)}>✏️</button>
                      <button onClick={() => handleDelete(r.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="profile-section">
        <h3>Change Password</h3>
        <div className="profile-form">
          <input type="password" placeholder="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <button onClick={handlePasswordChange}>Update Password</button>
        </div>
      </div>

      {message && <div className="profile-message">{message}</div>}
      {error && <div className="profile-error">{error}</div>}
      <AiAssistant />
    </div>
  );
};

export default ProfilePage;
