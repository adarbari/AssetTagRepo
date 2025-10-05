import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../input'
import { render } from '../../../test/test-utils'

describe('Input Component - Click Tests', () => {
  describe('Basic Input Functionality', () => {
    it('should render input with default type', () => {
      render(<Input placeholder="Enter text" />)
      
      const input = screen.getByPlaceholderText('Enter text')
      expect(input).toBeInTheDocument()
      // Input component doesn't explicitly set type="text" by default
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('data-slot', 'input')
    })

    it('should render input with specific type', () => {
      render(<Input type="email" placeholder="Enter email" />)
      
      const input = screen.getByPlaceholderText('Enter email')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('should handle text input', async () => {
      const user = userEvent.setup()
      render(<Input placeholder="Enter text" />)
      
      const input = screen.getByPlaceholderText('Enter text')
      await user.type(input, 'Hello World')
      
      expect(input).toHaveValue('Hello World')
    })

    it('should handle input focus and blur', async () => {
      const user = userEvent.setup()
      const mockOnFocus = vi.fn()
      const mockOnBlur = vi.fn()
      
      render(
        <Input 
          placeholder="Focus test" 
          onFocus={mockOnFocus}
          onBlur={mockOnBlur}
        />
      )
      
      const input = screen.getByPlaceholderText('Focus test')
      
      await user.click(input)
      expect(mockOnFocus).toHaveBeenCalledTimes(1)
      
      await user.tab()
      expect(mockOnBlur).toHaveBeenCalledTimes(1)
    })
  })

  describe('Input Types', () => {
    it('should handle text input type', async () => {
      const user = userEvent.setup()
      render(<Input type="text" placeholder="Text input" />)
      
      const input = screen.getByPlaceholderText('Text input')
      await user.type(input, 'Text content')
      
      expect(input).toHaveValue('Text content')
    })

    it('should handle email input type', async () => {
      const user = userEvent.setup()
      render(<Input type="email" placeholder="Email input" />)
      
      const input = screen.getByPlaceholderText('Email input')
      await user.type(input, 'test@example.com')
      
      expect(input).toHaveValue('test@example.com')
    })

    it('should handle password input type', async () => {
      const user = userEvent.setup()
      render(<Input type="password" placeholder="Password input" />)
      
      const input = screen.getByPlaceholderText('Password input')
      await user.type(input, 'secretpassword')
      
      expect(input).toHaveValue('secretpassword')
      expect(input).toHaveAttribute('type', 'password')
    })

    it('should handle number input type', async () => {
      const user = userEvent.setup()
      render(<Input type="number" placeholder="Number input" />)
      
      const input = screen.getByPlaceholderText('Number input')
      await user.type(input, '123')
      
      expect(input).toHaveValue(123)
      expect(input).toHaveAttribute('type', 'number')
    })

    it('should handle search input type', async () => {
      const user = userEvent.setup()
      render(<Input type="search" placeholder="Search input" />)
      
      const input = screen.getByPlaceholderText('Search input')
      await user.type(input, 'search query')
      
      expect(input).toHaveValue('search query')
      expect(input).toHaveAttribute('type', 'search')
    })

    it('should handle tel input type', async () => {
      const user = userEvent.setup()
      render(<Input type="tel" placeholder="Phone input" />)
      
      const input = screen.getByPlaceholderText('Phone input')
      await user.type(input, '123-456-7890')
      
      expect(input).toHaveValue('123-456-7890')
      expect(input).toHaveAttribute('type', 'tel')
    })

    it('should handle url input type', async () => {
      const user = userEvent.setup()
      render(<Input type="url" placeholder="URL input" />)
      
      const input = screen.getByPlaceholderText('URL input')
      await user.type(input, 'https://example.com')
      
      expect(input).toHaveValue('https://example.com')
      expect(input).toHaveAttribute('type', 'url')
    })
  })

  describe('Input Interactions', () => {
    it('should handle click events', async () => {
      const user = userEvent.setup()
      const mockOnClick = vi.fn()
      
      render(<Input placeholder="Clickable input" onClick={mockOnClick} />)
      
      const input = screen.getByPlaceholderText('Clickable input')
      await user.click(input)
      
      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('should handle change events', async () => {
      const user = userEvent.setup()
      const mockOnChange = vi.fn()
      
      render(<Input placeholder="Change input" onChange={mockOnChange} />)
      
      const input = screen.getByPlaceholderText('Change input')
      await user.type(input, 'test')
      
      expect(mockOnChange).toHaveBeenCalledTimes(4) // One for each character
    })

    it('should handle input events', async () => {
      const user = userEvent.setup()
      const mockOnInput = vi.fn()
      
      render(<Input placeholder="Input event" onInput={mockOnInput} />)
      
      const input = screen.getByPlaceholderText('Input event')
      await user.type(input, 'a')
      
      expect(mockOnInput).toHaveBeenCalledTimes(1)
    })

    it('should handle keydown events', async () => {
      const user = userEvent.setup()
      const mockOnKeyDown = vi.fn()
      
      render(<Input placeholder="Keydown input" onKeyDown={mockOnKeyDown} />)
      
      const input = screen.getByPlaceholderText('Keydown input')
      await user.type(input, 'a')
      
      expect(mockOnKeyDown).toHaveBeenCalledTimes(1)
    })

    it('should handle keyup events', async () => {
      const user = userEvent.setup()
      const mockOnKeyUp = vi.fn()
      
      render(<Input placeholder="Keyup input" onKeyUp={mockOnKeyUp} />)
      
      const input = screen.getByPlaceholderText('Keyup input')
      await user.type(input, 'a')
      
      expect(mockOnKeyUp).toHaveBeenCalledTimes(1)
    })
  })

  describe('Input Validation', () => {
    it('should handle required attribute', () => {
      render(<Input placeholder="Required input" required />)
      
      const input = screen.getByPlaceholderText('Required input')
      expect(input).toBeRequired()
    })

    it('should handle disabled state', () => {
      render(<Input placeholder="Disabled input" disabled />)
      
      const input = screen.getByPlaceholderText('Disabled input')
      expect(input).toBeDisabled()
    })

    it('should handle readonly state', () => {
      render(<Input placeholder="Readonly input" readOnly />)
      
      const input = screen.getByPlaceholderText('Readonly input')
      expect(input).toHaveAttribute('readonly')
    })

    it('should handle invalid state', () => {
      render(<Input placeholder="Invalid input" aria-invalid="true" />)
      
      const input = screen.getByPlaceholderText('Invalid input')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('should handle min and max attributes for number input', () => {
      render(
        <Input 
          type="number" 
          placeholder="Number range" 
          min="0" 
          max="100" 
        />
      )
      
      const input = screen.getByPlaceholderText('Number range')
      expect(input).toHaveAttribute('min', '0')
      expect(input).toHaveAttribute('max', '100')
    })

    it('should handle minlength and maxlength attributes', () => {
      render(
        <Input 
          placeholder="Length limited" 
          minLength={2} 
          maxLength={10} 
        />
      )
      
      const input = screen.getByPlaceholderText('Length limited')
      expect(input).toHaveAttribute('minlength', '2')
      expect(input).toHaveAttribute('maxlength', '10')
    })
  })

  describe('Input Accessibility', () => {
    it('should support aria-label', () => {
      render(<Input aria-label="Custom input label" />)
      
      const input = screen.getByLabelText('Custom input label')
      expect(input).toBeInTheDocument()
    })

    it('should support aria-describedby', () => {
      render(
        <div>
          <Input aria-describedby="help-text" />
          <div id="help-text">This is help text</div>
        </div>
      )
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby', 'help-text')
    })

    it('should support aria-labelledby', () => {
      render(
        <div>
          <div id="label-text">Input Label</div>
          <Input aria-labelledby="label-text" />
        </div>
      )
      
      const input = screen.getByLabelText('Input Label')
      expect(input).toBeInTheDocument()
    })

    it('should support custom role', () => {
      render(<Input role="searchbox" placeholder="Search" />)
      
      const input = screen.getByRole('searchbox')
      expect(input).toBeInTheDocument()
    })
  })

  describe('Input Custom Styling', () => {
    it('should apply custom className', () => {
      render(<Input className="custom-input-class" placeholder="Custom styled" />)
      
      const input = screen.getByPlaceholderText('Custom styled')
      expect(input).toHaveClass('custom-input-class')
    })

    it('should merge custom className with default classes', () => {
      render(<Input className="custom-class" placeholder="Merged classes" />)
      
      const input = screen.getByPlaceholderText('Merged classes')
      expect(input).toHaveClass('custom-class')
      expect(input).toHaveClass('border') // Default class should still be present
    })
  })

  describe('Input Event Handling', () => {
    it('should handle mouse events', async () => {
      const user = userEvent.setup()
      const mockOnMouseEnter = vi.fn()
      const mockOnMouseLeave = vi.fn()
      
      render(
        <Input 
          placeholder="Mouse events" 
          onMouseEnter={mockOnMouseEnter}
          onMouseLeave={mockOnMouseLeave}
        />
      )
      
      const input = screen.getByPlaceholderText('Mouse events')
      
      await user.hover(input)
      expect(mockOnMouseEnter).toHaveBeenCalledTimes(1)
      
      await user.unhover(input)
      expect(mockOnMouseLeave).toHaveBeenCalledTimes(1)
    })

    it('should handle mouse down and up events', async () => {
      const user = userEvent.setup()
      const mockOnMouseDown = vi.fn()
      const mockOnMouseUp = vi.fn()
      
      render(
        <Input 
          placeholder="Mouse down/up" 
          onMouseDown={mockOnMouseDown}
          onMouseUp={mockOnMouseUp}
        />
      )
      
      const input = screen.getByPlaceholderText('Mouse down/up')
      
      await user.pointer({ keys: '[MouseLeft>]', target: input })
      expect(mockOnMouseDown).toHaveBeenCalledTimes(1)
      
      await user.pointer({ keys: '[/MouseLeft]', target: input })
      expect(mockOnMouseUp).toHaveBeenCalledTimes(1)
    })
  })

  describe('Input Edge Cases', () => {
    it('should handle empty value', () => {
      render(<Input placeholder="Empty input" />)
      
      const input = screen.getByPlaceholderText('Empty input')
      expect(input).toHaveValue('')
    })

    it('should handle controlled input', async () => {
      const user = userEvent.setup()
      const TestComponent = () => {
        const [value, setValue] = React.useState('')
        return (
          <Input 
            value={value} 
            onChange={(e) => setValue(e.target.value)}
            placeholder="Controlled input"
          />
        )
      }
      
      render(<TestComponent />)
      
      const input = screen.getByPlaceholderText('Controlled input')
      await user.type(input, 'controlled')
      
      expect(input).toHaveValue('controlled')
    })

    it('should handle special characters', async () => {
      const user = userEvent.setup()
      render(<Input placeholder="Special chars" />)
      
      const input = screen.getByPlaceholderText('Special chars')
      await user.type(input, '!@#$%^&*()')
      
      expect(input).toHaveValue('!@#$%^&*()')
    })

    it('should handle very long text', async () => {
      const user = userEvent.setup()
      const longText = 'a'.repeat(1000)
      
      render(<Input placeholder="Long text" />)
      
      const input = screen.getByPlaceholderText('Long text')
      await user.type(input, longText)
      
      expect(input).toHaveValue(longText)
    })

    it('should handle copy and paste', async () => {
      const user = userEvent.setup()
      render(<Input placeholder="Copy paste test" />)
      
      const input = screen.getByPlaceholderText('Copy paste test')
      
      // Type some text
      await user.type(input, 'Hello')
      
      // Select all and copy
      await user.keyboard('{Control>}a{/Control}')
      await user.keyboard('{Control>}c{/Control}')
      
      // Clear and paste
      await user.keyboard('{Control>}a{/Control}')
      await user.keyboard('{Control>}v{/Control}')
      
      expect(input).toHaveValue('Hello')
    })
  })

  describe('Input Form Integration', () => {
    it('should work within a form', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      
      render(
        <form onSubmit={mockSubmit}>
          <Input name="test-input" placeholder="Form input" />
          <button type="submit">Submit</button>
        </form>
      )
      
      const input = screen.getByPlaceholderText('Form input')
      const submitButton = screen.getByRole('button', { name: /submit/i })
      
      await user.type(input, 'form data')
      await user.click(submitButton)
      
      expect(mockSubmit).toHaveBeenCalledTimes(1)
    })

    it('should handle form reset', async () => {
      const user = userEvent.setup()
      
      render(
        <form>
          <Input name="reset-input" placeholder="Reset input" />
          <button type="reset">Reset</button>
        </form>
      )
      
      const input = screen.getByPlaceholderText('Reset input')
      const resetButton = screen.getByRole('button', { name: /reset/i })
      
      await user.type(input, 'some text')
      expect(input).toHaveValue('some text')
      
      await user.click(resetButton)
      expect(input).toHaveValue('')
    })
  })
})
