import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter, 
  DialogClose 
} from '../dialog'
import { Button } from '../button'
import { Input } from '../input'
import { render } from '../../../test/test-utils'

describe('Dialog Component - Click Tests', () => {
  describe('Basic Dialog Functionality', () => {
    it('should open dialog when trigger is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
              <DialogDescription>This is a test dialog</DialogDescription>
            </DialogHeader>
            <div>Dialog content</div>
          </DialogContent>
        </Dialog>
      )
      
      const triggerButton = screen.getByRole('button', { name: /open dialog/i })
      await user.click(triggerButton)
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
      
      expect(screen.getByText('Test Dialog')).toBeInTheDocument()
      expect(screen.getByText('This is a test dialog')).toBeInTheDocument()
      expect(screen.getByText('Dialog content')).toBeInTheDocument()
    })

    it('should close dialog when close button is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <Dialog defaultOpen>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
            </DialogHeader>
            <div>Dialog content</div>
          </DialogContent>
        </Dialog>
      )
      
      // Dialog should be open by default
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      
      // Find and click the close button (X button)
      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('should close dialog when DialogClose is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
            </DialogHeader>
            <div>Dialog content</div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
      
      // Dialog should be open by default
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      
      // Click the cancel button
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
  })

  describe('Dialog with Form Interactions', () => {
    it('should handle form submission in dialog', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Form Dialog</DialogTitle>
            </DialogHeader>
            <form onSubmit={mockSubmit}>
              <Input placeholder="Enter name" />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Submit</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )
      
      const input = screen.getByPlaceholderText('Enter name')
      const submitButton = screen.getByRole('button', { name: /submit/i })
      
      await user.type(input, 'John Doe')
      await user.click(submitButton)
      
      expect(mockSubmit).toHaveBeenCalledTimes(1)
    })

    it('should handle multiple form inputs', async () => {
      const user = userEvent.setup()
      
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Multi Input Dialog</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="First name" />
              <Input placeholder="Last name" />
              <Input placeholder="Email" type="email" />
            </div>
            <DialogFooter>
              <Button>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
      
      const firstNameInput = screen.getByPlaceholderText('First name')
      const lastNameInput = screen.getByPlaceholderText('Last name')
      const emailInput = screen.getByPlaceholderText('Email')
      
      await user.type(firstNameInput, 'John')
      await user.type(lastNameInput, 'Doe')
      await user.type(emailInput, 'john@example.com')
      
      expect(firstNameInput).toHaveValue('John')
      expect(lastNameInput).toHaveValue('Doe')
      expect(emailInput).toHaveValue('john@example.com')
    })
  })

  describe('Dialog Button Interactions', () => {
    it('should handle multiple action buttons', async () => {
      const user = userEvent.setup()
      const mockSave = vi.fn()
      const mockDelete = vi.fn()
      
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Action Dialog</DialogTitle>
            </DialogHeader>
            <div>Choose an action</div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={mockDelete} variant="destructive">Delete</Button>
              <Button onClick={mockSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      const deleteButton = screen.getByRole('button', { name: /delete/i })
      const saveButton = screen.getByRole('button', { name: /save/i })
      
      await user.click(saveButton)
      expect(mockSave).toHaveBeenCalledTimes(1)
      
      await user.click(deleteButton)
      expect(mockDelete).toHaveBeenCalledTimes(1)
      
      await user.click(cancelButton)
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('should handle button clicks without closing dialog', async () => {
      const user = userEvent.setup()
      const mockAction = vi.fn()
      
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Non-closing Dialog</DialogTitle>
            </DialogHeader>
            <div>This action won't close the dialog</div>
            <DialogFooter>
              <Button onClick={mockAction}>Perform Action</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
      
      const actionButton = screen.getByRole('button', { name: /perform action/i })
      await user.click(actionButton)
      
      expect(mockAction).toHaveBeenCalledTimes(1)
      // Dialog should still be open
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  describe('Dialog Keyboard Interactions', () => {
    it('should close dialog on Escape key', async () => {
      const user = userEvent.setup()
      
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Keyboard Dialog</DialogTitle>
            </DialogHeader>
            <div>Press Escape to close</div>
          </DialogContent>
        </Dialog>
      )
      
      // Dialog should be open
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      
      // Press Escape key
      await user.keyboard('{Escape}')
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('should handle keyboard navigation in dialog', async () => {
      const user = userEvent.setup()
      
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Keyboard Navigation</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Button>First Button</Button>
              <Button>Second Button</Button>
              <Button>Third Button</Button>
            </div>
          </DialogContent>
        </Dialog>
      )
      
      const firstButton = screen.getByRole('button', { name: /first button/i })
      const secondButton = screen.getByRole('button', { name: /second button/i })
      const thirdButton = screen.getByRole('button', { name: /third button/i })
      
      // Focus first button and tab through
      firstButton.focus()
      await user.keyboard('{Tab}')
      expect(secondButton).toHaveFocus()
      
      await user.keyboard('{Tab}')
      expect(thirdButton).toHaveFocus()
    })
  })

  describe('Dialog Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      const user = userEvent.setup()
      
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Accessible Dialog</DialogTitle>
              <DialogDescription>This dialog has proper accessibility</DialogDescription>
            </DialogHeader>
            <div>Dialog content</div>
          </DialogContent>
        </Dialog>
      )
      
      const triggerButton = screen.getByRole('button', { name: /open dialog/i })
      await user.click(triggerButton)
      
      await waitFor(() => {
        const dialog = screen.getByRole('dialog')
        expect(dialog).toBeInTheDocument()
        expect(dialog).toHaveAttribute('aria-modal', 'true')
      })
    })

    it('should support custom aria attributes', async () => {
      const user = userEvent.setup()
      
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Custom Dialog</Button>
          </DialogTrigger>
          <DialogContent aria-label="Custom dialog label">
            <DialogHeader>
              <DialogTitle>Custom Dialog</DialogTitle>
            </DialogHeader>
            <div>Custom content</div>
          </DialogContent>
        </Dialog>
      )
      
      const triggerButton = screen.getByRole('button', { name: /open custom dialog/i })
      await user.click(triggerButton)
      
      await waitFor(() => {
        const dialog = screen.getByLabelText('Custom dialog label')
        expect(dialog).toBeInTheDocument()
      })
    })
  })

  describe('Dialog State Management', () => {
    it('should handle controlled open state', async () => {
      const user = userEvent.setup()
      const TestComponent = () => {
        const [open, setOpen] = React.useState(false)
        
        return (
          <div>
            <Button onClick={() => setOpen(true)}>Open</Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Controlled Dialog</DialogTitle>
                </DialogHeader>
                <div>Controlled content</div>
                <DialogFooter>
                  <Button onClick={() => setOpen(false)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )
      }
      
      render(<TestComponent />)
      
      const openButton = screen.getByRole('button', { name: /open/i })
      await user.click(openButton)
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
      
      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('should handle onOpenChange callback', async () => {
      const user = userEvent.setup()
      const mockOnOpenChange = vi.fn()
      
      render(
        <Dialog onOpenChange={mockOnOpenChange}>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Callback Dialog</DialogTitle>
            </DialogHeader>
            <div>Dialog content</div>
          </DialogContent>
        </Dialog>
      )
      
      const triggerButton = screen.getByRole('button', { name: /open dialog/i })
      await user.click(triggerButton)
      
      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(true)
      })
      
      // Close dialog
      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)
      
      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false)
      })
    })
  })

  describe('Dialog Custom Styling', () => {
    it('should apply custom className to dialog content', async () => {
      const user = userEvent.setup()
      
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Styled Dialog</Button>
          </DialogTrigger>
          <DialogContent className="custom-dialog-class">
            <DialogHeader>
              <DialogTitle>Styled Dialog</DialogTitle>
            </DialogHeader>
            <div>Styled content</div>
          </DialogContent>
        </Dialog>
      )
      
      const triggerButton = screen.getByRole('button', { name: /open styled dialog/i })
      await user.click(triggerButton)
      
      await waitFor(() => {
        const dialogContent = document.querySelector('[data-slot="dialog-content"]')
        expect(dialogContent).toHaveClass('custom-dialog-class')
      })
    })

    it('should apply custom className to dialog header and footer', async () => {
      const user = userEvent.setup()
      
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Custom Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader className="custom-header">
              <DialogTitle>Custom Header</DialogTitle>
            </DialogHeader>
            <div>Content</div>
            <DialogFooter className="custom-footer">
              <Button>Action</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
      
      const triggerButton = screen.getByRole('button', { name: /open custom dialog/i })
      await user.click(triggerButton)
      
      await waitFor(() => {
        expect(document.querySelector('[data-slot="dialog-header"]')).toHaveClass('custom-header')
        expect(document.querySelector('[data-slot="dialog-footer"]')).toHaveClass('custom-footer')
      })
    })
  })

  describe('Dialog Edge Cases', () => {
    it('should handle dialog with no content', async () => {
      const user = userEvent.setup()
      
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Empty Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Empty Dialog</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )
      
      const triggerButton = screen.getByRole('button', { name: /open empty dialog/i })
      await user.click(triggerButton)
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
    })

    it('should handle dialog with very long content', async () => {
      const user = userEvent.setup()
      const longContent = 'Lorem ipsum '.repeat(100)
      
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Long Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Long Content Dialog</DialogTitle>
            </DialogHeader>
            <div>{longContent}</div>
          </DialogContent>
        </Dialog>
      )
      
      const triggerButton = screen.getByRole('button', { name: /open long dialog/i })
      await user.click(triggerButton)
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        // Check that the content is present (may be truncated in display)
        expect(screen.getByText(/Lorem ipsum/)).toBeInTheDocument()
      })
    })

    it('should handle multiple dialogs', async () => {
      const user = userEvent.setup()
      
      render(
        <div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open First Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>First Dialog</DialogTitle>
              </DialogHeader>
              <div>First dialog content</div>
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open Second Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Second Dialog</DialogTitle>
              </DialogHeader>
              <div>Second dialog content</div>
            </DialogContent>
          </Dialog>
        </div>
      )
      
      const firstTrigger = screen.getByRole('button', { name: /open first dialog/i })
      await user.click(firstTrigger)
      
      await waitFor(() => {
        expect(screen.getByText('First Dialog')).toBeInTheDocument()
      })
      
      // Close first dialog
      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)
      
      await waitFor(() => {
        expect(screen.queryByText('First Dialog')).not.toBeInTheDocument()
      })
      
      // Open second dialog
      const secondTrigger = screen.getByRole('button', { name: /open second dialog/i })
      await user.click(secondTrigger)
      
      await waitFor(() => {
        expect(screen.getByText('Second Dialog')).toBeInTheDocument()
      })
    })
  })
})
