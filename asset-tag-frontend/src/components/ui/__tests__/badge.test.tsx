import React from &apos;react&apos;;
import { describe, it, expect, vi } from &apos;vitest&apos;;
import { screen } from &apos;@testing-library/react&apos;;
import userEvent from &apos;@testing-library/user-event&apos;;
import { Badge } from &apos;../badge&apos;;
import { render } from &apos;../../../test/test-utils&apos;;
import { Plus, AlertTriangle } from &apos;lucide-react&apos;;

describe(&apos;Badge Component - Click Tests&apos;, () => {
  describe(&apos;Basic Functionality&apos;, () => {
    it(&apos;should render badge with text&apos;, () => {
      render(<Badge>Test Badge</Badge>);

      const badge = screen.getByText(&apos;Test Badge&apos;);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute(&apos;data-slot&apos;, &apos;badge&apos;);
    });

    it(&apos;should render as span by default&apos;, () => {
      render(<Badge>Default Badge</Badge>);

      const badge = screen.getByText(&apos;Default Badge&apos;);
      expect(badge.tagName).toBe(&apos;SPAN&apos;);
    });

    it(&apos;should render as child component when asChild is true&apos;, () => {
      render(
        <Badge asChild>
          <button>Badge Button</button>
        </Badge>
      );

      const badgeButton = screen.getByRole(&apos;button&apos;, { name: /badge button/i });
      expect(badgeButton).toBeInTheDocument();
      expect(badgeButton).toHaveAttribute(&apos;data-slot&apos;, &apos;badge&apos;);
    });
  });

  describe(&apos;Badge Variants&apos;, () => {
    it(&apos;should render default variant&apos;, () => {
      render(<Badge>Default</Badge>);

      const badge = screen.getByText(&apos;Default&apos;);
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain(&apos;bg-primary&apos;);
    });

    it(&apos;should render secondary variant&apos;, () => {
      render(<Badge variant=&apos;secondary&apos;>Secondary</Badge>);

      const badge = screen.getByText(&apos;Secondary&apos;);
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain(&apos;bg-secondary&apos;);
    });

    it(&apos;should render destructive variant&apos;, () => {
      render(<Badge variant=&apos;destructive&apos;>Destructive</Badge>);

      const badge = screen.getByText(&apos;Destructive&apos;);
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain(&apos;bg-destructive&apos;);
    });

    it(&apos;should render outline variant&apos;, () => {
      render(<Badge variant=&apos;outline&apos;>Outline</Badge>);

      const badge = screen.getByText(&apos;Outline&apos;);
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain(&apos;text-foreground&apos;);
    });
  });

  describe(&apos;Badge with Icons&apos;, () => {
    it(&apos;should render badge with icon&apos;, () => {
      render(
        <Badge>
          <Plus className=&apos;h-3 w-3&apos; />
          With Icon
        </Badge>
      );

      const badge = screen.getByText(&apos;With Icon&apos;);
      expect(badge).toBeInTheDocument();

      // Icon should be present
      const icon = document.querySelector(&apos;svg&apos;);
      expect(icon).toBeInTheDocument();
    });

    it(&apos;should render badge with multiple icons&apos;, () => {
      render(
        <Badge>
          <Plus className=&apos;h-3 w-3&apos; />
          <AlertTriangle className=&apos;h-3 w-3&apos; />
          Multiple Icons
        </Badge>
      );

      const badge = screen.getByText(&apos;Multiple Icons&apos;);
      expect(badge).toBeInTheDocument();

      // Multiple icons should be present
      const icons = document.querySelectorAll(&apos;svg&apos;);
      expect(icons).toHaveLength(2);
    });
  });

  describe(&apos;Interactive Badge (asChild)&apos;, () => {
    it(&apos;should handle click on badge button&apos;, async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();

      render(
        <Badge asChild>
          <button onClick={mockOnClick}>Clickable Badge</button>
        </Badge>
      );

      const badgeButton = screen.getByRole(&apos;button&apos;, {
        name: /clickable badge/i,
      });
      await user.click(badgeButton);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it(&apos;should handle multiple clicks on badge button&apos;, async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();

      render(
        <Badge asChild>
          <button onClick={mockOnClick}>Multi Click Badge</button>
        </Badge>
      );

      const badgeButton = screen.getByRole(&apos;button&apos;, {
        name: /multi click badge/i,
      });

      await user.click(badgeButton);
      await user.click(badgeButton);
      await user.click(badgeButton);

      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });

    it(&apos;should handle keyboard activation on badge button&apos;, async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();

      render(
        <Badge asChild>
          <button onClick={mockOnClick}>Keyboard Badge</button>
        </Badge>
      );

      const badgeButton = screen.getByRole(&apos;button&apos;, {
        name: /keyboard badge/i,
      });

      // Focus and press Enter
      badgeButton.focus();
      await user.keyboard(&apos;{Enter}&apos;);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it(&apos;should handle Space key activation on badge button&apos;, async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();

      render(
        <Badge asChild>
          <button onClick={mockOnClick}>Space Badge</button>
        </Badge>
      );

      const badgeButton = screen.getByRole(&apos;button&apos;, { name: /space badge/i });

      // Focus and press Space
      badgeButton.focus();
      await user.keyboard(&apos; &apos;);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe(&apos;Accessibility&apos;, () => {
    it(&apos;should have proper data attributes&apos;, () => {
      render(<Badge>Accessible Badge</Badge>);

      const badge = screen.getByText(&apos;Accessible Badge&apos;);
      expect(badge).toHaveAttribute(&apos;data-slot&apos;, &apos;badge&apos;);
    });

    it(&apos;should support custom aria attributes&apos;, () => {
      render(
        <Badge aria-label=&apos;Custom badge label&apos; role=&apos;status&apos;>
          Custom Badge
        </Badge>
      );

      const badge = screen.getByText(&apos;Custom Badge&apos;);
      expect(badge).toHaveAttribute(&apos;aria-label&apos;, &apos;Custom badge label&apos;);
      expect(badge).toHaveAttribute(&apos;role&apos;, &apos;status&apos;);
    });

    it(&apos;should be focusable when rendered as button&apos;, () => {
      render(
        <Badge asChild>
          <button>Focusable Badge</button>
        </Badge>
      );

      const badgeButton = screen.getByRole(&apos;button&apos;, {
        name: /focusable badge/i,
      });
      badgeButton.focus();

      expect(badgeButton).toHaveFocus();
    });
  });

  describe(&apos;Custom Styling&apos;, () => {
    it(&apos;should apply custom className&apos;, () => {
      render(<Badge className=&apos;custom-class&apos;>Custom Badge</Badge>);

      const badge = screen.getByText(&apos;Custom Badge&apos;);
      expect(badge).toHaveClass(&apos;custom-class&apos;);
    });

    it(&apos;should merge custom className with variant classes&apos;, () => {
      render(
        <Badge variant=&apos;destructive&apos; className=&apos;custom-destructive&apos;>
          Custom Destructive
        </Badge>
      );

      const badge = screen.getByText(&apos;Custom Destructive&apos;);
      expect(badge).toHaveClass(&apos;custom-destructive&apos;);
      expect(badge.className).toContain(&apos;bg-destructive&apos;);
    });
  });

  describe(&apos;Event Handling&apos;, () => {
    it(&apos;should handle mouse events on badge button&apos;, async () => {
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

      const badgeButton = screen.getByRole(&apos;button&apos;, { name: /event badge/i });

      await user.pointer({ keys: &apos;[MouseLeft>]&apos;, target: badgeButton });
      expect(mockOnMouseDown).toHaveBeenCalledTimes(1);

      await user.pointer({ keys: &apos;[/MouseLeft]&apos;, target: badgeButton });
      expect(mockOnMouseUp).toHaveBeenCalledTimes(1);
    });

    it(&apos;should handle focus and blur events&apos;, async () => {
      const mockOnFocus = vi.fn();
      const mockOnBlur = vi.fn();

      render(
        <Badge asChild>
          <button onFocus={mockOnFocus} onBlur={mockOnBlur}>
            Focus Badge
          </button>
        </Badge>
      );

      const badgeButton = screen.getByRole(&apos;button&apos;, { name: /focus badge/i });

      badgeButton.focus();
      expect(mockOnFocus).toHaveBeenCalledTimes(1);

      badgeButton.blur();
      expect(mockOnBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe(&apos;Edge Cases&apos;, () => {
    it(&apos;should handle empty content&apos;, () => {
      render(<Badge></Badge>);

      const badge = document.querySelector(&apos;[data-slot=&quot;badge&quot;]&apos;);
      expect(badge).toBeInTheDocument();
    });

    it(&apos;should handle very long text&apos;, () => {
      const longText =
        &apos;This is a very long badge text that should be handled properly by the component&apos;;
      render(<Badge>{longText}</Badge>);

      const badge = screen.getByText(longText);
      expect(badge).toBeInTheDocument();
    });

    it(&apos;should handle special characters&apos;, () => {
      render(<Badge>Special: @#$%^&*()</Badge>);

      const badge = screen.getByText(&apos;Special: @#$%^&*()&apos;);
      expect(badge).toBeInTheDocument();
    });

    it(&apos;should handle disabled state when asChild&apos;, () => {
      render(
        <Badge asChild>
          <button disabled>Disabled Badge</button>
        </Badge>
      );

      const badgeButton = screen.getByRole(&apos;button&apos;, {
        name: /disabled badge/i,
      });
      expect(badgeButton).toBeDisabled();
    });
  });
});
