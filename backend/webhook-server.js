/**
 * Simple Webhook Server Example
 * 
 * This is a basic Express server that receives webhook requests from the frontend
 * and logs them to the console. Use this for testing the webhook integration.
 * 
 * Usage:
 *   1. npm install express cors
 *   2. node webhook-server.js
 *   3. Server will listen on http://localhost:3001
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies (with 10MB limit for large code)
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from Next.js frontend
  methods: ['POST', 'GET'],
}));

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Webhook server is running' });
});

// Main webhook endpoint
app.post('/webhook/code-update', (req, res) => {
  try {
    const { code, language, timestamp, sessionId, userId } = req.body;

    // Optional: Verify API key
    const apiKey = req.headers['x-api-key'];
    if (process.env.WEBHOOK_API_KEY && apiKey !== process.env.WEBHOOK_API_KEY) {
      console.error('❌ Unauthorized request - Invalid API key');
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid API key' });
    }

    // Log the received data
    console.log('\n=================================');
    console.log('📝 Code Update Received');
    console.log('=================================');
    console.log('Session ID:', sessionId || 'N/A');
    console.log('User ID:', userId || 'N/A');
    console.log('Language:', language);
    console.log('Timestamp:', timestamp);
    console.log('Code Length:', code?.length || 0, 'characters');
    console.log('Code Preview:');
    console.log('---');
    // Show first 200 characters of code
    console.log(code?.substring(0, 200) + (code?.length > 200 ? '...' : ''));
    console.log('=================================\n');

    // Here you would typically:
    // 1. Store the code in a database
    // 2. Trigger analytics processing
    // 3. Send to other services
    // 4. Run code analysis
    // etc.

    // Example: Store in memory (for demo purposes)
    if (!global.codeSessions) {
      global.codeSessions = {};
    }
    
    if (!global.codeSessions[sessionId]) {
      global.codeSessions[sessionId] = [];
    }
    
    global.codeSessions[sessionId].push({
      code,
      language,
      timestamp,
      receivedAt: new Date().toISOString(),
    });

    // Send success response
    res.status(200).json({
      success: true,
      received: true,
      sessionId,
      timestamp: new Date().toISOString(),
      message: 'Code update received successfully',
    });

  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    });
  }
});

// Get session history (for debugging)
app.get('/webhook/sessions', (req, res) => {
  const sessions = global.codeSessions || {};
  const sessionCount = Object.keys(sessions).length;
  const totalUpdates = Object.values(sessions).reduce((sum, updates) => sum + updates.length, 0);

  res.json({
    sessionCount,
    totalUpdates,
    sessions: Object.keys(sessions).map(sessionId => ({
      sessionId,
      updateCount: sessions[sessionId].length,
      firstUpdate: sessions[sessionId][0]?.timestamp,
      lastUpdate: sessions[sessionId][sessions[sessionId].length - 1]?.timestamp,
    })),
  });
});

// Get specific session data
app.get('/webhook/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const sessions = global.codeSessions || {};
  
  if (!sessions[sessionId]) {
    return res.status(404).json({
      error: 'Not found',
      message: `Session ${sessionId} not found`,
    });
  }

  res.json({
    sessionId,
    updateCount: sessions[sessionId].length,
    updates: sessions[sessionId],
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Endpoint ${req.path} not found`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n=================================');
  console.log('🚀 Webhook Server Started');
  console.log('=================================');
  console.log(`Port: ${PORT}`);
  console.log(`Webhook URL: http://localhost:${PORT}/webhook/code-update`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
  console.log(`Sessions API: http://localhost:${PORT}/webhook/sessions`);
  console.log('=================================\n');
  console.log('Waiting for webhook requests...\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n=================================');
  console.log('🛑 Shutting down webhook server');
  console.log('=================================\n');
  process.exit(0);
});

