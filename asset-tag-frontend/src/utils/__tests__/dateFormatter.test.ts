import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatDate,
  formatAuditDate,
  formatRelativeDate,
  formatCompactDate,
  formatTableDate,
} from '../dateFormatter';

describe('dateFormatter Utility', () => {
  const mockDate = '2023-10-27T14:30:00Z';
  const mockDateObject = new Date('2023-10-27T14:30:00Z');

  beforeEach(() => {
    // Mock the current date to ensure consistent test results
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-10-27T15:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatDate', () => {
    it('should format date string to local date and time', () => {
      const result = formatDate(mockDate, 'datetime');

      // Should return a formatted date string
      expect(typeof result).toBe('string');
      expect(result).toMatch(/Oct 27, 2023 at \d{1,2}:\d{2} [AP]M/);
    });

    it('should format Date object to local date and time', () => {
      const result = formatDate(mockDateObject, 'datetime');

      expect(typeof result).toBe('string');
      expect(result).toMatch(/Oct 27, 2023 at \d{1,2}:\d{2} [AP]M/);
    });

    it('should handle different time zones consistently', () => {
      const utcDate = '2023-10-27T14:30:00Z';
      const result = formatDate(utcDate, 'datetime');

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle edge case dates', () => {
      const edgeCases = [
        '2023-01-01T00:00:00Z',
        '2023-12-31T23:59:59Z',
        '2024-02-29T12:00:00Z', // Leap year
      ];

      edgeCases.forEach(dateString => {
        const result = formatDate(dateString, 'datetime');
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });
    });
  });

  describe('formatAuditDate', () => {
    it('should format date string to audit-friendly format', () => {
      const result = formatAuditDate(mockDate);

      expect(typeof result).toBe('string');
      expect(result).toMatch(/Oct 27, 2023 at \d{1,2}:\d{2} [AP]M/);
    });

    it('should format Date object to audit-friendly format', () => {
      const result = formatAuditDate(mockDateObject);

      expect(typeof result).toBe('string');
      expect(result).toMatch(/Oct 27, 2023 at \d{1,2}:\d{2} [AP]M/);
    });

    it('should include "at" in the formatted string', () => {
      const result = formatAuditDate(mockDate);

      expect(result).toContain('at');
    });

    it('should format different months correctly', () => {
      const januaryDate = '2023-01-15T10:30:00Z';
      const result = formatAuditDate(januaryDate);

      expect(result).toContain('Jan 15, 2023');
    });

    it('should format different years correctly', () => {
      const futureDate = '2025-06-15T10:30:00Z';
      const result = formatAuditDate(futureDate);

      expect(result).toContain('Jun 15, 2025');
    });
  });

  describe('formatRelativeDate', () => {
    it('should format time ago for recent dates', () => {
      const recentDate = '2023-10-27T14:45:00Z'; // 15 minutes ago
      const result = formatRelativeDate(recentDate);

      expect(typeof result).toBe('string');
      expect(result).toContain('minutes ago');
    });

    it('should format time ago for hours', () => {
      const hoursAgo = '2023-10-27T12:00:00Z'; // 3 hours ago
      const result = formatRelativeDate(hoursAgo);

      expect(typeof result).toBe('string');
      expect(result).toContain('hours ago');
    });

    it('should format time ago for days', () => {
      const daysAgo = '2023-10-25T15:00:00Z'; // 2 days ago
      const result = formatRelativeDate(daysAgo);

      expect(typeof result).toBe('string');
      expect(result).toContain('days ago');
    });

    it('should format time ago for future dates', () => {
      const futureDate = '2023-10-27T16:00:00Z'; // 1 hour in the future
      const result = formatRelativeDate(futureDate);

      expect(typeof result).toBe('string');
      expect(result).toMatch(/in \d+ hour|Just now/);
    });

    it('should handle Date object input', () => {
      const dateObject = new Date('2023-10-27T14:45:00Z');
      const result = formatRelativeDate(dateObject);

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle edge case of same time', () => {
      const sameTime = '2023-10-27T15:00:00Z'; // Same as mocked current time
      const result = formatRelativeDate(sameTime);

      expect(typeof result).toBe('string');
      expect(result).toMatch(/seconds ago|Just now/);
    });
  });

  describe('formatCompactDate', () => {
    it('should format date string to short date format', () => {
      const result = formatCompactDate(mockDate);

      expect(result).toBe('10/27/2023');
    });

    it('should format Date object to short date format', () => {
      const result = formatCompactDate(mockDateObject);

      expect(result).toBe('10/27/2023');
    });

    it('should handle single digit months and days', () => {
      const singleDigitDate = '2023-01-05T10:30:00Z';
      const result = formatCompactDate(singleDigitDate);

      expect(result).toBe('1/5/2023');
    });

    it('should handle different years', () => {
      const differentYear = '2025-12-31T10:30:00Z';
      const result = formatCompactDate(differentYear);

      expect(result).toBe('12/31/2025');
    });

    it('should handle leap year dates', () => {
      const leapYearDate = '2024-02-29T10:30:00Z';
      const result = formatCompactDate(leapYearDate);

      expect(result).toBe('2/29/2024');
    });
  });

  describe('formatTableDate', () => {
    it('should format date string to full date format', () => {
      const result = formatTableDate(mockDate);

      expect(result).toBe('Oct 27, 2023');
    });

    it('should format Date object to full date format', () => {
      const result = formatTableDate(mockDateObject);

      expect(result).toBe('Oct 27, 2023');
    });

    it('should format different months correctly', () => {
      const januaryDate = '2023-01-15T10:30:00Z';
      const result = formatTableDate(januaryDate);

      expect(result).toBe('Jan 15, 2023');
    });

    it('should format different years correctly', () => {
      const futureDate = '2025-06-15T10:30:00Z';
      const result = formatTableDate(futureDate);

      expect(result).toBe('Jun 15, 2025');
    });

    it('should handle single digit days', () => {
      const singleDigitDay = '2023-03-05T10:30:00Z';
      const result = formatTableDate(singleDigitDay);

      expect(result).toBe('Mar 5, 2023');
    });

    it('should handle all months correctly', () => {
      const months = [
        { date: '2023-01-15T10:30:00Z', expected: 'Jan 15, 2023' },
        { date: '2023-02-15T10:30:00Z', expected: 'Feb 15, 2023' },
        { date: '2023-03-15T10:30:00Z', expected: 'Mar 15, 2023' },
        { date: '2023-04-15T10:30:00Z', expected: 'Apr 15, 2023' },
        { date: '2023-05-15T10:30:00Z', expected: 'May 15, 2023' },
        { date: '2023-06-15T10:30:00Z', expected: 'Jun 15, 2023' },
        { date: '2023-07-15T10:30:00Z', expected: 'Jul 15, 2023' },
        { date: '2023-08-15T10:30:00Z', expected: 'Aug 15, 2023' },
        { date: '2023-09-15T10:30:00Z', expected: 'Sep 15, 2023' },
        { date: '2023-10-15T10:30:00Z', expected: 'Oct 15, 2023' },
        { date: '2023-11-15T10:30:00Z', expected: 'Nov 15, 2023' },
        { date: '2023-12-15T10:30:00Z', expected: 'Dec 15, 2023' },
      ];

      months.forEach(({ date, expected }) => {
        const result = formatTableDate(date);
        expect(result).toBe(expected);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid date strings gracefully', () => {
      const invalidDates = [
        'invalid-date',
        '2023-13-01T10:30:00Z', // Invalid month
        '2023-02-30T10:30:00Z', // Invalid day
        '',
        null as any,
        undefined as any,
      ];

      invalidDates.forEach(invalidDate => {
        expect(() => formatDate(invalidDate, 'datetime')).not.toThrow();
        expect(() => formatAuditDate(invalidDate)).not.toThrow();
        expect(() => formatRelativeDate(invalidDate)).not.toThrow();
        expect(() => formatCompactDate(invalidDate)).not.toThrow();
        expect(() => formatTableDate(invalidDate)).not.toThrow();
      });
    });

    it('should handle edge case date formats', () => {
      const edgeCases = [
        '2023-10-27T14:30:00.000Z', // With milliseconds
        '2023-10-27T14:30:00+00:00', // With timezone offset
        '2023-10-27', // Date only
      ];

      edgeCases.forEach(dateString => {
        expect(() => formatDate(dateString, 'datetime')).not.toThrow();
        expect(() => formatAuditDate(dateString)).not.toThrow();
        expect(() => formatRelativeDate(dateString)).not.toThrow();
        expect(() => formatCompactDate(dateString)).not.toThrow();
        expect(() => formatTableDate(dateString)).not.toThrow();
      });
    });
  });

  describe('Consistency', () => {
    it('should return consistent results for the same input', () => {
      const result1 = formatDate(mockDate, 'datetime');
      const result2 = formatDate(mockDate, 'datetime');

      expect(result1).toBe(result2);
    });

    it('should handle both string and Date object inputs consistently', () => {
      const stringResult = formatCompactDate(mockDate);
      const objectResult = formatCompactDate(mockDateObject);

      expect(stringResult).toBe(objectResult);
    });
  });
});
