import type { LucideIcon } from "lucide-react";

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

export interface WalletContextType {
  isConnected: boolean;
  account: string | null;
  usdBalance: number;
  tokenBalances: Record<string, number>;
  connect: () => void;
  disconnect: () => void;
  executeTrade: (tokenId: string, amount: number, action: 'buy' | 'sell') => void;
}
