'use client';
import React, { useState, useEffect, memo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, HelpCircle, Bot } from 'lucide-react';
import { useRealtimeTokens, type PriceUpdate } from '@/hooks/use-realtime-tokens';
import type { Token, TokenStatus, SortDescriptor } from '@/lib/types';
import { formatCurrency, formatCompactCurrency, formatPercentage, formatDuration, cn } from '@/lib/utils';
import { TokenTableSkeleton } from './token-table-skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useWallet } from '@/hooks/use-wallet';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import { ChartTooltip, ChartTooltipContent, ChartContainer } from '@/components/ui/chart';
import { useCurrency } from '@/hooks/use-currency';
import { useRouter } from 'next/navigation';


type ColumnConfig = {
    key: keyof Token | '#';
    label: string;
    tooltip?: string;
    sortable: boolean;
    className?: string;
    headerClassName?: string;
};

const columns: ColumnConfig[] = [
    { key: '#', label: '#', sortable: false, className: "w-12 text-muted-foreground text-center", headerClassName: "text-center" },
    { key: 'name', label: 'Token', sortable: true, className: 'w-48' },
    { key: 'price', label: 'Price', sortable: true },
    { key: 'priceChange15m', label: '15m', sortable: true, tooltip: 'Price change in the last 15 minutes' },
    { key: 'priceChange1h', label: '1h', sortable: true, tooltip: 'Price change in the last 1 hour' },
    { key: 'volume', label: 'Volume', sortable: true, tooltip: 'Trading volume in the last 24 hours' },
    { key: 'liquidity', label: 'Liquidity', sortable: true, tooltip: 'Available liquidity for this token pair' },
    { key: 'onChain', label: 'On-Chain', sortable: true, tooltip: 'Time since the token pair was created' },
];

const SortableHeader = ({ column, sortDescriptor, onSort }: { column: ColumnConfig, sortDescriptor: SortDescriptor, onSort: (key: any) => void }) => {
    const isSorted = sortDescriptor?.column === column.key;
    const direction = isSorted ? sortDescriptor?.direction : undefined;

    const headerContent = (
      <div className={cn("flex items-center gap-1", column.sortable && "cursor-pointer")}>
        <span>{column.label}</span>
        {column.tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{column.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
        {isSorted && (direction === 'ascending' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />)}
      </div>
    );
    
    return (
        <TableHead className={cn("whitespace-nowrap", column.headerClassName)} onClick={() => column.sortable && onSort(column.key)}>
            {headerContent}
        </TableHead>
    );
};


const PriceCell = ({ price, update }: { price: number; update: PriceUpdate | undefined }) => {
  const [priceChange, setPriceChange] = useState<'up' | 'down' | null>(null);
  const { currency, conversionRate } = useCurrency();
  const convertedPrice = price * conversionRate;

  useEffect(() => {
    if (update) {
      setPriceChange(update.direction);
      const timer = setTimeout(() => setPriceChange(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [update]);

  return (
    <TableCell data-price-change={priceChange}>
      {formatCurrency(convertedPrice, currency)}
    </TableCell>
  );
};

const PercentageCell = ({ value }: { value: number }) => (
    <TableCell className={value > 0 ? 'text-green-600' : 'text-red-600'}>
        {formatPercentage(value)}
    </TableCell>
);

const TradeDialogContent = ({ token }: { token: Token }) => {
    const { isConnected, account, disconnect, usdBalance, tokenBalances, executeTrade } = useWallet();
    const { currency, conversionRate } = useCurrency();
    const [amount, setAmount] = useState('');
    const { toast } = useToast();
    const router = useRouter();


    const handleTrade = (action: 'buy' | 'sell') => {
        const tradeAmount = parseFloat(amount);
        if (isNaN(tradeAmount) || tradeAmount <= 0) {
            toast({
                variant: 'destructive',
                title: 'Invalid Amount',
                description: 'Please enter a valid amount to trade.',
            });
            return;
        }

        try {
            executeTrade(token.id, tradeAmount, action);
            toast({
                title: 'Trade Successful',
                description: `You have successfully ${action === 'buy' ? 'bought' : 'sold'} ${tradeAmount} ${token.ticker}.`,
            });
            setAmount('');
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Trade Failed',
                description: error.message,
            });
        }
    };
    
    const chartConfig = {
      price: {
        label: 'Price',
        color: 'hsl(var(--accent))',
      },
    };
    
    const chartData = token.priceHistory.map(d => ({ ...d, price: d.price * conversionRate }));

    if (!isConnected) {
        return (
            <div className="py-4 space-y-4">
                <DialogDescription>
                    Connect your wallet to start trading.
                </DialogDescription>
                <Button className="w-full" variant="secondary" onClick={() => router.push('/login')}>
                    Connect Wallet
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4 pt-2">
            <div className="h-48">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                        <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.1}/>
                        </linearGradient>
                    </defs>
                  <XAxis dataKey="time" hide />
                  <YAxis domain={['dataMin', 'dataMax']} hide />
                  <RechartsTooltip 
                    cursor={false}
                    content={<ChartTooltipContent 
                      indicator="line" 
                      formatter={(value) => formatCurrency(value as number, currency)}
                    />}
                  />
                  <Area
                    dataKey="price"
                    type="natural"
                    fill="url(#fillPrice)"
                    stroke="hsl(var(--accent))"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
            </div>

            <div className="text-sm text-muted-foreground">
                Connected as {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <div className="text-muted-foreground">Balance</div>
                    <div>{formatCurrency(usdBalance * conversionRate, currency)}</div>
                </div>
                <div>
                    <div className="text-muted-foreground">{token.ticker} Balance</div>
                    <div>{(tokenBalances[token.id] || 0).toFixed(6)}</div>
                </div>
            </div>
            
            <div>
                <Input 
                    type="number"
                    placeholder={`Amount of ${token.ticker}`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => handleTrade('buy')}>Buy</Button>
                <Button variant="outline" onClick={() => handleTrade('sell')}>Sell</Button>
            </div>

            <Button className="w-full" variant="destructive" onClick={disconnect}>
                Disconnect Wallet
            </Button>
        </div>
    );
};


const TokenRow = memo(({ token, index, priceUpdate }: { token: Token; index: number, priceUpdate: PriceUpdate | undefined }) => {
    const IconComponent = token.icon;
    const { currency, conversionRate } = useCurrency();
    
    return (
        <TableRow className="group">
            <TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
            <TableCell>
                <div className="flex items-center gap-3">
                    <IconComponent className="h-8 w-8" />
                    <div className="font-medium">
                        <div>{token.name}</div>
                        <div className="text-xs text-muted-foreground">{token.ticker}</div>
                    </div>
                </div>
            </TableCell>
            <PriceCell price={token.price} update={priceUpdate} />
            <PercentageCell value={token.priceChange15m} />
            <PercentageCell value={token.priceChange1h} />
            <TableCell>{formatCompactCurrency(token.volume * conversionRate, currency)}</TableCell>
            <TableCell>{formatCompactCurrency(token.liquidity * conversionRate, currency)}</TableCell>
            <TableCell>{formatDuration(token.onChain)}</TableCell>
            <TableCell className="text-right">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            Trade
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Trade {token.name} ({token.ticker})</DialogTitle>
                        </DialogHeader>
                        <TradeDialogContent token={token} />
                    </DialogContent>
                </Dialog>
            </TableCell>
        </TableRow>
    );
});
TokenRow.displayName = 'TokenRow';


export default function TokenTable() {
    const { isLoading, tokens, priceUpdates, sortDescriptor, handleSort, activeTab, setActiveTab } = useRealtimeTokens();

    if (isLoading) {
        return <TokenTableSkeleton />;
    }

    return (
        <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TokenStatus)}>
                <TabsList>
                    <TabsTrigger value="New pairs">New pairs</TabsTrigger>
                    <TabsTrigger value="Final Stretch">Final Stretch</TabsTrigger>
                    <TabsTrigger value="Migrated">Migrated</TabsTrigger>
                </TabsList>
            </Tabs>

            <TooltipProvider>
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                {columns.map((col) => (
                                    <SortableHeader key={col.key} column={col} sortDescriptor={sortDescriptor} onSort={handleSort} />
                                ))}
                                <TableHead className="text-right w-24"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tokens.map((token, index) => (
                                <TokenRow key={token.id} token={token} index={index} priceUpdate={priceUpdates[token.id]} />
                            ))}
                        </TableBody>
                    </Table>
                    </div>
                </div>
            </TooltipProvider>
             {tokens.length === 0 && !isLoading && (
                <div className="text-center py-16 text-muted-foreground border rounded-lg">
                    <Bot className="mx-auto h-12 w-12 mb-2" />
                    No tokens found in this category.
                </div>
            )}
        </div>
    );
}
