/**
 * Webhook Configuration
 * 
 * Configure your webhook endpoint here or use environment variables
 */

import type { WebhookConfig } from './webhook';

export const webhookConfig: WebhookConfig = {
  // Webhook endpoint URL
  // Uses Vercel API route by default (works in both dev and production)
  // For external backend, set NEXT_PUBLIC_WEBHOOK_URL environment variable
  url: process.env.NEXT_PUBLIC_WEBHOOK_URL || 
       (typeof window !== 'undefined' 
         ? `${window.location.origin}/api/webhook/code-update`
         : '/api/webhook/code-update'),
  
  // Enable/disable webhook (enabled by default)
  enabled: process.env.NEXT_PUBLIC_WEBHOOK_ENABLED !== 'false',
  
  // Optional custom headers (e.g., authentication)
  headers: {
    'X-API-Key': process.env.NEXT_PUBLIC_WEBHOOK_API_KEY || '',
    // Add more headers as needed
  },
};

// Debounce delay in milliseconds (how long to wait after user stops typing)
export const WEBHOOK_DEBOUNCE_DELAY = 2000; // 2 seconds

