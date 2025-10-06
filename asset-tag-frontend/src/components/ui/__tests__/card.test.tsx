import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter, 
  CardAction 
} from '../card'
import { Button } from '../button'
import { render } from '../../../test/test-utils'
import { Plus, Edit, Trash2 } from 'lucide-react'

describe('Card Component - Click Tests', () => {
  describe('Basic Card Structure', () => {
    it('should render basic card', () => {
      render(
        <Card>
          <CardContent>Card Content</CardContent>
        </Card>
      )
      
      const card = document.querySelector('[data-slot="card"]')
      const content = document.querySelector('[data-slot="card-content"]')
      
      expect(card).toBeInTheDocument()
      expect(content).toBeInTheDocument()
      expect(content).toHaveTextContent('Card Content')
    })

    it('should render complete card structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>Card Content</CardContent>
          <CardFooter>Card Footer</CardFooter>
        </Card>
      )
      
      expect(document.querySelector('[data-slot="card"]')).toBeInTheDocument()
      expect(document.querySelector('[data-slot="card-header"]')).toBeInTheDocument()
      expect(document.querySelector('[data-slot="card-title"]')).toBeInTheDocument()
      expect(document.querySelector('[data-slot="card-description"]')).toBeInTheDocument()
      expect(document.querySelector('[data-slot="card-content"]')).toBeInTheDocument()
      expect(document.querySelector('[data-slot="card-footer"]')).toBeInTheDocument()
    })
  })

  describe('Card with Interactive Elements', () => {
    it('should handle clicks on buttons in card content', async () => {
      const user = userEvent.setup()
      const mockOnClick = vi.fn()
      
      render(
        <Card>
          <CardContent>
            <Button onClick={mockOnClick}>Click Me</Button>
          </CardContent>
        </Card>
      )
      
      const button = screen.getByRole('button', { name: /click me/i })
      await user.click(button)
      
      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('should handle multiple buttons in card', async () => {
      const user = userEvent.setup()
      const mockEdit = vi.fn()
      const mockDelete = vi.fn()
      
      render(
        <Card>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={mockEdit}>Edit</Button>
              <Button onClick={mockDelete} variant="destructive">Delete</Button>
            </div>
          </CardContent>
        </Card>
      )
      
      const editButton = screen.getByRole('button', { name: /edit/i })
      const deleteButton = screen.getByRole('button', { name: /delete/i })
      
      await user.click(editButton)
      await user.click(deleteButton)
      
      expect(mockEdit).toHaveBeenCalledTimes(1)
      expect(mockDelete).toHaveBeenCalledTimes(1)
    })

    it('should handle keyboard navigation in card', async () => {
      const user = userEvent.setup()
      const mockOnClick = vi.fn()
      
      render(
        <Card>
          <CardContent>
            <Button onClick={mockOnClick}>Keyboard Button</Button>
          </CardContent>
        </Card>
      )
      
      const button = screen.getByRole('button', { name: /keyboard button/i })
      button.focus()
      await user.keyboard('{Enter}')
      
      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Card with Actions', () => {
    it('should render card with action button', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card with Action</CardTitle>
            <CardAction>
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>Content with action</CardContent>
        </Card>
      )
      
      const actionButton = screen.getByRole('button', { name: /add/i })
      expect(actionButton).toBeInTheDocument()
      
      // Check that action is properly positioned
      const cardAction = document.querySelector('[data-slot="card-action"]')
      expect(cardAction).toBeInTheDocument()
    })

    it('should handle clicks on card action buttons', async () => {
      const user = userEvent.setup()
      const mockAction = vi.fn()
      
      render(
        <Card>
          <CardHeader>
            <CardTitle>Action Card</CardTitle>
            <CardAction>
              <Button onClick={mockAction} size="sm">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>Click the edit button</CardContent>
        </Card>
      )
      
      const editButton = screen.getByRole('button', { name: /edit/i })
      await user.click(editButton)
      
      expect(mockAction).toHaveBeenCalledTimes(1)
    })

    it('should handle multiple actions in card header', async () => {
      const user = userEvent.setup()
      const mockEdit = vi.fn()
      const mockDelete = vi.fn()
      
      render(
        <Card>
          <CardHeader>
            <CardTitle>Multi Action Card</CardTitle>
            <CardAction>
              <div className="flex gap-1">
                <Button onClick={mockEdit} size="sm" variant="outline" aria-label="Edit">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button onClick={mockDelete} size="sm" variant="destructive" aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardAction>
          </CardHeader>
          <CardContent>Multiple actions available</CardContent>
        </Card>
      )
      
      const editButton = screen.getByRole('button', { name: /edit/i })
      const deleteButton = screen.getByRole('button', { name: /delete/i })
      
      await user.click(editButton)
      await user.click(deleteButton)
      
      expect(mockEdit).toHaveBeenCalledTimes(1)
      expect(mockDelete).toHaveBeenCalledTimes(1)
    })
  })

  describe('Card Footer Interactions', () => {
    it('should handle buttons in card footer', async () => {
      const user = userEvent.setup()
      const mockSave = vi.fn()
      const mockCancel = vi.fn()
      
      render(
        <Card>
          <CardContent>Form content</CardContent>
          <CardFooter>
            <div className="flex gap-2 ml-auto">
              <Button onClick={mockCancel} variant="outline">Cancel</Button>
              <Button onClick={mockSave}>Save</Button>
            </div>
          </CardFooter>
        </Card>
      )
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      const saveButton = screen.getByRole('button', { name: /save/i })
      
      await user.click(cancelButton)
      await user.click(saveButton)
      
      expect(mockCancel).toHaveBeenCalledTimes(1)
      expect(mockSave).toHaveBeenCalledTimes(1)
    })

    it('should handle form submission in card footer', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      
      render(
        <Card>
          <CardContent>
            <input type="text" placeholder="Enter text" />
          </CardContent>
          <CardFooter>
            <Button type="submit" onClick={mockSubmit}>Submit</Button>
          </CardFooter>
        </Card>
      )
      
      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)
      
      expect(mockSubmit).toHaveBeenCalledTimes(1)
    })
  })

  describe('Card Accessibility', () => {
    it('should have proper data attributes', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Accessible Card</CardTitle>
            <CardDescription>Card description</CardDescription>
          </CardHeader>
          <CardContent>Card content</CardContent>
        </Card>
      )
      
      expect(document.querySelector('[data-slot="card"]')).toBeInTheDocument()
      expect(document.querySelector('[data-slot="card-header"]')).toBeInTheDocument()
      expect(document.querySelector('[data-slot="card-title"]')).toBeInTheDocument()
      expect(document.querySelector('[data-slot="card-description"]')).toBeInTheDocument()
      expect(document.querySelector('[data-slot="card-content"]')).toBeInTheDocument()
    })

    it('should support custom aria attributes', () => {
      render(
        <Card role="article" aria-label="Product card">
          <CardHeader>
            <CardTitle>Product Name</CardTitle>
          </CardHeader>
          <CardContent>Product details</CardContent>
        </Card>
      )
      
      const card = screen.getByRole('article')
      expect(card).toHaveAttribute('aria-label', 'Product card')
    })

    it('should support keyboard navigation between interactive elements', async () => {
      const user = userEvent.setup()
      const mockAction1 = vi.fn()
      const mockAction2 = vi.fn()
      
      render(
        <Card>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={mockAction1}>First Button</Button>
              <Button onClick={mockAction2}>Second Button</Button>
            </div>
          </CardContent>
        </Card>
      )
      
      const firstButton = screen.getByRole('button', { name: /first button/i })
      const secondButton = screen.getByRole('button', { name: /second button/i })
      
      // Tab navigation
      firstButton.focus()
      await user.keyboard('{Tab}')
      
      expect(secondButton).toHaveFocus()
    })
  })

  describe('Card Custom Styling', () => {
    it('should apply custom className to card', () => {
      render(
        <Card className="custom-card-class">
          <CardContent>Custom styled card</CardContent>
        </Card>
      )
      
      const card = document.querySelector('[data-slot="card"]')
      expect(card).toHaveClass('custom-card-class')
    })

    it('should apply custom className to card components', () => {
      render(
        <Card>
          <CardHeader className="custom-header">
            <CardTitle className="custom-title">Custom Title</CardTitle>
            <CardDescription className="custom-description">Custom Description</CardDescription>
          </CardHeader>
          <CardContent className="custom-content">Custom Content</CardContent>
          <CardFooter className="custom-footer">Custom Footer</CardFooter>
        </Card>
      )
      
      expect(document.querySelector('[data-slot="card-header"]')).toHaveClass('custom-header')
      expect(document.querySelector('[data-slot="card-title"]')).toHaveClass('custom-title')
      expect(document.querySelector('[data-slot="card-description"]')).toHaveClass('custom-description')
      expect(document.querySelector('[data-slot="card-content"]')).toHaveClass('custom-content')
      expect(document.querySelector('[data-slot="card-footer"]')).toHaveClass('custom-footer')
    })
  })

  describe('Card Event Handling', () => {
    it('should handle card click events', async () => {
      const user = userEvent.setup()
      const mockCardClick = vi.fn()
      
      render(
        <Card onClick={mockCardClick}>
          <CardContent>Clickable card</CardContent>
        </Card>
      )
      
      const card = document.querySelector('[data-slot="card"]')
      await user.click(card)
      
      expect(mockCardClick).toHaveBeenCalledTimes(1)
    })

    it('should handle mouse events on card', async () => {
      const user = userEvent.setup()
      const mockOnMouseEnter = vi.fn()
      const mockOnMouseLeave = vi.fn()
      
      render(
        <Card onMouseEnter={mockOnMouseEnter} onMouseLeave={mockOnMouseLeave}>
          <CardContent>Hoverable card</CardContent>
        </Card>
      )
      
      const card = document.querySelector('[data-slot="card"]')
      
      await user.hover(card)
      expect(mockOnMouseEnter).toHaveBeenCalledTimes(1)
      
      await user.unhover(card)
      expect(mockOnMouseLeave).toHaveBeenCalledTimes(1)
    })
  })

  describe('Card Edge Cases', () => {
    it('should handle empty card', () => {
      render(<Card></Card>)
      
      const card = document.querySelector('[data-slot="card"]')
      expect(card).toBeInTheDocument()
    })

    it('should handle card with only title', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title Only</CardTitle>
          </CardHeader>
        </Card>
      )
      
      expect(screen.getByText('Title Only')).toBeInTheDocument()
    })

    it('should handle card with only content', () => {
      render(
        <Card>
          <CardContent>Content Only</CardContent>
        </Card>
      )
      
      expect(screen.getByText('Content Only')).toBeInTheDocument()
    })

    it('should handle nested interactive elements', async () => {
      const user = userEvent.setup()
      const mockOuter = vi.fn()
      const mockInner = vi.fn()
      
      render(
        <Card onClick={mockOuter}>
          <CardContent>
            <Button onClick={mockInner}>Nested Button</Button>
          </CardContent>
        </Card>
      )
      
      const button = screen.getByRole('button', { name: /nested button/i })
      await user.click(button)
      
      // Both handlers should be called
      expect(mockInner).toHaveBeenCalledTimes(1)
      expect(mockOuter).toHaveBeenCalledTimes(1)
    })
  })
})
