# Webhook Server

A simple Express.js server for receiving and processing code updates from the coding interview platform frontend.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Server

```bash
npm start
```

The server will start on `http://localhost:3001`

### 3. Configure Frontend

Set the webhook URL in your frontend `.env.local`:

```env
NEXT_PUBLIC_WEBHOOK_URL=http://localhost:3001/webhook/code-update
NEXT_PUBLIC_WEBHOOK_ENABLED=true
```

## Features

- ✅ Receives code updates from frontend via POST requests
- ✅ CORS enabled for frontend communication
- ✅ API key authentication support (optional)
- ✅ Session tracking and history
- ✅ Health check endpoint
- ✅ In-memory storage for demo purposes
- ✅ Detailed logging of all code updates

## API Endpoints

### POST /webhook/code-update

Receives code updates from the frontend.

**Request Body**:
```json
{
  "code": "function twoSum(nums, target) { ... }",
  "language": "javascript",
  "timestamp": "2024-11-15T10:30:45.123Z",
  "sessionId": "session_1731668445123_abc123",
  "userId": "user_123"
}
```

**Response**:
```json
{
  "success": true,
  "received": true,
  "sessionId": "session_1731668445123_abc123",
  "timestamp": "2024-11-15T10:30:46.456Z",
  "message": "Code update received successfully"
}
```

### GET /health

Health check endpoint.

**Response**:
```json
{
  "status": "ok",
  "message": "Webhook server is running"
}
```

### GET /webhook/sessions

Get list of all sessions and their update counts.

**Response**:
```json
{
  "sessionCount": 3,
  "totalUpdates": 15,
  "sessions": [
    {
      "sessionId": "session_1731668445123_abc123",
      "updateCount": 5,
      "firstUpdate": "2024-11-15T10:30:45.123Z",
      "lastUpdate": "2024-11-15T10:35:22.456Z"
    }
  ]
}
```

### GET /webhook/sessions/:sessionId

Get all updates for a specific session.

**Response**:
```json
{
  "sessionId": "session_1731668445123_abc123",
  "updateCount": 5,
  "updates": [
    {
      "code": "function twoSum(nums, target) { ... }",
      "language": "javascript",
      "timestamp": "2024-11-15T10:30:45.123Z",
      "receivedAt": "2024-11-15T10:30:46.456Z"
    }
  ]
}
```

## Configuration

### Environment Variables

```bash
# Port (default: 3001)
PORT=3001

# Optional API key for authentication
WEBHOOK_API_KEY=your-secret-key
```

### With API Key

If you set `WEBHOOK_API_KEY`, the server will require the `X-API-Key` header in all webhook requests.

Frontend configuration:
```env
NEXT_PUBLIC_WEBHOOK_API_KEY=your-secret-key
```

## Console Output Example

```
=================================
📝 Code Update Received
=================================
Session ID: session_1731668445123_abc123
User ID: N/A
Language: javascript
Timestamp: 2024-11-15T10:30:45.123Z
Code Length: 156 characters
Code Preview:
---
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map....
=================================
```

## Development Mode

For auto-restart on file changes:

```bash
npm run dev
```

This uses `nodemon` to automatically restart the server when you make changes.

## Storage

**Current**: In-memory storage (data is lost when server restarts)

**Production**: Replace with persistent storage:

### PostgreSQL Example
```javascript
const { Pool } = require('pg');
const pool = new Pool({ /* config */ });

app.post('/webhook/code-update', async (req, res) => {
  const { code, language, timestamp, sessionId } = req.body;
  
  await pool.query(
    'INSERT INTO code_updates (session_id, code, language, timestamp) VALUES ($1, $2, $3, $4)',
    [sessionId, code, language, timestamp]
  );
  
  res.json({ success: true });
});
```

### MongoDB Example
```javascript
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URI);

app.post('/webhook/code-update', async (req, res) => {
  const { code, language, timestamp, sessionId } = req.body;
  
  await client.db('interviews')
    .collection('code_updates')
    .insertOne({ code, language, timestamp, sessionId, createdAt: new Date() });
  
  res.json({ success: true });
});
```

## Testing

### Test with curl

```bash
curl -X POST http://localhost:3001/webhook/code-update \
  -H "Content-Type: application/json" \
  -d '{
    "code": "console.log(\"Hello World\");",
    "language": "javascript",
    "timestamp": "2024-11-15T10:30:45.123Z",
    "sessionId": "test_session_123"
  }'
```

### Test with the Frontend

1. Start this webhook server: `npm start`
2. Start the frontend: `cd ../frontend && npm run dev`
3. Open http://localhost:3000 in your browser
4. Type in the code editor
5. Watch this server's console for incoming webhook requests

## Security

### Production Checklist

- [ ] Use HTTPS (not HTTP)
- [ ] Set strong API key
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Sanitize input data
- [ ] Set up proper CORS policies
- [ ] Use environment variables for secrets
- [ ] Enable request logging
- [ ] Implement error tracking

### Example with Helmet and Rate Limiting

```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/webhook/', limiter);
```

## Deployment

### Deploy to Heroku

```bash
heroku create your-webhook-server
git push heroku main
heroku config:set WEBHOOK_API_KEY=your-secret-key
```

### Deploy to Railway

```bash
railway login
railway init
railway up
```

### Deploy to Vercel (Serverless)

Convert to serverless function in `api/webhook.js`:

```javascript
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Handle webhook
  const { code, language, timestamp, sessionId } = req.body;
  
  // Store in database
  // ...
  
  res.json({ success: true });
};
```

## Troubleshooting

### Server won't start
- Check if port 3001 is already in use
- Run `lsof -i :3001` to see what's using the port
- Kill the process or use a different port

### CORS errors
- Verify frontend URL in CORS configuration
- Check that frontend is running on http://localhost:3000

### No requests received
- Verify webhook URL in frontend configuration
- Check server is running
- Check firewall settings
- Look for errors in browser console

## Next Steps

- [ ] Add database integration (PostgreSQL, MongoDB, etc.)
- [ ] Implement real-time WebSocket updates
- [ ] Add code analysis and metrics
- [ ] Create admin dashboard
- [ ] Add user authentication
- [ ] Implement data export features
- [ ] Add automated tests
- [ ] Set up CI/CD pipeline

## License

MIT

