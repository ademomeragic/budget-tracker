import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/sidebar/sidebar";
import Dashboard from "./pages/dashboard/dashboard";
import "./App.css";
import FloatingActionButton from "./components/sidebar/floatingButton/floatingButton";
import Transactions from "./pages/transaction/transaction";
import Wallet from "./pages/wallet/wallet";
import Reports from "./pages/reports/reports";
import AuthForm from "./pages/auth/authForm";

function MainLayout() {
  return (
    <div className="app-container">
      <Sidebar />
      <FloatingActionButton />
      <div className="content-area">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/reports" element={<Reports />} />
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
