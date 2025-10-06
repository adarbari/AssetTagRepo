import React from &apos;react&apos;;
import { describe, it, expect, vi } from &apos;vitest&apos;;
import { screen } from &apos;@testing-library/react&apos;;
import userEvent from &apos;@testing-library/user-event&apos;;
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from &apos;../card&apos;;
import { Button } from &apos;../button&apos;;
import { render } from &apos;../../../test/test-utils&apos;;
import { Plus, Edit, Trash2 } from &apos;lucide-react&apos;;

describe(&apos;Card Component - Click Tests&apos;, () => {
  describe(&apos;Basic Card Structure&apos;, () => {
    it(&apos;should render basic card&apos;, () => {
      render(
        <Card>
          <CardContent>Card Content</CardContent>
        </Card>
      );

      const card = document.querySelector(&apos;[data-slot=&quot;card&quot;]&apos;);
      const content = document.querySelector(&apos;[data-slot=&quot;card-content&quot;]&apos;);

      expect(card).toBeInTheDocument();
      expect(content).toBeInTheDocument();
      expect(content).toHaveTextContent(&apos;Card Content&apos;);
    });

    it(&apos;should render complete card structure&apos;, () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>Card Content</CardContent>
          <CardFooter>Card Footer</CardFooter>
        </Card>
      );

      expect(document.querySelector(&apos;[data-slot=&quot;card&quot;]&apos;)).toBeInTheDocument();
      expect(
        document.querySelector(&apos;[data-slot=&quot;card-header&quot;]&apos;)
      ).toBeInTheDocument();
      expect(
        document.querySelector(&apos;[data-slot=&quot;card-title&quot;]&apos;)
      ).toBeInTheDocument();
      expect(
        document.querySelector(&apos;[data-slot=&quot;card-description&quot;]&apos;)
      ).toBeInTheDocument();
      expect(
        document.querySelector(&apos;[data-slot=&quot;card-content&quot;]&apos;)
      ).toBeInTheDocument();
      expect(
        document.querySelector(&apos;[data-slot=&quot;card-footer&quot;]&apos;)
      ).toBeInTheDocument();
    });
  });

  describe(&apos;Card with Interactive Elements&apos;, () => {
    it(&apos;should handle clicks on buttons in card content&apos;, async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();

      render(
        <Card>
          <CardContent>
            <Button onClick={mockOnClick}>Click Me</Button>
          </CardContent>
        </Card>
      );

      const button = screen.getByRole(&apos;button&apos;, { name: /click me/i });
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it(&apos;should handle multiple buttons in card&apos;, async () => {
      const user = userEvent.setup();
      const mockEdit = vi.fn();
      const mockDelete = vi.fn();

      render(
        <Card>
          <CardContent>
            <div className=&apos;flex gap-2&apos;>
              <Button onClick={mockEdit}>Edit</Button>
              <Button onClick={mockDelete} variant=&apos;destructive&apos;>
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      );

      const editButton = screen.getByRole(&apos;button&apos;, { name: /edit/i });
      const deleteButton = screen.getByRole(&apos;button&apos;, { name: /delete/i });

      await user.click(editButton);
      await user.click(deleteButton);

      expect(mockEdit).toHaveBeenCalledTimes(1);
      expect(mockDelete).toHaveBeenCalledTimes(1);
    });

    it(&apos;should handle keyboard navigation in card&apos;, async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();

      render(
        <Card>
          <CardContent>
            <Button onClick={mockOnClick}>Keyboard Button</Button>
          </CardContent>
        </Card>
      );

      const button = screen.getByRole(&apos;button&apos;, { name: /keyboard button/i });
      button.focus();
      await user.keyboard(&apos;{Enter}&apos;);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe(&apos;Card with Actions&apos;, () => {
    it(&apos;should render card with action button&apos;, () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card with Action</CardTitle>
            <CardAction>
              <Button size=&apos;sm&apos;>
                <Plus className=&apos;h-4 w-4&apos; />
                Add
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>Content with action</CardContent>
        </Card>
      );

      const actionButton = screen.getByRole(&apos;button&apos;, { name: /add/i });
      expect(actionButton).toBeInTheDocument();

      // Check that action is properly positioned
      const cardAction = document.querySelector(&apos;[data-slot=&quot;card-action&quot;]&apos;);
      expect(cardAction).toBeInTheDocument();
    });

    it(&apos;should handle clicks on card action buttons&apos;, async () => {
      const user = userEvent.setup();
      const mockAction = vi.fn();

      render(
        <Card>
          <CardHeader>
            <CardTitle>Action Card</CardTitle>
            <CardAction>
              <Button onClick={mockAction} size=&apos;sm&apos;>
                <Edit className=&apos;h-4 w-4&apos; />
                Edit
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>Click the edit button</CardContent>
        </Card>
      );

      const editButton = screen.getByRole(&apos;button&apos;, { name: /edit/i });
      await user.click(editButton);

      expect(mockAction).toHaveBeenCalledTimes(1);
    });

    it(&apos;should handle multiple actions in card header&apos;, async () => {
      const user = userEvent.setup();
      const mockEdit = vi.fn();
      const mockDelete = vi.fn();

      render(
        <Card>
          <CardHeader>
            <CardTitle>Multi Action Card</CardTitle>
            <CardAction>
              <div className=&apos;flex gap-1&apos;>
                <Button
                  onClick={mockEdit}
                  size=&apos;sm&apos;
                  variant=&apos;outline&apos;
                  aria-label=&apos;Edit&apos;
                >
                  <Edit className=&apos;h-4 w-4&apos; />
                </Button>
                <Button
                  onClick={mockDelete}
                  size=&apos;sm&apos;
                  variant=&apos;destructive&apos;
                  aria-label=&apos;Delete&apos;
                >
                  <Trash2 className=&apos;h-4 w-4&apos; />
                </Button>
              </div>
            </CardAction>
          </CardHeader>
          <CardContent>Multiple actions available</CardContent>
        </Card>
      );

      const editButton = screen.getByRole(&apos;button&apos;, { name: /edit/i });
      const deleteButton = screen.getByRole(&apos;button&apos;, { name: /delete/i });

      await user.click(editButton);
      await user.click(deleteButton);

      expect(mockEdit).toHaveBeenCalledTimes(1);
      expect(mockDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe(&apos;Card Footer Interactions&apos;, () => {
    it(&apos;should handle buttons in card footer&apos;, async () => {
      const user = userEvent.setup();
      const mockSave = vi.fn();
      const mockCancel = vi.fn();

      render(
        <Card>
          <CardContent>Form content</CardContent>
          <CardFooter>
            <div className=&apos;flex gap-2 ml-auto&apos;>
              <Button onClick={mockCancel} variant=&apos;outline&apos;>
                Cancel
              </Button>
              <Button onClick={mockSave}>Save</Button>
            </div>
          </CardFooter>
        </Card>
      );

      const cancelButton = screen.getByRole(&apos;button&apos;, { name: /cancel/i });
      const saveButton = screen.getByRole(&apos;button&apos;, { name: /save/i });

      await user.click(cancelButton);
      await user.click(saveButton);

      expect(mockCancel).toHaveBeenCalledTimes(1);
      expect(mockSave).toHaveBeenCalledTimes(1);
    });

    it(&apos;should handle form submission in card footer&apos;, async () => {
      const user = userEvent.setup();
      const mockSubmit = vi.fn();

      render(
        <Card>
          <CardContent>
            <input type=&apos;text&apos; placeholder=&apos;Enter text&apos; />
          </CardContent>
          <CardFooter>
            <Button type=&apos;submit&apos; onClick={mockSubmit}>
              Submit
            </Button>
          </CardFooter>
        </Card>
      );

      const submitButton = screen.getByRole(&apos;button&apos;, { name: /submit/i });
      await user.click(submitButton);

      expect(mockSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe(&apos;Card Accessibility&apos;, () => {
    it(&apos;should have proper data attributes&apos;, () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Accessible Card</CardTitle>
            <CardDescription>Card description</CardDescription>
          </CardHeader>
          <CardContent>Card content</CardContent>
        </Card>
      );

      expect(document.querySelector(&apos;[data-slot=&quot;card&quot;]&apos;)).toBeInTheDocument();
      expect(
        document.querySelector(&apos;[data-slot=&quot;card-header&quot;]&apos;)
      ).toBeInTheDocument();
      expect(
        document.querySelector(&apos;[data-slot=&quot;card-title&quot;]&apos;)
      ).toBeInTheDocument();
      expect(
        document.querySelector(&apos;[data-slot=&quot;card-description&quot;]&apos;)
      ).toBeInTheDocument();
      expect(
        document.querySelector(&apos;[data-slot=&quot;card-content&quot;]&apos;)
      ).toBeInTheDocument();
    });

    it(&apos;should support custom aria attributes&apos;, () => {
      render(
        <Card role=&apos;article&apos; aria-label=&apos;Product card&apos;>
          <CardHeader>
            <CardTitle>Product Name</CardTitle>
          </CardHeader>
          <CardContent>Product details</CardContent>
        </Card>
      );

      const card = screen.getByRole(&apos;article&apos;);
      expect(card).toHaveAttribute(&apos;aria-label&apos;, &apos;Product card&apos;);
    });

    it(&apos;should support keyboard navigation between interactive elements&apos;, async () => {
      const user = userEvent.setup();
      const mockAction1 = vi.fn();
      const mockAction2 = vi.fn();

      render(
        <Card>
          <CardContent>
            <div className=&apos;flex gap-2&apos;>
              <Button onClick={mockAction1}>First Button</Button>
              <Button onClick={mockAction2}>Second Button</Button>
            </div>
          </CardContent>
        </Card>
      );

      const firstButton = screen.getByRole(&apos;button&apos;, { name: /first button/i });
      const secondButton = screen.getByRole(&apos;button&apos;, {
        name: /second button/i,
      });

      // Tab navigation
      firstButton.focus();
      await user.keyboard(&apos;{Tab}&apos;);

      expect(secondButton).toHaveFocus();
    });
  });

  describe(&apos;Card Custom Styling&apos;, () => {
    it(&apos;should apply custom className to card&apos;, () => {
      render(
        <Card className=&apos;custom-card-class&apos;>
          <CardContent>Custom styled card</CardContent>
        </Card>
      );

      const card = document.querySelector(&apos;[data-slot=&quot;card&quot;]&apos;);
      expect(card).toHaveClass(&apos;custom-card-class&apos;);
    });

    it(&apos;should apply custom className to card components&apos;, () => {
      render(
        <Card>
          <CardHeader className=&apos;custom-header&apos;>
            <CardTitle className=&apos;custom-title&apos;>Custom Title</CardTitle>
            <CardDescription className=&apos;custom-description&apos;>
              Custom Description
            </CardDescription>
          </CardHeader>
          <CardContent className=&apos;custom-content&apos;>Custom Content</CardContent>
          <CardFooter className=&apos;custom-footer&apos;>Custom Footer</CardFooter>
        </Card>
      );

      expect(document.querySelector(&apos;[data-slot=&quot;card-header&quot;]&apos;)).toHaveClass(
        &apos;custom-header&apos;
      );
      expect(document.querySelector(&apos;[data-slot=&quot;card-title&quot;]&apos;)).toHaveClass(
        &apos;custom-title&apos;
      );
      expect(
        document.querySelector(&apos;[data-slot=&quot;card-description&quot;]&apos;)
      ).toHaveClass(&apos;custom-description&apos;);
      expect(document.querySelector(&apos;[data-slot=&quot;card-content&quot;]&apos;)).toHaveClass(
        &apos;custom-content&apos;
      );
      expect(document.querySelector(&apos;[data-slot=&quot;card-footer&quot;]&apos;)).toHaveClass(
        &apos;custom-footer&apos;
      );
    });
  });

  describe(&apos;Card Event Handling&apos;, () => {
    it(&apos;should handle card click events&apos;, async () => {
      const user = userEvent.setup();
      const mockCardClick = vi.fn();

      render(
        <Card onClick={mockCardClick}>
          <CardContent>Clickable card</CardContent>
        </Card>
      );

      const card = document.querySelector(&apos;[data-slot=&quot;card&quot;]&apos;);
      await user.click(card);

      expect(mockCardClick).toHaveBeenCalledTimes(1);
    });

    it(&apos;should handle mouse events on card&apos;, async () => {
      const user = userEvent.setup();
      const mockOnMouseEnter = vi.fn();
      const mockOnMouseLeave = vi.fn();

      render(
        <Card onMouseEnter={mockOnMouseEnter} onMouseLeave={mockOnMouseLeave}>
          <CardContent>Hoverable card</CardContent>
        </Card>
      );

      const card = document.querySelector(&apos;[data-slot=&quot;card&quot;]&apos;);

      await user.hover(card);
      expect(mockOnMouseEnter).toHaveBeenCalledTimes(1);

      await user.unhover(card);
      expect(mockOnMouseLeave).toHaveBeenCalledTimes(1);
    });
  });

  describe(&apos;Card Edge Cases&apos;, () => {
    it(&apos;should handle empty card&apos;, () => {
      render(<Card></Card>);

      const card = document.querySelector(&apos;[data-slot=&quot;card&quot;]&apos;);
      expect(card).toBeInTheDocument();
    });

    it(&apos;should handle card with only title&apos;, () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title Only</CardTitle>
          </CardHeader>
        </Card>
      );

      expect(screen.getByText(&apos;Title Only&apos;)).toBeInTheDocument();
    });

    it(&apos;should handle card with only content&apos;, () => {
      render(
        <Card>
          <CardContent>Content Only</CardContent>
        </Card>
      );

      expect(screen.getByText(&apos;Content Only&apos;)).toBeInTheDocument();
    });

    it(&apos;should handle nested interactive elements&apos;, async () => {
      const user = userEvent.setup();
      const mockOuter = vi.fn();
      const mockInner = vi.fn();

      render(
        <Card onClick={mockOuter}>
          <CardContent>
            <Button onClick={mockInner}>Nested Button</Button>
          </CardContent>
        </Card>
      );

      const button = screen.getByRole(&apos;button&apos;, { name: /nested button/i });
      await user.click(button);

      // Both handlers should be called
      expect(mockInner).toHaveBeenCalledTimes(1);
      expect(mockOuter).toHaveBeenCalledTimes(1);
    });
  });
});
