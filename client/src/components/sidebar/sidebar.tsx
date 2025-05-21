import { Link } from "react-router-dom";
import {
  FiHome,
  FiDollarSign,
  FiPieChart,
  FiCalendar,
  FiLogOut,
} from "react-icons/fi";
import "./sidebar.css";
import React from "react";
import { useAuth } from "../../context/AuthContext";

const HomeIcon = FiHome as unknown as React.FC;
const DollarSignIcon = FiDollarSign as unknown as React.FC;
const PieChartIcon = FiPieChart as unknown as React.FC;
const CalendarIcon = FiCalendar as unknown as React.FC;
const LogoutIcon = FiLogOut as unknown as React.FC;

export default function Sidebar() {
  const { token, logout } = useAuth();

  const getUsername = () => {
    try {
      const payload = JSON.parse(atob(token!.split(".")[1]));
      return payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || "User";
    } catch {
      return "User";
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        {/* Main Navigation */}
        <nav className="sidebar-nav">
          <Link to="/" className="nav-item active">
            <span className="nav-icon"><HomeIcon /></span>
            <span className="nav-text">Dashboard</span>
          </Link>
          <Link to="/wallet" className="nav-item">
            <span className="nav-icon"><DollarSignIcon /></span>
            <span className="nav-text">Wallet</span>
          </Link>
          <Link to="/reports" className="nav-item">
            <span className="nav-icon">
              <PieChartIcon />
            </span>
            <span className="nav-text">Reports</span>
          </Link>

          <Link to="/calendar" className="nav-item">
            <span className="nav-icon"><CalendarIcon /></span>
            <span className="nav-text">Calendar</span>
          </Link>
          <Link to="/categories" className="nav-item">
            <span className="nav-icon"><CalendarIcon /></span>
            <span className="nav-text">Categories</span>
          </Link>
          <Link to="/goals" className="nav-item">
            <span className="nav-icon"><CalendarIcon /></span>
            <span className="nav-text">Goals</span>
          </Link>
          <Link to="/profile" className="nav-item">
            <span className="nav-icon"><CalendarIcon /></span>
            <span className="nav-text">Profile</span>
          </Link>
        </nav>

        {/* User Info & Logout */}
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="profile-icon">{getUsername().charAt(0).toUpperCase()}</div>
            <div className="profile-info">
              <div className="profile-name">{getUsername()}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={logout}>
            <span className="nav-icon"><LogoutIcon /></span>
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
