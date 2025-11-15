import { NextRequest, NextResponse } from 'next/server';

/**
 * Webhook API Route for Code Updates
 * 
 * This serverless function receives code updates from the CodeEditor component
 * and can be deployed on Vercel without needing a separate backend server.
 * 
 * Endpoint: /api/webhook/code-update
 * Method: POST
 */

export async function POST(request: NextRequest) {
  try {
    // Verify API key (optional but recommended for security)
    const apiKey = request.headers.get('x-api-key');
    const expectedKey = process.env.WEBHOOK_API_KEY;
    
    if (expectedKey && apiKey !== expectedKey) {
      console.warn('❌ Unauthorized webhook attempt');
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized',
          message: 'Invalid API key' 
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { code, language, timestamp, sessionId, userId } = body;

    // Validate required fields
    if (!code || !language || !timestamp || !sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'Missing required fields: code, language, timestamp, sessionId'
        },
        { status: 400 }
      );
    }

    // Log the code update (visible in Vercel logs)
    console.log('\n=================================');
    console.log('📝 Code Update Received');
    console.log('=================================');
    console.log('Session ID:', sessionId);
    console.log('User ID:', userId || 'N/A');
    console.log('Language:', language);
    console.log('Timestamp:', timestamp);
    console.log('Code Length:', code?.length || 0, 'characters');
    console.log('Code Preview:');
    console.log(code.substring(0, 200) + (code.length > 200 ? '...' : ''));
    console.log('=================================\n');

    // ═══════════════════════════════════════════════════════
    // TODO: Add your custom logic here
    // ═══════════════════════════════════════════════════════
    
    // Example 1: Store in Vercel Postgres
    // ────────────────────────────────────
    // import { sql } from '@vercel/postgres';
    // await sql`
    //   INSERT INTO code_updates (session_id, user_id, code, language, timestamp)
    //   VALUES (${sessionId}, ${userId}, ${code}, ${language}, ${timestamp})
    // `;

    // Example 2: Store in Supabase
    // ────────────────────────────────────
    // import { createClient } from '@supabase/supabase-js';
    // const supabase = createClient(
    //   process.env.SUPABASE_URL!,
    //   process.env.SUPABASE_KEY!
    // );
    // await supabase.from('code_updates').insert({
    //   session_id: sessionId,
    //   user_id: userId,
    //   code,
    //   language,
    //   timestamp,
    // });

    // Example 3: Send to external API
    // ────────────────────────────────────
    // await fetch(process.env.EXTERNAL_API_URL!, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ sessionId, code, language, timestamp }),
    // });

    // Example 4: Send to analytics service
    // ────────────────────────────────────
    // import { track } from '@vercel/analytics/server';
    // await track('code_update', {
    //   sessionId,
    //   language,
    //   codeLength: code.length,
    // });

    // Return success response
    return NextResponse.json({
      success: true,
      received: true,
      sessionId,
      timestamp: new Date().toISOString(),
      message: 'Code update received successfully',
    });

  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
      },
    }
  );
}

// Optional: GET handler for testing/health check
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/webhook/code-update',
    methods: ['POST'],
    message: 'Webhook endpoint is running',
    timestamp: new Date().toISOString(),
  });
}

