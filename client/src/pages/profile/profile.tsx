import React, { useEffect, useState } from "react";
import {
  updatePassword,
  updateThreshold,
  fetchUserSettings,
  updateNotificationPreferences,
} from "../../api/api";
import "./profile.css";
import ChatWidget from "../../components/chat/ChatWidget";

type NotificationPreferences = {
  deadlineWarnings: boolean;
  nearLimitWarnings: boolean;
  exceededWarnings: boolean;
  incomeCongratulations: boolean;
};

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

      <div>
        <ChatWidget />
      </div>

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
        </div>
      </div>

      <div className="profile-section">
        <h3>Notifications</h3>
        <div className="profile-form">
          <label>
            <input
              type="checkbox"
              checked={preferences.deadlineWarnings}
              onChange={() => toggle("deadlineWarnings")}
            />
            Deadline Warnings
          </label>
          <label>
            <input
              type="checkbox"
              checked={preferences.nearLimitWarnings}
              onChange={() => toggle("nearLimitWarnings")}
            />
            Near Limit Warnings
          </label>
          <label>
            <input
              type="checkbox"
              checked={preferences.exceededWarnings}
              onChange={() => toggle("exceededWarnings")}
            />
            Exceeded Goal Warnings
          </label>
          <label>
            <input
              type="checkbox"
              checked={preferences.incomeCongratulations}
              onChange={() => toggle("incomeCongratulations")}
            />
            Income Goal Congrats
          </label>
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
