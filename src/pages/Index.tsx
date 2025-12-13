import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { BillingTimeline } from "@/components/BillingTimeline";
import { SignupForm } from "@/components/SignupForm";
import { WhyTipKoro } from "@/components/WhyTipKoro";
import { CreatorHighlights } from "@/components/CreatorHighlights";
import { SuccessCard } from "@/components/SuccessCard";
import { Confetti } from "@/components/Confetti";
import { BkashIcon, NagadIcon, RocketIcon, CardIcon, CryptoIcon, SparkleIcon } from "@/components/icons/PaymentIcons";
import { createCheckout } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

type SignupStep = "initial" | "payment" | "success";

const Index: React.FC = () => {
  const [step, setStep] = useState<SignupStep>("initial");
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  const handleStartSignup = () => {
    setStep("payment");
    document.getElementById("signup")?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePaymentComplete = async (paymentData: { fullname: string; email: string }) => {
    setIsLoading(true);
    try {
      const result = await createCheckout({
        fullname: paymentData.fullname,
        email: paymentData.email,
        amount: 150,
      });

      if (result.payment_url) {
        // Redirect to Rupantor Pay
        window.location.href = result.payment_url;
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create payment link",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {showConfetti && <Confetti />}

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container max-w-4xl text-center">
          {/* Promo Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium mb-6 animate-fade-in">
            <SparkleIcon className="w-4 h-4" />
            <span>Early Creator Offer — limited</span>
            <SparkleIcon className="w-4 h-4" />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 text-balance animate-fade-in">
            Join TipKoro — get your creator account activated today
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
            Sign up now: pay for month 1, months 2–3 are free, billing starts month 4.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 animate-fade-in">
            <Button
              variant="hero-accent"
              size="xl"
              onClick={handleStartSignup}
              className="animate-pulse-glow"
            >
              Join & Activate (Pay Now) →
            </Button>
          </div>

          {/* Payment Methods */}
          <div className="flex flex-wrap items-center justify-center gap-4 opacity-60">
            <span className="text-sm text-muted-foreground">Accepted:</span>
            <BkashIcon className="w-8 h-8" />
            <NagadIcon className="w-8 h-8" />
            <RocketIcon className="w-8 h-8" />
            <CardIcon className="w-8 h-8" />
            <CryptoIcon className="w-8 h-8" />
          </div>
        </div>
      </section>

      {/* Offer Details Section */}
      <section id="offer" className="py-16 px-4 bg-secondary/30">
        <div className="container max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            No hidden fees. No surprises. Just fair pricing for Bangladeshi creators.
          </p>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Pricing Card */}
            <div className="tipkoro-card">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-display font-bold">৳150</span>
                <span className="text-muted-foreground">/month</span>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-success mt-0.5">✓</span>
                  <span>You pay month 1 now — account activated instantly</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-success mt-0.5">✓</span>
                  <span>Months 2 and 3 are completely free</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-success mt-0.5">✓</span>
                  <span>Automatic billing starts month 4</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-success mt-0.5">✓</span>
                  <span>Cancel anytime before month 4</span>
                </li>
              </ul>

              <p className="text-sm text-muted-foreground border-t border-border pt-4">
                All payments processed securely via bKash, Nagad, Rocket, Card, or Crypto.
              </p>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-center">Your Billing Timeline</h3>
              <BillingTimeline />
            </div>
          </div>
        </div>
      </section>

      {/* Signup Section */}
      <section id="signup" className="py-16 px-4">
        <div className="container max-w-md">
          {step === "initial" && (
            <div className="text-center">
              <h2 className="text-2xl font-display font-bold mb-4">
                Ready to join?
              </h2>
              <p className="text-muted-foreground mb-6">
                Start your creator journey with TipKoro today.
              </p>
              <Button
                variant="hero-accent"
                size="lg"
                onClick={handleStartSignup}
              >
                Get Started →
              </Button>
            </div>
          )}

          {step === "payment" && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-sm mb-4">
                  <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <span>Payment</span>
                </div>
                <h2 className="text-2xl font-display font-bold">
                  Complete Your Payment
                </h2>
                <p className="text-muted-foreground mt-2">
                  Pay ৳150 for month 1 to activate your account
                </p>
              </div>
              <SignupForm
                step="payment"
                onPaymentComplete={handlePaymentComplete}
                isLoading={isLoading}
              />
            </div>
          )}

          {step === "success" && (
            <div className="animate-fade-in">
              <SuccessCard username={username} />
            </div>
          )}
        </div>
      </section>

      {/* Why TipKoro Section */}
      <div id="why">
        <WhyTipKoro />
      </div>

      {/* Creator Highlights */}
      <CreatorHighlights />

      <Footer />
    </div>
  );
};

export default Index;
