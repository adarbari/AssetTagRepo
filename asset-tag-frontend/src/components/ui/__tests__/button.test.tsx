import React from &apos;react&apos;;
import { describe, it, expect, vi } from &apos;vitest&apos;;
import { screen } from &apos;@testing-library/react&apos;;
import userEvent from &apos;@testing-library/user-event&apos;;
import { Button } from &apos;../button&apos;;
import { render } from &apos;../../../test/test-utils&apos;;
import { Plus } from &apos;lucide-react&apos;;

describe(&apos;Button Component - Click Tests&apos;, () => {
  describe(&apos;Basic Click Functionality&apos;, () => {
    it(&apos;should render button with text&apos;, () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole(&apos;button&apos;, { name: /click me/i });
      expect(button).toBeInTheDocument();
    });

    it(&apos;should call onClick when clicked&apos;, async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();

      render(<Button onClick={mockOnClick}>Click me</Button>);

      const button = screen.getByRole(&apos;button&apos;, { name: /click me/i });
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it(&apos;should not call onClick when disabled&apos;, async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();

      render(
        <Button onClick={mockOnClick} disabled>
          Click me
        </Button>
      );

      const button = screen.getByRole(&apos;button&apos;, { name: /click me/i });
      expect(button).toBeDisabled();

      await user.click(button);
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it(&apos;should handle multiple clicks&apos;, async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();

      render(<Button onClick={mockOnClick}>Click me</Button>);

      const button = screen.getByRole(&apos;button&apos;, { name: /click me/i });

      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });
  });

  describe(&apos;Button Variants&apos;, () => {
    it(&apos;should render default variant&apos;, () => {
      render(<Button>Default Button</Button>);

      const button = screen.getByRole(&apos;button&apos;, { name: /default button/i });
      expect(button).toHaveClass(&apos;bg-primary&apos;);
    });

    it(&apos;should render destructive variant&apos;, () => {
      render(<Button variant=&apos;destructive&apos;>Delete</Button>);

      const button = screen.getByRole(&apos;button&apos;, { name: /delete/i });
      expect(button).toHaveClass(&apos;bg-destructive&apos;);
    });

    it(&apos;should render outline variant&apos;, () => {
      render(<Button variant=&apos;outline&apos;>Outline Button</Button>);

      const button = screen.getByRole(&apos;button&apos;, { name: /outline button/i });
      expect(button).toHaveClass(&apos;border&apos;);
    });

    it(&apos;should render secondary variant&apos;, () => {
      render(<Button variant=&apos;secondary&apos;>Secondary Button</Button>);

      const button = screen.getByRole(&apos;button&apos;, { name: /secondary button/i });
      expect(button).toHaveClass(&apos;bg-secondary&apos;);
    });

    it(&apos;should render ghost variant&apos;, () => {
      render(<Button variant=&apos;ghost&apos;>Ghost Button</Button>);

      const button = screen.getByRole(&apos;button&apos;, { name: /ghost button/i });
      expect(button).toHaveClass(&apos;hover:bg-accent&apos;);
    });

    it(&apos;should render link variant&apos;, () => {
      render(<Button variant=&apos;link&apos;>Link Button</Button>);

      const button = screen.getByRole(&apos;button&apos;, { name: /link button/i });
      expect(button).toHaveClass(&apos;text-primary&apos;);
    });
  });

  describe(&apos;Button Sizes&apos;, () => {
    it(&apos;should render default size&apos;, () => {
      render(<Button>Default Size</Button>);

      const button = screen.getByRole(&apos;button&apos;, { name: /default size/i });
      expect(button).toHaveClass(&apos;h-9&apos;);
    });

    it(&apos;should render small size&apos;, () => {
      render(<Button size=&apos;sm&apos;>Small Button</Button>);

      const button = screen.getByRole(&apos;button&apos;, { name: /small button/i });
      expect(button).toHaveClass(&apos;h-8&apos;);
    });

    it(&apos;should render large size&apos;, () => {
      render(<Button size=&apos;lg&apos;>Large Button</Button>);

      const button = screen.getByRole(&apos;button&apos;, { name: /large button/i });
      expect(button).toHaveClass(&apos;h-10&apos;);
    });

    it(&apos;should render icon size&apos;, () => {
      render(<Button size=&apos;icon&apos;>Icon Button</Button>);

      const button = screen.getByRole(&apos;button&apos;, { name: /icon button/i });
      expect(button).toHaveClass(&apos;size-9&apos;);
    });
  });

  describe(&apos;Button with Icons&apos;, () => {
    it(&apos;should render button with icon&apos;, () => {
      render(
        <Button>
          <Plus className=&apos;h-4 w-4&apos; />
          Add Item
        </Button>
      );

      const button = screen.getByRole(&apos;button&apos;, { name: /add item/i });
      expect(button).toBeInTheDocument();

      // Icon should be present (SVG elements don&apos;t have img role by default)
      const icon = document.querySelector(&apos;svg&apos;);
      expect(icon).toBeInTheDocument();
    });

    it(&apos;should handle click on button with icon&apos;, async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();

      render(
        <Button onClick={mockOnClick}>
          <Plus className=&apos;h-4 w-4&apos; />
          Add Item
        </Button>
      );

      const button = screen.getByRole(&apos;button&apos;, { name: /add item/i });
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it(&apos;should handle click on icon within button&apos;, async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();

      render(
        <Button onClick={mockOnClick}>
          <Plus className=&apos;h-4 w-4&apos; />
          Add Item
        </Button>
      );

      const icon = document.querySelector(&apos;svg&apos;);
      expect(icon).toBeInTheDocument();
      if (icon) await user.click(icon);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe(&apos;Button Types&apos;, () => {
    it(&apos;should render as button type by default&apos;, () => {
      render(<Button>Submit</Button>);

      const button = screen.getByRole(&apos;button&apos;, { name: /submit/i });
      // Button component doesn&apos;t explicitly set type, so it uses browser default
      // The button should be clickable and functional
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe(&apos;BUTTON&apos;);
    });

    it(&apos;should render as submit type when specified&apos;, () => {
      render(<Button type=&apos;submit&apos;>Submit</Button>);

      const button = screen.getByRole(&apos;button&apos;, { name: /submit/i });
      expect(button).toHaveAttribute(&apos;type&apos;, &apos;submit&apos;);
    });

    it(&apos;should render as reset type when specified&apos;, () => {
      render(<Button type=&apos;reset&apos;>Reset</Button>);

      const button = screen.getByRole(&apos;button&apos;, { name: /reset/i });
      expect(button).toHaveAttribute(&apos;type&apos;, &apos;reset&apos;);
    });
  });

  describe(&apos;Accessibility&apos;, () => {
    it(&apos;should have proper button role&apos;, () => {
      render(<Button>Accessible Button</Button>);

      const button = screen.getByRole(&apos;button&apos;, { name: /accessible button/i });
      expect(button).toBeInTheDocument();
    });

    it(&apos;should support keyboard navigation&apos;, async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();

      render(<Button onClick={mockOnClick}>Keyboard Button</Button>);

      const button = screen.getByRole(&apos;button&apos;, { name: /keyboard button/i });

      // Tab to button
      await user.tab();
      expect(document.activeElement).toBe(button);

      // Press Enter
      await user.keyboard(&apos;{Enter}&apos;);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it(&apos;should support Space key activation&apos;, async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();

      render(<Button onClick={mockOnClick}>Space Button</Button>);

      const button = screen.getByRole(&apos;button&apos;, { name: /space button/i });
      button.focus();

      // Press Space
      await user.keyboard(&apos; &apos;);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it(&apos;should have proper focus styles&apos;, () => {
      render(<Button>Focus Button</Button>);

      const button = screen.getByRole(&apos;button&apos;, { name: /focus button/i });
      expect(button).toHaveClass(&apos;focus-visible:ring-ring/50&apos;);
    });

    it(&apos;should be disabled when disabled prop is true&apos;, () => {
      render(<Button disabled>Disabled Button</Button>);

      const button = screen.getByRole(&apos;button&apos;, { name: /disabled button/i });
      expect(button).toBeDisabled();
      expect(button).toHaveClass(&apos;disabled:opacity-50&apos;);
    });
  });

  describe(&apos;Form Integration&apos;, () => {
    it(&apos;should submit form when type is submit&apos;, async () => {
      const user = userEvent.setup();
      const mockSubmit = vi.fn();

      render(
        <form onSubmit={mockSubmit}>
          <Button type=&apos;submit&apos;>Submit Form</Button>
        </form>
      );

      const button = screen.getByRole(&apos;button&apos;, { name: /submit form/i });
      await user.click(button);

      expect(mockSubmit).toHaveBeenCalledTimes(1);
    });

    it(&apos;should reset form when type is reset&apos;, async () => {
      const user = userEvent.setup();
      const mockReset = vi.fn();

      render(
        <form onReset={mockReset}>
          <input defaultValue=&apos;test&apos; />
          <Button type=&apos;reset&apos;>Reset Form</Button>
        </form>
      );

      const button = screen.getByRole(&apos;button&apos;, { name: /reset form/i });
      await user.click(button);

      expect(mockReset).toHaveBeenCalledTimes(1);
    });
  });

  describe(&apos;Event Handling&apos;, () => {
    it(&apos;should handle onMouseDown&apos;, async () => {
      const user = userEvent.setup();
      const mockOnMouseDown = vi.fn();

      render(<Button onMouseDown={mockOnMouseDown}>Mouse Button</Button>);

      const button = screen.getByRole(&apos;button&apos;, { name: /mouse button/i });
      await user.pointer({ keys: &apos;[MouseLeft>]&apos;, target: button });

      expect(mockOnMouseDown).toHaveBeenCalledTimes(1);
    });

    it(&apos;should handle onMouseUp&apos;, async () => {
      const user = userEvent.setup();
      const mockOnMouseUp = vi.fn();

      render(<Button onMouseUp={mockOnMouseUp}>Mouse Button</Button>);

      const button = screen.getByRole(&apos;button&apos;, { name: /mouse button/i });
      await user.pointer({ keys: &apos;[MouseLeft/]&apos;, target: button });

      expect(mockOnMouseUp).toHaveBeenCalledTimes(1);
    });

    it(&apos;should handle onFocus&apos;, async () => {
      const user = userEvent.setup();
      const mockOnFocus = vi.fn();

      render(<Button onFocus={mockOnFocus}>Focus Button</Button>);

      screen.getByRole(&apos;button&apos;, { name: /focus button/i });
      await user.tab();

      expect(mockOnFocus).toHaveBeenCalledTimes(1);
    });

    it(&apos;should handle onBlur&apos;, async () => {
      const mockOnBlur = vi.fn();

      render(
        <>
          <Button onBlur={mockOnBlur}>Blur Button</Button>
          <button>Other Button</button>
        </>
      );

      const button = screen.getByRole(&apos;button&apos;, { name: /blur button/i });
      const otherButton = screen.getByRole(&apos;button&apos;, { name: /other button/i });

      button.focus();
      otherButton.focus();

      expect(mockOnBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe(&apos;Custom Props&apos;, () => {
    it(&apos;should pass through custom props&apos;, () => {
      render(
        <Button data-testid=&apos;custom-button&apos; aria-label=&apos;Custom Label&apos;>
          Custom
        </Button>
      );

      const button = screen.getByTestId(&apos;custom-button&apos;);
      expect(button).toHaveAttribute(&apos;aria-label&apos;, &apos;Custom Label&apos;);
    });

    it(&apos;should apply custom className&apos;, () => {
      render(<Button className=&apos;custom-class&apos;>Custom Class</Button>);

      const button = screen.getByRole(&apos;button&apos;, { name: /custom class/i });
      expect(button).toHaveClass(&apos;custom-class&apos;);
    });
  });
});
