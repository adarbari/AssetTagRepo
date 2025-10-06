/**
 * Global error handler utilities
 *
 * Handles common errors that occur from third-party libraries
 * like the CSS security error from Leaflet
 */

/**
 * Suppresses CSS security errors from external stylesheets
 * This is a known issue with libraries like Leaflet that load CSS from CDNs
 */
export function suppressCSSSecurityErrors() {
  // Store the original console.error
  const originalError = console.error;

  // Override console.error to filter out CSS security errors
  console.error = (...args: any[]) => {
    // Check if this is the CSS security error
    const errorMessage = args[0]?.toString() || '';

    if (
      errorMessage.includes('cssRules') ||
      errorMessage.includes('CSSStyleSheet') ||
      errorMessage.includes('Cannot access rules')
    ) {
      // Silently ignore this error - it's a known Leaflet/external CSS issue
      return;
    }

    // For all other errors, use the original console.error
    originalError.apply(console, args);
  };
}

/**
 * Global error event listener
 * Catches errors that would otherwise be uncaught
 */
export function setupGlobalErrorHandler() {
  window.addEventListener('error', event => {
    // Check if this is the CSS security error
    if (
      event.message?.includes('cssRules') ||
      event.message?.includes('CSSStyleSheet') ||
      event.message?.includes('Cannot access rules')
    ) {
      // Prevent the error from being logged
      event.preventDefault();
      event.stopPropagation();
      return false;
    }

    // Allow other errors to bubble up normally
    return true;
  });

  // Also handle unhandled promise rejections
  window.addEventListener('unhandledrejection', event => {
    const errorMessage = event.reason?.toString() || '';

    if (
      errorMessage.includes('cssRules') ||
      errorMessage.includes('CSSStyleSheet') ||
      errorMessage.includes('Cannot access rules')
    ) {
      // Prevent the error from being logged
      event.preventDefault();
      return false;
    }

    // Allow other rejections to bubble up normally
    return true;
  });
}

/**
 * Safe wrapper for accessing CSS rules
 * Use this when you need to programmatically access stylesheet rules
 */
export function safeGetCSSRules(stylesheet: CSSStyleSheet): CSSRuleList | null {
  try {
    return stylesheet.cssRules;
  } catch (error) {
    // CSS security error - stylesheet is from a different origin
    console.warn('Cannot access CSS rules from external stylesheet:', error);
    return null;
  }
}

/**
 * Initialize all error handlers
 * Call this once at app startup
 */
export function initializeErrorHandlers() {
  suppressCSSSecurityErrors();
  setupGlobalErrorHandler();
}
