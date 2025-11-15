# Coding Interview App

An AI-powered coding interview platform with real-time voice interaction, code editing, and automated performance evaluation.

## Features

🎙️ **Voice Interview** - Conduct live coding interviews with an AI interviewer using ElevenLabs  
💻 **Code Editor** - Write and test code with syntax highlighting  
📊 **AI Evaluation** - Get comprehensive performance reports powered by Claude AI  
📈 **Detailed Grading** - Receive scores on coding skills, communication, and algorithmic thinking  
🔄 **Real-time Sync** - Automatic code saving and session tracking  

## Architecture

```
HackCodingInterview/
├── frontend/          # Next.js application
│   ├── app/          # Pages and API routes
│   ├── components/   # React components
│   └── lib/          # Utilities and helpers
└── backend/          # Webhook server (optional)
```

## Prerequisites

- **Node.js** 20.x or higher
- **npm** or **yarn**
- **ElevenLabs API Key** - [Get it here](https://elevenlabs.io/)
- **Anthropic API Key** - [Get it here](https://console.anthropic.com/)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd HackCodingInterview
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Set Up Environment Variables

Create a `.env` or `.env.local` file in the `frontend` directory:

```bash
# ElevenLabs API Key for voice interviews
ELEVEN_LABS_API_KEY=your_elevenlabs_api_key_here

# Anthropic API Key for AI-powered report generation
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional: Webhook API Key for security
WEBHOOK_API_KEY=your_webhook_api_key_here
```

**Getting API Keys:**

- **ElevenLabs**: Sign up at [elevenlabs.io](https://elevenlabs.io/) → Settings → API Key
- **Anthropic**: Sign up at [console.anthropic.com](https://console.anthropic.com/) → API Keys → Create Key

### 4. Verify Setup

Test that your API keys are working:

```bash
# Install dotenv if not already installed
npm install dotenv

# Run the test script
node test-transcript.js
```

You should see:
- ✅ API keys found
- ✅ Connection to ElevenLabs successful
- ✅ Connection to Anthropic successful

## Running the App

### Development Mode

```bash
cd frontend
npm run dev
```

The app will be available at: **http://localhost:3000**

### Production Build

```bash
cd frontend
npm run build
npm start
```

## Usage Guide

### 1. Start an Interview

1. Open http://localhost:3000
2. You'll see:
   - **Problem description** on the left
   - **Code editor** on the right
   - **AI agent widget** at the bottom

### 2. Conduct the Interview

1. **Start the conversation** with the AI agent (click the widget)
2. **Write your code** in the editor
3. The code **auto-saves** every 2 seconds
4. **Session ID** is displayed in the top right corner

### 3. Finish the Interview

1. Click the **"Finish Interview"** button (top right)
2. Wait while the system:
   - Fetches your conversation transcript
   - Retrieves your code
   - Generates a comprehensive report using Claude AI

### 4. View Your Report

The report includes:
- **Overall recommendation** (Strong Hire, Hire, Maybe, No Hire)
- **Performance summary**
- **Detailed grades** (1-10 scale):
  - Coding Skills
  - Communication
  - Algorithmic Thinking
- **Strengths** identified
- **Areas for improvement**

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx                    # Main interview page
│   ├── report/
│   │   └── page.tsx               # Report display page
│   ├── api/
│   │   ├── transcript/
│   │   │   └── route.ts           # Fetch ElevenLabs transcript
│   │   ├── generate-report/
│   │   │   └── route.ts           # Generate AI report with Claude
│   │   └── webhook/
│   │       └── code-update/
│   │           └── route.ts       # Store/retrieve code
│   ├── layout.tsx                 # App layout
│   └── globals.css                # Global styles
├── components/
│   ├── CodeEditor.tsx             # Monaco code editor
│   ├── ProblemViewer.tsx          # Problem description display
│   └── ui/                        # UI components (buttons, cards, etc.)
├── lib/
│   ├── session.ts                 # Session management
│   ├── webhook.ts                 # Webhook utilities
│   ├── webhook-config.ts          # Webhook configuration
│   └── utils.ts                   # Helper functions
├── .env                           # Environment variables (DO NOT COMMIT)
└── package.json                   # Dependencies
```

## API Routes

### GET `/api/transcript`

Fetches the latest interview conversation from ElevenLabs.

**Response:**
```json
{
  "transcript": "Full conversation text...",
  "conversationId": "conv_xxx",
  "startTime": 1234567890,
  "summary": "AI summary of conversation",
  "callDuration": 120
}
```

### POST `/api/generate-report`

Generates an evaluation report using Claude AI.

**Request:**
```json
{
  "transcript": "Full conversation and code...",
  "sessionId": "session_xxx",
  "codeData": {
    "code": "function twoSum(...) {...}",
    "language": "javascript"
  }
}
```

**Response:**
```json
{
  "report": {
    "summary": "...",
    "grades": {
      "codingSkills": { "score": 8, "feedback": "..." },
      "communication": { "score": 9, "feedback": "..." },
      "algorithmicThinking": { "score": 7, "feedback": "..." }
    },
    "strengths": ["...", "...", "..."],
    "areasForImprovement": ["...", "...", "..."],
    "recommendation": "Hire",
    "recommendationReasoning": "..."
  }
}
```

### POST/GET `/api/webhook/code-update`

Stores and retrieves code written during the interview.

**POST - Store code:**
```json
{
  "code": "function twoSum(...) {...}",
  "language": "javascript",
  "timestamp": "2025-11-15T15:30:00.000Z",
  "sessionId": "session_xxx"
}
```

**GET - Retrieve code:**
```
/api/webhook/code-update?sessionId=session_xxx
```

## Configuration

### ElevenLabs Agent Configuration

The ElevenLabs agent ID is configured in `app/page.tsx`:

```tsx
<elevenlabs-convai agent-id="agent_2401ka3jvjf2f1bbfb3c60fcppg3"></elevenlabs-convai>
```

To use your own agent:
1. Create an agent at [elevenlabs.io](https://elevenlabs.io/)
2. Copy your agent ID
3. Replace the `agent-id` in the code above

### Webhook Configuration

Edit `lib/webhook-config.ts` to configure the webhook:

```typescript
export const webhookConfig: WebhookConfig = {
  url: 'http://localhost:3000/api/webhook/code-update',
  enabled: true,
  headers: {
    // Add your webhook API key if needed
    // 'x-api-key': process.env.WEBHOOK_API_KEY || '',
  },
};
```

## Troubleshooting

### "No API keys found"

**Solution:** Make sure your `.env` or `.env.local` file exists in the `frontend` directory with:
```bash
ELEVEN_LABS_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

### "Failed to fetch transcript"

**Possible causes:**
1. No conversation was conducted before clicking "Finish Interview"
2. Invalid ElevenLabs API key
3. Agent ID doesn't match

**Solution:** 
- Have a conversation with the AI agent first
- Verify your API key is correct
- Check the agent ID in `app/page.tsx`

### "Failed to generate report"

**Possible causes:**
1. Invalid Anthropic API key
2. Insufficient API credits
3. Transcript is too long

**Solution:**
- Verify your Anthropic API key
- Check your Anthropic account credits
- Check the browser console and terminal for detailed error messages

### Hydration Errors

If you see hydration warnings in the console, clear your browser cache and refresh.

### Code Not Saving

**Check:**
1. Webhook is enabled in `lib/webhook-config.ts`
2. Browser console shows "Code update received"
3. Session ID is visible in the UI header

## Development

### Install Dependencies

```bash
cd frontend
npm install
```

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Run Tests

```bash
# Test API connections
node test-transcript.js

# Test specific features (from browser console)
fetch('/api/webhook/code-update').then(r => r.json()).then(console.log)
```

### Linting

```bash
npm run lint
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `ELEVEN_LABS_API_KEY` | Yes | ElevenLabs API key for voice interviews |
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for Claude AI |
| `WEBHOOK_API_KEY` | No | Optional API key for webhook security |

## Tech Stack

- **Frontend Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS
- **Code Editor**: Monaco Editor
- **Voice AI**: ElevenLabs ConvAI
- **Report AI**: Anthropic Claude 4.5 Sonnet
- **UI Components**: Radix UI
- **Language**: TypeScript

## Features in Detail

### Session Management

- Each interview gets a unique session ID
- Session IDs persist in `sessionStorage`
- Visible in UI for easy debugging
- Used to link code changes with interviews

### Code Auto-Save

- Code saves automatically every 2 seconds (debounced)
- Stored in-memory by default (resets on server restart)
- Can be extended to use a database for production

### AI-Powered Reports

- Claude AI analyzes both conversation and code
- Provides detailed feedback on multiple criteria
- Generates actionable recommendations
- Includes strengths and improvement areas

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `ELEVEN_LABS_API_KEY`
   - `ANTHROPIC_API_KEY`
4. Deploy!

### Other Platforms

The app is a standard Next.js application and can be deployed to:
- AWS Amplify
- Netlify
- Railway
- Any Node.js hosting platform

## Security Notes

⚠️ **Important:**
- Never commit `.env` or `.env.local` files to git
- Keep your API keys secret
- The `.env` files are already in `.gitignore`
- For production, use environment variables in your hosting platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Add your license here]

## Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Check the troubleshooting section above
- Review the error logs in the browser console and terminal

## Roadmap

- [ ] Database integration for persistent storage
- [ ] User authentication
- [ ] Multiple interview problems
- [ ] Code execution and testing
- [ ] Export reports as PDF
- [ ] Video recording of interviews
- [ ] Multi-language support

---

**Happy Interviewing! 🚀**

For more detailed documentation, see:
- `frontend/test-transcript.js` - Test script for API connections
- `frontend/lib/` - Utility functions and helpers
- API route files for implementation details
