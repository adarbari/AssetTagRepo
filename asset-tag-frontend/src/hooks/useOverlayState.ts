import { useState, useEffect } from 'react';

/**
 * Custom hook for managing overlay state with localStorage persistence
 * @param key - localStorage key for storing the state
 * @param defaultValue - default value if no stored state exists
 * @returns [state, setState] tuple
 */
export function useOverlayState(key: string, defaultValue: boolean): [boolean, (value: boolean) => void] {
  // Clean up any invalid localStorage entries on first use
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored === 'undefined' || stored === 'null') {
        localStorage.removeItem(key);
      }
    } catch (error) {
      // Ignore errors during cleanup
    }
  }, [key]);
  const [state, setState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(key);
      // Check for null, undefined, or the string "undefined"
      if (stored === null || stored === undefined || stored === 'undefined' || stored === 'null') {
        return defaultValue;
      }
      return JSON.parse(stored);
    } catch (error) {
      console.warn(`Failed to parse localStorage value for key "${key}":`, error);
      return defaultValue;
    }
  });
  
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Failed to save state to localStorage for key "${key}":`, error);
    }
  }, [key, state]);
  
  return [state, setState];
}
