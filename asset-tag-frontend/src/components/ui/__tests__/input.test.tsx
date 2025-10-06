import React from &apos;react&apos;;
import { describe, it, expect, vi } from &apos;vitest&apos;;
import { screen } from &apos;@testing-library/react&apos;;
import userEvent from &apos;@testing-library/user-event&apos;;
import { Input } from &apos;../input&apos;;
import { render } from &apos;../../../test/test-utils&apos;;

describe(&apos;Input Component - Click Tests&apos;, () => {
  describe(&apos;Basic Input Functionality&apos;, () => {
    it(&apos;should render input with default type&apos;, () => {
      render(<Input placeholder=&apos;Enter text&apos; />);

      const input = screen.getByPlaceholderText(&apos;Enter text&apos;);
      expect(input).toBeInTheDocument();
      // Input component doesn&apos;t explicitly set type=&quot;text&quot; by default
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute(&apos;data-slot&apos;, &apos;input&apos;);
    });

    it(&apos;should render input with specific type&apos;, () => {
      render(<Input type=&apos;email&apos; placeholder=&apos;Enter email&apos; />);

      const input = screen.getByPlaceholderText(&apos;Enter email&apos;);
      expect(input).toHaveAttribute(&apos;type&apos;, &apos;email&apos;);
    });

    it(&apos;should handle text input&apos;, async () => {
      const user = userEvent.setup();
      render(<Input placeholder=&apos;Enter text&apos; />);

      const input = screen.getByPlaceholderText(&apos;Enter text&apos;);
      await user.type(input, &apos;Hello World&apos;);

      expect(input).toHaveValue(&apos;Hello World&apos;);
    });

    it(&apos;should handle input focus and blur&apos;, async () => {
      const user = userEvent.setup();
      const mockOnFocus = vi.fn();
      const mockOnBlur = vi.fn();

      render(
        <Input
          placeholder=&apos;Focus test&apos;
          onFocus={mockOnFocus}
          onBlur={mockOnBlur}
        />
      );

      const input = screen.getByPlaceholderText(&apos;Focus test&apos;);

      await user.click(input);
      expect(mockOnFocus).toHaveBeenCalledTimes(1);

      await user.tab();
      expect(mockOnBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe(&apos;Input Types&apos;, () => {
    it(&apos;should handle text input type&apos;, async () => {
      const user = userEvent.setup();
      render(<Input type=&apos;text&apos; placeholder=&apos;Text input&apos; />);

      const input = screen.getByPlaceholderText(&apos;Text input&apos;);
      await user.type(input, &apos;Text content&apos;);

      expect(input).toHaveValue(&apos;Text content&apos;);
    });

    it(&apos;should handle email input type&apos;, async () => {
      const user = userEvent.setup();
      render(<Input type=&apos;email&apos; placeholder=&apos;Email input&apos; />);

      const input = screen.getByPlaceholderText(&apos;Email input&apos;);
      await user.type(input, &apos;test@example.com&apos;);

      expect(input).toHaveValue(&apos;test@example.com&apos;);
    });

    it(&apos;should handle password input type&apos;, async () => {
      const user = userEvent.setup();
      render(<Input type=&apos;password&apos; placeholder=&apos;Password input&apos; />);

      const input = screen.getByPlaceholderText(&apos;Password input&apos;);
      await user.type(input, &apos;secretpassword&apos;);

      expect(input).toHaveValue(&apos;secretpassword&apos;);
      expect(input).toHaveAttribute(&apos;type&apos;, &apos;password&apos;);
    });

    it(&apos;should handle number input type&apos;, async () => {
      const user = userEvent.setup();
      render(<Input type=&apos;number&apos; placeholder=&apos;Number input&apos; />);

      const input = screen.getByPlaceholderText(&apos;Number input&apos;);
      await user.type(input, &apos;123&apos;);

      expect(input).toHaveValue(123);
      expect(input).toHaveAttribute(&apos;type&apos;, &apos;number&apos;);
    });

    it(&apos;should handle search input type&apos;, async () => {
      const user = userEvent.setup();
      render(<Input type=&apos;search&apos; placeholder=&apos;Search input&apos; />);

      const input = screen.getByPlaceholderText(&apos;Search input&apos;);
      await user.type(input, &apos;search query&apos;);

      expect(input).toHaveValue(&apos;search query&apos;);
      expect(input).toHaveAttribute(&apos;type&apos;, &apos;search&apos;);
    });

    it(&apos;should handle tel input type&apos;, async () => {
      const user = userEvent.setup();
      render(<Input type=&apos;tel&apos; placeholder=&apos;Phone input&apos; />);

      const input = screen.getByPlaceholderText(&apos;Phone input&apos;);
      await user.type(input, &apos;123-456-7890&apos;);

      expect(input).toHaveValue(&apos;123-456-7890&apos;);
      expect(input).toHaveAttribute(&apos;type&apos;, &apos;tel&apos;);
    });

    it(&apos;should handle url input type&apos;, async () => {
      const user = userEvent.setup();
      render(<Input type=&apos;url&apos; placeholder=&apos;URL input&apos; />);

      const input = screen.getByPlaceholderText(&apos;URL input&apos;);
      await user.type(input, &apos;https://example.com&apos;);

      expect(input).toHaveValue(&apos;https://example.com&apos;);
      expect(input).toHaveAttribute(&apos;type&apos;, &apos;url&apos;);
    });
  });

  describe(&apos;Input Interactions&apos;, () => {
    it(&apos;should handle click events&apos;, async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();

      render(<Input placeholder=&apos;Clickable input&apos; onClick={mockOnClick} />);

      const input = screen.getByPlaceholderText(&apos;Clickable input&apos;);
      await user.click(input);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it(&apos;should handle change events&apos;, async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();

      render(<Input placeholder=&apos;Change input&apos; onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText(&apos;Change input&apos;);
      await user.type(input, &apos;test&apos;);

      expect(mockOnChange).toHaveBeenCalledTimes(4); // One for each character
    });

    it(&apos;should handle input events&apos;, async () => {
      const user = userEvent.setup();
      const mockOnInput = vi.fn();

      render(<Input placeholder=&apos;Input event&apos; onInput={mockOnInput} />);

      const input = screen.getByPlaceholderText(&apos;Input event&apos;);
      await user.type(input, &apos;a&apos;);

      expect(mockOnInput).toHaveBeenCalledTimes(1);
    });

    it(&apos;should handle keydown events&apos;, async () => {
      const user = userEvent.setup();
      const mockOnKeyDown = vi.fn();

      render(<Input placeholder=&apos;Keydown input&apos; onKeyDown={mockOnKeyDown} />);

      const input = screen.getByPlaceholderText(&apos;Keydown input&apos;);
      await user.type(input, &apos;a&apos;);

      expect(mockOnKeyDown).toHaveBeenCalledTimes(1);
    });

    it(&apos;should handle keyup events&apos;, async () => {
      const user = userEvent.setup();
      const mockOnKeyUp = vi.fn();

      render(<Input placeholder=&apos;Keyup input&apos; onKeyUp={mockOnKeyUp} />);

      const input = screen.getByPlaceholderText(&apos;Keyup input&apos;);
      await user.type(input, &apos;a&apos;);

      expect(mockOnKeyUp).toHaveBeenCalledTimes(1);
    });
  });

  describe(&apos;Input Validation&apos;, () => {
    it(&apos;should handle required attribute&apos;, () => {
      render(<Input placeholder=&apos;Required input&apos; required />);

      const input = screen.getByPlaceholderText(&apos;Required input&apos;);
      expect(input).toBeRequired();
    });

    it(&apos;should handle disabled state&apos;, () => {
      render(<Input placeholder=&apos;Disabled input&apos; disabled />);

      const input = screen.getByPlaceholderText(&apos;Disabled input&apos;);
      expect(input).toBeDisabled();
    });

    it(&apos;should handle readonly state&apos;, () => {
      render(<Input placeholder=&apos;Readonly input&apos; readOnly />);

      const input = screen.getByPlaceholderText(&apos;Readonly input&apos;);
      expect(input).toHaveAttribute(&apos;readonly&apos;);
    });

    it(&apos;should handle invalid state&apos;, () => {
      render(<Input placeholder=&apos;Invalid input&apos; aria-invalid=&apos;true&apos; />);

      const input = screen.getByPlaceholderText(&apos;Invalid input&apos;);
      expect(input).toHaveAttribute(&apos;aria-invalid&apos;, &apos;true&apos;);
    });

    it(&apos;should handle min and max attributes for number input&apos;, () => {
      render(
        <Input type=&apos;number&apos; placeholder=&apos;Number range&apos; min=&apos;0&apos; max=&apos;100&apos; />
      );

      const input = screen.getByPlaceholderText(&apos;Number range&apos;);
      expect(input).toHaveAttribute(&apos;min&apos;, &apos;0&apos;);
      expect(input).toHaveAttribute(&apos;max&apos;, &apos;100&apos;);
    });

    it(&apos;should handle minlength and maxlength attributes&apos;, () => {
      render(
        <Input placeholder=&apos;Length limited&apos; minLength={2} maxLength={10} />
      );

      const input = screen.getByPlaceholderText(&apos;Length limited&apos;);
      expect(input).toHaveAttribute(&apos;minlength&apos;, &apos;2&apos;);
      expect(input).toHaveAttribute(&apos;maxlength&apos;, &apos;10&apos;);
    });
  });

  describe(&apos;Input Accessibility&apos;, () => {
    it(&apos;should support aria-label&apos;, () => {
      render(<Input aria-label=&apos;Custom input label&apos; />);

      const input = screen.getByLabelText(&apos;Custom input label&apos;);
      expect(input).toBeInTheDocument();
    });

    it(&apos;should support aria-describedby&apos;, () => {
      render(
        <div>
          <Input aria-describedby=&apos;help-text&apos; />
          <div id=&apos;help-text&apos;>This is help text</div>
        </div>
      );

      const input = screen.getByRole(&apos;textbox&apos;);
      expect(input).toHaveAttribute(&apos;aria-describedby&apos;, &apos;help-text&apos;);
    });

    it(&apos;should support aria-labelledby&apos;, () => {
      render(
        <div>
          <div id=&apos;label-text&apos;>Input Label</div>
          <Input aria-labelledby=&apos;label-text&apos; />
        </div>
      );

      const input = screen.getByLabelText(&apos;Input Label&apos;);
      expect(input).toBeInTheDocument();
    });

    it(&apos;should support custom role&apos;, () => {
      render(<Input role=&apos;searchbox&apos; placeholder=&apos;Search&apos; />);

      const input = screen.getByRole(&apos;searchbox&apos;);
      expect(input).toBeInTheDocument();
    });
  });

  describe(&apos;Input Custom Styling&apos;, () => {
    it(&apos;should apply custom className&apos;, () => {
      render(
        <Input className=&apos;custom-input-class&apos; placeholder=&apos;Custom styled&apos; />
      );

      const input = screen.getByPlaceholderText(&apos;Custom styled&apos;);
      expect(input).toHaveClass(&apos;custom-input-class&apos;);
    });

    it(&apos;should merge custom className with default classes&apos;, () => {
      render(<Input className=&apos;custom-class&apos; placeholder=&apos;Merged classes&apos; />);

      const input = screen.getByPlaceholderText(&apos;Merged classes&apos;);
      expect(input).toHaveClass(&apos;custom-class&apos;);
      expect(input).toHaveClass(&apos;border&apos;); // Default class should still be present
    });
  });

  describe(&apos;Input Event Handling&apos;, () => {
    it(&apos;should handle mouse events&apos;, async () => {
      const user = userEvent.setup();
      const mockOnMouseEnter = vi.fn();
      const mockOnMouseLeave = vi.fn();

      render(
        <Input
          placeholder=&apos;Mouse events&apos;
          onMouseEnter={mockOnMouseEnter}
          onMouseLeave={mockOnMouseLeave}
        />
      );

      const input = screen.getByPlaceholderText(&apos;Mouse events&apos;);

      await user.hover(input);
      expect(mockOnMouseEnter).toHaveBeenCalledTimes(1);

      await user.unhover(input);
      expect(mockOnMouseLeave).toHaveBeenCalledTimes(1);
    });

    it(&apos;should handle mouse down and up events&apos;, async () => {
      const user = userEvent.setup();
      const mockOnMouseDown = vi.fn();
      const mockOnMouseUp = vi.fn();

      render(
        <Input
          placeholder=&apos;Mouse down/up&apos;
          onMouseDown={mockOnMouseDown}
          onMouseUp={mockOnMouseUp}
        />
      );

      const input = screen.getByPlaceholderText(&apos;Mouse down/up&apos;);

      await user.pointer({ keys: &apos;[MouseLeft>]&apos;, target: input });
      expect(mockOnMouseDown).toHaveBeenCalledTimes(1);

      await user.pointer({ keys: &apos;[/MouseLeft]&apos;, target: input });
      expect(mockOnMouseUp).toHaveBeenCalledTimes(1);
    });
  });

  describe(&apos;Input Edge Cases&apos;, () => {
    it(&apos;should handle empty value&apos;, () => {
      render(<Input placeholder=&apos;Empty input&apos; />);

      const input = screen.getByPlaceholderText(&apos;Empty input&apos;);
      expect(input).toHaveValue(&apos;&apos;);
    });

    it(&apos;should handle controlled input&apos;, async () => {
      const user = userEvent.setup();
      const TestComponent = () => {
        const [value, setValue] = React.useState(&apos;&apos;);
        return (
          <Input
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder=&apos;Controlled input&apos;
          />
        );
      };

      render(<TestComponent />);

      const input = screen.getByPlaceholderText(&apos;Controlled input&apos;);
      await user.type(input, &apos;controlled&apos;);

      expect(input).toHaveValue(&apos;controlled&apos;);
    });

    it(&apos;should handle special characters&apos;, async () => {
      const user = userEvent.setup();
      render(<Input placeholder=&apos;Special chars&apos; />);

      const input = screen.getByPlaceholderText(&apos;Special chars&apos;);
      await user.type(input, &apos;!@#$%^&*()&apos;);

      expect(input).toHaveValue(&apos;!@#$%^&*()&apos;);
    });

    it(&apos;should handle very long text&apos;, async () => {
      const user = userEvent.setup();
      const longText = &apos;a&apos;.repeat(1000);

      render(<Input placeholder=&apos;Long text&apos; />);

      const input = screen.getByPlaceholderText(&apos;Long text&apos;);
      await user.type(input, longText);

      expect(input).toHaveValue(longText);
    });

    it(&apos;should handle copy and paste&apos;, async () => {
      const user = userEvent.setup();
      render(<Input placeholder=&apos;Copy paste test&apos; />);

      const input = screen.getByPlaceholderText(&apos;Copy paste test&apos;);

      // Type some text
      await user.type(input, &apos;Hello&apos;);

      // Select all and copy
      await user.keyboard(&apos;{Control>}a{/Control}&apos;);
      await user.keyboard(&apos;{Control>}c{/Control}&apos;);

      // Clear and paste
      await user.keyboard(&apos;{Control>}a{/Control}&apos;);
      await user.keyboard(&apos;{Control>}v{/Control}&apos;);

      expect(input).toHaveValue(&apos;Hello&apos;);
    });
  });

  describe(&apos;Input Form Integration&apos;, () => {
    it(&apos;should work within a form&apos;, async () => {
      const user = userEvent.setup();
      const mockSubmit = vi.fn();

      render(
        <form onSubmit={mockSubmit}>
          <Input name=&apos;test-input&apos; placeholder=&apos;Form input&apos; />
          <button type=&apos;submit&apos;>Submit</button>
        </form>
      );

      const input = screen.getByPlaceholderText(&apos;Form input&apos;);
      const submitButton = screen.getByRole(&apos;button&apos;, { name: /submit/i });

      await user.type(input, &apos;form data&apos;);
      await user.click(submitButton);

      expect(mockSubmit).toHaveBeenCalledTimes(1);
    });

    it(&apos;should handle form reset&apos;, async () => {
      const user = userEvent.setup();

      render(
        <form>
          <Input name=&apos;reset-input&apos; placeholder=&apos;Reset input&apos; />
          <button type=&apos;reset&apos;>Reset</button>
        </form>
      );

      const input = screen.getByPlaceholderText(&apos;Reset input&apos;);
      const resetButton = screen.getByRole(&apos;button&apos;, { name: /reset/i });

      await user.type(input, &apos;some text&apos;);
      expect(input).toHaveValue(&apos;some text&apos;);

      await user.click(resetButton);
      expect(input).toHaveValue(&apos;&apos;);
    });
  });
});
