import React from "react";
import { useUser } from "@clerk/clerk-react";
import { Navigate, Link } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { TopNavbar } from "@/components/TopNavbar";
import { MainFooter } from "@/components/MainFooter";
import { Button } from "@/components/ui/button";
import { Onboarding } from "@/components/Onboarding";
import { 
  Heart, 
  DollarSign, 
  Users, 
  TrendingUp, 
  ExternalLink,
  Settings,
  Wallet,
  Copy,
  Check
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { isSignedIn, isLoaded } = useUser();
  const { profile, loading } = useProfile();
  const [copied, setCopied] = useState(false);

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

  // Show onboarding if not completed
  if (profile && profile.onboarding_status !== 'completed') {
    return <Onboarding />;
  }

  const profileUrl = profile?.username 
    ? `${window.location.origin}/${profile.username}` 
    : null;

  const copyProfileUrl = () => {
    if (profileUrl) {
      navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast({ title: "Link copied!", description: "Your profile URL has been copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isCreator = profile?.account_type === 'creator';

  return (
    <div className="min-h-screen bg-background">
      <TopNavbar />
      <div className="h-24" />

      <main className="container max-w-6xl py-8 px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">
              Welcome back, {profile?.first_name || 'there'}!
            </h1>
            <p className="text-muted-foreground mt-1">
              {isCreator ? "Here's your creator dashboard" : "Manage your supporter account"}
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/settings">
              <Button variant="outline" className="gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </Link>
            {isCreator && (
              <Link to="/finance">
                <Button variant="outline" className="gap-2">
                  <Wallet className="w-4 h-4" />
                  Finance
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Profile URL Card */}
        {isCreator && profileUrl && (
          <div className="tipkoro-card mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold mb-1">Your TipKoro Page</h3>
                <p className="text-sm text-muted-foreground">{profileUrl}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyProfileUrl} className="gap-2">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy Link"}
                </Button>
                <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Visit
                  </Button>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        {isCreator && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                  <Users className="w-5 h-5 text-success" />
                </div>
                <span className="text-sm text-muted-foreground">Supporters</span>
              </div>
              <p className="text-2xl font-display font-bold">{profile?.total_supporters || 0}</p>
            </div>
            
            <div className="tipkoro-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">This Month</span>
              </div>
              <p className="text-2xl font-display font-bold">৳0</p>
            </div>
            
            <div className="tipkoro-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <TrendingUp className="w-5 h-5 text-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">Growth</span>
              </div>
              <p className="text-2xl font-display font-bold">+0%</p>
            </div>
          </div>
        )}

        {/* Recent Tips */}
        {isCreator && (
          <div className="tipkoro-card">
            <h3 className="text-lg font-semibold mb-4">Recent Tips</h3>
            <div className="text-center py-12 text-muted-foreground">
              <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No tips yet</p>
              <p className="text-sm mt-1">Share your profile link to start receiving tips!</p>
            </div>
          </div>
        )}

        {/* Supporter Dashboard */}
        {!isCreator && (
          <div className="tipkoro-card text-center py-12">
            <Heart className="w-16 h-16 mx-auto mb-4 text-accent" />
            <h3 className="text-xl font-semibold mb-2">You're a Supporter!</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Browse creators on TipKoro and show them your support with tips.
            </p>
            <Link to="/explore">
              <Button className="gap-2">
                <Users className="w-4 h-4" />
                Explore Creators
              </Button>
            </Link>
          </div>
        )}
      </main>

      <MainFooter />
    </div>
  );
}
