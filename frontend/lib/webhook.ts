/**
 * Webhook utility for sending code editor updates
 */

export interface WebhookPayload {
  code: string;
  language: string;
  timestamp: string;
  sessionId?: string;
  userId?: string;
}

export interface WebhookConfig {
  url: string;
  enabled: boolean;
  headers?: Record<string, string>;
}

/**
 * Send code update to webhook endpoint
 */
export async function sendCodeUpdate(
  payload: WebhookPayload,
  config: WebhookConfig
): Promise<boolean> {
  if (!config.enabled || !config.url) {
    console.log('[Webhook] Disabled or no URL configured');
    return false;
  }

  try {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('[Webhook] Failed to send update:', response.status, response.statusText);
      return false;
    }

    console.log('[Webhook] Successfully sent code update');
    return true;
  } catch (error) {
    console.error('[Webhook] Error sending update:', error);
    return false;
  }
}

/**
 * Create a debounced version of the webhook sender
 * This prevents excessive API calls while user is typing
 */
export function createDebouncedWebhook(
  config: WebhookConfig,
  delayMs: number = 2000
) {
  let timeoutId: NodeJS.Timeout | null = null;

  return (payload: WebhookPayload) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      sendCodeUpdate(payload, config);
    }, delayMs);
  };
}

/**
 * Generate a session ID for tracking user sessions
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

