import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface CheckoutParams {
  fullname: string;
  email: string;
  amount?: number;
}

interface CheckoutResponse {
  payment_url?: string;
  error?: string;
}

interface VerifyParams {
  transaction_id: string;
  payment_method?: string;
  payment_amount?: number;
}

interface VerifyResponse {
  verified: boolean;
  transaction_id: string;
  status: string;
  amount?: string;
  payment_method?: string;
  email?: string;
  error?: string;
}

interface ProfileData {
  transaction_id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  bio: string;
  category: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  other_link?: string;
  payout_method: string;
  phone?: string;
}

interface CompleteSignupResponse {
  success: boolean;
  username?: string;
  active_until?: string;
  billing_start?: string;
  error?: string;
}

export async function createCheckout(params: CheckoutParams): Promise<CheckoutResponse> {
  const successUrl = `${window.location.origin}/payment/success`;
  const cancelUrl = `${window.location.origin}/payment/cancel`;

  const { data, error } = await supabase.functions.invoke('rupantor-checkout', {
    body: {
      fullname: params.fullname,
      email: params.email,
      amount: params.amount || 10,
      successUrl,
      cancelUrl,
    },
  });

  if (error) {
    console.error("Checkout error:", error);
    return { error: error.message };
  }

  return data;
}

export async function verifyPayment(params: VerifyParams): Promise<VerifyResponse> {
  const { data, error } = await supabase.functions.invoke('rupantor-verify', {
    body: params,
  });

  if (error) {
    console.error("Verify error:", error);
    return { 
      verified: false, 
      transaction_id: params.transaction_id,
      status: 'ERROR',
      error: error.message 
    };
  }

  return data;
}

export async function completeSignup(profileData: ProfileData): Promise<CompleteSignupResponse> {
  const { data, error } = await supabase.functions.invoke('complete-signup', {
    body: profileData,
  });

  if (error) {
    console.error("Complete signup error:", error);
    return { success: false, error: error.message };
  }

  return data;
}
