'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { initialTokens } from '@/lib/data';
import type { WalletContextType, UserProfile } from '@/lib/types';
import { useAuth, useFirestore, useUser, setDocumentNonBlocking } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const [usdBalance, setUsdBalance] = useState(0);
  const [tokenBalances, setTokenBalances] = useState<Record<string, number>>({});
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const createProfile = useCallback(async (userId: string) => {
    if (!firestore || !auth.currentUser) return;
    const userDocRef = doc(firestore, 'users', userId);
    // Create a default profile
    const defaultProfile: UserProfile = {
        id: userId,
        name: auth.currentUser.displayName || 'New User',
        email: auth.currentUser.email || '',
        profilePic: auth.currentUser.photoURL || `https://i.pravatar.cc/150?u=${userId}`,
        country: 'IN',
        contact: '',
    };
    await setDoc(userDocRef, defaultProfile);
    setProfile(defaultProfile);
  }, [firestore, auth.currentUser]);

  const fetchProfile = useCallback(async (userId: string) => {
    if (!firestore) return;
    const userDocRef = doc(firestore, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      setProfile(userDoc.data() as UserProfile);
    } else {
        await createProfile(userId);
    }
  }, [firestore, createProfile]);


  useEffect(() => {
    if (user && firestore) {
      fetchProfile(user.uid);
      setUsdBalance(10000); // Mock balance on login
      const initialBalances: Record<string, number> = {};
      initialTokens.forEach(token => {
        if (token.ticker !== 'USDC') {
          initialBalances[token.id] = Math.random() * 10;
        }
      });
      setTokenBalances(initialBalances);

    } else {
      // Reset state on logout
      setProfile(null);
      setUsdBalance(0);
      setTokenBalances({});
    }
  }, [user, firestore, fetchProfile]);

  const disconnect = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
  }, [auth]);

  const executeTrade = useCallback((tokenId: string, amount: number, action: 'buy' | 'sell') => {
    const token = initialTokens.find(t => t.id === tokenId);
    if (!token) throw new Error("Token not found");

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

  const updateProfile = useCallback((newProfileData: Partial<UserProfile>) => {
    if (!user || !firestore) return;
    const userDocRef = doc(firestore, 'users', user.uid);
    setDocumentNonBlocking(userDocRef, newProfileData, { merge: true });
    setProfile(prev => ({ ...prev!, ...newProfileData }));
  }, [user, firestore]);

  const addFunds = useCallback((amount: number) => {
    setUsdBalance(prev => prev + amount);
  }, []);

  return (
    <WalletContext.Provider value={{ 
        isConnected: !!user,
        isUserLoading, 
        account: user?.uid || null,
        user,
        usdBalance, 
        tokenBalances, 
        profile, 
        disconnect, 
        executeTrade, 
        updateProfile, 
        addFunds,
        createProfile,
    }}>
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
