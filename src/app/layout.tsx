import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { WalletProvider } from '@/hooks/use-wallet';
import { CurrencyProvider } from '@/hooks/use-currency';

export const metadata: Metadata = {
  title: 'Axiom Trade Table Clone',
  description: 'A token discovery table clone.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body">
        <CurrencyProvider>
          <WalletProvider>
            {children}
          </WalletProvider>
        </CurrencyProvider>
        <Toaster />
      </body>
    </html>
  );
}
