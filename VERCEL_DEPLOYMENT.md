# Deploying to Vercel with Webhooks

## Overview

When deploying to Vercel, you have two main options for handling webhooks:

1. **Vercel Serverless Functions** (Recommended) - Deploy webhook as part of your Next.js app
2. **External Backend** - Deploy the webhook server separately (Railway, Heroku, etc.)

## Option 1: Vercel Serverless Functions (Recommended)

This is the easiest option - your webhook runs as a serverless function within your Vercel deployment.

### Step 1: Create API Route

Create a new file in your frontend: `app/api/webhook/code-update/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Verify API key (optional but recommended)
    const apiKey = request.headers.get('x-api-key');
    if (process.env.WEBHOOK_API_KEY && apiKey !== process.env.WEBHOOK_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { code, language, timestamp, sessionId, userId } = body;

    // Log the code update (visible in Vercel logs)
    console.log('📝 Code Update Received:');
    console.log('Session ID:', sessionId);
    console.log('Language:', language);
    console.log('Timestamp:', timestamp);
    console.log('Code Length:', code?.length || 0);

    // Here you would typically:
    // 1. Store in database (Vercel Postgres, Supabase, MongoDB Atlas, etc.)
    // 2. Send to analytics service
    // 3. Trigger other webhooks
    // 4. Process the code

    // Example: Store in Vercel Postgres
    // const { sql } = await import('@vercel/postgres');
    // await sql`
    //   INSERT INTO code_updates (session_id, code, language, timestamp)
    //   VALUES (${sessionId}, ${code}, ${language}, ${timestamp})
    // `;

    // Example: Store in Supabase
    // const { createClient } = await import('@supabase/supabase-js');
    // const supabase = createClient(
    //   process.env.SUPABASE_URL!,
    //   process.env.SUPABASE_KEY!
    // );
    // await supabase.from('code_updates').insert({
    //   session_id: sessionId,
    //   code,
    //   language,
    //   timestamp,
    // });

    return NextResponse.json({
      success: true,
      received: true,
      sessionId,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: Handle OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { status: 200 });
}
```

### Step 2: Update Webhook Configuration

Update `frontend/lib/webhook-config.ts`:

```typescript
export const webhookConfig: WebhookConfig = {
  // Use relative URL for same-domain API route
  url: process.env.NEXT_PUBLIC_WEBHOOK_URL || '/api/webhook/code-update',
  
  enabled: process.env.NEXT_PUBLIC_WEBHOOK_ENABLED !== 'false', // Enabled by default
  
  headers: {
    'X-API-Key': process.env.NEXT_PUBLIC_WEBHOOK_API_KEY || '',
  },
};
```

### Step 3: Configure Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:

```
WEBHOOK_API_KEY=your-secret-key-here
NEXT_PUBLIC_WEBHOOK_ENABLED=true
```

**Note**: For the serverless function approach, you don't need to set `NEXT_PUBLIC_WEBHOOK_URL` because it uses a relative path.

### Step 4: Deploy to Vercel

```bash
cd frontend
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

### Step 5: Verify

After deployment, your webhook URL will be:
```
https://your-app.vercel.app/api/webhook/code-update
```

Test it with curl:
```bash
curl -X POST https://your-app.vercel.app/api/webhook/code-update \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secret-key-here" \
  -d '{
    "code": "console.log(\"test\");",
    "language": "javascript",
    "timestamp": "2024-11-15T10:00:00Z",
    "sessionId": "test_session"
  }'
```

---

## Option 2: External Backend Server

If you prefer to keep your webhook logic separate or need more control, deploy the backend elsewhere.

### Popular Options:

#### A. Railway (Easiest)

1. **Sign up**: https://railway.app
2. **Create new project** → **Deploy from GitHub**
3. **Connect backend folder**
4. Railway will auto-detect Node.js and deploy
5. **Add environment variables** in Railway dashboard:
   ```
   WEBHOOK_API_KEY=your-secret-key
   PORT=3001
   ```
6. **Copy the Railway URL**: `https://your-app.railway.app`

#### B. Heroku

```bash
cd backend
heroku create your-webhook-server
heroku config:set WEBHOOK_API_KEY=your-secret-key
git push heroku main
```

#### C. Render

1. Go to https://render.com
2. Create **New Web Service**
3. Connect your repo → select `backend` folder
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variables

#### D. DigitalOcean App Platform

1. Go to https://cloud.digitalocean.com/apps
2. Create app from GitHub
3. Select backend folder
4. Configure environment variables
5. Deploy

### Configure Frontend for External Backend

After deploying your backend, update Vercel environment variables:

1. Go to Vercel project → **Settings** → **Environment Variables**
2. Add:

```
NEXT_PUBLIC_WEBHOOK_URL=https://your-backend.railway.app/webhook/code-update
NEXT_PUBLIC_WEBHOOK_ENABLED=true
NEXT_PUBLIC_WEBHOOK_API_KEY=your-secret-key
```

3. Redeploy frontend

---

## Database Integration (Production)

For production, you'll want to store code updates in a database.

### Vercel Postgres

**Install**:
```bash
npm install @vercel/postgres
```

**Create table**:
```sql
CREATE TABLE code_updates (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(100),
  user_id VARCHAR(100),
  code TEXT,
  language VARCHAR(50),
  timestamp TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_session_id ON code_updates(session_id);
CREATE INDEX idx_created_at ON code_updates(created_at);
```

**Use in API route**:
```typescript
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  const { code, language, timestamp, sessionId } = await request.json();
  
  await sql`
    INSERT INTO code_updates (session_id, code, language, timestamp)
    VALUES (${sessionId}, ${code}, ${language}, ${timestamp})
  `;
  
  return NextResponse.json({ success: true });
}
```

### Supabase

**Install**:
```bash
npm install @supabase/supabase-js
```

**Setup** in Vercel environment variables:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

**Use in API route**:
```typescript
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!
  );
  
  const { code, language, timestamp, sessionId } = await request.json();
  
  const { error } = await supabase
    .from('code_updates')
    .insert({
      session_id: sessionId,
      code,
      language,
      timestamp,
    });
  
  if (error) throw error;
  
  return NextResponse.json({ success: true });
}
```

### MongoDB Atlas

**Install**:
```bash
npm install mongodb
```

**Setup**:
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/database
```

**Use in API route**:
```typescript
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!);

export async function POST(request: NextRequest) {
  await client.connect();
  
  const { code, language, timestamp, sessionId } = await request.json();
  
  await client.db().collection('code_updates').insertOne({
    sessionId,
    code,
    language,
    timestamp,
    createdAt: new Date(),
  });
  
  return NextResponse.json({ success: true });
}
```

---

## Complete Deployment Checklist

### Frontend (Vercel)

- [ ] Create Vercel account
- [ ] Connect GitHub repository
- [ ] Configure root directory to `frontend`
- [ ] Add environment variables:
  ```
  NEXT_PUBLIC_WEBHOOK_ENABLED=true
  WEBHOOK_API_KEY=your-secret-key
  NEXT_PUBLIC_WEBHOOK_API_KEY=your-secret-key
  ```
- [ ] Deploy
- [ ] Test webhook endpoint

### Backend (If using Option 2)

- [ ] Choose hosting provider (Railway, Heroku, etc.)
- [ ] Deploy backend code
- [ ] Set environment variables
- [ ] Get deployed URL
- [ ] Update frontend `NEXT_PUBLIC_WEBHOOK_URL` in Vercel
- [ ] Redeploy frontend

### Database (Optional but recommended)

- [ ] Choose database provider
- [ ] Create database and tables
- [ ] Get connection string
- [ ] Add to Vercel environment variables
- [ ] Update API route to use database
- [ ] Test database connection

---

## Environment Variables Reference

### Vercel Environment Variables (Option 1: Serverless)

```env
# Required
WEBHOOK_API_KEY=your-secret-key-here

# Optional (defaults work fine)
NEXT_PUBLIC_WEBHOOK_ENABLED=true

# Database (if using)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your-key
# OR
POSTGRES_URL=postgres://...
# OR
MONGODB_URI=mongodb+srv://...
```

### Vercel Environment Variables (Option 2: External Backend)

```env
# Required
NEXT_PUBLIC_WEBHOOK_URL=https://your-backend.railway.app/webhook/code-update
NEXT_PUBLIC_WEBHOOK_ENABLED=true
NEXT_PUBLIC_WEBHOOK_API_KEY=your-secret-key
```

---

## Testing Your Deployment

### Test 1: Health Check

```bash
# For Vercel Serverless (create health endpoint)
curl https://your-app.vercel.app/api/health

# For external backend
curl https://your-backend.railway.app/health
```

### Test 2: Webhook Endpoint

```bash
curl -X POST https://your-app.vercel.app/api/webhook/code-update \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secret-key" \
  -d '{
    "code": "console.log(\"Hello from production!\");",
    "language": "javascript",
    "timestamp": "2024-11-15T10:00:00Z",
    "sessionId": "test_session_production"
  }'
```

Expected response:
```json
{
  "success": true,
  "received": true,
  "sessionId": "test_session_production",
  "timestamp": "2024-11-15T10:00:01Z"
}
```

### Test 3: From Frontend

1. Open your deployed app
2. Type in the code editor
3. Watch for "Saved" indicator
4. Check Vercel logs:
   - Go to Vercel Dashboard → Deployments → Functions
   - Click on your API route
   - View real-time logs

---

## Monitoring & Debugging

### View Logs in Vercel

1. Go to your project in Vercel
2. Click **Deployments** → Select latest deployment
3. Click **Functions** tab
4. Click on `/api/webhook/code-update`
5. View real-time logs

### Using Vercel Analytics

Add to your API route:
```typescript
import { track } from '@vercel/analytics/server';

export async function POST(request: NextRequest) {
  await track('code_update', {
    sessionId,
    language,
    codeLength: code.length,
  });
  
  // ... rest of handler
}
```

### Error Tracking with Sentry

```bash
npm install @sentry/nextjs
```

Initialize in `app/api/webhook/code-update/route.ts`:
```typescript
import * as Sentry from '@sentry/nextjs';

export async function POST(request: NextRequest) {
  try {
    // ... your code
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
}
```

---

## Security Best Practices

### 1. Always Use API Keys

```typescript
const apiKey = request.headers.get('x-api-key');
if (!apiKey || apiKey !== process.env.WEBHOOK_API_KEY) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### 2. Rate Limiting

Install `@upstash/ratelimit`:
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function POST(request: NextRequest) {
  const ip = request.ip ?? 'anonymous';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  
  // ... rest of handler
}
```

### 3. Validate Input

```typescript
const schema = z.object({
  code: z.string().max(100000), // Max 100KB
  language: z.enum(['javascript', 'typescript', 'python', 'java', 'cpp']),
  timestamp: z.string().datetime(),
  sessionId: z.string().min(10).max(100),
});

const body = schema.parse(await request.json());
```

### 4. Use Environment Variables

Never hardcode secrets:
```typescript
// ❌ Bad
const apiKey = 'my-secret-key';

// ✅ Good
const apiKey = process.env.WEBHOOK_API_KEY;
```

---

## Cost Considerations

### Vercel Serverless Functions

- **Free tier**: 100GB-hours/month
- **Pro tier**: $20/month + overage
- Each webhook call ≈ 50-200ms execution
- ~1,000-10,000 updates = ~0.01-0.5 GB-hours

### External Backend Hosting

- **Railway**: $5/month for 512MB RAM
- **Heroku**: $7/month for basic dyno
- **Render**: $7/month for starter instance
- **DigitalOcean**: $5/month for basic droplet

### Database Costs

- **Vercel Postgres**: Included in Pro plan
- **Supabase**: Free tier (500MB), $25/month for Pro
- **MongoDB Atlas**: Free tier (512MB), $9/month for M10
- **PlanetScale**: Free tier (5GB), $29/month for Scaler

---

## Recommended Setup (Best Practices)

```
┌─────────────────────────────────────────┐
│         Vercel (Frontend + API)          │
│                                          │
│  • Next.js app                          │
│  • Serverless API route                 │
│  • Handles webhooks                     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│          Supabase (Database)            │
│                                          │
│  • Stores code updates                  │
│  • Real-time subscriptions              │
│  • Authentication (optional)            │
└─────────────────────────────────────────┘
```

**Why this setup?**
- ✅ Everything in one place (easier to manage)
- ✅ No CORS issues (same domain)
- ✅ Automatic scaling
- ✅ Built-in monitoring
- ✅ Easy environment variables
- ✅ Cost-effective

---

## Quick Start Commands

### Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy frontend
cd frontend
vercel

# Add environment variables
vercel env add WEBHOOK_API_KEY
vercel env add NEXT_PUBLIC_WEBHOOK_ENABLED

# Production deployment
vercel --prod
```

### Deploy with GitHub Integration

1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. Set root directory to `frontend`
5. Add environment variables
6. Deploy

---

## Summary

**For most users, I recommend Option 1 (Vercel Serverless)**:
- ✅ Easier to set up
- ✅ No CORS issues
- ✅ One deployment
- ✅ Scales automatically
- ✅ Cheaper for low-medium traffic

**Use Option 2 (External Backend) if you**:
- Need persistent connections (WebSockets)
- Need custom runtime or long-running processes
- Want complete control over backend infrastructure
- Already have backend infrastructure

The webhook will work seamlessly in production with either option! 🚀

