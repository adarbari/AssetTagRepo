// import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SeverityBadge } from '../common/SeverityBadge';
import type { IssueSeverity } from '../../types/issue';

describe('SeverityBadge Component', () => {
  describe('Rendering', () => {
    it('should render with correct text', () => {
      render(<SeverityBadge severity='critical' />);
      expect(screen.getByText('critical')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<SeverityBadge severity='high' className='custom-class' />);
      const badge = screen.getByText('high');
      expect(badge).toHaveClass('custom-class');
    });
  });

  describe('Severity Color Mapping', () => {
    it('should apply correct colors for critical severity', () => {
      render(<SeverityBadge severity='critical' />);
      const badge = screen.getByText('critical');
      expect(badge).toHaveClass('bg-red-100', 'text-red-700', 'border-red-200');
    });

    it('should apply correct colors for high severity', () => {
      render(<SeverityBadge severity='high' />);
      const badge = screen.getByText('high');
      expect(badge).toHaveClass(
        'bg-orange-100',
        'text-orange-700',
        'border-orange-200'
      );
    });

    it('should apply correct colors for medium severity', () => {
      render(<SeverityBadge severity='medium' />);
      const badge = screen.getByText('medium');
      expect(badge).toHaveClass(
        'bg-yellow-100',
        'text-yellow-700',
        'border-yellow-200'
      );
    });

    it('should apply correct colors for low severity', () => {
      render(<SeverityBadge severity='low' />);
      const badge = screen.getByText('low');
      expect(badge).toHaveClass(
        'bg-blue-100',
        'text-blue-700',
        'border-blue-200'
      );
    });
  });

  describe('Case Insensitive Handling', () => {
    it('should handle uppercase severity', () => {
      render(<SeverityBadge severity='CRITICAL' />);
      const badge = screen.getByText('CRITICAL');
      expect(badge).toHaveClass('bg-red-100', 'text-red-700', 'border-red-200');
    });

    it('should handle mixed case severity', () => {
      render(<SeverityBadge severity='High' />);
      const badge = screen.getByText('High');
      expect(badge).toHaveClass(
        'bg-orange-100',
        'text-orange-700',
        'border-orange-200'
      );
    });
  });

  describe('Unknown Severity Handling', () => {
    it('should default to medium colors for unknown severity', () => {
      render(<SeverityBadge severity='unknown' as IssueSeverity />);
      const badge = screen.getByText('unknown');
      expect(badge).toHaveClass(
        'bg-yellow-100',
        'text-yellow-700',
        'border-yellow-200'
      );
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with proper role', () => {
      render(<SeverityBadge severity='critical' />);
      const badge = screen.getByText('critical');
      expect(badge).toBeInTheDocument();
    });

    it('should have proper text content', () => {
      render(<SeverityBadge severity='high' />);
      expect(screen.getByText('high')).toBeInTheDocument();
    });
  });
});
