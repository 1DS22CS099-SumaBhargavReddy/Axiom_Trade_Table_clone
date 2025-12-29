'use client';
import TokenTable from '@/components/token/token-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/hooks/use-currency';
import { ChevronsUpDown, User } from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@/hooks/use-wallet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const CurrencySwitcher = () => {
  const { currency, setCurrency, currencies } = useCurrency();
  const currencyInfo = currencies[currency];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-28 justify-between">
          <span>{currencyInfo.symbol} {currencyInfo.code}</span>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {Object.values(currencies).map((c) => (
          <DropdownMenuItem key={c.code} onClick={() => setCurrency(c.code)}>
            {c.symbol} {c.code}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};


export default function Home() {
  const { profile } = useWallet();

  return (
    <div className="p-4 md:p-8">
      <div className="w-full max-w-screen-xl mx-auto">
        <header className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Token Discovery</h1>
          <div className="flex items-center gap-4">
            <CurrencySwitcher />
            <Link href="/profile" passHref>
              <Avatar className="cursor-pointer">
                <AvatarImage src={profile.profilePic} alt={profile.name} />
                <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>
        <main>
          <TokenTable />
        </main>
      </div>
    </div>
  );
}
