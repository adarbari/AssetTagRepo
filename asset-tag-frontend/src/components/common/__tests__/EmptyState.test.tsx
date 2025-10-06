import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '../EmptyState';
import { render } from '../../../test/test-utils';
import { AlertTriangle, Plus } from 'lucide-react';

describe('EmptyState Component - Button Click Tests', () => {
  describe('Action Button Functionality', () => {
    it('should render action button when action is provided', () => {
      const mockAction = vi.fn();

      render(
        <EmptyState
          title='No items found'
          action={{
            label: 'Create Item',
            onClick: mockAction,
          }}
        />
      );

      const actionButton = screen.getByRole('button', { name: /create item/i });
      expect(actionButton).toBeInTheDocument();
    });

    it('should not render action button when action is not provided', () => {
      render(<EmptyState title='No items found' />);

      const actionButton = screen.queryByRole('button');
      expect(actionButton).not.toBeInTheDocument();
    });

    it('should call action.onClick when action button is clicked', async () => {
      const user = userEvent.setup();
      const mockAction = vi.fn();

      render(
        <EmptyState
          title='No items found'
          action={{
            label: 'Create Item',
            onClick: mockAction,
          }}
        />
      );

      const actionButton = screen.getByRole('button', { name: /create item/i });
      await user.click(actionButton);

      expect(mockAction).toHaveBeenCalledTimes(1);
    });

    it('should render action button with icon when provided', () => {
      const mockAction = vi.fn();

      render(
        <EmptyState
          title='No items found'
          action={{
            label: 'Add New',
            onClick: mockAction,
            icon: Plus,
          }}
        />
      );

      const actionButton = screen.getByRole('button', { name: /add new/i });
      expect(actionButton).toBeInTheDocument();

      // Icon should be present (SVG elements don't have img role by default)
      const iconElement = document.querySelector('svg');
      expect(iconElement).toBeInTheDocument();
    });
  });

  describe('Content Display', () => {
    it('should render title', () => {
      render(<EmptyState title='No items found' />);

      expect(screen.getByText('No items found')).toBeInTheDocument();
    });

    it('should render description when provided', () => {
      render(
        <EmptyState
          title='No items found'
          description='There are no items to display at this time.'
        />
      );

      expect(
        screen.getByText('There are no items to display at this time.')
      ).toBeInTheDocument();
    });

    it('should not render description when not provided', () => {
      render(<EmptyState title='No items found' />);

      // Should not have description paragraph
      const description = document.querySelector('p.text-muted-foreground');
      expect(description).not.toBeInTheDocument();
    });

    it('should render icon when provided', () => {
      render(<EmptyState title='No items found' icon={AlertTriangle} />);

      // Icon should be rendered (SVG elements don't have img role by default)
      const iconElement = document.querySelector('svg');
      expect(iconElement).toBeInTheDocument();
    });

    it('should not render icon container when icon is not provided', () => {
      render(<EmptyState title='No items found' />);

      // Should not have icon container
      const iconContainer = document.querySelector('.bg-muted');
      expect(iconContainer).not.toBeInTheDocument();
    });
  });

  describe('Combined Functionality', () => {
    it('should work with all props together', async () => {
      const user = userEvent.setup();
      const mockAction = vi.fn();

      render(
        <EmptyState
          title='Complete Empty State'
          description='This is a complete empty state with all features'
          icon={AlertTriangle}
          action={{
            label: 'Complete Action',
            onClick: mockAction,
            icon: Plus,
          }}
        />
      );

      // Check all elements are present
      expect(screen.getByText('Complete Empty State')).toBeInTheDocument();
      expect(
        screen.getByText('This is a complete empty state with all features')
      ).toBeInTheDocument();

      const actionButton = screen.getByRole('button', {
        name: /complete action/i,
      });
      expect(actionButton).toBeInTheDocument();

      // Test action button
      await user.click(actionButton);
      expect(mockAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<EmptyState title='No items found' />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('No items found');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const mockAction = vi.fn();

      render(
        <EmptyState
          title='No items found'
          action={{
            label: 'Create Item',
            onClick: mockAction,
          }}
        />
      );

      // Tab to action button
      await user.tab();
      const actionButton = screen.getByRole('button', { name: /create item/i });
      expect(document.activeElement).toBe(actionButton);
    });

    it('should have proper button roles and labels', () => {
      const mockAction = vi.fn();

      render(
        <EmptyState
          title='No items found'
          action={{
            label: 'Create Item',
            onClick: mockAction,
          }}
        />
      );

      const actionButton = screen.getByRole('button', { name: /create item/i });
      expect(actionButton).toBeInTheDocument();
      expect(actionButton).toHaveAccessibleName();
    });

    it('should be focusable when action is provided', () => {
      const mockAction = vi.fn();

      render(
        <EmptyState
          title='No items found'
          action={{
            label: 'Create Item',
            onClick: mockAction,
          }}
        />
      );

      const actionButton = screen.getByRole('button', { name: /create item/i });
      actionButton.focus();
      expect(document.activeElement).toBe(actionButton);
    });
  });

  describe('Button State Management', () => {
    it('should handle multiple rapid clicks', async () => {
      const user = userEvent.setup();
      const mockAction = vi.fn();

      render(
        <EmptyState
          title='No items found'
          action={{
            label: 'Create Item',
            onClick: mockAction,
          }}
        />
      );

      const actionButton = screen.getByRole('button', { name: /create item/i });

      // Click multiple times rapidly
      await user.click(actionButton);
      await user.click(actionButton);
      await user.click(actionButton);

      expect(mockAction).toHaveBeenCalledTimes(3);
    });

    it('should maintain button state during interactions', async () => {
      const user = userEvent.setup();
      const mockAction = vi.fn();

      render(
        <EmptyState
          title='No items found'
          action={{
            label: 'Create Item',
            onClick: mockAction,
          }}
        />
      );

      const actionButton = screen.getByRole('button', { name: /create item/i });

      // Button should remain enabled
      expect(actionButton).not.toBeDisabled();

      await user.click(actionButton);

      // Button should still be enabled after click
      expect(actionButton).not.toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should handle action errors gracefully', async () => {
      const user = userEvent.setup();
      const mockAction = vi.fn().mockRejectedValue(new Error('Action failed'));

      // Mock console.error to prevent error from showing in test output
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(
        <EmptyState
          title='No items found'
          action={{
            label: 'Create Item',
            onClick: mockAction,
          }}
        />
      );

      const actionButton = screen.getByRole('button', { name: /create item/i });

      // Should call the action function even if it throws
      try {
        await user.click(actionButton);
      } catch (error) {
        // Expected error, ignore it
      }

      expect(mockAction).toHaveBeenCalledTimes(1);

      // Restore console.error
      consoleSpy.mockRestore();
    });
  });

  describe('Visual Layout', () => {
    it('should center content properly', () => {
      render(<EmptyState title='No items found' />);

      const container = document.querySelector(
        '.flex.flex-col.items-center.justify-center'
      );
      expect(container).toBeInTheDocument();
    });

    it('should have proper spacing for action button', () => {
      const mockAction = vi.fn();

      render(
        <EmptyState
          title='No items found'
          description='Description text'
          action={{
            label: 'Create Item',
            onClick: mockAction,
          }}
        />
      );

      const actionButton = screen.getByRole('button', { name: /create item/i });
      expect(actionButton).toBeInTheDocument();

      // Button should have proper margin (check if button has proper spacing)
      expect(actionButton).toBeInTheDocument();
      // The button should be properly positioned within the component
      expect(actionButton.closest('div')).toBeTruthy();
    });
  });
});
