import type { User } from "firebase/auth";

export type TokenStatus = 'New pairs' | 'Final Stretch' | 'Migrated';

export type Token = {
  id: string;
  name: string;
  ticker: string;
  icon: ((props: React.ComponentProps<'svg'>) => JSX.Element);
  price: number; // Always in USD
  priceChange15m: number;
  priceChange1h: number;
  volume: number; // Always in USD
  liquidity: number; // Always in USD
  onChain: number; // age in minutes
  status: TokenStatus;
  priceHistory: { time: number; price: number }[]; // prices in USD
};

export type SortDescriptor = {
  column: keyof Token | '#' | 'priceChange15m' | 'priceChange1h';
  direction: 'ascending' | 'descending';
} | null;

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  country: string;
  contact: string;
  profilePic: string;
};

export interface WalletContextType {
  isConnected: boolean;
  isUserLoading: boolean;
  account: string | null;
  user: User | null;
  usdBalance: number;
  tokenBalances: Record<string, number>;
  profile: UserProfile | null;
  disconnect: () => void;
  executeTrade: (tokenId: string, amount: number, action: 'buy' | 'sell') => void;
  updateProfile: (newProfile: Partial<UserProfile>) => void;
  addFunds: (amount: number) => void;
}
