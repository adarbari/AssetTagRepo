import React from &apos;react&apos;;
import { describe, it, expect, vi } from &apos;vitest&apos;;
import { screen, waitFor } from &apos;@testing-library/react&apos;;
import userEvent from &apos;@testing-library/user-event&apos;;
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from &apos;../dialog&apos;;
import { Button } from &apos;../button&apos;;
import { Input } from &apos;../input&apos;;
import { render } from &apos;../../../test/test-utils&apos;;

describe(&apos;Dialog Component - Click Tests&apos;, () => {
  describe(&apos;Basic Dialog Functionality&apos;, () => {
    it(&apos;should open dialog when trigger is clicked&apos;, async () => {
      const user = userEvent.setup();

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
      );

      const triggerButton = screen.getByRole(&apos;button&apos;, {
        name: /open dialog/i,
      });
      await user.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByRole(&apos;dialog&apos;)).toBeInTheDocument();
      });

      expect(screen.getByText(&apos;Test Dialog&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;This is a test dialog&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Dialog content&apos;)).toBeInTheDocument();
    });

    it(&apos;should close dialog when close button is clicked&apos;, async () => {
      const user = userEvent.setup();

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
      );

      // Dialog should be open by default
      expect(screen.getByRole(&apos;dialog&apos;)).toBeInTheDocument();

      // Find and click the close button (X button)
      const closeButton = screen.getByRole(&apos;button&apos;, { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole(&apos;dialog&apos;)).not.toBeInTheDocument();
      });
    });

    it(&apos;should close dialog when DialogClose is clicked&apos;, async () => {
      const user = userEvent.setup();

      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
            </DialogHeader>
            <div>Dialog content</div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant=&apos;outline&apos;>Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      // Dialog should be open by default
      expect(screen.getByRole(&apos;dialog&apos;)).toBeInTheDocument();

      // Click the cancel button
      const cancelButton = screen.getByRole(&apos;button&apos;, { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole(&apos;dialog&apos;)).not.toBeInTheDocument();
      });
    });
  });

  describe(&apos;Dialog with Form Interactions&apos;, () => {
    it(&apos;should handle form submission in dialog&apos;, async () => {
      const user = userEvent.setup();
      const mockSubmit = vi.fn();

      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Form Dialog</DialogTitle>
            </DialogHeader>
            <form onSubmit={mockSubmit}>
              <Input placeholder=&apos;Enter name&apos; />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type=&apos;button&apos; variant=&apos;outline&apos;>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type=&apos;submit&apos;>Submit</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      );

      const input = screen.getByPlaceholderText(&apos;Enter name&apos;);
      const submitButton = screen.getByRole(&apos;button&apos;, { name: /submit/i });

      await user.type(input, &apos;John Doe&apos;);
      await user.click(submitButton);

      expect(mockSubmit).toHaveBeenCalledTimes(1);
    });

    it(&apos;should handle multiple form inputs&apos;, async () => {
      const user = userEvent.setup();

      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Multi Input Dialog</DialogTitle>
            </DialogHeader>
            <div className=&apos;space-y-4&apos;>
              <Input placeholder=&apos;First name&apos; />
              <Input placeholder=&apos;Last name&apos; />
              <Input placeholder=&apos;Email&apos; type=&apos;email&apos; />
            </div>
            <DialogFooter>
              <Button>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      const firstNameInput = screen.getByPlaceholderText(&apos;First name&apos;);
      const lastNameInput = screen.getByPlaceholderText(&apos;Last name&apos;);
      const emailInput = screen.getByPlaceholderText(&apos;Email&apos;);

      await user.type(firstNameInput, &apos;John&apos;);
      await user.type(lastNameInput, &apos;Doe&apos;);
      await user.type(emailInput, &apos;john@example.com&apos;);

      expect(firstNameInput).toHaveValue(&apos;John&apos;);
      expect(lastNameInput).toHaveValue(&apos;Doe&apos;);
      expect(emailInput).toHaveValue(&apos;john@example.com&apos;);
    });
  });

  describe(&apos;Dialog Button Interactions&apos;, () => {
    it(&apos;should handle multiple action buttons&apos;, async () => {
      const user = userEvent.setup();
      const mockSave = vi.fn();
      const mockDelete = vi.fn();

      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Action Dialog</DialogTitle>
            </DialogHeader>
            <div>Choose an action</div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant=&apos;outline&apos;>Cancel</Button>
              </DialogClose>
              <Button onClick={mockDelete} variant=&apos;destructive&apos;>
                Delete
              </Button>
              <Button onClick={mockSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      const cancelButton = screen.getByRole(&apos;button&apos;, { name: /cancel/i });
      const deleteButton = screen.getByRole(&apos;button&apos;, { name: /delete/i });
      const saveButton = screen.getByRole(&apos;button&apos;, { name: /save/i });

      await user.click(saveButton);
      expect(mockSave).toHaveBeenCalledTimes(1);

      await user.click(deleteButton);
      expect(mockDelete).toHaveBeenCalledTimes(1);

      await user.click(cancelButton);
      await waitFor(() => {
        expect(screen.queryByRole(&apos;dialog&apos;)).not.toBeInTheDocument();
      });
    });

    it(&apos;should handle button clicks without closing dialog&apos;, async () => {
      const user = userEvent.setup();
      const mockAction = vi.fn();

      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Non-closing Dialog</DialogTitle>
            </DialogHeader>
            <div>This action won&apos;t close the dialog</div>
            <DialogFooter>
              <Button onClick={mockAction}>Perform Action</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      const actionButton = screen.getByRole(&apos;button&apos;, {
        name: /perform action/i,
      });
      await user.click(actionButton);

      expect(mockAction).toHaveBeenCalledTimes(1);
      // Dialog should still be open
      expect(screen.getByRole(&apos;dialog&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;Dialog Keyboard Interactions&apos;, () => {
    it(&apos;should close dialog on Escape key&apos;, async () => {
      const user = userEvent.setup();

      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Keyboard Dialog</DialogTitle>
            </DialogHeader>
            <div>Press Escape to close</div>
          </DialogContent>
        </Dialog>
      );

      // Dialog should be open
      expect(screen.getByRole(&apos;dialog&apos;)).toBeInTheDocument();

      // Press Escape key
      await user.keyboard(&apos;{Escape}&apos;);

      await waitFor(() => {
        expect(screen.queryByRole(&apos;dialog&apos;)).not.toBeInTheDocument();
      });
    });

    it(&apos;should handle keyboard navigation in dialog&apos;, async () => {
      const user = userEvent.setup();

      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Keyboard Navigation</DialogTitle>
            </DialogHeader>
            <div className=&apos;space-y-2&apos;>
              <Button>First Button</Button>
              <Button>Second Button</Button>
              <Button>Third Button</Button>
            </div>
          </DialogContent>
        </Dialog>
      );

      const firstButton = screen.getByRole(&apos;button&apos;, { name: /first button/i });
      const secondButton = screen.getByRole(&apos;button&apos;, {
        name: /second button/i,
      });
      const thirdButton = screen.getByRole(&apos;button&apos;, { name: /third button/i });

      // Focus first button and tab through
      firstButton.focus();
      await user.keyboard(&apos;{Tab}&apos;);
      expect(secondButton).toHaveFocus();

      await user.keyboard(&apos;{Tab}&apos;);
      expect(thirdButton).toHaveFocus();
    });
  });

  describe(&apos;Dialog Accessibility&apos;, () => {
    it(&apos;should have proper ARIA attributes&apos;, async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Accessible Dialog</DialogTitle>
              <DialogDescription>
                This dialog has proper accessibility
              </DialogDescription>
            </DialogHeader>
            <div>Dialog content</div>
          </DialogContent>
        </Dialog>
      );

      const triggerButton = screen.getByRole(&apos;button&apos;, {
        name: /open dialog/i,
      });
      await user.click(triggerButton);

      await waitFor(() => {
        const dialog = screen.getByRole(&apos;dialog&apos;);
        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveAttribute(&apos;aria-modal&apos;, &apos;true&apos;);
      });
    });

    it(&apos;should support custom aria attributes&apos;, async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Custom Dialog</Button>
          </DialogTrigger>
          <DialogContent aria-label=&apos;Custom dialog label&apos;>
            <DialogHeader>
              <DialogTitle>Custom Dialog</DialogTitle>
            </DialogHeader>
            <div>Custom content</div>
          </DialogContent>
        </Dialog>
      );

      const triggerButton = screen.getByRole(&apos;button&apos;, {
        name: /open custom dialog/i,
      });
      await user.click(triggerButton);

      await waitFor(() => {
        const dialog = screen.getByLabelText(&apos;Custom dialog label&apos;);
        expect(dialog).toBeInTheDocument();
      });
    });
  });

  describe(&apos;Dialog State Management&apos;, () => {
    it(&apos;should handle controlled open state&apos;, async () => {
      const user = userEvent.setup();
      const TestComponent = () => {
        const [open, setOpen] = React.useState(false);

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
        );
      };

      render(<TestComponent />);

      const openButton = screen.getByRole(&apos;button&apos;, { name: /open/i });
      await user.click(openButton);

      await waitFor(() => {
        expect(screen.getByRole(&apos;dialog&apos;)).toBeInTheDocument();
      });

      // Click the footer close button (not the X button)
      const closeButton = screen.getByRole(&apos;button&apos;, { name: &apos;Close&apos; });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole(&apos;dialog&apos;)).not.toBeInTheDocument();
      });
    });

    it(&apos;should handle onOpenChange callback&apos;, async () => {
      const user = userEvent.setup();
      const mockOnOpenChange = vi.fn();

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
      );

      const triggerButton = screen.getByRole(&apos;button&apos;, {
        name: /open dialog/i,
      });
      await user.click(triggerButton);

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(true);
      });

      // Close dialog
      const closeButton = screen.getByRole(&apos;button&apos;, { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe(&apos;Dialog Custom Styling&apos;, () => {
    it(&apos;should apply custom className to dialog content&apos;, async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Styled Dialog</Button>
          </DialogTrigger>
          <DialogContent className=&apos;custom-dialog-class&apos;>
            <DialogHeader>
              <DialogTitle>Styled Dialog</DialogTitle>
            </DialogHeader>
            <div>Styled content</div>
          </DialogContent>
        </Dialog>
      );

      const triggerButton = screen.getByRole(&apos;button&apos;, {
        name: /open styled dialog/i,
      });
      await user.click(triggerButton);

      await waitFor(() => {
        const dialogContent = document.querySelector(
          &apos;[data-slot=&quot;dialog-content&quot;]&apos;
        );
        expect(dialogContent).toHaveClass(&apos;custom-dialog-class&apos;);
      });
    });

    it(&apos;should apply custom className to dialog header and footer&apos;, async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Custom Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader className=&apos;custom-header&apos;>
              <DialogTitle>Custom Header</DialogTitle>
            </DialogHeader>
            <div>Content</div>
            <DialogFooter className=&apos;custom-footer&apos;>
              <Button>Action</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      const triggerButton = screen.getByRole(&apos;button&apos;, {
        name: /open custom dialog/i,
      });
      await user.click(triggerButton);

      await waitFor(() => {
        expect(
          document.querySelector(&apos;[data-slot=&quot;dialog-header&quot;]&apos;)
        ).toHaveClass(&apos;custom-header&apos;);
        expect(
          document.querySelector(&apos;[data-slot=&quot;dialog-footer&quot;]&apos;)
        ).toHaveClass(&apos;custom-footer&apos;);
      });
    });
  });

  describe(&apos;Dialog Edge Cases&apos;, () => {
    it(&apos;should handle dialog with no content&apos;, async () => {
      const user = userEvent.setup();

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
      );

      const triggerButton = screen.getByRole(&apos;button&apos;, {
        name: /open empty dialog/i,
      });
      await user.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByRole(&apos;dialog&apos;)).toBeInTheDocument();
      });
    });

    it(&apos;should handle dialog with very long content&apos;, async () => {
      const user = userEvent.setup();
      const longContent = &apos;Lorem ipsum &apos;.repeat(100);

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
      );

      const triggerButton = screen.getByRole(&apos;button&apos;, {
        name: /open long dialog/i,
      });
      await user.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByRole(&apos;dialog&apos;)).toBeInTheDocument();
        // Check that the content is present (may be truncated in display)
        expect(screen.getByText(/Lorem ipsum/)).toBeInTheDocument();
      });
    });

    it(&apos;should handle multiple dialogs&apos;, async () => {
      const user = userEvent.setup();

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
      );

      const firstTrigger = screen.getByRole(&apos;button&apos;, {
        name: /open first dialog/i,
      });
      await user.click(firstTrigger);

      await waitFor(() => {
        expect(screen.getByText(&apos;First Dialog&apos;)).toBeInTheDocument();
      });

      // Close first dialog
      const closeButton = screen.getByRole(&apos;button&apos;, { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText(&apos;First Dialog&apos;)).not.toBeInTheDocument();
      });

      // Open second dialog
      const secondTrigger = screen.getByRole(&apos;button&apos;, {
        name: /open second dialog/i,
      });
      await user.click(secondTrigger);

      await waitFor(() => {
        expect(screen.getByText(&apos;Second Dialog&apos;)).toBeInTheDocument();
      });
    });
  });
});
