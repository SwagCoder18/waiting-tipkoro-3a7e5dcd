import React from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

const PaymentCancel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-xl mx-auto px-4 py-12">
        <div className="tipkoro-card text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
          <p className="text-muted-foreground mb-6">
            Your payment was cancelled or could not be completed. No charges were made.
          </p>

          <div className="space-y-3">
            <Button 
              variant="hero-accent" 
              className="w-full"
              onClick={() => navigate("/")}
            >
              Try Again
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/")}
            >
              Back to Home
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            Having trouble? Contact us at{" "}
            <a href="mailto:support@tipkoro.com" className="text-primary hover:underline">
              support@tipkoro.com
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentCancel;
