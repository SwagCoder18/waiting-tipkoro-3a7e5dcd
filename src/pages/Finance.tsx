import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { TopNavbar } from "@/components/TopNavbar";
import { MainFooter } from "@/components/MainFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  DollarSign, 
  TrendingUp, 
  Wallet,
  ArrowDownToLine,
  Calendar,
  Clock
} from "lucide-react";

export default function Finance() {
  const { isSignedIn, isLoaded } = useUser();
  const { profile, loading } = useProfile();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('');
  const [payoutDetails, setPayoutDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  if (profile?.account_type !== 'creator') {
    return <Navigate to="/dashboard" replace />;
  }

  const availableBalance = (profile?.total_received || 0) - 150; // Minus platform fee
  const canWithdraw = availableBalance > 0;

  const handleWithdraw = async () => {
    if (!withdrawAmount || !payoutMethod || !payoutDetails) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount.",
        variant: "destructive",
      });
      return;
    }

    if (amount > availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance to withdraw this amount.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .insert({
          profile_id: profile?.id,
          amount,
          payout_method: payoutMethod,
          payout_details: { number: payoutDetails }
        });

      if (error) throw error;

      toast({
        title: "Withdrawal Requested!",
        description: "Your withdrawal request has been submitted. It will be processed within 3-5 business days.",
      });

      setWithdrawAmount('');
      setPayoutMethod('');
      setPayoutDetails('');
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      toast({
        title: "Error",
        description: "Failed to submit withdrawal request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNavbar />
      <div className="h-24" />

      <main className="container max-w-4xl py-8 px-4">
        <h1 className="text-3xl font-display font-bold mb-2">Finance</h1>
        <p className="text-muted-foreground mb-8">Manage your earnings and withdrawals</p>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="tipkoro-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-accent/20">
                <DollarSign className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">Total Received</span>
            </div>
            <p className="text-2xl font-display font-bold">৳{profile?.total_received || 0}</p>
          </div>
          
          <div className="tipkoro-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-success/20">
                <Wallet className="w-5 h-5 text-success" />
              </div>
              <span className="text-sm text-muted-foreground">Available</span>
            </div>
            <p className="text-2xl font-display font-bold">৳{Math.max(0, availableBalance)}</p>
          </div>
          
          <div className="tipkoro-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">This Month</span>
            </div>
            <p className="text-2xl font-display font-bold">৳0</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Withdrawal Form */}
          <div className="tipkoro-card">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <ArrowDownToLine className="w-5 h-5" />
              Request Withdrawal
            </h2>
            
            {canWithdraw ? (
              <div className="space-y-4">
                <div>
                  <label className="tipkoro-label">Amount (৳)</label>
                  <Input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="tipkoro-input"
                    max={availableBalance}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum: ৳{availableBalance}
                  </p>
                </div>

                <div>
                  <label className="tipkoro-label">Payout Method</label>
                  <Select value={payoutMethod} onValueChange={setPayoutMethod}>
                    <SelectTrigger className="tipkoro-input">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bkash">bKash</SelectItem>
                      <SelectItem value="nagad">Nagad</SelectItem>
                      <SelectItem value="rocket">Rocket</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="tipkoro-label">
                    {payoutMethod ? `${payoutMethod.charAt(0).toUpperCase() + payoutMethod.slice(1)} Number` : 'Account Number'}
                  </label>
                  <Input
                    value={payoutDetails}
                    onChange={(e) => setPayoutDetails(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="tipkoro-input"
                  />
                </div>

                <Button 
                  onClick={handleWithdraw}
                  disabled={isSubmitting}
                  className="w-full bg-accent text-accent-foreground hover:bg-tipkoro-gold-hover"
                >
                  {isSubmitting ? "Submitting..." : "Request Withdrawal"}
                </Button>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>Withdrawals are processed within 3-5 business days</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Wallet className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-muted-foreground">No balance available for withdrawal</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You need to receive at least ৳150 in tips to cover the platform fee.
                </p>
              </div>
            )}
          </div>

          {/* Earnings Chart / History */}
          <div className="tipkoro-card">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Earnings History
            </h2>
            
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No earnings data yet</p>
              <p className="text-sm mt-1">Your earnings history will appear here.</p>
            </div>
          </div>
        </div>
      </main>

      <MainFooter />
    </div>
  );
}
