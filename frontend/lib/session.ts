/**
 * Session management for tracking interview sessions
 */

// Generate a unique session ID
export function generateSessionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `session_${timestamp}_${random}`;
}

// Store and retrieve session ID from sessionStorage
const SESSION_KEY = 'interview_session_id';

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') {
    // Server-side: return a temporary ID
    return generateSessionId();
  }

  let sessionId = sessionStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(SESSION_KEY, sessionId);
    console.log('[Session] Created new session ID:', sessionId);
  }
  
  return sessionId;
}

export function getSessionId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return sessionStorage.getItem(SESSION_KEY);
}

export function clearSessionId(): void {
  if (typeof window === 'undefined') {
    return;
  }
  sessionStorage.removeItem(SESSION_KEY);
  console.log('[Session] Cleared session ID');
}

export function setSessionId(sessionId: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  sessionStorage.setItem(SESSION_KEY, sessionId);
  console.log('[Session] Set session ID:', sessionId);
}

