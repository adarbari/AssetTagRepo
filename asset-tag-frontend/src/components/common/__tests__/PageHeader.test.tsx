import React from &apos;react&apos;;
import { describe, it, expect, vi } from &apos;vitest&apos;;
import { screen } from &apos;@testing-library/react&apos;;
import userEvent from &apos;@testing-library/user-event&apos;;
import { PageHeader } from &apos;../PageHeader&apos;;
import { render } from &apos;../../../test/test-utils&apos;;
import { AlertTriangle, Plus } from &apos;lucide-react&apos;;

describe(&apos;PageHeader Component - Button Click Tests&apos;, () => {
  describe(&apos;Back Button Functionality&apos;, () => {
    it(&apos;should render back button when onBack is provided&apos;, () => {
      const mockOnBack = vi.fn();

      render(<PageHeader title=&apos;Test Page&apos; onBack={mockOnBack} />);

      const backButton = screen.getByRole(&apos;button&apos;, { name: /back/i });
      expect(backButton).toBeInTheDocument();
    });

    it(&apos;should not render back button when onBack is not provided&apos;, () => {
      render(<PageHeader title=&apos;Test Page&apos; />);

      const backButton = screen.queryByRole(&apos;button&apos;, { name: /back/i });
      expect(backButton).not.toBeInTheDocument();
    });

    it(&apos;should call onBack when back button is clicked&apos;, async () => {
      const user = userEvent.setup();
      const mockOnBack = vi.fn();

      render(<PageHeader title=&apos;Test Page&apos; onBack={mockOnBack} />);

      const backButton = screen.getByRole(&apos;button&apos;, { name: /back/i });
      await user.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it(&apos;should have proper accessibility attributes for back button&apos;, () => {
      const mockOnBack = vi.fn();

      render(<PageHeader title=&apos;Test Page&apos; onBack={mockOnBack} />);

      const backButton = screen.getByRole(&apos;button&apos;, { name: /back/i });
      // Button component doesn&apos;t explicitly set type, so it uses browser default
      expect(backButton).toBeInTheDocument();
      expect(backButton.tagName).toBe(&apos;BUTTON&apos;);
      // Check for ghost variant styling (hover:bg-accent indicates ghost variant)
      expect(backButton.className).toContain(&apos;hover:bg-accent&apos;);
    });
  });

  describe(&apos;Actions Area&apos;, () => {
    it(&apos;should render actions when provided&apos;, () => {
      const mockAction = vi.fn();

      render(
        <PageHeader
          title=&apos;Test Page&apos;
          actions={
            <button onClick={mockAction}>
              <Plus className=&apos;h-4 w-4 mr-2&apos; />
              Add Item
            </button>
          }
        />
      );

      const actionButton = screen.getByRole(&apos;button&apos;, { name: /add item/i });
      expect(actionButton).toBeInTheDocument();
    });

    it(&apos;should not render actions area when actions is not provided&apos;, () => {
      render(<PageHeader title=&apos;Test Page&apos; />);

      // Should not have any action buttons
      const buttons = screen.queryAllByRole(&apos;button&apos;);
      expect(buttons).toHaveLength(0);
    });

    it(&apos;should handle multiple actions&apos;, async () => {
      const user = userEvent.setup();
      const mockAction1 = vi.fn();
      const mockAction2 = vi.fn();

      render(
        <PageHeader
          title=&apos;Test Page&apos;
          actions={
            <>
              <button onClick={mockAction1}>Action 1</button>
              <button onClick={mockAction2}>Action 2</button>
            </>
          }
        />
      );

      const action1Button = screen.getByRole(&apos;button&apos;, { name: /action 1/i });
      const action2Button = screen.getByRole(&apos;button&apos;, { name: /action 2/i });

      await user.click(action1Button);
      expect(mockAction1).toHaveBeenCalledTimes(1);

      await user.click(action2Button);
      expect(mockAction2).toHaveBeenCalledTimes(1);
    });
  });

  describe(&apos;Icon Display&apos;, () => {
    it(&apos;should render icon when provided&apos;, () => {
      render(<PageHeader title=&apos;Test Page&apos; icon={AlertTriangle} />);

      // Icon should be rendered in the header (SVG elements don&apos;t have img role by default)
      const iconElement = document.querySelector(&apos;svg&apos;);
      expect(iconElement).toBeInTheDocument();
    });

    it(&apos;should not render icon container when icon is not provided&apos;, () => {
      render(<PageHeader title=&apos;Test Page&apos; />);

      // Should not have icon container
      const iconContainer = document.querySelector(&apos;.bg-primary&apos;);
      expect(iconContainer).not.toBeInTheDocument();
    });
  });

  describe(&apos;Badge Display&apos;, () => {
    it(&apos;should render badge when provided&apos;, () => {
      render(
        <PageHeader
          title=&apos;Test Page&apos;
          badge={{ label: &apos;Beta&apos;, variant: &apos;secondary&apos; }}
        />
      );

      const badge = screen.getByText(&apos;Beta&apos;);
      expect(badge).toBeInTheDocument();
    });

    it(&apos;should not render badge when not provided&apos;, () => {
      render(<PageHeader title=&apos;Test Page&apos; />);

      // Should not have any badges
      const badges = document.querySelectorAll(&apos;[data-testid=&quot;badge&quot;]&apos;);
      expect(badges).toHaveLength(0);
    });

    it(&apos;should apply correct badge variant&apos;, () => {
      render(
        <PageHeader
          title=&apos;Test Page&apos;
          badge={{ label: &apos;Warning&apos;, variant: &apos;destructive&apos; }}
        />
      );

      const badge = screen.getByText(&apos;Warning&apos;);
      expect(badge).toBeInTheDocument();
      // Badge should have destructive styling (check for destructive-related classes)
      expect(badge.className).toContain(&apos;destructive&apos;);
    });
  });

  describe(&apos;Content Display&apos;, () => {
    it(&apos;should render title&apos;, () => {
      render(<PageHeader title=&apos;Test Page&apos; />);

      expect(screen.getByText(&apos;Test Page&apos;)).toBeInTheDocument();
    });

    it(&apos;should render description when provided&apos;, () => {
      render(
        <PageHeader
          title=&apos;Test Page&apos;
          description=&apos;This is a test page description&apos;
        />
      );

      expect(
        screen.getByText(&apos;This is a test page description&apos;)
      ).toBeInTheDocument();
    });

    it(&apos;should not render description when not provided&apos;, () => {
      render(<PageHeader title=&apos;Test Page&apos; />);

      // Should not have description paragraph
      const description = document.querySelector(&apos;p.text-muted-foreground&apos;);
      expect(description).not.toBeInTheDocument();
    });
  });

  describe(&apos;Combined Functionality&apos;, () => {
    it(&apos;should work with all props together&apos;, async () => {
      const user = userEvent.setup();
      const mockOnBack = vi.fn();
      const mockAction = vi.fn();

      render(
        <PageHeader
          title=&apos;Complete Test Page&apos;
          description=&apos;A page with all features&apos;
          icon={AlertTriangle}
          badge={{ label: &apos;Active&apos;, variant: &apos;default&apos; }}
          onBack={mockOnBack}
          actions={<button onClick={mockAction}>Complete Action</button>}
        />
      );

      // Check all elements are present
      expect(screen.getByText(&apos;Complete Test Page&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;A page with all features&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Active&apos;)).toBeInTheDocument();

      const backButton = screen.getByRole(&apos;button&apos;, { name: /back/i });
      const actionButton = screen.getByRole(&apos;button&apos;, {
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

  describe(&apos;Accessibility&apos;, () => {
    it(&apos;should have proper heading structure&apos;, () => {
      render(<PageHeader title=&apos;Test Page&apos; />);

      const heading = screen.getByRole(&apos;heading&apos;, { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent(&apos;Test Page&apos;);
    });

    it(&apos;should support keyboard navigation&apos;, async () => {
      const user = userEvent.setup();
      const mockOnBack = vi.fn();
      const mockAction = vi.fn();

      render(
        <PageHeader
          title=&apos;Test Page&apos;
          onBack={mockOnBack}
          actions={<button onClick={mockAction}>Test Action</button>}
        />
      );

      // Tab to back button
      await user.tab();
      const backButton = screen.getByRole(&apos;button&apos;, { name: /back/i });
      expect(document.activeElement).toBe(backButton);

      // Tab to action button
      await user.tab();
      const actionButton = screen.getByRole(&apos;button&apos;, { name: /test action/i });
      expect(document.activeElement).toBe(actionButton);
    });

    it(&apos;should have proper button roles and labels&apos;, () => {
      const mockOnBack = vi.fn();

      render(<PageHeader title=&apos;Test Page&apos; onBack={mockOnBack} />);

      const backButton = screen.getByRole(&apos;button&apos;, { name: /back/i });
      expect(backButton).toBeInTheDocument();
      expect(backButton).toHaveAccessibleName();
    });
  });
});
