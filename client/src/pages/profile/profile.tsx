import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { uploadImage } from "../services/imageService";
import { updateProfile, changePassword } from "../services/userService";
import "./profile.css";

// Icons
import {
  FiEdit,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiX,
  FiUpload,
  FiLock,
  FiUser,
  FiMail,
  FiGlobe,
} from "react-icons/fi";
import { MdPassword, MdCurrencyExchange, MdDateRange } from "react-icons/md";

// Types
type ProfileFormData = {
  username: string;
  name: string;
  email: string;
};

type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type SettingsFormData = {
  currency: string;
  language: string;
  theme: "light" | "dark" | "system";
};

const SUPPORTED_CURRENCIES = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "BAM", name: "Bosnian Mark" },
  { code: "JPY", name: "Japanese Yen" },
];

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "bs", name: "Bosanski" },
  { code: "de", name: "Deutsch" },
  { code: "fr", name: "Français" },
];

const DEFAULT_PROFILE_IMAGE =
  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  const { settings, setSettings } = useSettings();

  // Form states
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    username: user?.username || "",
    name: user?.name || "",
    email: user?.email || "",
  });

  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [settingsForm, setSettingsForm] = useState<SettingsFormData>({
    currency: settings?.currency || "USD",
    language: settings?.language || "en",
    theme: settings?.theme || "system",
  });

  // UI states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState(
    user?.profileImage || DEFAULT_PROFILE_IMAGE
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Error states
  const [errors, setErrors] = useState({
    username: "",
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Reset messages after timeout
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  // Handle image upload
  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image
    if (!file.type.match("image.*")) {
      setErrorMessage("Please select a valid image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("Image size should be less than 2MB");
      return;
    }

    setProfileImage(file);
    setPreviewImage(URL.createObjectURL(file));

    try {
      setIsLoading(true);
      const imageUrl = await uploadImage(file);

      // Update user profile with new image
      const updatedUser = { ...user!, profileImage: imageUrl };
      await updateProfile(updatedUser);
      setUser(updatedUser);

      setSuccessMessage("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      setErrorMessage("Failed to update profile picture");
      setPreviewImage(user?.profileImage || DEFAULT_PROFILE_IMAGE);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle profile form changes
  const handleProfileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle password form changes
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle settings form changes
  const handleSettingsChange = (
    e: ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setSettingsForm((prev) => ({ ...prev, [name]: value }));
  };

  // Validate profile form
  const validateProfileForm = () => {
    let valid = true;
    const newErrors = { username: "", name: "", email: "" };

    if (!profileForm.username.trim()) {
      newErrors.username = "Username is required";
      valid = false;
    } else if (profileForm.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
      valid = false;
    }

    if (!profileForm.name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }

    if (!profileForm.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(profileForm.email)
    ) {
      newErrors.email = "Invalid email address";
      valid = false;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return valid;
  };

  // Validate password form
  const validatePasswordForm = () => {
    let valid = true;
    const newErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = "Current password is required";
      valid = false;
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = "New password is required";
      valid = false;
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
      valid = false;
    } else if (!/[A-Z]/.test(passwordForm.newPassword)) {
      newErrors.newPassword =
        "Password must contain at least one uppercase letter";
      valid = false;
    } else if (!/[0-9]/.test(passwordForm.newPassword)) {
      newErrors.newPassword = "Password must contain at least one number";
      valid = false;
    } else if (!/[^A-Za-z0-9]/.test(passwordForm.newPassword)) {
      newErrors.newPassword =
        "Password must contain at least one special character";
      valid = false;
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
      valid = false;
    } else if (passwordForm.confirmPassword !== passwordForm.newPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return valid;
  };

  // Submit profile form
  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !validateProfileForm()) return;

    try {
      setIsLoading(true);
      const updatedUser = {
        ...user,
        username: profileForm.username,
        name: profileForm.name,
        email: profileForm.email,
      };

      await updateProfile(updatedUser);
      setUser(updatedUser);
      setIsEditingProfile(false);
      setSuccessMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrorMessage("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit password form
  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    try {
      setIsLoading(true);
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSuccessMessage("Password changed successfully!");

      // Logout user after password change for security
      setTimeout(() => {
        logout();
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Error changing password:", error);
      setErrorMessage(
        "Failed to change password. Please check your current password."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Submit settings form
  const handleSettingsSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      await setSettings(settingsForm);
      setIsEditingSettings(false);
      setSuccessMessage("Settings updated successfully!");
    } catch (error) {
      console.error("Error updating settings:", error);
      setErrorMessage("Failed to update settings");
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    if (isEditingProfile) {
      setProfileForm({
        username: user?.username || "",
        name: user?.name || "",
        email: user?.email || "",
      });
      setIsEditingProfile(false);
    }

    if (isEditingSettings) {
      setSettingsForm({
        currency: settings?.currency || "USD",
        language: settings?.language || "en",
        theme: settings?.theme || "system",
      });
      setIsEditingSettings(false);
    }

    setErrors({
      username: "",
      name: "",
      email: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  if (!user) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className={`profile-container ${settings.theme}`}>
      {/* Success/Error Messages */}
      {(successMessage || errorMessage) && (
        <div className={`alert ${successMessage ? "success" : "error"}`}>
          {successMessage || errorMessage}
          <button
            onClick={() => {
              setSuccessMessage("");
              setErrorMessage("");
            }}
            className="close-btn"
          >
            <FiX />
          </button>
        </div>
      )}

      <div className="profile-header">
        <h1>Profile Settings</h1>
        <p>Manage your personal information and account settings</p>
      </div>

      <div className="profile-content">
        {/* Profile Image Section */}
        <div className="profile-image-section">
          <div className="image-container">
            <img
              src={previewImage}
              alt="Profile"
              className="profile-image"
              onError={(e) => {
                const img = e.currentTarget;
                if (img.src !== DEFAULT_PROFILE_IMAGE) {
                  img.src = DEFAULT_PROFILE_IMAGE;
                }
              }}
            />
            <div className="image-upload">
              <label
                htmlFor="profile-image-upload"
                className="change-photo-btn"
              >
                <FiUpload /> Change Photo
              </label>
              <input
                id="profile-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </div>
          </div>

          <div className="member-since">
            <MdDateRange className="icon" />
            <span>
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Profile Info Section */}
        <div className="profile-info-section">
          {!isEditingProfile ? (
            <div className="profile-info-container">
              <h2>{user.name}</h2>
              <p className="username">@{user.username}</p>

              <div className="info-item">
                <FiMail className="icon" />
                <span>{user.email}</span>
              </div>

              <div className="action-buttons">
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="edit-btn"
                >
                  <FiEdit /> Edit Profile
                </button>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="change-password-btn"
                >
                  <MdPassword /> Change Password
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleProfileSubmit} className="profile-edit-form">
              <h2>Edit Profile</h2>

              <div className="form-group">
                <label htmlFor="username">
                  <FiUser className="icon" /> Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={profileForm.username}
                  onChange={handleProfileChange}
                  className={errors.username ? "error" : ""}
                  placeholder="Enter your username"
                />
                {errors.username && (
                  <span className="error-message">{errors.username}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="name">
                  <FiUser className="icon" /> Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  className={errors.name ? "error" : ""}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <FiMail className="icon" /> Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  className={errors.email ? "error" : ""}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="cancel-btn"
                  disabled={isLoading}
                >
                  <FiX /> Cancel
                </button>
                <button type="submit" disabled={isLoading} className="save-btn">
                  {isLoading ? (
                    "Saving..."
                  ) : (
                    <>
                      <FiCheck /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Settings Section */}
        <div className="settings-section">
          <div className="section-header">
            <h2>
              <FiGlobe /> Account Settings
            </h2>
            {!isEditingSettings ? (
              <button
                onClick={() => setIsEditingSettings(true)}
                className="edit-btn"
              >
                <FiEdit /> Edit Settings
              </button>
            ) : (
              <button onClick={cancelEditing} className="cancel-btn">
                <FiX /> Cancel
              </button>
            )}
          </div>

          {!isEditingSettings ? (
            <div className="settings-info">
              <div className="info-item">
                <span className="label">Currency:</span>
                <span className="value">
                  {SUPPORTED_CURRENCIES.find(
                    (c) => c.code === settings.currency
                  )?.name || settings.currency}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Language:</span>
                <span className="value">
                  {SUPPORTED_LANGUAGES.find((l) => l.code === settings.language)
                    ?.name || settings.language}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Theme:</span>
                <span className="value capitalize">{settings.theme}</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSettingsSubmit} className="settings-form">
              <div className="form-group">
                <label htmlFor="currency">
                  <MdCurrencyExchange className="icon" /> Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={settingsForm.currency}
                  onChange={handleSettingsChange}
                >
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.name} ({currency.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="language">
                  <FiGlobe className="icon" /> Language
                </label>
                <select
                  id="language"
                  name="language"
                  value={settingsForm.language}
                  onChange={handleSettingsChange}
                >
                  {SUPPORTED_LANGUAGES.map((language) => (
                    <option key={language.code} value={language.code}>
                      {language.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="theme">
                  <FiGlobe className="icon" /> Theme
                </label>
                <div className="theme-options">
                  <label>
                    <input
                      type="radio"
                      name="theme"
                      value="light"
                      checked={settingsForm.theme === "light"}
                      onChange={handleSettingsChange}
                    />
                    Light
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="theme"
                      value="dark"
                      checked={settingsForm.theme === "dark"}
                      onChange={handleSettingsChange}
                    />
                    Dark
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="theme"
                      value="system"
                      checked={settingsForm.theme === "system"}
                      onChange={handleSettingsChange}
                    />
                    System
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="cancel-btn"
                  disabled={isLoading}
                >
                  <FiX /> Cancel
                </button>
                <button type="submit" disabled={isLoading} className="save-btn">
                  {isLoading ? (
                    "Saving..."
                  ) : (
                    <>
                      <FiCheck /> Save Settings
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>
              <FiLock /> Change Password
            </h2>
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <div className="password-input">
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className={errors.currentPassword ? "error" : ""}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <span className="error-message">
                    {errors.currentPassword}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <div className="password-input">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className={errors.newPassword ? "error" : ""}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.newPassword && (
                  <span className="error-message">{errors.newPassword}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <div className="password-input">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className={errors.confirmPassword ? "error" : ""}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="error-message">
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              <div className="password-strength">
                <p>Password must contain:</p>
                <ul>
                  <li
                    className={
                      passwordForm.newPassword.length >= 8 ? "valid" : ""
                    }
                  >
                    At least 8 characters
                  </li>
                  <li
                    className={
                      /[A-Z]/.test(passwordForm.newPassword) ? "valid" : ""
                    }
                  >
                    One uppercase letter
                  </li>
                  <li
                    className={
                      /[0-9]/.test(passwordForm.newPassword) ? "valid" : ""
                    }
                  >
                    One number
                  </li>
                  <li
                    className={
                      /[^A-Za-z0-9]/.test(passwordForm.newPassword)
                        ? "valid"
                        : ""
                    }
                  >
                    One special character
                  </li>
                </ul>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                    setErrors((prev) => ({
                      ...prev,
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    }));
                  }}
                  className="cancel-btn"
                  disabled={isLoading}
                >
                  <FiX /> Cancel
                </button>
                <button type="submit" disabled={isLoading} className="save-btn">
                  {isLoading ? (
                    "Updating..."
                  ) : (
                    <>
                      <FiCheck /> Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
