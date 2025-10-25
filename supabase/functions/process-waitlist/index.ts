import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WaitlistData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  attended_2025: boolean;
  agency_state: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const requestData: WaitlistData = await req.json();
    console.log('Processing waitlist submission:', { email: requestData.email });

    // Basic validation
    if (!requestData.first_name || !requestData.last_name || !requestData.email || !requestData.phone || 
        typeof requestData.attended_2025 !== 'boolean' || !requestData.agency_state) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save to database
    const { data: dbData, error: dbError } = await supabase
      .from('waitlist')
      .insert({
        first_name: requestData.first_name,
        last_name: requestData.last_name,
        email: requestData.email,
        phone: requestData.phone,
        attended_2025: requestData.attended_2025,
        agency_state: requestData.agency_state,
      })
      .select()
      .single();

    // Handle database errors
    if (dbError) {
      console.error('Database error:', dbError);
      
      // Duplicate email
      if (dbError.code === '23505') {
        return new Response(
          JSON.stringify({ 
            error: 'duplicate', 
            message: 'Email already registered' 
          }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw dbError;
    }

    console.log('Successfully saved to database:', dbData.id);

    // Send to Make.com webhook
    const makeWebhookUrl = Deno.env.get('MAKE_WEBHOOK_URL');
    
    if (makeWebhookUrl) {
      try {
        const webhookPayload = {
          id: dbData.id,
          first_name: dbData.first_name,
          last_name: dbData.last_name,
          email: dbData.email,
          phone: dbData.phone,
          attended_2025: dbData.attended_2025,
          agency_state: dbData.agency_state,
          created_at: dbData.created_at,
        };

        console.log('Sending to Make.com webhook...');
        
        const webhookResponse = await fetch(makeWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload),
        });

        if (!webhookResponse.ok) {
          console.error('Webhook error:', {
            status: webhookResponse.status,
            statusText: webhookResponse.statusText,
          });
          // Don't fail the request if webhook fails - data is already saved
        } else {
          console.log('Successfully sent to Make.com webhook');
        }
      } catch (webhookError) {
        console.error('Webhook send failed:', webhookError);
        // Don't fail the request if webhook fails - data is already saved
      }
    } else {
      console.warn('MAKE_WEBHOOK_URL not configured');
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Successfully joined waitlist',
        id: dbData.id 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-waitlist function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
