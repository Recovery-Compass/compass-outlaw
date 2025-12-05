// Supabase Edge Function: gemini-draft
// SECURITY: JWT verification ENABLED
// PFV V16 Protocol Compliant

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestPayload {
  recipient: string;
  keyFacts: string;
  desiredOutcome: string;
  tone: 'AGGRESSIVE' | 'COLLABORATIVE' | 'FORMAL';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ==========================================
    // CRITICAL SECURITY: JWT VERIFICATION
    // ==========================================
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify JWT token with Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error('JWT verification failed:', authError);
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized: Invalid or expired token',
          details: authError?.message 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log authenticated request
    console.log(`Authenticated request from user: ${user.id} (${user.email})`);

    // ==========================================
    // REQUEST VALIDATION
    // ==========================================
    const payload: RequestPayload = await req.json();
    
    if (!payload.recipient || !payload.keyFacts || !payload.desiredOutcome) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: recipient, keyFacts, desiredOutcome' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!['AGGRESSIVE', 'COLLABORATIVE', 'FORMAL'].includes(payload.tone)) {
      return new Response(
        JSON.stringify({ error: 'Invalid tone. Must be AGGRESSIVE, COLLABORATIVE, or FORMAL' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // ==========================================
    // GEMINI API CALL (SECURE)
    // ==========================================
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const prompt = `
      ACT AS: Senior Litigation Strategist (AutoLex Architect).
      TASK: Draft a legal correspondence.

      RECIPIENT: ${payload.recipient}
      KEY FACTS: ${payload.keyFacts}
      DESIRED OUTCOME: ${payload.desiredOutcome}
      TONE: ${payload.tone}

      FORMATTING RULES:
      1. Use standard legal correspondence headers if applicable.
      2. Cite specific California Probate Codes where relevant (infer from context).
      3. Be concise, authoritative, and direct.
      4. If TONE is AGGRESSIVE, focus on liability and deadlines.
      5. If TONE is COLLABORATIVE, focus on mutual benefit and resolution.

      OUTPUT: The full draft text of the letter/email.
    `;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'AI generation failed', details: errorText }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const geminiData = await geminiResponse.json();
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No content generated';

    // ==========================================
    // AUDIT LOG (Optional)
    // ==========================================
    // Log usage for billing/monitoring
    await supabaseClient.from('function_usage_logs').insert({
      user_id: user.id,
      function_name: 'gemini-draft',
      request_payload: {
        recipient: payload.recipient,
        tone: payload.tone,
      },
      response_length: generatedText.length,
      timestamp: new Date().toISOString(),
    }).catch(err => console.error('Audit log failed:', err));

    // ==========================================
    // SECURE RESPONSE
    // ==========================================
    return new Response(
      JSON.stringify({
        success: true,
        text: generatedText,
        user: user.email,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
