import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  suppressCSSSecurityErrors,
  setupGlobalErrorHandler,
  safeGetCSSRules,
  initializeErrorHandlers,
} from '../errorHandler';

describe('Error Handler Utilities', () => {
  let originalConsoleError: typeof console.error;
  let originalAddEventListener: typeof window.addEventListener;
  let originalRemoveEventListener: typeof window.removeEventListener;

  beforeEach(() => {
    // Store original methods
    originalConsoleError = console.error;
    originalAddEventListener = window.addEventListener;
    originalRemoveEventListener = window.removeEventListener;

    // Mock console.error
// console.error = vi.fn();
  });

  afterEach(() => {
    // Restore original methods
// console.error = originalConsoleError;
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
    vi.restoreAllMocks();
  });

  describe('suppressCSSSecurityErrors', () => {
    it('should suppress CSS security errors from console.error', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      suppressCSSSecurityErrors();

      // Test CSS security error messages
      const cssErrors = [
        'Cannot access rules of CSSStyleSheet',
        'cssRules property is not accessible',
        'CSSStyleSheet rules cannot be accessed',
      ];

      cssErrors.forEach(errorMessage => {
// // // // // // // console.error(errorMessage);
        expect(consoleSpy).not.toHaveBeenCalledWith(errorMessage);
      });

      consoleSpy.mockRestore();
    });

    it('should allow other errors to pass through', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      suppressCSSSecurityErrors();

      const regularError = 'This is a regular error';
// // // // // // // console.error(regularError);

      expect(consoleSpy).toHaveBeenCalledWith(regularError);
      consoleSpy.mockRestore();
    });

    it('should handle multiple arguments in console.error', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      suppressCSSSecurityErrors();

      // CSS security error with multiple args
// // // // // // // console.error('CSSStyleSheet error', { details: 'test' });
      expect(consoleSpy).not.toHaveBeenCalledWith('CSSStyleSheet error', {
        details: 'test',
      });

      // Regular error with multiple args
// // // // // // // console.error('Regular error', { details: 'test' });
      expect(consoleSpy).toHaveBeenCalledWith('Regular error', {
        details: 'test',
      });

      consoleSpy.mockRestore();
    });

    it('should handle undefined or null error messages', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      suppressCSSSecurityErrors();

// // // // // // // console.error(undefined);
// // // // // // // console.error(null);
// // // // // // // console.error('');

      // Should not throw and should allow these through
      expect(consoleSpy).toHaveBeenCalledWith(undefined);
      expect(consoleSpy).toHaveBeenCalledWith(null);
      expect(consoleSpy).toHaveBeenCalledWith('');

      consoleSpy.mockRestore();
    });
  });

  describe('setupGlobalErrorHandler', () => {
    let mockAddEventListener: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockAddEventListener = vi.fn();
      window.addEventListener = mockAddEventListener;
    });

    it('should set up error event listeners', () => {
      setupGlobalErrorHandler();

      expect(mockAddEventListener).toHaveBeenCalledWith(
        'error',
        expect.any(Function)
      );
      expect(mockAddEventListener).toHaveBeenCalledWith(
        'unhandledrejection',
        expect.any(Function)
      );
    });

    it('should prevent CSS security errors from bubbling up', () => {
      setupGlobalErrorHandler();

      // Get the error event handler
      const errorHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'error'
      )?.[1];

      expect(errorHandler).toBeDefined();

      // Create a mock error event
      const mockEvent = {
        message: 'Cannot access rules of CSSStyleSheet',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      };

      // Call the handler
      const result = errorHandler!(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should allow other errors to bubble up normally', () => {
      setupGlobalErrorHandler();

      const errorHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'error'
      )?.[1];

      const mockEvent = {
        message: 'Regular JavaScript error',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      };

      const result = errorHandler!(mockEvent);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle unhandled promise rejections', () => {
      setupGlobalErrorHandler();

      const rejectionHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'unhandledrejection'
      )?.[1];

      expect(rejectionHandler).toBeDefined();

      // Test CSS security rejection
      const cssRejectionEvent = {
        reason: 'CSSStyleSheet rules cannot be accessed',
        preventDefault: vi.fn(),
      };

      const cssResult = rejectionHandler!(cssRejectionEvent);
      expect(cssRejectionEvent.preventDefault).toHaveBeenCalled();
      expect(cssResult).toBe(false);

      // Test regular rejection
      const regularRejectionEvent = {
        reason: 'Regular promise rejection',
        preventDefault: vi.fn(),
      };

      const regularResult = rejectionHandler!(regularRejectionEvent);
      expect(regularRejectionEvent.preventDefault).not.toHaveBeenCalled();
      expect(regularResult).toBe(true);
    });

    it('should handle undefined rejection reasons', () => {
      setupGlobalErrorHandler();

      const rejectionHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'unhandledrejection'
      )?.[1];

      const mockEvent = {
        reason: undefined,
        preventDefault: vi.fn(),
      };

      const result = rejectionHandler!(mockEvent);
      expect(result).toBe(true); // Should allow through
    });
  });

  describe('safeGetCSSRules', () => {
    it('should return CSS rules when accessible', () => {
      const mockRules = [
        { selectorText: '.test', style: {} },
        { selectorText: '.another', style: {} },
      ];

      const mockStylesheet = {
        cssRules: mockRules,
      } as unknown as CSSStyleSheet;

      const result = safeGetCSSRules(mockStylesheet);

      expect(result).toBe(mockRules);
    });

    it('should return null and log warning when CSS rules are not accessible', () => {
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const mockStylesheet = {
        get cssRules() {
          throw new Error('Cannot access rules of CSSStyleSheet');
        },
      } as unknown as CSSStyleSheet;

      const result = safeGetCSSRules(mockStylesheet);

      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Cannot access CSS rules from external stylesheet:',
        expect.any(Error)
      );

      consoleWarnSpy.mockRestore();
    });

    it('should handle other types of errors', () => {
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const mockStylesheet = {
        get cssRules() {
          throw new Error('Some other error');
        },
      } as unknown as CSSStyleSheet;

      const result = safeGetCSSRules(mockStylesheet);

      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Cannot access CSS rules from external stylesheet:',
        expect.any(Error)
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('initializeErrorHandlers', () => {
    it('should call both suppressCSSSecurityErrors and setupGlobalErrorHandler', () => {
      const suppressSpy = vi.spyOn(
        { suppressCSSSecurityErrors },
        'suppressCSSSecurityErrors'
      );
      const setupSpy = vi.spyOn(
        { setupGlobalErrorHandler },
        'setupGlobalErrorHandler'
      );

      // Mock the functions
      vi.doMock('../errorHandler', () => ({
        suppressCSSSecurityErrors: suppressSpy,
        setupGlobalErrorHandler: setupSpy,
        safeGetCSSRules: vi.fn(),
        initializeErrorHandlers: vi.fn(),
      }));

      initializeErrorHandlers();

      // The functions should be called (though we can't easily spy on them directly)
      // This test mainly ensures the function doesn't throw
      expect(() => initializeErrorHandlers()).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('should work together to suppress CSS errors completely', () => {
      // Initialize all error handlers
      initializeErrorHandlers();

      // Mock a CSS stylesheet that throws
      const mockStylesheet = {
        get cssRules() {
          throw new Error('Cannot access rules of CSSStyleSheet');
        },
      } as unknown as CSSStyleSheet;

      // This should not cause any console errors or warnings
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const result = safeGetCSSRules(mockStylesheet);

      expect(result).toBeNull();
      // The warning should still be logged (this is expected behavior)
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it('should handle real-world CSS security error scenarios', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      initializeErrorHandlers();

      // Simulate the exact error messages that Leaflet might produce
      const leafletErrors = [
        "SecurityError: Failed to read the 'cssRules' property from 'CSSStyleSheet': Cannot access rules",
        'Cannot access rules of CSSStyleSheet',
        'CSSStyleSheet rules cannot be accessed due to CORS policy',
      ];

      leafletErrors.forEach(errorMessage => {
// // // // // // // console.error(errorMessage);
        // Should not appear in console.error calls
        expect(consoleSpy).not.toHaveBeenCalledWith(errorMessage);
      });

      consoleSpy.mockRestore();
    });
  });
});
