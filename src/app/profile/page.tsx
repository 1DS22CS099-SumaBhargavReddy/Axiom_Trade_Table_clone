'use client';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useWallet } from '@/hooks/use-wallet';
import { useCurrency } from '@/hooks/use-currency';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';

const countries = [
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'JP', name: 'Japan' },
];

const PaymentDialog = ({ amount, onPaymentSuccess }: { amount: string; onPaymentSuccess: (method: 'UPI' | 'Card') => void }) => {
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [pin, setPin] = useState('');
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [activeTab, setActiveTab] = useState<'UPI' | 'Card'>('UPI');
  const { toast } = useToast();

  const handlePayment = () => {
    if (activeTab === 'UPI' && !upiId) {
      toast({ variant: 'destructive', title: 'Invalid UPI ID', description: 'Please enter a valid UPI ID.' });
      return;
    }
    if (activeTab === 'Card' && (!cardNumber || !expiry || !cvv)) {
      toast({ variant: 'destructive', title: 'Invalid Card Details', description: 'Please fill in all card details.' });
      return;
    }
    setShowPinEntry(true);
  };

  const handlePinConfirm = () => {
    if (pin === '1234') { // Mock PIN
      onPaymentSuccess(activeTab);
      setShowPinEntry(false);
      setPin('');
    } else {
      toast({ variant: 'destructive', title: 'Invalid PIN', description: 'The entered PIN is incorrect.' });
      setPin('');
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Complete Your Payment</DialogTitle>
        <DialogDescription>
          You are adding {formatCurrency(parseFloat(amount), useCurrency().currency)} to your wallet.
        </DialogDescription>
      </DialogHeader>

      {showPinEntry ? (
        <div className="space-y-4">
          <Label htmlFor="pin">Enter 4-digit PIN</Label>
          <Input
            id="pin"
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="text-center text-xl tracking-[1rem]"
          />
          <Button onClick={handlePinConfirm} className="w-full">Confirm Payment</Button>
        </div>
      ) : (
        <Tabs defaultValue="UPI" onValueChange={(value) => setActiveTab(value as 'UPI' | 'Card')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="UPI">UPI</TabsTrigger>
            <TabsTrigger value="Card">Card</TabsTrigger>
          </TabsList>
          <TabsContent value="UPI" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="upiId">UPI ID</Label>
              <Input id="upiId" placeholder="yourname@bank" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
            </div>
            <Button onClick={handlePayment} className="w-full">Pay with UPI</Button>
          </TabsContent>
          <TabsContent value="Card" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input id="cardNumber" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry</Label>
                <Input id="expiry" placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input id="cvv" placeholder="123" value={cvv} onChange={(e) => setCvv(e.target.value)} />
              </div>
            </div>
            <Button onClick={handlePayment} className="w-full">Pay with Card</Button>
          </TabsContent>
        </Tabs>
      )}
    </DialogContent>
  );
};


export default function ProfilePage() {
  const { profile, updateProfile, usdBalance, addFunds, isConnected, isUserLoading } = useWallet();
  const { currency, conversionRate } = useCurrency();
  const { toast } = useToast();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const [amountToAdd, setAmountToAdd] = useState('');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isUserLoading && !isConnected) {
      router.push('/login');
    }
    if (profile) {
        setEditedProfile(profile);
    }
  }, [isConnected, isUserLoading, router, profile]);


  const handleProfileChange = (field: keyof typeof editedProfile, value: string) => {
    setEditedProfile(prev => ({ ...prev!, [field]: value }));
  };

  const handleSaveProfile = () => {
    if (editedProfile) {
        updateProfile(editedProfile);
        setIsEditing(false);
        toast({
          title: 'Profile Updated',
          description: 'Your profile information has been saved.',
        });
    }
  };
  
  const handleInitiateAddFunds = () => {
    const amount = parseFloat(amountToAdd);
     if (isNaN(amount) || amount <= 0) {
      toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please enter a valid amount to add.' });
      return;
    }
    setIsPaymentDialogOpen(true);
  }

  const handlePaymentSuccess = (method: 'UPI' | 'Card') => {
    const amount = parseFloat(amountToAdd);
    addFunds(amount / conversionRate); // Convert to USD before adding
    toast({ title: 'Funds Added', description: `${formatCurrency(amount, currency)} has been added to your wallet via ${method}.` });
    setAmountToAdd('');
    setIsPaymentDialogOpen(false);
  };
  
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newPic = e.target?.result as string;
        updateProfile({ profilePic: newPic });
        setEditedProfile(prev => ({...prev!, profilePic: newPic}));
        toast({
          title: 'Avatar Changed!',
          description: 'Your profile picture has been updated.',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  if (isUserLoading || !isConnected || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Loading Profile...</CardTitle>
            <CardDescription>Please wait while we fetch your profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-muted h-12 w-12"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
       <div className="w-full max-w-screen-md mx-auto">
        <header className="mb-6">
            <Link href="/" passHref>
                <Button variant="outline" className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Trading
                </Button>
            </Link>
          <h1 className="text-3xl font-bold text-foreground">Profile & Wallet</h1>
        </header>

        <main className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>View and edit your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={editedProfile.profilePic} alt={editedProfile.name} />
                  <AvatarFallback>{editedProfile.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <Input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                <Button variant="outline" size="sm" onClick={triggerFileSelect}>Upload Picture</Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={editedProfile.name} onChange={(e) => handleProfileChange('name', e.target.value)} disabled={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={editedProfile.email} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={editedProfile.country} onValueChange={(value) => handleProfileChange('country', value)} disabled={!isEditing}>
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact No.</Label>
                <Input id="contact" value={editedProfile.contact} onChange={(e) => handleProfileChange('contact', e.target.value)} disabled={!isEditing} />
              </div>
            </CardContent>
            <CardFooter>
              {isEditing ? (
                <Button onClick={handleSaveProfile} className="w-full">Save Changes</Button>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)} className="w-full">Edit Profile</Button>
              )}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wallet</CardTitle>
              <CardDescription>Manage your funds.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-3xl font-bold">{formatCurrency(usdBalance * conversionRate, currency)}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Add Funds</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder={`Amount in ${currency}`}
                  value={amountToAdd}
                  onChange={(e) => setAmountToAdd(e.target.value)}
                />
              </div>
              <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full" onClick={handleInitiateAddFunds}>Add Funds</Button>
                </DialogTrigger>
                {amountToAdd && (
                  <PaymentDialog amount={amountToAdd} onPaymentSuccess={handlePaymentSuccess} />
                )}
              </Dialog>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
