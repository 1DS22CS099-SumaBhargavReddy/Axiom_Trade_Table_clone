import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: currency === 'INR' ? 2 : (amount < 1 ? 6 : 2),
  }).format(amount);
}

export function formatCompactCurrency(amount: number, currency: string = "USD") {
    const currencySymbol = new Intl.NumberFormat("en-US", { style: 'currency', currency: currency }).formatToParts(1).find(p => p.type === 'currency')?.value || '$';

    if (amount >= 1e9) {
        return `${currencySymbol}${(amount / 1e9).toFixed(2)}B`;
    }
    if (amount >= 1e6) {
        return `${currencySymbol}${(amount / 1e6).toFixed(2)}M`;
    }
    if (amount >= 1e3) {
        return `${currencySymbol}${(amount / 1e3).toFixed(1)}K`;
    }
    return `${currencySymbol}${amount.toFixed(2)}`;
}

export function formatPercentage(value: number) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}h ${remainingMinutes}m`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  return `${days}d ${remainingHours}h`;
}
