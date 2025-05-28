import React, { useEffect, useState } from "react";
import {
  updatePassword,
  updateThreshold,
  fetchUserSettings,
  updateNotificationPreferences,
} from "../../api/api";
import "./profile.css";
import { useCurrency } from "../../context/CurrencyContext";

type NotificationPreferences = {
  deadlineWarnings: boolean;
  nearLimitWarnings: boolean;
  exceededWarnings: boolean;
  incomeCongratulations: boolean;
};

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
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [threshold, setThreshold] = useState(80);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    deadlineWarnings: true,
    nearLimitWarnings: true,
    exceededWarnings: true,
    incomeCongratulations: true,
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { currency, setCurrency } = useCurrency();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await fetchUserSettings();
        setThreshold(data.threshold);
        if (data.preferences) setPreferences(data.preferences);
      } catch {
        setError("Failed to load settings.");
      }
    };
    loadSettings();
  }, []);

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

  return (
    <div className="profile-container">
      <h2 className="profile-title">User Profile</h2>

      <div className="profile-section">
        <h3>Settings</h3>
        <div className="profile-form">
          <label>Notification Threshold (%)</label>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            min={10}
            max={100}
          />
          <button onClick={handleThresholdChange}>Update Threshold</button>

          <label style={{ marginTop: "20px" }}>Preferred Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="currency-dropdown"
          >
            {currencyOptions.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.flag} {opt.code} — {opt.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="profile-section">
        <h3>Notifications</h3>
        <div className="profile-form">
          {Object.entries(preferences).map(([key, value]) => (
            <label key={key}>
              <input
                type="checkbox"
                checked={value}
                onChange={() => toggle(key as keyof typeof preferences)}
              />
              {key.replace(/([A-Z])/g, " $1")}
            </label>
          ))}
          <button onClick={handlePreferencesChange}>Update Preferences</button>
        </div>
      </div>

      <div className="profile-section">
        <h3>Change Password</h3>
        <div className="profile-form">
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button onClick={handlePasswordChange}>Update Password</button>
        </div>
      </div>

      {message && <div className="profile-message">{message}</div>}
      {error && <div className="profile-error">{error}</div>}
    </div>
  );
};

export default ProfilePage;
