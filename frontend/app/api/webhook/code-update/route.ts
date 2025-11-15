import { NextRequest, NextResponse } from 'next/server';

/**
 * Webhook API Route for Code Updates
 * 
 * This serverless function receives code updates from the CodeEditor component
 * and can be deployed on Vercel without needing a separate backend server.
 * 
 * Endpoint: /api/webhook/code-update
 * Methods: POST (send code), GET (retrieve code)
 */

// In-memory storage for code updates (per session)
// Note: This resets when the server restarts. For production, use a database.
interface StoredCode {
  code: string;
  language: string;
  timestamp: string;
  userId?: string;
  lastUpdated: string;
}

const codeStore = new Map<string, StoredCode>();

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

    // Store the code in memory
    codeStore.set(sessionId, {
      code,
      language,
      timestamp,
      userId,
      lastUpdated: new Date().toISOString(),
    });

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
    console.log('Stored sessions:', codeStore.size);
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

// GET handler to retrieve stored code
export async function GET(request: NextRequest) {
  try {
    // Get sessionId from query parameters
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    // If no sessionId provided, return info about all sessions
    if (!sessionId) {
      const sessions = Array.from(codeStore.keys());
      return NextResponse.json({
        status: 'ok',
        endpoint: '/api/webhook/code-update',
        methods: ['POST', 'GET'],
        message: 'Webhook endpoint is running',
        totalSessions: codeStore.size,
        sessions: sessions,
        usage: {
          POST: 'Send code updates with { code, language, timestamp, sessionId, userId }',
          GET: 'Retrieve code with ?sessionId=<session-id>',
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Verify API key (optional but recommended for security)
    const apiKey = request.headers.get('x-api-key');
    const expectedKey = process.env.WEBHOOK_API_KEY;
    
    if (expectedKey && apiKey !== expectedKey) {
      console.warn('❌ Unauthorized GET attempt');
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized',
          message: 'Invalid API key' 
        },
        { status: 401 }
      );
    }

    // Retrieve code from store
    const storedCode = codeStore.get(sessionId);

    if (!storedCode) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: `No code found for session: ${sessionId}`,
          availableSessions: Array.from(codeStore.keys()),
        },
        { status: 404 }
      );
    }

    console.log(`\n📖 Code Retrieved for session: ${sessionId}`);
    
    return NextResponse.json({
      success: true,
      sessionId,
      ...storedCode,
    });

  } catch (error) {
    console.error('❌ Error retrieving code:', error);
    
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

