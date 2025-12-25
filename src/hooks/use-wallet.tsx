'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface WalletContextType {
  isConnected: boolean;
  account: string | null;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);

  const connect = useCallback(() => {
    // This is a mock connection.
    // In a real app, you would integrate with a wallet provider like MetaMask.
    const mockAccount = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    setAccount(mockAccount);
    setIsConnected(true);
  }, []);

  const disconnect = useCallback(() => {
    setAccount(null);
    setIsConnected(false);
  }, []);

  return (
    <WalletContext.Provider value={{ isConnected, account, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
