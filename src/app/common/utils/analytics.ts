/**
 * Utilidad para registro de eventos personalizados en Umami Analytics
 * 100% amigable con la privacidad y libre de cookies de terceros.
 */

declare global {
  interface Window {
    umami?: {
      track: {
        (eventName: string, eventData?: Record<string, any>): void;
        (
          customPayload: (
            defaultPayload: Record<string, any>,
          ) => Record<string, any>,
        ): void;
      };
    };
  }
}

export function trackUmamiEvent(
  eventName: string,
  eventData?: Record<string, any>,
) {
  if (
    typeof window !== "undefined" &&
    window.umami &&
    typeof window.umami.track === "function"
  ) {
    try {
      window.umami.track(eventName, eventData);
    } catch {
      // Silenciar de forma segura si el usuario tiene bloqueador de rastreo estricto
    }
  }
}
