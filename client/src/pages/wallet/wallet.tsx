import React from "react";
import "./wallet.css";

export default function Wallet() {
  // Sample wallet data
  const wallets = [
    { id: 1, name: "Main Account", balance: 4500, currency: "USD" },
    { id: 2, name: "Savings", balance: 12000, currency: "USD" },
  ];

  return (
    <div className="wallet-page">
      <h1>My Wallets</h1>
      <div className="wallets-grid">
        {wallets.map((wallet) => (
          <div key={wallet.id} className="wallet-card">
            <h3>{wallet.name}</h3>
            <p className="wallet-balance">
              {wallet.balance.toLocaleString()} {wallet.currency}
            </p>
          </div>
        ))}
      </div>
      <button className="add-wallet-btn">+ Add Wallet</button>
    </div>
  );
}
