
'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { initialTokens, generateRealtimeUpdate } from '@/lib/data';
import type { Token, SortDescriptor, TokenStatus } from '@/lib/types';

export type PriceUpdate = {
  direction: 'up' | 'down' | null;
  timestamp: number;
};

export function useRealtimeTokens() {
  const [isLoading, setIsLoading] = useState(true);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [priceUpdates, setPriceUpdates] = useState<Record<string, PriceUpdate>>({});
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({ column: 'volume', direction: 'descending' });
  const [activeTab, setActiveTab] = useState<TokenStatus>('New pairs');

  useEffect(() => {
    const timer = setTimeout(() => {
      setTokens(initialTokens);
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const interval = setInterval(() => {
      setTokens(currentTokens => {
        const newUpdates: Record<string, PriceUpdate> = {};
        const updatedTokens = currentTokens.map(token => {
          if (Math.random() > 0.7) { // ~30% chance to update a token
            const update = generateRealtimeUpdate(token);
            const oldPrice = token.price;
            const newPrice = update.price!;
            
            newUpdates[token.id] = {
              direction: newPrice > oldPrice ? 'up' : 'down',
              timestamp: Date.now(),
            };
            return { ...token, ...update };
          }
          return token;
        });
        if (Object.keys(newUpdates).length > 0) {
          setPriceUpdates(prev => ({ ...prev, ...newUpdates }));
        }
        return updatedTokens;
      });
    }, 2000); // Update interval

    return () => clearInterval(interval);
  }, [isLoading]);

  const sortedAndFilteredTokens = useMemo(() => {
    let filtered = tokens.filter(token => token.status === activeTab);

    if (sortDescriptor) {
      filtered.sort((a, b) => {
        const aValue = sortDescriptor.column === '#' ? 0 : a[sortDescriptor.column as keyof Token];
        const bValue = sortDescriptor.column === '#' ? 0 : b[sortDescriptor.column as keyof Token];

        if (aValue === undefined || bValue === undefined) return 0;

        if (aValue < bValue) {
          return sortDescriptor.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortDescriptor.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [tokens, sortDescriptor, activeTab]);

  const handleSort = useCallback((column: keyof Token | '#') => {
    setSortDescriptor(current => {
      if (current?.column === column) {
        return { column, direction: current.direction === 'ascending' ? 'descending' : 'ascending' };
      }
      return { column, direction: 'descending' };
    });
  }, []);
  
  return {
    isLoading,
    tokens: sortedAndFilteredTokens,
    priceUpdates,
    sortDescriptor,
    handleSort,
    activeTab,
    setActiveTab,
  };
}
