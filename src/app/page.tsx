import TokenTable from '@/components/token/token-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="p-4 md:p-8">
      <div className="w-full max-w-screen-xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Token Discovery</h1>
        </header>
        <main>
          <TokenTable />
        </main>
      </div>
    </div>
  );
}
