import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import './profile.css';

const DEFAULT_PROFILE_IMAGE = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

type User = {
  id: number;
  name: string;
  email: string;
  profileImage: string;
  createdAt: string;
};

type ProfileFormData = {
  name: string;
  email: string;
};

type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const LOCAL_STORAGE_KEY = 'user_profile_data';

export const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState(DEFAULT_PROFILE_IMAGE);
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    name: '',
    email: '',
  });

  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchUser = () => {
      const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
      let loadedUser: User;

      if (storedUser) {
        loadedUser = JSON.parse(storedUser);
      } else {
        loadedUser = {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          profileImage: DEFAULT_PROFILE_IMAGE,
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(loadedUser));
      }

      setUser(loadedUser);
      setProfileForm({ name: loadedUser.name, email: loadedUser.email });
      setPreviewImage(loadedUser.profileImage || DEFAULT_PROFILE_IMAGE);
      setIsLoading(false);
    };

    fetchUser();
  }, []);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleProfileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateProfileForm = () => {
    let valid = true;
    const newErrors = { name: '', email: '' };

    if (!profileForm.name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    }

    if (!profileForm.email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(profileForm.email)) {
      newErrors.email = 'Invalid email address';
      valid = false;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return valid;
  };

  const validatePasswordForm = () => {
    let valid = true;
    const newErrors = { currentPassword: '', newPassword: '', confirmPassword: '' };

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
      valid = false;
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required';
      valid = false;
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
      valid = false;
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
      valid = false;
    } else if (passwordForm.confirmPassword !== passwordForm.newPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return valid;
  };

  const onSubmitProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !validateProfileForm()) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const updatedUser: User = {
      ...user,
      name: profileForm.name,
      email: profileForm.email,
      profileImage: previewImage,
    };

    setUser(updatedUser);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedUser));
    setIsEditing(false);
    setIsLoading(false);
    alert('Profile updated successfully!');
  };

  const onSubmitPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsPasswordEditing(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setIsLoading(false);
    alert('Password updated successfully!');
  };

  if (isLoading && !user) return <div className="loading">Loading profile...</div>;
  if (!user) return <div className="loading">User not found</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile Settings</h1>
      </div>

      <div className="profile-content">
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
            {isEditing && (
              <div className="image-upload">
                <label htmlFor="profile-image-upload" className="change-photo-btn">
                  Change Photo
                </label>
                <input
                  id="profile-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="profile-info-section">
          {!isEditing ? (
            <div className="profile-info-container">
              <h2>{user.name}</h2>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
              <div className="action-buttons">
                <button onClick={() => setIsEditing(true)} className="editt-btn">Edit Profile</button>
                <button onClick={() => setIsPasswordEditing(true)} className="changee-password-btn">Change Password</button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmitProfile} className="profile-edit-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setProfileForm({ name: user.name, email: user.email });
                    setPreviewImage(user.profileImage || DEFAULT_PROFILE_IMAGE);
                    setErrors((prev) => ({ ...prev, name: '', email: '' }));
                  }}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button type="submit" disabled={isLoading} className="save-btn">
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {isPasswordEditing && (
        <div className="password-modal">
          <div className="password-modal-content">
            <h2>Change Password</h2>
            <form onSubmit={onSubmitPassword}>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className={errors.currentPassword ? 'error' : ''}
                />
                {errors.currentPassword && <span className="error-message">{errors.currentPassword}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className={errors.newPassword ? 'error' : ''}
                />
                {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className={errors.confirmPassword ? 'error' : ''}
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setIsPasswordEditing(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setErrors((prev) => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
                  }}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button type="submit" disabled={isLoading} className="save-btn">
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
