/**
 * Suppress non-critical Supabase auth errors that occur during token refresh
 * These errors are often transient network issues and don't need to be shown to users
 */
export function suppressSupabaseAuthErrors() {
  if (typeof window === 'undefined') return;

  const originalError = console.error;
  const originalWarn = console.warn;

  // Suppress Supabase auth token refresh errors
  console.error = function (...args: any[]) {
    const message = args[0]?.toString?.() || String(args[0]);

    // Suppress Supabase auth-js errors
    if (
      message?.includes?.('_handleRequest') ||
      message?.includes?.('_request') ||
      message?.includes?.('_refreshAccessToken') ||
      message?.includes?.('GoTrueClient') ||
      (args[1]?.toString?.()?.includes?.('@supabase') || args[1]?.code?.includes?.('PGRST')) ||
      message?.includes?.('401') ||
      message?.includes?.('network') ||
      message?.includes?.('fetch')
    ) {
      // Don't log these errors - they're often transient
      return;
    }

    // Log other errors normally
    originalError.apply(console, args as any);
  };

  console.warn = function (...args: any[]) {
    const message = args[0]?.toString?.() || String(args[0]);

    // Suppress Supabase auth-js warnings
    if (
      message?.includes?.('_handleRequest') ||
      message?.includes?.('@supabase/auth-js') ||
      message?.includes?.('token refresh')
    ) {
      return;
    }

    // Log other warnings normally
    originalWarn.apply(console, args as any);
  };
}
