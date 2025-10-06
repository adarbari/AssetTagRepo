import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Badge } from '../badge';
import { render } from '../../../test/test-utils';
import { Plus, AlertTriangle } from 'lucide-react';

describe('Badge Component - Click Tests', () => {
  describe('Basic Functionality', () => {
    it('should render badge with text', () => {
      render(<Badge>Test Badge</Badge>);

      const badge = screen.getByText('Test Badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('data-slot', 'badge');
    });

    it('should render as span by default', () => {
      render(<Badge>Default Badge</Badge>);

      const badge = screen.getByText('Default Badge');
      expect(badge.tagName).toBe('SPAN');
    });

    it('should render as child component when asChild is true', () => {
      render(
        <Badge asChild>
          <button>Badge Button</button>
        </Badge>
      );

      const badgeButton = screen.getByRole('button', { name: /badge button/i });
      expect(badgeButton).toBeInTheDocument();
      expect(badgeButton).toHaveAttribute('data-slot', 'badge');
    });
  });

  describe('Badge Variants', () => {
    it('should render default variant', () => {
      render(<Badge>Default</Badge>);

      const badge = screen.getByText('Default');
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain('bg-primary');
    });

    it('should render secondary variant', () => {
      render(<Badge variant='secondary'>Secondary</Badge>);

      const badge = screen.getByText('Secondary');
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain('bg-secondary');
    });

    it('should render destructive variant', () => {
      render(<Badge variant='destructive'>Destructive</Badge>);

      const badge = screen.getByText('Destructive');
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain('bg-destructive');
    });

    it('should render outline variant', () => {
      render(<Badge variant='outline'>Outline</Badge>);

      const badge = screen.getByText('Outline');
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain('text-foreground');
    });
  });

  describe('Badge with Icons', () => {
    it('should render badge with icon', () => {
      render(
        <Badge>
          <Plus className='h-3 w-3' />
          With Icon
        </Badge>
      );

      const badge = screen.getByText('With Icon');
      expect(badge).toBeInTheDocument();

      // Icon should be present
      const icon = document.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should render badge with multiple icons', () => {
      render(
        <Badge>
          <Plus className='h-3 w-3' />
          <AlertTriangle className='h-3 w-3' />
          Multiple Icons
        </Badge>
      );

      const badge = screen.getByText('Multiple Icons');
      expect(badge).toBeInTheDocument();

      // Multiple icons should be present
      const icons = document.querySelectorAll('svg');
      expect(icons).toHaveLength(2);
    });
  });

  describe('Interactive Badge (asChild)', () => {
    it('should handle click on badge button', async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();

      render(
        <Badge asChild>
          <button onClick={mockOnClick}>Clickable Badge</button>
        </Badge>
      );

      const badgeButton = screen.getByRole('button', {
        name: /clickable badge/i,
      });
      await user.click(badgeButton);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple clicks on badge button', async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();

      render(
        <Badge asChild>
          <button onClick={mockOnClick}>Multi Click Badge</button>
        </Badge>
      );

      const badgeButton = screen.getByRole('button', {
        name: /multi click badge/i,
      });

      await user.click(badgeButton);
      await user.click(badgeButton);
      await user.click(badgeButton);

      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });

    it('should handle keyboard activation on badge button', async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();

      render(
        <Badge asChild>
          <button onClick={mockOnClick}>Keyboard Badge</button>
        </Badge>
      );

      const badgeButton = screen.getByRole('button', {
        name: /keyboard badge/i,
      });

      // Focus and press Enter
      badgeButton.focus();
      await user.keyboard('{Enter}');

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should handle Space key activation on badge button', async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();

      render(
        <Badge asChild>
          <button onClick={mockOnClick}>Space Badge</button>
        </Badge>
      );

      const badgeButton = screen.getByRole('button', { name: /space badge/i });

      // Focus and press Space
      badgeButton.focus();
      await user.keyboard(' ');

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper data attributes', () => {
      render(<Badge>Accessible Badge</Badge>);

      const badge = screen.getByText('Accessible Badge');
      expect(badge).toHaveAttribute('data-slot', 'badge');
    });

    it('should support custom aria attributes', () => {
      render(
        <Badge aria-label='Custom badge label' role='status'>
          Custom Badge
        </Badge>
      );

      const badge = screen.getByText('Custom Badge');
      expect(badge).toHaveAttribute('aria-label', 'Custom badge label');
      expect(badge).toHaveAttribute('role', 'status');
    });

    it('should be focusable when rendered as button', () => {
      render(
        <Badge asChild>
          <button>Focusable Badge</button>
        </Badge>
      );

      const badgeButton = screen.getByRole('button', {
        name: /focusable badge/i,
      });
      badgeButton.focus();

      expect(badgeButton).toHaveFocus();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      render(<Badge className='custom-class'>Custom Badge</Badge>);

      const badge = screen.getByText('Custom Badge');
      expect(badge).toHaveClass('custom-class');
    });

    it('should merge custom className with variant classes', () => {
      render(
        <Badge variant='destructive' className='custom-destructive'>
          Custom Destructive
        </Badge>
      );

      const badge = screen.getByText('Custom Destructive');
      expect(badge).toHaveClass('custom-destructive');
      expect(badge.className).toContain('bg-destructive');
    });
  });

  describe('Event Handling', () => {
    it('should handle mouse events on badge button', async () => {
      const user = userEvent.setup();
      const mockOnMouseDown = vi.fn();
      const mockOnMouseUp = vi.fn();

      render(
        <Badge asChild>
          <button onMouseDown={mockOnMouseDown} onMouseUp={mockOnMouseUp}>
            Event Badge
          </button>
        </Badge>
      );

      const badgeButton = screen.getByRole('button', { name: /event badge/i });

      await user.pointer({ keys: '[MouseLeft>]', target: badgeButton });
      expect(mockOnMouseDown).toHaveBeenCalledTimes(1);

      await user.pointer({ keys: '[/MouseLeft]', target: badgeButton });
      expect(mockOnMouseUp).toHaveBeenCalledTimes(1);
    });

    it('should handle focus and blur events', async () => {
      const user = userEvent.setup();
      const mockOnFocus = vi.fn();
      const mockOnBlur = vi.fn();

      render(
        <Badge asChild>
          <button onFocus={mockOnFocus} onBlur={mockOnBlur}>
            Focus Badge
          </button>
        </Badge>
      );

      const badgeButton = screen.getByRole('button', { name: /focus badge/i });

      badgeButton.focus();
      expect(mockOnFocus).toHaveBeenCalledTimes(1);

      badgeButton.blur();
      expect(mockOnBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      render(<Badge></Badge>);

      const badge = document.querySelector('[data-slot="badge"]');
      expect(badge).toBeInTheDocument();
    });

    it('should handle very long text', () => {
      const longText =
        'This is a very long badge text that should be handled properly by the component';
      render(<Badge>{longText}</Badge>);

      const badge = screen.getByText(longText);
      expect(badge).toBeInTheDocument();
    });

    it('should handle special characters', () => {
      render(<Badge>Special: @#$%^&*()</Badge>);

      const badge = screen.getByText('Special: @#$%^&*()');
      expect(badge).toBeInTheDocument();
    });

    it('should handle disabled state when asChild', () => {
      render(
        <Badge asChild>
          <button disabled>Disabled Badge</button>
        </Badge>
      );

      const badgeButton = screen.getByRole('button', {
        name: /disabled badge/i,
      });
      expect(badgeButton).toBeDisabled();
    });
  });
});
