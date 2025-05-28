import React, { createContext, useState, useEffect, useContext } from "react";

type CurrencyContextType = {
  currency: string;
  setCurrency: (currency: string) => void;
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "BAM",
  setCurrency: () => {},
});

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState("BAM");

  useEffect(() => {
    const saved = localStorage.getItem("currency");
    if (saved) setCurrencyState(saved);
  }, []);

  const setCurrency = (newCurrency: string) => {
    localStorage.setItem("currency", newCurrency);
    setCurrencyState(newCurrency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
