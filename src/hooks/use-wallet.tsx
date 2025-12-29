'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { initialTokens } from '@/lib/data';
import type { WalletContextType, UserProfile } from '@/lib/types';

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const initialProfile: UserProfile = {
  name: 'Satoshi Nakamoto',
  email: 'satoshi@example.com',
  country: 'JP',
  contact: '+81 123-456-7890',
  profilePic: 'https://i.pravatar.cc/150?u=satoshi',
};


export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [usdBalance, setUsdBalance] = useState(0);
  const [tokenBalances, setTokenBalances] = useState<Record<string, number>>({});
  const [profile, setProfile] = useState<UserProfile>(initialProfile);

  const connect = useCallback(() => {
    const mockAccount = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    setAccount(mockAccount);
    setIsConnected(true);
    setUsdBalance(10000); // Mock USD balance
    
    // Mock initial token balances
    const initialBalances: Record<string, number> = {};
    initialTokens.forEach(token => {
      if (token.ticker !== 'USDC') {
        initialBalances[token.id] = Math.random() * 10;
      }
    });
    setTokenBalances(initialBalances);

  }, []);

  const disconnect = useCallback(() => {
    setAccount(null);
    setIsConnected(false);
    setUsdBalance(0);
    setTokenBalances({});
  }, []);

  const executeTrade = useCallback((tokenId: string, amount: number, action: 'buy' | 'sell') => {
    const token = initialTokens.find(t => t.id === tokenId);
    if (!token) throw new Error("Token not found");

    // All internal logic uses USD as the base currency
    const tradeValue = amount * token.price;

    if (action === 'buy') {
      if (usdBalance < tradeValue) {
        throw new Error("Insufficient USD balance");
      }
      setUsdBalance(prev => prev - tradeValue);
      setTokenBalances(prev => ({
        ...prev,
        [tokenId]: (prev[tokenId] || 0) + amount,
      }));
    } else { // sell
      const currentTokenBalance = tokenBalances[tokenId] || 0;
      if (currentTokenBalance < amount) {
        throw new Error(`Insufficient ${token.ticker} balance`);
      }
      setUsdBalance(prev => prev + tradeValue);
      setTokenBalances(prev => ({
        ...prev,
        [tokenId]: prev[tokenId] - amount,
      }));
    }
  }, [usdBalance, tokenBalances]);

  const updateProfile = useCallback((newProfile: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...newProfile }));
  }, []);

  const addFunds = useCallback((amount: number) => {
    setUsdBalance(prev => prev + amount);
  }, []);

  return (
    <WalletContext.Provider value={{ isConnected, account, usdBalance, tokenBalances, profile, connect, disconnect, executeTrade, updateProfile, addFunds }}>
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
