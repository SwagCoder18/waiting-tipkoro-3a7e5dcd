import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("Rupantor webhook received:", payload);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const adminWebhookUrl = Deno.env.get('ADMIN_WEBHOOK_URL');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const transactionId = payload.transaction_id || payload.transactionId;
    const status = payload.status;
    const paymentMethod = payload.payment_method || payload.paymentMethod;
    const amount = payload.amount;

    if (!transactionId) {
      console.error("Missing transaction_id in webhook payload");
      return new Response(
        JSON.stringify({ error: "Missing transaction_id" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if record exists
    const { data: existingRecord } = await supabase
      .from('creator_signups')
      .select('id')
      .eq('transaction_id', transactionId)
      .maybeSingle();

    const paymentStatus = status === 'COMPLETED' ? 'completed' : 
                          status === 'ERROR' || status === 'FAILED' ? 'failed' : 'pending';

    if (existingRecord) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('creator_signups')
        .update({
          payment_status: paymentStatus,
          payment_method: paymentMethod,
          amount: amount ? parseFloat(amount) : null,
        })
        .eq('transaction_id', transactionId);

      if (updateError) {
        console.error("Error updating from webhook:", updateError);
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('creator_signups')
        .insert({
          transaction_id: transactionId,
          payment_status: paymentStatus,
          payment_method: paymentMethod,
          amount: amount ? parseFloat(amount) : null,
          email: payload.email,
        });

      if (insertError) {
        console.error("Error inserting from webhook:", insertError);
      }
    }

    console.log(`Webhook processed: ${transactionId} -> ${paymentStatus}`);

    // Fire admin webhook if configured and payment completed
    if (adminWebhookUrl && paymentStatus === 'completed') {
      try {
        await fetch(adminWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'payment.completed',
            timestamp: new Date().toISOString(),
            data: {
              transaction_id: transactionId,
              payment_method: paymentMethod,
              amount,
              email: payload.email,
            }
          }),
        });
        console.log("Admin webhook fired successfully");
      } catch (webhookError) {
        console.error("Failed to fire admin webhook:", webhookError);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in rupantor-webhook:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
