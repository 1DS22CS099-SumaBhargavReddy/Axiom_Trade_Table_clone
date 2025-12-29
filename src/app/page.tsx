'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TokenTable from '@/components/token/token-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/hooks/use-currency';
import { ChevronsUpDown, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@/hooks/use-wallet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

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
  const { profile, isConnected, disconnect, isUserLoading } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !isConnected) {
      router.push('/login');
    }
  }, [isUserLoading, isConnected, router]);

  if (isUserLoading || !isConnected) {
    return (
       <div className="p-4 md:p-8">
        <div className="w-full max-w-screen-xl mx-auto">
          <header className="mb-6 flex justify-between items-center">
            <Skeleton className="h-9 w-64" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </header>
          <main>
             <div className="text-center py-16 text-muted-foreground border rounded-lg">
                <p>Loading your trading experience...</p>
             </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="w-full max-w-screen-xl mx-auto">
        <header className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Token Discovery</h1>
          <div className="flex items-center gap-4">
            <CurrencySwitcher />
            {profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage src={profile.profilePic} alt={profile.name} />
                    <AvatarFallback>{profile.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/profile" passHref>
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                  </Link>
                   <DropdownMenuItem onClick={disconnect}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
               <Skeleton className="h-10 w-10 rounded-full" />
            )}
          </div>
        </header>
        <main>
          <TokenTable />
        </main>
      </div>
    </div>
  );
}
