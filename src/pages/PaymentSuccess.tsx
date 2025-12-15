import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { TopNavbar } from "@/components/TopNavbar";
import { MainFooter } from "@/components/MainFooter";
import { Button } from "@/components/ui/button";
import { verifyPayment } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@clerk/clerk-react";
import { Check, Download, Share2, Home, ArrowRight } from "lucide-react";
import { Confetti } from "@/components/Confetti";

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [paymentType, setPaymentType] = useState<"onboarding" | "tip" | null>(null);
  const [tipData, setTipData] = useState<any>(null);

  useEffect(() => {
    const txnId = searchParams.get("transactionId");
    const paymentMethod = searchParams.get("paymentMethod");
    const paymentAmount = searchParams.get("paymentAmount");

    if (!txnId) {
      toast({
        title: "Invalid Request",
        description: "No transaction ID found. Redirecting to home...",
        variant: "destructive",
      });
      setTimeout(() => navigate("/"), 2000);
      return;
    }

    const verify = async () => {
      try {
        const result = await verifyPayment({
          transaction_id: txnId,
          payment_method: paymentMethod || undefined,
          payment_amount: paymentAmount ? parseFloat(paymentAmount) : undefined,
        });

        if (result.verified) {
          setIsVerified(true);

          // Check if this is an onboarding payment
          const onboardingProfileId = localStorage.getItem("tipkoro_onboarding_profile_id");
          const storedTipData = localStorage.getItem("tipkoro_tip_data");

          if (onboardingProfileId) {
            setPaymentType("onboarding");
            // Update creator subscription
            const { error } = await supabase
              .from("creator_subscriptions")
              .update({
                payment_status: "completed",
                transaction_id: txnId,
                payment_method: paymentMethod,
                amount: paymentAmount ? parseFloat(paymentAmount) : 150,
                billing_start: new Date().toISOString(),
                active_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              })
              .eq("profile_id", onboardingProfileId);

            if (!error) {
              // Update profile onboarding status
              await supabase
                .from("profiles")
                .update({ onboarding_status: "profile" })
                .eq("id", onboardingProfileId);
              localStorage.removeItem("tipkoro_onboarding_profile_id");
            }
          } else if (storedTipData) {
            setPaymentType("tip");
            const tipInfo = JSON.parse(storedTipData);
            setTipData(tipInfo);

            // Insert the tip into the database
            await supabase.from("tips").insert({
              creator_id: tipInfo.creatorId,
              supporter_name: tipInfo.supporterName,
              supporter_email: tipInfo.supporterEmail,
              amount: tipInfo.amount,
              message: tipInfo.message,
              is_anonymous: tipInfo.isAnonymous,
              payment_status: "completed",
              transaction_id: txnId,
              payment_method: paymentMethod,
            });

            localStorage.removeItem("tipkoro_tip_data");
          }

          toast({
            title: "Payment Verified! ✓",
            description: "Your payment was successful.",
          });
        } else {
          toast({
            title: "Verification Failed",
            description: result.error || "Could not verify payment.",
            variant: "destructive",
          });
          setTimeout(() => navigate("/"), 3000);
        }
      } catch (error) {
        console.error("Verification error:", error);
        toast({
          title: "Error",
          description: "An error occurred during verification.",
          variant: "destructive",
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verify();
  }, [searchParams, navigate]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <TopNavbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="tipkoro-card text-center py-12 max-w-md w-full">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Verifying Payment...</h2>
            <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
          </div>
        </main>
        <MainFooter />
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <TopNavbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="tipkoro-card text-center py-12 max-w-md w-full">
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-semibold mb-2">Verification Failed</h2>
            <p className="text-muted-foreground">Redirecting you back...</p>
          </div>
        </main>
        <MainFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Confetti />
      <TopNavbar />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="tipkoro-card text-center py-12 max-w-md w-full">
          <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-success" />
          </div>
          
          <h1 className="text-2xl font-bold font-display mb-2">
            {paymentType === "onboarding" ? "Welcome to TipKoro!" : "Thank You!"}
          </h1>
          
          <p className="text-muted-foreground mb-8">
            {paymentType === "onboarding" 
              ? "Your creator subscription is now active. Complete your profile to start receiving tips!"
              : tipData 
                ? `Your tip of ৳${tipData.amount} has been sent successfully!`
                : "Your payment was successful."}
          </p>

          <div className="space-y-3">
            {paymentType === "onboarding" ? (
              <Button
                onClick={() => navigate("/dashboard")}
                className="w-full bg-accent text-accent-foreground hover:bg-tipkoro-gold-hover"
              >
                Complete Profile <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // Generate shareable image logic would go here
                    toast({
                      title: "Coming Soon",
                      description: "Donation image generation will be available soon!",
                    });
                  }}
                >
                  <Download className="w-4 h-4 mr-2" /> Create Donation Image
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    navigator.share?.({
                      title: "I supported a creator on TipKoro!",
                      text: `I just sent a tip on TipKoro! Support your favorite creators too.`,
                      url: window.location.origin,
                    });
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
              </>
            )}
            
            <Link to="/">
              <Button variant="ghost" className="w-full">
                <Home className="w-4 h-4 mr-2" /> Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <MainFooter />
    </div>
  );
};

export default PaymentSuccess;
