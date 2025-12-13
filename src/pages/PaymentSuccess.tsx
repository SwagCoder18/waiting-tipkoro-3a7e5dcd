import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SignupForm } from "@/components/SignupForm";
import { SuccessCard } from "@/components/SuccessCard";
import { Confetti } from "@/components/Confetti";
import { verifyPayment, completeSignup } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface FormData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  category: string;
  twitter: string;
  instagram: string;
  youtube: string;
  otherLink: string;
  payoutMethod: string;
  phone: string;
}

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string>("");

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

    setTransactionId(txnId);

    // Verify the payment
    const verify = async () => {
      try {
        const result = await verifyPayment({
          transaction_id: txnId,
          payment_method: paymentMethod || undefined,
          payment_amount: paymentAmount ? parseFloat(paymentAmount) : undefined,
        });

        if (result.verified) {
          setIsVerified(true);
          setVerifiedEmail(result.email || "");
          toast({
            title: "Payment Verified! ✓",
            description: "Your payment was successful. Please complete your profile.",
          });
        } else {
          toast({
            title: "Verification Failed",
            description: result.error || "Could not verify payment. Please try again.",
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

  const handleFormSubmit = async (formData: FormData) => {
    if (!transactionId) return;

    setIsSubmitting(true);
    try {
      const result = await completeSignup({
        transaction_id: transactionId,
        username: formData.username,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email || verifiedEmail,
        bio: formData.bio,
        category: formData.category,
        twitter: formData.twitter || undefined,
        instagram: formData.instagram || undefined,
        youtube: formData.youtube || undefined,
        other_link: formData.otherLink || undefined,
        payout_method: formData.payoutMethod,
        phone: formData.phone || undefined,
      });

      if (result.success) {
        setIsComplete(true);
        toast({
          title: "Welcome to TipKoro! 🎉",
          description: "Your creator account is now active.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to complete signup.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Confetti />
        <Header />
        <main className="container max-w-xl mx-auto px-4 py-12">
          <SuccessCard />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-xl mx-auto px-4 py-12">
        {isVerifying ? (
          <div className="tipkoro-card text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Verifying Payment...</h2>
            <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
          </div>
        ) : isVerified ? (
          <div>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full mb-4">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Payment Successful
              </div>
              <h1 className="text-2xl font-bold mb-2">Complete Your Profile</h1>
              <p className="text-muted-foreground">
                One more step to activate your creator account
              </p>
            </div>

            <div className="tipkoro-card">
              <SignupForm
                step="details"
                onSubmit={handleFormSubmit}
                onPaymentComplete={() => {}}
                isLoading={isSubmitting}
              />
            </div>
          </div>
        ) : (
          <div className="tipkoro-card text-center py-12">
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-semibold mb-2">Verification Failed</h2>
            <p className="text-muted-foreground">Redirecting you back to try again...</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
