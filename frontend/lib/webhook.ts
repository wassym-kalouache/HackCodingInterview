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

  console.log('[Webhook] Sending to:', config.url);
  console.log('[Webhook] Payload:', {
    codeLength: payload.code.length,
    language: payload.language,
    sessionId: payload.sessionId,
    timestamp: payload.timestamp,
    codePreview: payload.code.substring(0, 150) + (payload.code.length > 150 ? '...' : '')
  });

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
      const responseText = await response.text();
      console.error('[Webhook] Response:', responseText);
      return false;
    }

    const responseData = await response.json();
    console.log('[Webhook] ✅ Successfully sent code update');
    console.log('[Webhook] Response:', responseData);
    return true;
  } catch (error) {
    console.error('[Webhook] ❌ Error sending update:', error);
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
      console.log('[Webhook] ⏱️  Debouncing - resetting timer');
      clearTimeout(timeoutId);
    }

    console.log('[Webhook] ⏱️  Will send in', delayMs, 'ms');
    
    timeoutId = setTimeout(() => {
      console.log('[Webhook] ⏱️  Debounce complete - sending now!');
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

/**
 * Retrieve code from the webhook endpoint
 */
export async function getCodeUpdate(
  sessionId: string,
  config: WebhookConfig
): Promise<WebhookPayload | null> {
  if (!config.enabled || !config.url) {
    console.log('[Webhook] Disabled or no URL configured');
    return null;
  }

  try {
    const url = `${config.url}?sessionId=${encodeURIComponent(sessionId)}`;
    console.log('[Webhook] Retrieving code from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...config.headers,
      },
    });

    if (!response.ok) {
      console.error('[Webhook] Failed to retrieve code:', response.status, response.statusText);
      const responseText = await response.text();
      console.error('[Webhook] Response:', responseText);
      return null;
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error('[Webhook] API returned error:', data.message);
      return null;
    }

    console.log('[Webhook] ✅ Successfully retrieved code');
    console.log('[Webhook] Code length:', data.code?.length || 0);
    
    return {
      code: data.code,
      language: data.language,
      timestamp: data.timestamp,
      sessionId: data.sessionId,
      userId: data.userId,
    };
  } catch (error) {
    console.error('[Webhook] ❌ Error retrieving code:', error);
    return null;
  }
}

/**
 * Get all available sessions
 */
export async function getAvailableSessions(
  config: WebhookConfig
): Promise<string[]> {
  if (!config.enabled || !config.url) {
    console.log('[Webhook] Disabled or no URL configured');
    return [];
  }

  try {
    console.log('[Webhook] Retrieving available sessions from:', config.url);

    const response = await fetch(config.url, {
      method: 'GET',
      headers: {
        ...config.headers,
      },
    });

    if (!response.ok) {
      console.error('[Webhook] Failed to retrieve sessions:', response.status);
      return [];
    }

    const data = await response.json();
    console.log('[Webhook] ✅ Total sessions:', data.totalSessions);
    
    return data.sessions || [];
  } catch (error) {
    console.error('[Webhook] ❌ Error retrieving sessions:', error);
    return [];
  }
}

