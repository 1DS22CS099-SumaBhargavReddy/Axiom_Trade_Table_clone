'use client';
import { useState, useRef } from 'react';
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

const countries = [
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'JP', name: 'Japan' },
];

export default function ProfilePage() {
  const { profile, updateProfile, usdBalance, addFunds, isConnected, connect } = useWallet();
  const { currency, conversionRate } = useCurrency();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const [amountToAdd, setAmountToAdd] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleProfileChange = (field: keyof typeof editedProfile, value: string) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    updateProfile(editedProfile);
    setIsEditing(false);
    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been saved.',
    });
  };

  const handleAddFunds = (method: 'UPI' | 'Card') => {
    const amount = parseFloat(amountToAdd);
    if (isNaN(amount) || amount <= 0) {
      toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please enter a valid amount.' });
      return;
    }
    addFunds(amount / conversionRate); // Convert to USD before adding
    toast({ title: 'Funds Added', description: `${formatCurrency(amount, currency)} has been added to your wallet via ${method}.` });
    setAmountToAdd('');
  };
  
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newPic = e.target?.result as string;
        updateProfile({ profilePic: newPic });
        setEditedProfile(prev => ({...prev, profilePic: newPic}));
        toast({
          title: 'Avatar Changed!',
          description: 'Your profile picture has been updated.',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>Please connect your wallet to view your profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={connect}>Connect Wallet</Button>
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
                  <AvatarImage src={profile.profilePic} alt={profile.name} />
                  <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
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
                <Input id="email" type="email" value={editedProfile.email} onChange={(e) => handleProfileChange('email', e.target.value)} disabled={!isEditing} />
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
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={() => handleAddFunds('UPI')}>Add via UPI</Button>
                <Button onClick={() => handleAddFunds('Card')}>Add via Card</Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
