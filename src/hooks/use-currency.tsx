'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';

type Currency = 'USD' | 'INR';

type CurrencyInfo = {
  code: Currency;
  symbol: string;
  rate: number; // Rate relative to USD
};

const currencies: Record<Currency, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', rate: 1 },
  INR: { code: 'INR', symbol: '₹', rate: 83.5 },
};

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  conversionRate: number;
  currencies: typeof currencies;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>('USD');

  const conversionRate = useMemo(() => currencies[currency].rate, [currency]);

  const value = {
    currency,
    setCurrency,
    conversionRate,
    currencies,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
