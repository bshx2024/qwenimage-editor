/**
 * Umami Telemetry & Conversion Tracking Helper
 * Safely invokes window.umami.track() when available
 */

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, any>) => void;
    };
  }
}

export function trackUmamiEvent(eventName: string, eventData?: Record<string, any>): void {
  if (typeof window === 'undefined') return;
  try {
    if (window.umami && typeof window.umami.track === 'function') {
      window.umami.track(eventName, eventData);
    }
  } catch (err) {
    // Graceful silent fallback if adblocker blocks Umami
  }
}
