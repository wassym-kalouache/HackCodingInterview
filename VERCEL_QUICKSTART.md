# Vercel Deployment - Quick Start Guide

## ⚡ 5-Minute Deployment

Your app is now ready to deploy to Vercel with built-in webhook support!

## What's Ready

✅ **Frontend** - Next.js app with Monaco editor
✅ **Webhook API** - Serverless function at `/api/webhook/code-update`
✅ **Auto-configured** - No additional setup needed
✅ **Works locally** - Test before deploying

## Deploy Now

### Option 1: GitHub Integration (Recommended)

1. **Push to GitHub**
   ```bash
   cd /Users/wassymkalouache/Documents/Projects/Coding/HackCodingInterview
   git add .
   git commit -m "Add coding interview platform with webhooks"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select your repo
   - Set **Root Directory** to `frontend`
   - Click "Deploy"

3. **Add Environment Variables** (Optional)
   - Go to Settings → Environment Variables
   - Add: `WEBHOOK_API_KEY` = `your-secret-key`
   - Redeploy

4. **Done!** 🎉
   Your app is live at `https://your-app.vercel.app`

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel

# Add environment variable
vercel env add WEBHOOK_API_KEY

# Deploy to production
vercel --prod
```

## Test Your Deployment

### 1. Open Your App
```
https://your-app.vercel.app
```

### 2. Type in the Editor
Watch for the "Saved" indicator after typing

### 3. Check Webhook Logs
1. Go to Vercel Dashboard
2. Click your project → Deployments → Latest
3. Click "Functions" tab
4. Click `/api/webhook/code-update`
5. See real-time logs of code updates

### 4. Test the API Endpoint
```bash
curl -X POST https://your-app.vercel.app/api/webhook/code-update \
  -H "Content-Type: application/json" \
  -d '{
    "code": "console.log(\"Hello Vercel!\");",
    "language": "javascript",
    "timestamp": "2024-11-15T10:00:00Z",
    "sessionId": "test_session"
  }'
```

## How It Works

```
User Types Code
     ↓
Frontend (your-app.vercel.app)
     ↓
Webhook sends to: /api/webhook/code-update
     ↓
Serverless function processes
     ↓
Logs visible in Vercel Dashboard
```

## Environment Variables

### Required
None! It works out of the box.

### Optional (for security)
```
WEBHOOK_API_KEY=your-secret-key-here
```

Then update frontend to use it:
```
NEXT_PUBLIC_WEBHOOK_API_KEY=your-secret-key-here
```

## What Happens Next

The webhook currently **logs to Vercel console**. To store data:

### Option 1: Add Vercel Postgres
```bash
# In Vercel Dashboard: Storage → Create Database → Postgres
# Then in your code:
npm install @vercel/postgres
```

### Option 2: Add Supabase
```bash
npm install @supabase/supabase-js
```
Add env vars:
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your-key
```

### Option 3: Add MongoDB Atlas
```bash
npm install mongodb
```
Add env var:
```
MONGODB_URI=mongodb+srv://...
```

See `VERCEL_DEPLOYMENT.md` for complete database integration examples.

## File Structure

```
frontend/
├── app/
│   ├── api/
│   │   └── webhook/
│   │       └── code-update/
│   │           └── route.ts       ← Serverless webhook handler
│   ├── page.tsx                   ← Main app
│   └── layout.tsx
├── components/
│   └── CodeEditor.tsx             ← Sends webhooks
└── lib/
    ├── webhook.ts                 ← Webhook utilities
    └── webhook-config.ts          ← Auto-configured for Vercel
```

## Webhook Endpoint

Your webhook endpoint will be:
```
https://your-app.vercel.app/api/webhook/code-update
```

It automatically:
- ✅ Receives code updates
- ✅ Logs to Vercel console
- ✅ Returns success response
- ✅ Validates requests (if API key set)
- ✅ Handles errors gracefully

## Viewing Logs

### Real-time Logs
1. Vercel Dashboard → Your Project
2. Deployments → Latest
3. Functions → `/api/webhook/code-update`
4. See live logs as users type

### Log Format
```
=================================
📝 Code Update Received
=================================
Session ID: session_1731668445123_abc
Language: javascript
Timestamp: 2024-11-15T10:30:45Z
Code Length: 156 characters
Code Preview:
function twoSum(nums, target) { ... }
=================================
```

## Troubleshooting

### Webhook not working?

**Check 1**: Verify API route exists
```bash
curl https://your-app.vercel.app/api/webhook/code-update
```
Should return: `{ status: "ok", ... }`

**Check 2**: Check browser console for errors

**Check 3**: Check Vercel function logs

**Check 4**: Verify NEXT_PUBLIC_WEBHOOK_ENABLED is not 'false'

### 401 Unauthorized?

Remove or match API keys:
- In Vercel: Remove `WEBHOOK_API_KEY` OR
- Add `NEXT_PUBLIC_WEBHOOK_API_KEY` with same value

### No logs appearing?

- Wait a few seconds (cold start)
- Check correct function in Vercel dashboard
- Verify deployment is latest version

## Custom Domain

1. Go to Vercel Dashboard → Your Project
2. Settings → Domains
3. Add your domain
4. Update DNS records
5. Webhook URL becomes: `https://yourdomain.com/api/webhook/code-update`

## Cost

### Vercel Free Tier Includes:
- Unlimited deployments
- 100GB bandwidth/month
- 100GB-hours serverless execution
- ~10,000-100,000 webhook calls depending on execution time

### If You Exceed Free Tier:
- Vercel Pro: $20/month
- Includes 1TB bandwidth
- 1000 GB-hours execution

For this webhook use case, **free tier is plenty** for most users!

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Test webhook
3. ✅ Add database (optional)
4. ✅ Set up API key (optional)
5. ✅ Monitor logs
6. ✅ Add custom domain (optional)

## Summary

Your coding interview platform is **ready to deploy** with:
- ✅ Built-in webhook handler
- ✅ Automatic routing
- ✅ No separate backend needed
- ✅ Works in development and production
- ✅ Scales automatically
- ✅ Free to start

Just push to GitHub, connect to Vercel, and you're live! 🚀

## Need Help?

- **Detailed Guide**: See `VERCEL_DEPLOYMENT.md`
- **Webhook Setup**: See `WEBHOOK_INTEGRATION.md`
- **General Info**: See `WEBHOOK_SUMMARY.md`

---

**Ready to deploy?** → https://vercel.com/new

