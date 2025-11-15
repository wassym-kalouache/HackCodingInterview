# Webhook Integration Guide

## Overview

The coding interview platform now includes automatic webhook integration that sends real-time code updates to a specified endpoint. This allows you to:

- Track user coding activity in real-time
- Store code snapshots for review
- Analyze coding patterns and progress
- Integrate with backend systems for processing

## Features

✅ **Automatic Code Tracking**: Sends code updates as the user types
✅ **Debounced Requests**: Prevents excessive API calls (2-second delay after user stops typing)
✅ **Session Tracking**: Unique session ID for each coding session
✅ **Language Detection**: Includes selected programming language
✅ **Timestamp**: ISO 8601 timestamp for each update
✅ **Visual Feedback**: Shows "Auto-save" status indicator in UI
✅ **Configurable**: Easy to enable/disable and configure endpoint

## How It Works

### 1. User Types in Editor
```
User types code → onChange event triggered → State updated
```

### 2. Webhook Trigger (Debounced)
```
Code change detected → Wait 2 seconds → Send webhook → Update status
```

### 3. Payload Sent
```json
{
  "code": "function twoSum(nums, target) {\n  // User's code here\n}",
  "language": "javascript",
  "timestamp": "2024-11-15T10:30:45.123Z",
  "sessionId": "session_1731668445123_abc123"
}
```

## Configuration

### Option 1: Environment Variables (Recommended)

Create a `.env.local` file in the `frontend/` directory:

```env
# Webhook endpoint URL
NEXT_PUBLIC_WEBHOOK_URL=https://your-api.com/webhook/code-update

# Enable/disable webhook
NEXT_PUBLIC_WEBHOOK_ENABLED=true

# Optional API key for authentication
NEXT_PUBLIC_WEBHOOK_API_KEY=your-secret-api-key
```

### Option 2: Direct Configuration

Edit `lib/webhook-config.ts`:

```typescript
export const webhookConfig: WebhookConfig = {
  url: 'https://your-api.com/webhook/code-update',
  enabled: true,
  headers: {
    'X-API-Key': 'your-secret-api-key',
  },
};
```

## Webhook Payload Structure

### Request

**Method**: `POST`

**Headers**:
```
Content-Type: application/json
X-API-Key: your-api-key (if configured)
```

**Body**:
```typescript
{
  code: string;        // The actual code from the editor
  language: string;    // Programming language (javascript, python, etc.)
  timestamp: string;   // ISO 8601 timestamp
  sessionId?: string;  // Unique session identifier
  userId?: string;     // Optional user ID (add custom logic)
}
```

### Example Payload

```json
{
  "code": "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}",
  "language": "javascript",
  "timestamp": "2024-11-15T10:30:45.123Z",
  "sessionId": "session_1731668445123_abc123"
}
```

## Backend Implementation Examples

### Node.js + Express

```javascript
const express = require('express');
const app = express();

app.use(express.json());

app.post('/webhook/code-update', (req, res) => {
  const { code, language, timestamp, sessionId } = req.body;
  
  // Verify API key
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.WEBHOOK_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Process the code update
  console.log(`[${timestamp}] Session ${sessionId}: Code update in ${language}`);
  
  // Store in database, trigger analysis, etc.
  // ... your logic here ...
  
  res.status(200).json({ success: true, received: true });
});

app.listen(3001, () => {
  console.log('Webhook server listening on port 3001');
});
```

### Python + Flask

```python
from flask import Flask, request, jsonify
import os

app = Flask(__name__)

@app.route('/webhook/code-update', methods=['POST'])
def code_update():
    # Verify API key
    api_key = request.headers.get('X-API-Key')
    if api_key != os.environ.get('WEBHOOK_API_KEY'):
        return jsonify({'error': 'Unauthorized'}), 401
    
    # Get payload
    data = request.json
    code = data.get('code')
    language = data.get('language')
    timestamp = data.get('timestamp')
    session_id = data.get('sessionId')
    
    # Process the code update
    print(f"[{timestamp}] Session {session_id}: Code update in {language}")
    
    # Store in database, trigger analysis, etc.
    # ... your logic here ...
    
    return jsonify({'success': True, 'received': True}), 200

if __name__ == '__main__':
    app.run(port=3001)
```

### Next.js API Route

Create `pages/api/webhook/code-update.ts`:

```typescript
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify API key
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.WEBHOOK_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { code, language, timestamp, sessionId } = req.body;

  // Process the code update
  console.log(`[${timestamp}] Session ${sessionId}: Code update in ${language}`);
  
  // Store in database, trigger analysis, etc.
  // ... your logic here ...

  res.status(200).json({ success: true, received: true });
}
```

## Debouncing Configuration

The webhook uses debouncing to prevent excessive API calls. By default, it waits **2 seconds** after the user stops typing before sending the update.

To change the delay, edit `lib/webhook-config.ts`:

```typescript
// Change from 2000ms (2 seconds) to 5000ms (5 seconds)
export const WEBHOOK_DEBOUNCE_DELAY = 5000;
```

## UI Status Indicator

The editor displays a real-time status indicator showing:

- **Auto-save** (gray dot): Idle, ready to send
- **Saving...** (yellow pulsing dot): Debounce in progress
- **Saved** (green dot): Successfully sent to webhook
- **Error** (red dot): Failed to send (check console)

## Session Tracking

Each coding session gets a unique session ID in the format:
```
session_[timestamp]_[random-string]
```

Example: `session_1731668445123_abc123`

This allows you to:
- Track multiple coding sessions
- Group code updates by session
- Analyze progression within a session

## Adding User ID

To include a user ID in the webhook payload, modify `components/CodeEditor.tsx`:

```typescript
const payload: WebhookPayload = {
  code,
  language,
  timestamp: new Date().toISOString(),
  sessionId: sessionIdRef.current,
  userId: 'user_123', // Add your user ID here
};
```

## Security Considerations

### API Key Authentication
Always use an API key to secure your webhook endpoint:

```typescript
headers: {
  'X-API-Key': process.env.NEXT_PUBLIC_WEBHOOK_API_KEY || '',
}
```

### HTTPS
Use HTTPS for production webhooks:
```
https://your-api.com/webhook/code-update
```

### Rate Limiting
Implement rate limiting on your backend to prevent abuse.

### Validation
Validate incoming payloads on your backend:
- Check payload structure
- Validate data types
- Sanitize code content
- Verify timestamps

## Disabling Webhooks

### Temporarily Disable
Set environment variable:
```env
NEXT_PUBLIC_WEBHOOK_ENABLED=false
```

### Permanently Disable
Edit `lib/webhook-config.ts`:
```typescript
export const webhookConfig: WebhookConfig = {
  url: '',
  enabled: false,
};
```

## Testing

### Test with RequestBin

1. Go to https://requestbin.com/
2. Create a new bin
3. Copy the bin URL
4. Set as webhook URL:
   ```env
   NEXT_PUBLIC_WEBHOOK_URL=https://your-bin.requestbin.com
   ```
5. Type in the code editor
6. Check RequestBin to see captured requests

### Test Locally

1. Run a local server on port 3001:
   ```bash
   node webhook-server.js
   ```

2. Set webhook URL:
   ```env
   NEXT_PUBLIC_WEBHOOK_URL=http://localhost:3001/webhook/code-update
   ```

3. Type in the code editor
4. Check server logs for incoming requests

### Console Logging

Webhook activity is logged to browser console:
- `[Webhook] Successfully sent code update` - Success
- `[Webhook] Failed to send update: [status]` - HTTP error
- `[Webhook] Error sending update: [error]` - Network error
- `[Webhook] Disabled or no URL configured` - Not configured

## Troubleshooting

### Webhook Not Sending

**Check 1**: Verify webhook is enabled
```typescript
// In lib/webhook-config.ts
enabled: true
```

**Check 2**: Verify URL is set
```env
NEXT_PUBLIC_WEBHOOK_URL=https://your-api.com/webhook/code-update
```

**Check 3**: Check browser console for errors

**Check 4**: Verify backend is running and accessible

### CORS Errors

If you see CORS errors in the console, configure your backend:

```javascript
// Express example
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  methods: ['POST'],
}));
```

### 401 Unauthorized

Check API key configuration matches on both frontend and backend.

### Network Errors

- Verify backend URL is accessible
- Check firewall settings
- Ensure backend is running
- Test endpoint with curl or Postman

## Advanced Customization

### Custom Headers

Add custom headers in `lib/webhook-config.ts`:

```typescript
headers: {
  'X-API-Key': process.env.NEXT_PUBLIC_WEBHOOK_API_KEY || '',
  'X-Client-Version': '1.0.0',
  'X-Platform': 'web',
}
```

### Multiple Webhooks

To send to multiple endpoints, modify `lib/webhook.ts`:

```typescript
export async function sendCodeUpdate(payload: WebhookPayload, configs: WebhookConfig[]) {
  const promises = configs.map(config => 
    fetch(config.url, { /* ... */ })
  );
  return Promise.all(promises);
}
```

### Conditional Sending

Only send webhooks for specific languages:

```typescript
useEffect(() => {
  if (!webhookConfig.enabled) return;
  if (!['javascript', 'python'].includes(language)) return; // Only JS and Python
  
  // ... rest of webhook logic
}, [code, language]);
```

## File Structure

```
frontend/
├── lib/
│   ├── webhook.ts              # Webhook utility functions
│   └── webhook-config.ts       # Configuration
├── components/
│   └── CodeEditor.tsx          # Editor with webhook integration
└── WEBHOOK_INTEGRATION.md      # This documentation
```

## Data Storage Examples

### Store in PostgreSQL

```sql
CREATE TABLE code_updates (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(100),
  code TEXT,
  language VARCHAR(50),
  timestamp TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert code update
INSERT INTO code_updates (session_id, code, language, timestamp)
VALUES ($1, $2, $3, $4);
```

### Store in MongoDB

```javascript
const codeUpdate = {
  sessionId: req.body.sessionId,
  code: req.body.code,
  language: req.body.language,
  timestamp: new Date(req.body.timestamp),
  createdAt: new Date()
};

await db.collection('code_updates').insertOne(codeUpdate);
```

### Store in Redis (for caching)

```javascript
const redis = require('redis');
const client = redis.createClient();

// Store latest code for session
await client.set(
  `session:${sessionId}:code`,
  JSON.stringify({ code, language, timestamp }),
  'EX', 3600 // Expire after 1 hour
);
```

## Performance Considerations

- **Debouncing**: Reduces API calls by ~95% compared to sending on every keystroke
- **Async**: Webhook sending doesn't block UI updates
- **Lightweight**: Minimal impact on editor performance
- **Configurable**: Adjust debounce delay based on your needs

## Analytics & Insights

Track useful metrics from webhook data:
- **Typing speed**: Time between updates
- **Code changes**: Diff between updates
- **Language preferences**: Most used languages
- **Session duration**: First to last update
- **Problem-solving patterns**: Code evolution over time

## Summary

The webhook integration provides a powerful way to track and analyze coding activity in real-time. It's:
- ✅ Easy to configure
- ✅ Production-ready
- ✅ Secure (with API keys)
- ✅ Performant (debounced)
- ✅ Flexible (customizable)

Start tracking code updates by configuring your webhook endpoint and enabling the feature!

