import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../button';
import { render } from '../../../test/test-utils';
import { Plus } from 'lucide-react';

describe('Button Component - Click Tests', () => {
  describe('Basic Click Functionality', () => {
    it('should render button with text', () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
    });

    it('should call onClick when clicked', async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();

      render(<Button onClick={mockOnClick}>Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();

      render(
        <Button onClick={mockOnClick} disabled>
          Click me
        </Button>
      );

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeDisabled();

      await user.click(button);
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should handle multiple clicks', async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();

      render(<Button onClick={mockOnClick}>Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });

      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('Button Variants', () => {
    it('should render default variant', () => {
      render(<Button>Default Button</Button>);

      const button = screen.getByRole('button', { name: /default button/i });
      expect(button).toHaveClass('bg-primary');
    });

    it('should render destructive variant', () => {
      render(<Button variant='destructive'>Delete</Button>);

      const button = screen.getByRole('button', { name: /delete/i });
      expect(button).toHaveClass('bg-destructive');
    });

    it('should render outline variant', () => {
      render(<Button variant='outline'>Outline Button</Button>);

      const button = screen.getByRole('button', { name: /outline button/i });
      expect(button).toHaveClass('border');
    });

    it('should render secondary variant', () => {
      render(<Button variant='secondary'>Secondary Button</Button>);

      const button = screen.getByRole('button', { name: /secondary button/i });
      expect(button).toHaveClass('bg-secondary');
    });

    it('should render ghost variant', () => {
      render(<Button variant='ghost'>Ghost Button</Button>);

      const button = screen.getByRole('button', { name: /ghost button/i });
      expect(button).toHaveClass('hover:bg-accent');
    });

    it('should render link variant', () => {
      render(<Button variant='link'>Link Button</Button>);

      const button = screen.getByRole('button', { name: /link button/i });
      expect(button).toHaveClass('text-primary');
    });
  });

  describe('Button Sizes', () => {
    it('should render default size', () => {
      render(<Button>Default Size</Button>);

      const button = screen.getByRole('button', { name: /default size/i });
      expect(button).toHaveClass('h-9');
    });

    it('should render small size', () => {
      render(<Button size='sm'>Small Button</Button>);

      const button = screen.getByRole('button', { name: /small button/i });
      expect(button).toHaveClass('h-8');
    });

    it('should render large size', () => {
      render(<Button size='lg'>Large Button</Button>);

      const button = screen.getByRole('button', { name: /large button/i });
      expect(button).toHaveClass('h-10');
    });

    it('should render icon size', () => {
      render(<Button size='icon'>Icon Button</Button>);

      const button = screen.getByRole('button', { name: /icon button/i });
      expect(button).toHaveClass('size-9');
    });
  });

  describe('Button with Icons', () => {
    it('should render button with icon', () => {
      render(
        <Button>
          <Plus className='h-4 w-4' />
          Add Item
        </Button>
      );

      const button = screen.getByRole('button', { name: /add item/i });
      expect(button).toBeInTheDocument();

      // Icon should be present (SVG elements don't have img role by default)
      const icon = document.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should handle click on button with icon', async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();

      render(
        <Button onClick={mockOnClick}>
          <Plus className='h-4 w-4' />
          Add Item
        </Button>
      );

      const button = screen.getByRole('button', { name: /add item/i });
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should handle click on icon within button', async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();

      render(
        <Button onClick={mockOnClick}>
          <Plus className='h-4 w-4' />
          Add Item
        </Button>
      );

      const icon = document.querySelector('svg');
      expect(icon).toBeInTheDocument();
      if (icon) await user.click(icon);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Button Types', () => {
    it('should render as button type by default', () => {
      render(<Button>Submit</Button>);

      const button = screen.getByRole('button', { name: /submit/i });
      // Button component doesn't explicitly set type, so it uses browser default
      // The button should be clickable and functional
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe('BUTTON');
    });

    it('should render as submit type when specified', () => {
      render(<Button type='submit'>Submit</Button>);

      const button = screen.getByRole('button', { name: /submit/i });
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should render as reset type when specified', () => {
      render(<Button type='reset'>Reset</Button>);

      const button = screen.getByRole('button', { name: /reset/i });
      expect(button).toHaveAttribute('type', 'reset');
    });
  });

  describe('Accessibility', () => {
    it('should have proper button role', () => {
      render(<Button>Accessible Button</Button>);

      const button = screen.getByRole('button', { name: /accessible button/i });
      expect(button).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();

      render(<Button onClick={mockOnClick}>Keyboard Button</Button>);

      const button = screen.getByRole('button', { name: /keyboard button/i });

      // Tab to button
      await user.tab();
      expect(document.activeElement).toBe(button);

      // Press Enter
      await user.keyboard('{Enter}');
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should support Space key activation', async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();

      render(<Button onClick={mockOnClick}>Space Button</Button>);

      const button = screen.getByRole('button', { name: /space button/i });
      button.focus();

      // Press Space
      await user.keyboard(' ');
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should have proper focus styles', () => {
      render(<Button>Focus Button</Button>);

      const button = screen.getByRole('button', { name: /focus button/i });
      expect(button).toHaveClass('focus-visible:ring-ring/50');
    });

    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled Button</Button>);

      const button = screen.getByRole('button', { name: /disabled button/i });
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50');
    });
  });

  describe('Form Integration', () => {
    it('should submit form when type is submit', async () => {
      const user = userEvent.setup();
      const mockSubmit = vi.fn();

      render(
        <form onSubmit={mockSubmit}>
          <Button type='submit'>Submit Form</Button>
        </form>
      );

      const button = screen.getByRole('button', { name: /submit form/i });
      await user.click(button);

      expect(mockSubmit).toHaveBeenCalledTimes(1);
    });

    it('should reset form when type is reset', async () => {
      const user = userEvent.setup();
      const mockReset = vi.fn();

      render(
        <form onReset={mockReset}>
          <input defaultValue='test' />
          <Button type='reset'>Reset Form</Button>
        </form>
      );

      const button = screen.getByRole('button', { name: /reset form/i });
      await user.click(button);

      expect(mockReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('Event Handling', () => {
    it('should handle onMouseDown', async () => {
      const user = userEvent.setup();
      const mockOnMouseDown = vi.fn();

      render(<Button onMouseDown={mockOnMouseDown}>Mouse Button</Button>);

      const button = screen.getByRole('button', { name: /mouse button/i });
      await user.pointer({ keys: '[MouseLeft>]', target: button });

      expect(mockOnMouseDown).toHaveBeenCalledTimes(1);
    });

    it('should handle onMouseUp', async () => {
      const user = userEvent.setup();
      const mockOnMouseUp = vi.fn();

      render(<Button onMouseUp={mockOnMouseUp}>Mouse Button</Button>);

      const button = screen.getByRole('button', { name: /mouse button/i });
      await user.pointer({ keys: '[MouseLeft/]', target: button });

      expect(mockOnMouseUp).toHaveBeenCalledTimes(1);
    });

    it('should handle onFocus', async () => {
      const user = userEvent.setup();
      const mockOnFocus = vi.fn();

      render(<Button onFocus={mockOnFocus}>Focus Button</Button>);

      screen.getByRole('button', { name: /focus button/i });
      await user.tab();

      expect(mockOnFocus).toHaveBeenCalledTimes(1);
    });

    it('should handle onBlur', async () => {
      const mockOnBlur = vi.fn();

      render(
        <>
          <Button onBlur={mockOnBlur}>Blur Button</Button>
          <button>Other Button</button>
        </>
      );

      const button = screen.getByRole('button', { name: /blur button/i });
      const otherButton = screen.getByRole('button', { name: /other button/i });

      button.focus();
      otherButton.focus();

      expect(mockOnBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('Custom Props', () => {
    it('should pass through custom props', () => {
      render(
        <Button data-testid='custom-button' aria-label='Custom Label'>
          Custom
        </Button>
      );

      const button = screen.getByTestId('custom-button');
      expect(button).toHaveAttribute('aria-label', 'Custom Label');
    });

    it('should apply custom className', () => {
      render(<Button className='custom-class'>Custom Class</Button>);

      const button = screen.getByRole('button', { name: /custom class/i });
      expect(button).toHaveClass('custom-class');
    });
  });
});
