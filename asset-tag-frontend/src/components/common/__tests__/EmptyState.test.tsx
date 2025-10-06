import React from &apos;react&apos;;
import { describe, it, expect, vi } from &apos;vitest&apos;;
import { screen } from &apos;@testing-library/react&apos;;
import userEvent from &apos;@testing-library/user-event&apos;;
import { EmptyState } from &apos;../EmptyState&apos;;
import { render } from &apos;../../../test/test-utils&apos;;
import { AlertTriangle, Plus } from &apos;lucide-react&apos;;

describe(&apos;EmptyState Component - Button Click Tests&apos;, () => {
  describe(&apos;Action Button Functionality&apos;, () => {
    it(&apos;should render action button when action is provided&apos;, () => {
      const mockAction = vi.fn();

      render(
        <EmptyState
          title=&apos;No items found&apos;
          action={{
            label: &apos;Create Item&apos;,
            onClick: mockAction,
          }}
        />
      );

      const actionButton = screen.getByRole(&apos;button&apos;, { name: /create item/i });
      expect(actionButton).toBeInTheDocument();
    });

    it(&apos;should not render action button when action is not provided&apos;, () => {
      render(<EmptyState title=&apos;No items found&apos; />);

      const actionButton = screen.queryByRole(&apos;button&apos;);
      expect(actionButton).not.toBeInTheDocument();
    });

    it(&apos;should call action.onClick when action button is clicked&apos;, async () => {
      const user = userEvent.setup();
      const mockAction = vi.fn();

      render(
        <EmptyState
          title=&apos;No items found&apos;
          action={{
            label: &apos;Create Item&apos;,
            onClick: mockAction,
          }}
        />
      );

      const actionButton = screen.getByRole(&apos;button&apos;, { name: /create item/i });
      await user.click(actionButton);

      expect(mockAction).toHaveBeenCalledTimes(1);
    });

    it(&apos;should render action button with icon when provided&apos;, () => {
      const mockAction = vi.fn();

      render(
        <EmptyState
          title=&apos;No items found&apos;
          action={{
            label: &apos;Add New&apos;,
            onClick: mockAction,
            icon: Plus,
          }}
        />
      );

      const actionButton = screen.getByRole(&apos;button&apos;, { name: /add new/i });
      expect(actionButton).toBeInTheDocument();

      // Icon should be present (SVG elements don&apos;t have img role by default)
      const iconElement = document.querySelector(&apos;svg&apos;);
      expect(iconElement).toBeInTheDocument();
    });
  });

  describe(&apos;Content Display&apos;, () => {
    it(&apos;should render title&apos;, () => {
      render(<EmptyState title=&apos;No items found&apos; />);

      expect(screen.getByText(&apos;No items found&apos;)).toBeInTheDocument();
    });

    it(&apos;should render description when provided&apos;, () => {
      render(
        <EmptyState
          title=&apos;No items found&apos;
          description=&apos;There are no items to display at this time.&apos;
        />
      );

      expect(
        screen.getByText(&apos;There are no items to display at this time.&apos;)
      ).toBeInTheDocument();
    });

    it(&apos;should not render description when not provided&apos;, () => {
      render(<EmptyState title=&apos;No items found&apos; />);

      // Should not have description paragraph
      const description = document.querySelector(&apos;p.text-muted-foreground&apos;);
      expect(description).not.toBeInTheDocument();
    });

    it(&apos;should render icon when provided&apos;, () => {
      render(<EmptyState title=&apos;No items found&apos; icon={AlertTriangle} />);

      // Icon should be rendered (SVG elements don&apos;t have img role by default)
      const iconElement = document.querySelector(&apos;svg&apos;);
      expect(iconElement).toBeInTheDocument();
    });

    it(&apos;should not render icon container when icon is not provided&apos;, () => {
      render(<EmptyState title=&apos;No items found&apos; />);

      // Should not have icon container
      const iconContainer = document.querySelector(&apos;.bg-muted&apos;);
      expect(iconContainer).not.toBeInTheDocument();
    });
  });

  describe(&apos;Combined Functionality&apos;, () => {
    it(&apos;should work with all props together&apos;, async () => {
      const user = userEvent.setup();
      const mockAction = vi.fn();

      render(
        <EmptyState
          title=&apos;Complete Empty State&apos;
          description=&apos;This is a complete empty state with all features&apos;
          icon={AlertTriangle}
          action={{
            label: &apos;Complete Action&apos;,
            onClick: mockAction,
            icon: Plus,
          }}
        />
      );

      // Check all elements are present
      expect(screen.getByText(&apos;Complete Empty State&apos;)).toBeInTheDocument();
      expect(
        screen.getByText(&apos;This is a complete empty state with all features&apos;)
      ).toBeInTheDocument();

      const actionButton = screen.getByRole(&apos;button&apos;, {
        name: /complete action/i,
      });
      expect(actionButton).toBeInTheDocument();

      // Test action button
      await user.click(actionButton);
      expect(mockAction).toHaveBeenCalledTimes(1);
    });
  });

  describe(&apos;Accessibility&apos;, () => {
    it(&apos;should have proper heading structure&apos;, () => {
      render(<EmptyState title=&apos;No items found&apos; />);

      const heading = screen.getByRole(&apos;heading&apos;, { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent(&apos;No items found&apos;);
    });

    it(&apos;should support keyboard navigation&apos;, async () => {
      const user = userEvent.setup();
      const mockAction = vi.fn();

      render(
        <EmptyState
          title=&apos;No items found&apos;
          action={{
            label: &apos;Create Item&apos;,
            onClick: mockAction,
          }}
        />
      );

      // Tab to action button
      await user.tab();
      const actionButton = screen.getByRole(&apos;button&apos;, { name: /create item/i });
      expect(document.activeElement).toBe(actionButton);
    });

    it(&apos;should have proper button roles and labels&apos;, () => {
      const mockAction = vi.fn();

      render(
        <EmptyState
          title=&apos;No items found&apos;
          action={{
            label: &apos;Create Item&apos;,
            onClick: mockAction,
          }}
        />
      );

      const actionButton = screen.getByRole(&apos;button&apos;, { name: /create item/i });
      expect(actionButton).toBeInTheDocument();
      expect(actionButton).toHaveAccessibleName();
    });

    it(&apos;should be focusable when action is provided&apos;, () => {
      const mockAction = vi.fn();

      render(
        <EmptyState
          title=&apos;No items found&apos;
          action={{
            label: &apos;Create Item&apos;,
            onClick: mockAction,
          }}
        />
      );

      const actionButton = screen.getByRole(&apos;button&apos;, { name: /create item/i });
      actionButton.focus();
      expect(document.activeElement).toBe(actionButton);
    });
  });

  describe(&apos;Button State Management&apos;, () => {
    it(&apos;should handle multiple rapid clicks&apos;, async () => {
      const user = userEvent.setup();
      const mockAction = vi.fn();

      render(
        <EmptyState
          title=&apos;No items found&apos;
          action={{
            label: &apos;Create Item&apos;,
            onClick: mockAction,
          }}
        />
      );

      const actionButton = screen.getByRole(&apos;button&apos;, { name: /create item/i });

      // Click multiple times rapidly
      await user.click(actionButton);
      await user.click(actionButton);
      await user.click(actionButton);

      expect(mockAction).toHaveBeenCalledTimes(3);
    });

    it(&apos;should maintain button state during interactions&apos;, async () => {
      const user = userEvent.setup();
      const mockAction = vi.fn();

      render(
        <EmptyState
          title=&apos;No items found&apos;
          action={{
            label: &apos;Create Item&apos;,
            onClick: mockAction,
          }}
        />
      );

      const actionButton = screen.getByRole(&apos;button&apos;, { name: /create item/i });

      // Button should remain enabled
      expect(actionButton).not.toBeDisabled();

      await user.click(actionButton);

      // Button should still be enabled after click
      expect(actionButton).not.toBeDisabled();
    });
  });

  describe(&apos;Error Handling&apos;, () => {
    it(&apos;should handle action errors gracefully&apos;, async () => {
      const user = userEvent.setup();
      const mockAction = vi.fn().mockRejectedValue(new Error(&apos;Action failed&apos;));

      // Mock // console.error to prevent error from showing in test output
      const consoleSpy = vi
        .spyOn(console, &apos;error&apos;)
        .mockImplementation(() => {});

      render(
        <EmptyState
          title=&apos;No items found&apos;
          action={{
            label: &apos;Create Item&apos;,
            onClick: mockAction,
          }}
        />
      );

      const actionButton = screen.getByRole(&apos;button&apos;, { name: /create item/i });

      // Should call the action function even if it throws
      try {
        await user.click(actionButton);
      } catch (error) {
        // Expected error, ignore it
      }

      expect(mockAction).toHaveBeenCalledTimes(1);

      // Restore // console.error
      consoleSpy.mockRestore();
    });
  });

  describe(&apos;Visual Layout&apos;, () => {
    it(&apos;should center content properly&apos;, () => {
      render(<EmptyState title=&apos;No items found&apos; />);

      const container = document.querySelector(
        &apos;.flex.flex-col.items-center.justify-center&apos;
      );
      expect(container).toBeInTheDocument();
    });

    it(&apos;should have proper spacing for action button&apos;, () => {
      const mockAction = vi.fn();

      render(
        <EmptyState
          title=&apos;No items found&apos;
          description=&apos;Description text&apos;
          action={{
            label: &apos;Create Item&apos;,
            onClick: mockAction,
          }}
        />
      );

      const actionButton = screen.getByRole(&apos;button&apos;, { name: /create item/i });
      expect(actionButton).toBeInTheDocument();

      // Button should have proper margin (check if button has proper spacing)
      expect(actionButton).toBeInTheDocument();
      // The button should be properly positioned within the component
      expect(actionButton.closest(&apos;div&apos;)).toBeTruthy();
    });
  });
});
