// @ts-nocheck
// Deno edge function - types handled at runtime

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory rate limiting by IP (resets on function cold start)
// For production, consider Redis/KV store for persistent rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_REQUESTS = 20; // Max requests per window
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute window

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_REQUESTS - 1 };
  }
  
  if (record.count >= RATE_LIMIT_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }
  
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_REQUESTS - record.count };
}

// Cleanup old entries periodically to prevent memory bloat
function cleanupRateLimitMap() {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}

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

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('cf-connecting-ip') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    // Check rate limit
    const rateCheck = checkRateLimit(clientIP);
    if (!rateCheck.allowed) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please wait before making more requests.' }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
            'Retry-After': '60'
          } 
        }
      );
    }

    // Periodic cleanup (run on ~1% of requests to avoid overhead)
    if (Math.random() < 0.01) {
      cleanupRateLimitMap();
    }

    const { action, payload } = await req.json();
    
    // Input validation
    if (!action || typeof action !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid request: action is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const validActions = ['glass-house', 'intelligence', 'legal-strategy', 'rosetta-stone'];
    if (!validActions.includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Invalid action type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
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
        userPrompt = payload?.prompt || '';
        break;

      case 'intelligence':
        systemPrompt = `${SYSTEM_INSTRUCTION}

You are generating a Financial Intelligence Report. Analyze the provided context and generate actionable intelligence.`;
        userPrompt = payload?.prompt || '';
        break;

      case 'legal-strategy':
        systemPrompt = `${SYSTEM_INSTRUCTION}

ACT AS: Senior Litigation Strategist (AutoLex Architect).
TASK: Draft legal correspondence with the specified tone.`;
        userPrompt = payload?.prompt || '';
        break;

      case 'rosetta-stone':
        systemPrompt = `${SYSTEM_INSTRUCTION}

You are Rosetta Stone v1.0, an AI-powered document analyzer and converter. Your task is to:
1. CLASSIFY content as: PROSE (narrative text), TABULAR (spreadsheets, tables, CSV data), or HIERARCHICAL (JSON, XML, nested structures, legal documents with sections)
2. ANALYZE the document structure and extract key metadata
3. PROVIDE confidence scores (0-100) for your classification
4. CONVERT prose to clean Markdown, hierarchical to JSON with inferred schema
5. GENERATE a PFV v14.2 compliant summary

For the content provided, return your analysis in this exact JSON format:
{
  "classification": "PROSE" | "TABULAR" | "HIERARCHICAL",
  "confidence": <number 0-100>,
  "reasoning": "<brief explanation of classification>",
  "convertedContent": "<the converted/cleaned content>",
  "jsonSchema": <inferred schema object if HIERARCHICAL, null otherwise>,
  "keyEntities": ["<extracted entity 1>", "<extracted entity 2>"],
  "summary": "<2-3 sentence summary>"
}`;
        // Limit content to prevent abuse
        const contentLimit = 10000;
        const safeContent = (payload?.content || payload?.prompt || '').slice(0, contentLimit);
        userPrompt = `Analyze and convert the following document:

FILENAME: ${payload?.fileName || 'unknown'}
MIME TYPE: ${payload?.mimeType || 'text/plain'}
TIMESTAMP: ${payload?.timestamp || new Date().toISOString()}

CONTENT:
${safeContent}`;
        break;

      default:
        userPrompt = payload?.prompt || '';
    }

    // Validate prompt isn't empty
    if (!userPrompt.trim()) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: prompt content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${action} request from IP: ${clientIP.substring(0, 10)}...`);

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
        temperature: payload?.temperature || 0.3,
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
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': String(rateCheck.remaining)
        } 
      }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
