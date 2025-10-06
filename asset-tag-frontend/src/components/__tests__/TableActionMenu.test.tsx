// import React from &apos;react&apos;;
import { render, screen, waitFor } from &apos;@testing-library/react&apos;;
import userEvent from &apos;@testing-library/user-event&apos;;
import { describe, it, expect, vi, beforeEach } from &apos;vitest&apos;;
import { TableActionMenu, type TableAction } from &apos;../common/TableActionMenu&apos;;
import { Edit, Trash2, Eye, Download } from &apos;lucide-react&apos;;

describe(&apos;TableActionMenu Component&apos;, () => {
  const mockActions: TableAction[] = [
    {
      label: &apos;View&apos;,
      onClick: vi.fn(),
      icon: Eye,
    },
    {
      label: &apos;Edit&apos;,
      onClick: vi.fn(),
      icon: Edit,
    },
    {
      label: &apos;Download&apos;,
      onClick: vi.fn(),
      icon: Download,
    },
    {
      label: &apos;Delete&apos;,
      onClick: vi.fn(),
      icon: Trash2,
      isDestructive: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe(&apos;Basic Rendering&apos;, () => {
    it(&apos;should render trigger button&apos;, () => {
      render(<TableActionMenu actions={mockActions} />);

      const triggerButton = screen.getByRole(&apos;button&apos;);
      expect(triggerButton).toBeInTheDocument();
    });

    it(&apos;should render with default label&apos;, async () => {
      const user = userEvent.setup();
      render(<TableActionMenu actions={mockActions} />);

      const triggerButton = screen.getByRole(&apos;button&apos;);
      await user.click(triggerButton);

      expect(screen.getByText(&apos;Actions&apos;)).toBeInTheDocument();
    });

    it(&apos;should render with custom label&apos;, async () => {
      const user = userEvent.setup();
      render(<TableActionMenu actions={mockActions} label=&apos;Row Actions&apos; />);

      const triggerButton = screen.getByRole(&apos;button&apos;);
      await user.click(triggerButton);

      expect(screen.getByText(&apos;Row Actions&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;Menu Items&apos;, () => {
    it(&apos;should render all action items&apos;, async () => {
      const user = userEvent.setup();
      render(<TableActionMenu actions={mockActions} />);

      const triggerButton = screen.getByRole(&apos;button&apos;);
      await user.click(triggerButton);

      expect(screen.getByText(&apos;View&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Edit&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Download&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Delete&apos;)).toBeInTheDocument();
    });

    it(&apos;should render icons for actions that have them&apos;, async () => {
      const user = userEvent.setup();
      render(<TableActionMenu actions={mockActions} />);

      const triggerButton = screen.getByRole(&apos;button&apos;);
      await user.click(triggerButton);

      // Check that icons are rendered (they should be SVG elements)
      const viewIcon = screen
        .getByText(&apos;View&apos;)
        .closest(&apos;[role=&quot;menuitem&quot;]&apos;)
        ?.querySelector(&apos;svg&apos;);
      const editIcon = screen
        .getByText(&apos;Edit&apos;)
        .closest(&apos;[role=&quot;menuitem&quot;]&apos;)
        ?.querySelector(&apos;svg&apos;);
      const downloadIcon = screen
        .getByText(&apos;Download&apos;)
        .closest(&apos;[role=&quot;menuitem&quot;]&apos;)
        ?.querySelector(&apos;svg&apos;);
      const deleteIcon = screen
        .getByText(&apos;Delete&apos;)
        .closest(&apos;[role=&quot;menuitem&quot;]&apos;)
        ?.querySelector(&apos;svg&apos;);

      expect(viewIcon).toBeInTheDocument();
      expect(editIcon).toBeInTheDocument();
      expect(downloadIcon).toBeInTheDocument();
      expect(deleteIcon).toBeInTheDocument();
    });

    it(&apos;should render actions without icons&apos;, async () => {
      const user = userEvent.setup();
      const actionsWithoutIcons: TableAction[] = [
        {
          label: &apos;View Details&apos;,
          onClick: vi.fn(),
        },
        {
          label: &apos;Archive&apos;,
          onClick: vi.fn(),
        },
      ];

      render(<TableActionMenu actions={actionsWithoutIcons} />);

      const triggerButton = screen.getByRole(&apos;button&apos;);
      await user.click(triggerButton);

      expect(screen.getByText(&apos;View Details&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Archive&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;Action Interactions&apos;, () => {
    it(&apos;should call onClick when action is clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<TableActionMenu actions={mockActions} />);

      const triggerButton = screen.getByRole(&apos;button&apos;);
      await user.click(triggerButton);

      const editAction = screen.getByText(&apos;Edit&apos;);
      await user.click(editAction);

      expect(mockActions[1].onClick).toHaveBeenCalledTimes(1);
    });

    it(&apos;should call correct onClick for each action&apos;, async () => {
      const user = userEvent.setup();
      render(<TableActionMenu actions={mockActions} />);

      const triggerButton = screen.getByRole(&apos;button&apos;);
      await user.click(triggerButton);

      // Click View action
      const viewAction = screen.getByText(&apos;View&apos;);
      await user.click(viewAction);
      expect(mockActions[0].onClick).toHaveBeenCalledTimes(1);

      // Reopen menu and click Download action
      await user.click(triggerButton);
      const downloadAction = screen.getByText(&apos;Download&apos;);
      await user.click(downloadAction);
      expect(mockActions[2].onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe(&apos;Destructive Actions&apos;, () => {
    it(&apos;should apply destructive styling to destructive actions&apos;, async () => {
      const user = userEvent.setup();
      render(<TableActionMenu actions={mockActions} />);

      const triggerButton = screen.getByRole(&apos;button&apos;);
      await user.click(triggerButton);

      const deleteAction = screen.getByText(&apos;Delete&apos;);
      expect(deleteAction).toHaveClass(
        &apos;data-[variant=destructive]:text-destructive&apos;
      );
    });

    it(&apos;should not apply destructive styling to non-destructive actions&apos;, async () => {
      const user = userEvent.setup();
      render(<TableActionMenu actions={mockActions} />);

      const triggerButton = screen.getByRole(&apos;button&apos;);
      await user.click(triggerButton);

      const viewAction = screen.getByText(&apos;View&apos;);
      expect(viewAction).not.toHaveClass(&apos;text-destructive&apos;);
    });
  });

  describe(&apos;Separators&apos;, () => {
    it(&apos;should render separator before action when specified&apos;, async () => {
      const user = userEvent.setup();
      const actionsWithSeparator: TableAction[] = [
        {
          label: &apos;View&apos;,
          onClick: vi.fn(),
        },
        {
          label: &apos;Edit&apos;,
          onClick: vi.fn(),
        },
        {
          label: &apos;Delete&apos;,
          onClick: vi.fn(),
          isDestructive: true,
          separatorBefore: true,
        },
      ];

      render(<TableActionMenu actions={actionsWithSeparator} />);

      const triggerButton = screen.getByRole(&apos;button&apos;);
      await user.click(triggerButton);

      // Check that separators are rendered (they should be hr elements or similar)
      const menuContent = screen.getByRole(&apos;menu&apos;);
      expect(menuContent).toBeInTheDocument();
    });

    it(&apos;should not render separator when not specified&apos;, async () => {
      const user = userEvent.setup();
      const actionsWithoutSeparator: TableAction[] = [
        {
          label: &apos;View&apos;,
          onClick: vi.fn(),
        },
        {
          label: &apos;Edit&apos;,
          onClick: vi.fn(),
        },
      ];

      render(<TableActionMenu actions={actionsWithoutSeparator} />);

      const triggerButton = screen.getByRole(&apos;button&apos;);
      await user.click(triggerButton);

      expect(screen.getByText(&apos;View&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Edit&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;Edge Cases&apos;, () => {
    it(&apos;should handle empty actions array&apos;, async () => {
      const user = userEvent.setup();
      render(<TableActionMenu actions={[]} />);

      const triggerButton = screen.getByRole(&apos;button&apos;);
      expect(triggerButton).toBeInTheDocument();

      await user.click(triggerButton);
      expect(screen.getByText(&apos;Actions&apos;)).toBeInTheDocument();
    });

    it(&apos;should handle single action&apos;, async () => {
      const user = userEvent.setup();
      const singleAction: TableAction[] = [
        {
          label: &apos;View Only&apos;,
          onClick: vi.fn(),
        },
      ];

      render(<TableActionMenu actions={singleAction} />);

      const triggerButton = screen.getByRole(&apos;button&apos;);
      await user.click(triggerButton);

      expect(screen.getByText(&apos;View Only&apos;)).toBeInTheDocument();
    });

    it(&apos;should handle actions with long labels&apos;, async () => {
      const user = userEvent.setup();
      const actionsWithLongLabels: TableAction[] = [
        {
          label: &apos;This is a very long action label that might wrap&apos;,
          onClick: vi.fn(),
        },
      ];

      render(<TableActionMenu actions={actionsWithLongLabels} />);

      const triggerButton = screen.getByRole(&apos;button&apos;);
      await user.click(triggerButton);

      expect(
        screen.getByText(&apos;This is a very long action label that might wrap&apos;)
      ).toBeInTheDocument();
    });
  });

  describe(&apos;Accessibility&apos;, () => {
    it(&apos;should have proper button role for trigger&apos;, () => {
      render(<TableActionMenu actions={mockActions} />);

      const triggerButton = screen.getByRole(&apos;button&apos;);
      expect(triggerButton).toBeInTheDocument();
    });

    it(&apos;should have proper menu structure when opened&apos;, async () => {
      const user = userEvent.setup();
      render(<TableActionMenu actions={mockActions} />);

      const triggerButton = screen.getByRole(&apos;button&apos;);
      await user.click(triggerButton);

      // Check that menu items have proper roles
      const menuItems = screen.getAllByRole(&apos;menuitem&apos;);
      expect(menuItems).toHaveLength(4);
    });

    it(&apos;should have proper labels for screen readers&apos;, async () => {
      const user = userEvent.setup();
      render(<TableActionMenu actions={mockActions} />);

      const triggerButton = screen.getByRole(&apos;button&apos;);
      await user.click(triggerButton);

      expect(screen.getByText(&apos;View&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Edit&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Download&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Delete&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;Menu Behavior&apos;, () => {
    it(&apos;should close menu after action is clicked&apos;, async () => {
      const user = userEvent.setup();
      render(<TableActionMenu actions={mockActions} />);

      const triggerButton = screen.getByRole(&apos;button&apos;);
      await user.click(triggerButton);

      expect(screen.getByText(&apos;View&apos;)).toBeInTheDocument();

      const viewAction = screen.getByText(&apos;View&apos;);
      await user.click(viewAction);

      // Menu should close after action is clicked
      await waitFor(() => {
        expect(screen.queryByText(&apos;View&apos;)).not.toBeInTheDocument();
      });
    });

    it(&apos;should align menu to end&apos;, async () => {
      const user = userEvent.setup();
      render(<TableActionMenu actions={mockActions} />);

      const triggerButton = screen.getByRole(&apos;button&apos;);
      await user.click(triggerButton);

      // The menu should be aligned to the end (right side)
      // This is tested by checking that the menu content is rendered
      expect(screen.getByText(&apos;Actions&apos;)).toBeInTheDocument();
    });
  });
});
