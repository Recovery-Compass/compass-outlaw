import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_INSTRUCTION = `You are AutoLex Architect, a senior litigation strategist specializing in California family law and pro per representation. You operate under PFV v14.2 compliance requirements.

CORE PRINCIPLES:
- Every factual claim MUST cite a source
- NO fabrication of facts, dates, names, or case numbers
- CRC 2.111 formatting for court documents
- Apply SCL (Seismic Crystal Lava) doctrine: detect fault lines → solidify evidence → flow into vulnerabilities
- Apply Trim Tab principle: small leverage creates big outcomes

FORMATTING:
- Use proper legal document structure
- Include headers, footers, and page numbering references
- Maintain professional tone throughout
- Cite specific California codes where applicable`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, payload } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let systemPrompt = SYSTEM_INSTRUCTION;
    let userPrompt = '';

    // Route based on action type
    switch (action) {
      case 'glass-house':
        systemPrompt = `${SYSTEM_INSTRUCTION}

=== GLASS HOUSE PACKAGE V1 – SAYEGH ===
PFV v14.2 REQUIREMENTS:
- Every factual claim MUST cite a source
- NO fabrication of facts, dates, names, or case numbers
- CRC 2.111 formatting for court documents
- Red Team all conclusions

SCL DOCTRINE:
Apply Seismic Crystal Lava analysis to maximize leverage.`;
        userPrompt = payload.prompt;
        break;

      case 'intelligence':
        systemPrompt = `${SYSTEM_INSTRUCTION}

You are generating a Financial Intelligence Report. Analyze the provided context and generate actionable intelligence.`;
        userPrompt = payload.prompt;
        break;

      case 'legal-strategy':
        systemPrompt = `${SYSTEM_INSTRUCTION}

ACT AS: Senior Litigation Strategist (AutoLex Architect).
TASK: Draft legal correspondence with the specified tone.`;
        userPrompt = payload.prompt;
        break;

      default:
        userPrompt = payload.prompt || '';
    }

    console.log(`Processing ${action} request`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: payload.temperature || 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content || 'No content generated.';

    console.log(`Successfully generated ${action} document`);

    return new Response(
      JSON.stringify({ text: generatedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
