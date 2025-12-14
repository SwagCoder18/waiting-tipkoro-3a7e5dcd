import React, { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HeartIcon } from "./icons/PaymentIcons";
import { toast } from "@/hooks/use-toast";
import { createCheckout } from "@/lib/api";
import { useUser } from "@clerk/clerk-react";
import { Heart, Rocket, User, Link as LinkIcon, Check } from "lucide-react";

type OnboardingStep = 'account_type' | 'payment' | 'profile';

export function Onboarding() {
  const { user } = useUser();
  const { profile, updateProfile, refetch } = useProfile();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(
    profile?.onboarding_status === 'pending' ? 'account_type' : 
    profile?.onboarding_status as OnboardingStep || 'account_type'
  );
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    twitter: '',
    instagram: '',
    youtube: '',
    facebook: '',
    other_link: ''
  });

  const handleAccountTypeSelect = async (type: 'supporter' | 'creator') => {
    setIsLoading(true);
    
    if (type === 'supporter') {
      // Supporters skip payment and go straight to profile
      await updateProfile({ 
        account_type: 'supporter', 
        onboarding_status: 'profile' 
      });
      setCurrentStep('profile');
    } else {
      // Creators need to pay first
      await updateProfile({ 
        account_type: 'creator', 
        onboarding_status: 'payment' 
      });
      setCurrentStep('payment');
    }
    
    setIsLoading(false);
  };

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const result = await createCheckout({
        fullname: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Creator',
        email: user?.primaryEmailAddress?.emailAddress || '',
        amount: 10,
      });

      if (result.payment_url) {
        // Store that we're in onboarding in localStorage so we can resume
        localStorage.setItem('tipkoro_onboarding_profile_id', profile?.id || '');
        window.location.href = result.payment_url;
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create payment link",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      toast({
        title: "Username required",
        description: "Please choose a username for your profile.",
        variant: "destructive",
      });
      return;
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(formData.username)) {
      toast({
        title: "Invalid username",
        description: "Username can only contain letters, numbers, and underscores.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Clean up social links - remove https:// if provided
    const cleanLink = (link: string) => {
      if (!link) return null;
      return link.replace(/^https?:\/\//, '').trim() || null;
    };

    const result = await updateProfile({
      username: formData.username.toLowerCase(),
      bio: formData.bio || null,
      twitter: cleanLink(formData.twitter),
      instagram: cleanLink(formData.instagram),
      youtube: cleanLink(formData.youtube),
      facebook: cleanLink(formData.facebook),
      other_link: cleanLink(formData.other_link),
      onboarding_status: 'completed'
    });

    if (result.error) {
      toast({
        title: "Error",
        description: result.error.includes('duplicate') 
          ? "This username is already taken. Please choose another."
          : result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome to TipKoro!",
        description: "Your account is now set up.",
      });
      refetch();
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <HeartIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-2xl">TipKoro</span>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className={`w-3 h-3 rounded-full ${currentStep === 'account_type' ? 'bg-accent' : 'bg-muted'}`} />
          <div className={`w-8 h-0.5 ${currentStep !== 'account_type' ? 'bg-accent' : 'bg-muted'}`} />
          <div className={`w-3 h-3 rounded-full ${currentStep === 'payment' ? 'bg-accent' : currentStep === 'profile' ? 'bg-accent' : 'bg-muted'}`} />
          <div className={`w-8 h-0.5 ${currentStep === 'profile' ? 'bg-accent' : 'bg-muted'}`} />
          <div className={`w-3 h-3 rounded-full ${currentStep === 'profile' ? 'bg-accent' : 'bg-muted'}`} />
        </div>

        {/* Step Content */}
        <div className="tipkoro-card">
          {currentStep === 'account_type' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-display font-bold mb-2">Choose Your Account Type</h2>
                <p className="text-muted-foreground">How do you want to use TipKoro?</p>
              </div>
              
              <div className="grid gap-4">
                <button
                  onClick={() => handleAccountTypeSelect('supporter')}
                  disabled={isLoading}
                  className="tipkoro-card flex items-start gap-4 p-5 text-left hover:border-accent/50 hover:bg-accent/5 transition-all cursor-pointer"
                >
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Supporter</h3>
                    <p className="text-sm text-muted-foreground">
                      Free forever. Support your favorite creators with tips.
                    </p>
                  </div>
                </button>
                
                <button
                  onClick={() => handleAccountTypeSelect('creator')}
                  disabled={isLoading}
                  className="tipkoro-card flex items-start gap-4 p-5 text-left hover:border-accent/50 hover:bg-accent/5 transition-all cursor-pointer border-2 border-tipkoro-gold"
                >
                  <div className="p-3 rounded-xl bg-accent/20">
                    <Rocket className="w-6 h-6 text-tipkoro-dark" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Creator</h3>
                    <p className="text-sm text-muted-foreground">
                      ৳150/month. Get your own page and receive tips from fans.
                    </p>
                    <p className="text-xs text-accent-foreground mt-1 font-medium">
                      🎉 Early offer: Pay ৳10 now, 2 months free!
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {currentStep === 'payment' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-display font-bold mb-2">Activate Your Creator Account</h2>
                <p className="text-muted-foreground">Pay ৳10 to get started with 3 months access</p>
              </div>
              
              <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Month 1</span>
                  <span className="font-medium">৳10</span>
                </div>
                <div className="flex justify-between text-sm text-success">
                  <span>Months 2-3 (Free)</span>
                  <span className="font-medium">৳0</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-semibold">
                  <span>Total Today</span>
                  <span>৳10</span>
                </div>
              </div>
              
              <Button 
                onClick={handlePayment} 
                disabled={isLoading}
                className="w-full h-12 bg-accent text-accent-foreground hover:bg-tipkoro-gold-hover"
              >
                {isLoading ? "Processing..." : "Pay ৳10 & Activate"}
              </Button>
              
              <button 
                onClick={() => {
                  updateProfile({ account_type: 'supporter', onboarding_status: 'profile' });
                  setCurrentStep('profile');
                }}
                className="w-full text-sm text-muted-foreground hover:text-foreground"
              >
                Continue as Supporter instead
              </button>
            </div>
          )}

          {currentStep === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-display font-bold mb-2">Complete Your Profile</h2>
                <p className="text-muted-foreground">Tell us a bit about yourself</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="tipkoro-label">
                    Username <span className="text-destructive">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">tipkoro.com/</span>
                    <Input
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="yourname"
                      className="tipkoro-input flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="tipkoro-label">Bio</label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell your supporters about yourself..."
                    className="tipkoro-input min-h-[100px]"
                    maxLength={300}
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="tipkoro-label flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Social Links
                  </label>
                  <Input
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    placeholder="twitter.com/username"
                    className="tipkoro-input"
                  />
                  <Input
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="instagram.com/username"
                    className="tipkoro-input"
                  />
                  <Input
                    value={formData.youtube}
                    onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                    placeholder="youtube.com/@channel"
                    className="tipkoro-input"
                  />
                  <Input
                    value={formData.facebook}
                    onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                    placeholder="facebook.com/page"
                    className="tipkoro-input"
                  />
                  <Input
                    value={formData.other_link}
                    onChange={(e) => setFormData({ ...formData, other_link: e.target.value })}
                    placeholder="other website or link"
                    className="tipkoro-input"
                  />
                </div>
              </div>
              
              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-accent text-accent-foreground hover:bg-tipkoro-gold-hover"
              >
                {isLoading ? "Saving..." : "Complete Setup"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
