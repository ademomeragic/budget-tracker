import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/sidebar/sidebar";
import Dashboard from "./pages/dashboard/dashboard";
import "./App.css";
import Transactions from "./pages/transaction/transaction";
import Wallet from "./pages/wallet/wallet";
import Reports from "./pages/reports/reports";
import AuthForm from "./pages/auth/authForm";
import { ProfilePage } from "./pages/profile/profile";
import ExpenseTracker from "./pages/goals/goals";

function MainLayout() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="content-area">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/tracker" element={<ExpenseTracker />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthForm />} />
        <Route path="*" element={<MainLayout />} />
      </Routes>
    </Router>
  );
}
