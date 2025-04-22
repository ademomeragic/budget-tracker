import { Link } from "react-router-dom";
import {
  FiHome,
  FiDollarSign,
  FiCreditCard,
  FiPieChart,
  FiUserPlus, // Signup icon
} from "react-icons/fi";
import "./sidebar.css";

export default function Sidebar() {
  return (
    <div className="sidebar">
      {/* Main Navigation */}
      <nav className="sidebar-nav">
        <Link to="/" className="nav-item">
          <span className="nav-icon">
            <FiHome />
          </span>
          <span>Dashboard</span>
        </Link>
        <Link to="/transactions" className="nav-item">
          <span className="nav-icon">
            <FiDollarSign />
          </span>
          <span>Transactions</span>
        </Link>
        <Link to="/wallet" className="nav-item">
          <span className="nav-icon">
            <FiCreditCard />
          </span>
          <span>Wallet</span>
        </Link>
        <Link to="/reports" className="nav-item">
          <span className="nav-icon">
            <FiPieChart />
          </span>
          <span>Reports</span>
        </Link>
      </nav>

      {/* Sign Up Button at Bottom */}
      <div className="sidebar-footer">
        <Link to="/auth" className="signup-btn">
          <span className="nav-icon">
            <FiUserPlus />
          </span>
          <span>Sign Up</span>
        </Link>
      </div>
    </div>
  );
}
