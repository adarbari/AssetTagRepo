import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PageHeader } from '../PageHeader';
import { render } from '../../../test/test-utils';
import { AlertTriangle, Plus } from 'lucide-react';

describe('PageHeader Component - Button Click Tests', () => {
  describe('Back Button Functionality', () => {
    it('should render back button when onBack is provided', () => {
      const mockOnBack = vi.fn();

      render(<PageHeader title='Test Page' onBack={mockOnBack} />);

      const backButton = screen.getByRole('button', { name: /back/i });
      expect(backButton).toBeInTheDocument();
    });

    it('should not render back button when onBack is not provided', () => {
      render(<PageHeader title='Test Page' />);

      const backButton = screen.queryByRole('button', { name: /back/i });
      expect(backButton).not.toBeInTheDocument();
    });

    it('should call onBack when back button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnBack = vi.fn();

      render(<PageHeader title='Test Page' onBack={mockOnBack} />);

      const backButton = screen.getByRole('button', { name: /back/i });
      await user.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('should have proper accessibility attributes for back button', () => {
      const mockOnBack = vi.fn();

      render(<PageHeader title='Test Page' onBack={mockOnBack} />);

      const backButton = screen.getByRole('button', { name: /back/i });
      // Button component doesn't explicitly set type, so it uses browser default
      expect(backButton).toBeInTheDocument();
      expect(backButton.tagName).toBe('BUTTON');
      // Check for ghost variant styling (hover:bg-accent indicates ghost variant)
      expect(backButton.className).toContain('hover:bg-accent');
    });
  });

  describe('Actions Area', () => {
    it('should render actions when provided', () => {
      const mockAction = vi.fn();

      render(
        <PageHeader
          title='Test Page'
          actions={
            <button onClick={mockAction}>
              <Plus className='h-4 w-4 mr-2' />
              Add Item
            </button>
          }
        />
      );

      const actionButton = screen.getByRole('button', { name: /add item/i });
      expect(actionButton).toBeInTheDocument();
    });

    it('should not render actions area when actions is not provided', () => {
      render(<PageHeader title='Test Page' />);

      // Should not have any action buttons
      const buttons = screen.queryAllByRole('button');
      expect(buttons).toHaveLength(0);
    });

    it('should handle multiple actions', async () => {
      const user = userEvent.setup();
      const mockAction1 = vi.fn();
      const mockAction2 = vi.fn();

      render(
        <PageHeader
          title='Test Page'
          actions={
            <>
              <button onClick={mockAction1}>Action 1</button>
              <button onClick={mockAction2}>Action 2</button>
            </>
          }
        />
      );

      const action1Button = screen.getByRole('button', { name: /action 1/i });
      const action2Button = screen.getByRole('button', { name: /action 2/i });

      await user.click(action1Button);
      expect(mockAction1).toHaveBeenCalledTimes(1);

      await user.click(action2Button);
      expect(mockAction2).toHaveBeenCalledTimes(1);
    });
  });

  describe('Icon Display', () => {
    it('should render icon when provided', () => {
      render(<PageHeader title='Test Page' icon={AlertTriangle} />);

      // Icon should be rendered in the header (SVG elements don't have img role by default)
      const iconElement = document.querySelector('svg');
      expect(iconElement).toBeInTheDocument();
    });

    it('should not render icon container when icon is not provided', () => {
      render(<PageHeader title='Test Page' />);

      // Should not have icon container
      const iconContainer = document.querySelector('.bg-primary');
      expect(iconContainer).not.toBeInTheDocument();
    });
  });

  describe('Badge Display', () => {
    it('should render badge when provided', () => {
      render(
        <PageHeader
          title='Test Page'
          badge={{ label: 'Beta', variant: 'secondary' }}
        />
      );

      const badge = screen.getByText('Beta');
      expect(badge).toBeInTheDocument();
    });

    it('should not render badge when not provided', () => {
      render(<PageHeader title='Test Page' />);

      // Should not have any badges
      const badges = document.querySelectorAll('[data-testid=&quot;badge&quot;]');
      expect(badges).toHaveLength(0);
    });

    it('should apply correct badge variant', () => {
      render(
        <PageHeader
          title='Test Page'
          badge={{ label: 'Warning', variant: 'destructive' }}
        />
      );

      const badge = screen.getByText('Warning');
      expect(badge).toBeInTheDocument();
      // Badge should have destructive styling (check for destructive-related classes)
      expect(badge.className).toContain('destructive');
    });
  });

  describe('Content Display', () => {
    it('should render title', () => {
      render(<PageHeader title='Test Page' />);

      expect(screen.getByText('Test Page')).toBeInTheDocument();
    });

    it('should render description when provided', () => {
      render(
        <PageHeader
          title='Test Page'
          description='This is a test page description'
        />
      );

      expect(
        screen.getByText('This is a test page description')
      ).toBeInTheDocument();
    });

    it('should not render description when not provided', () => {
      render(<PageHeader title='Test Page' />);

      // Should not have description paragraph
      const description = document.querySelector('p.text-muted-foreground');
      expect(description).not.toBeInTheDocument();
    });
  });

  describe('Combined Functionality', () => {
    it('should work with all props together', async () => {
      const user = userEvent.setup();
      const mockOnBack = vi.fn();
      const mockAction = vi.fn();

      render(
        <PageHeader
          title='Complete Test Page'
          description='A page with all features'
          icon={AlertTriangle}
          badge={{ label: 'Active', variant: 'default' }}
          onBack={mockOnBack}
          actions={<button onClick={mockAction}>Complete Action</button>}
        />
      );

      // Check all elements are present
      expect(screen.getByText('Complete Test Page')).toBeInTheDocument();
      expect(screen.getByText('A page with all features')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();

      const backButton = screen.getByRole('button', { name: /back/i });
      const actionButton = screen.getByRole('button', {
        name: /complete action/i,
      });

      // Test back button
      await user.click(backButton);
      expect(mockOnBack).toHaveBeenCalledTimes(1);

      // Test action button
      await user.click(actionButton);
      expect(mockAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<PageHeader title='Test Page' />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Test Page');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const mockOnBack = vi.fn();
      const mockAction = vi.fn();

      render(
        <PageHeader
          title='Test Page'
          onBack={mockOnBack}
          actions={<button onClick={mockAction}>Test Action</button>}
        />
      );

      // Tab to back button
      await user.tab();
      const backButton = screen.getByRole('button', { name: /back/i });
      expect(document.activeElement).toBe(backButton);

      // Tab to action button
      await user.tab();
      const actionButton = screen.getByRole('button', { name: /test action/i });
      expect(document.activeElement).toBe(actionButton);
    });

    it('should have proper button roles and labels', () => {
      const mockOnBack = vi.fn();

      render(<PageHeader title='Test Page' onBack={mockOnBack} />);

      const backButton = screen.getByRole('button', { name: /back/i });
      expect(backButton).toBeInTheDocument();
      expect(backButton).toHaveAccessibleName();
    });
  });
});
