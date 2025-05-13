import { Link } from "react-router-dom";
import {
  FiHome,
  FiDollarSign,
  FiCreditCard,
  FiPieChart,
  FiUser,
  FiCalendar,
} from "react-icons/fi";
import "./sidebar.css";
import React from "react";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-content">
        {/* Main Navigation */}
        <nav className="sidebar-nav">
          <Link to="/" className="nav-item active">
            <span className="nav-icon">
              <FiHome />
            </span>
            <span className="nav-text">Dashboard</span>
          </Link>
          <Link to="/wallet" className="nav-item">
            <span className="nav-icon">
              <FiDollarSign />
            </span>

            <span className="nav-text">Wallet</span>
          </Link>
          <Link to="/wallet" className="nav-item">
            <span className="nav-icon">
              <FiPieChart />
            </span>
            <span className="nav-text">Reports</span>
          </Link>
          <Link to="/calendar" className="nav-item">
            <span className="nav-icon">
              <FiCalendar />
            </span>
            <span className="nav-text">Calendar</span>
          </Link>
          <Link to="/profile" className="nav-item">
            <span className="nav-icon">
              <FiUser />
            </span>
            <span className="nav-text">Profile</span>
          </Link>
        </nav>

        {/* Sign Up Button at Bottom */}
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="profile-icon">JD</div>
            <div className="profile-info">
              <div className="profile-name">John Doe</div>
              <div className="profile-email">john@example.com</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
