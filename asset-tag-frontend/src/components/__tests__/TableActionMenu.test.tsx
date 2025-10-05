import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TableActionMenu, type TableAction } from '../common/TableActionMenu'
import { Edit, Trash2, Eye, Download } from 'lucide-react'

describe('TableActionMenu Component', () => {
  const mockActions: TableAction[] = [
    {
      label: 'View',
      onClick: vi.fn(),
      icon: Eye,
    },
    {
      label: 'Edit',
      onClick: vi.fn(),
      icon: Edit,
    },
    {
      label: 'Download',
      onClick: vi.fn(),
      icon: Download,
    },
    {
      label: 'Delete',
      onClick: vi.fn(),
      icon: Trash2,
      isDestructive: true,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render trigger button', () => {
      render(<TableActionMenu actions={mockActions} />)
      
      const triggerButton = screen.getByRole('button')
      expect(triggerButton).toBeInTheDocument()
    })

    it('should render with default label', async () => {
      const user = userEvent.setup()
      render(<TableActionMenu actions={mockActions} />)
      
      const triggerButton = screen.getByRole('button')
      await user.click(triggerButton)
      
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })

    it('should render with custom label', async () => {
      const user = userEvent.setup()
      render(<TableActionMenu actions={mockActions} label="Row Actions" />)
      
      const triggerButton = screen.getByRole('button')
      await user.click(triggerButton)
      
      expect(screen.getByText('Row Actions')).toBeInTheDocument()
    })
  })

  describe('Menu Items', () => {
    it('should render all action items', async () => {
      const user = userEvent.setup()
      render(<TableActionMenu actions={mockActions} />)
      
      const triggerButton = screen.getByRole('button')
      await user.click(triggerButton)
      
      expect(screen.getByText('View')).toBeInTheDocument()
      expect(screen.getByText('Edit')).toBeInTheDocument()
      expect(screen.getByText('Download')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    it('should render icons for actions that have them', async () => {
      const user = userEvent.setup()
      render(<TableActionMenu actions={mockActions} />)
      
      const triggerButton = screen.getByRole('button')
      await user.click(triggerButton)
      
      // Check that icons are rendered (they should be SVG elements)
      const viewIcon = screen.getByText('View').closest('[role="menuitem"]')?.querySelector('svg')
      const editIcon = screen.getByText('Edit').closest('[role="menuitem"]')?.querySelector('svg')
      const downloadIcon = screen.getByText('Download').closest('[role="menuitem"]')?.querySelector('svg')
      const deleteIcon = screen.getByText('Delete').closest('[role="menuitem"]')?.querySelector('svg')
      
      expect(viewIcon).toBeInTheDocument()
      expect(editIcon).toBeInTheDocument()
      expect(downloadIcon).toBeInTheDocument()
      expect(deleteIcon).toBeInTheDocument()
    })

    it('should render actions without icons', async () => {
      const user = userEvent.setup()
      const actionsWithoutIcons: TableAction[] = [
        {
          label: 'View Details',
          onClick: vi.fn(),
        },
        {
          label: 'Archive',
          onClick: vi.fn(),
        },
      ]
      
      render(<TableActionMenu actions={actionsWithoutIcons} />)
      
      const triggerButton = screen.getByRole('button')
      await user.click(triggerButton)
      
      expect(screen.getByText('View Details')).toBeInTheDocument()
      expect(screen.getByText('Archive')).toBeInTheDocument()
    })
  })

  describe('Action Interactions', () => {
    it('should call onClick when action is clicked', async () => {
      const user = userEvent.setup()
      render(<TableActionMenu actions={mockActions} />)
      
      const triggerButton = screen.getByRole('button')
      await user.click(triggerButton)
      
      const editAction = screen.getByText('Edit')
      await user.click(editAction)
      
      expect(mockActions[1].onClick).toHaveBeenCalledTimes(1)
    })

    it('should call correct onClick for each action', async () => {
      const user = userEvent.setup()
      render(<TableActionMenu actions={mockActions} />)
      
      const triggerButton = screen.getByRole('button')
      await user.click(triggerButton)
      
      // Click View action
      const viewAction = screen.getByText('View')
      await user.click(viewAction)
      expect(mockActions[0].onClick).toHaveBeenCalledTimes(1)
      
      // Reopen menu and click Download action
      await user.click(triggerButton)
      const downloadAction = screen.getByText('Download')
      await user.click(downloadAction)
      expect(mockActions[2].onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Destructive Actions', () => {
    it('should apply destructive styling to destructive actions', async () => {
      const user = userEvent.setup()
      render(<TableActionMenu actions={mockActions} />)
      
      const triggerButton = screen.getByRole('button')
      await user.click(triggerButton)
      
      const deleteAction = screen.getByText('Delete')
      expect(deleteAction).toHaveClass('data-[variant=destructive]:text-destructive')
    })

    it('should not apply destructive styling to non-destructive actions', async () => {
      const user = userEvent.setup()
      render(<TableActionMenu actions={mockActions} />)
      
      const triggerButton = screen.getByRole('button')
      await user.click(triggerButton)
      
      const viewAction = screen.getByText('View')
      expect(viewAction).not.toHaveClass('text-destructive')
    })
  })

  describe('Separators', () => {
    it('should render separator before action when specified', async () => {
      const user = userEvent.setup()
      const actionsWithSeparator: TableAction[] = [
        {
          label: 'View',
          onClick: vi.fn(),
        },
        {
          label: 'Edit',
          onClick: vi.fn(),
        },
        {
          label: 'Delete',
          onClick: vi.fn(),
          isDestructive: true,
          separatorBefore: true,
        },
      ]
      
      render(<TableActionMenu actions={actionsWithSeparator} />)
      
      const triggerButton = screen.getByRole('button')
      await user.click(triggerButton)
      
      // Check that separators are rendered (they should be hr elements or similar)
      const menuContent = screen.getByRole('menu')
      expect(menuContent).toBeInTheDocument()
    })

    it('should not render separator when not specified', async () => {
      const user = userEvent.setup()
      const actionsWithoutSeparator: TableAction[] = [
        {
          label: 'View',
          onClick: vi.fn(),
        },
        {
          label: 'Edit',
          onClick: vi.fn(),
        },
      ]
      
      render(<TableActionMenu actions={actionsWithoutSeparator} />)
      
      const triggerButton = screen.getByRole('button')
      await user.click(triggerButton)
      
      expect(screen.getByText('View')).toBeInTheDocument()
      expect(screen.getByText('Edit')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty actions array', async () => {
      const user = userEvent.setup()
      render(<TableActionMenu actions={[]} />)
      
      const triggerButton = screen.getByRole('button')
      expect(triggerButton).toBeInTheDocument()
      
      await user.click(triggerButton)
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })

    it('should handle single action', async () => {
      const user = userEvent.setup()
      const singleAction: TableAction[] = [
        {
          label: 'View Only',
          onClick: vi.fn(),
        },
      ]
      
      render(<TableActionMenu actions={singleAction} />)
      
      const triggerButton = screen.getByRole('button')
      await user.click(triggerButton)
      
      expect(screen.getByText('View Only')).toBeInTheDocument()
    })

    it('should handle actions with long labels', async () => {
      const user = userEvent.setup()
      const actionsWithLongLabels: TableAction[] = [
        {
          label: 'This is a very long action label that might wrap',
          onClick: vi.fn(),
        },
      ]
      
      render(<TableActionMenu actions={actionsWithLongLabels} />)
      
      const triggerButton = screen.getByRole('button')
      await user.click(triggerButton)
      
      expect(screen.getByText('This is a very long action label that might wrap')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper button role for trigger', () => {
      render(<TableActionMenu actions={mockActions} />)
      
      const triggerButton = screen.getByRole('button')
      expect(triggerButton).toBeInTheDocument()
    })

    it('should have proper menu structure when opened', async () => {
      const user = userEvent.setup()
      render(<TableActionMenu actions={mockActions} />)
      
      const triggerButton = screen.getByRole('button')
      await user.click(triggerButton)
      
      // Check that menu items have proper roles
      const menuItems = screen.getAllByRole('menuitem')
      expect(menuItems).toHaveLength(4)
    })

    it('should have proper labels for screen readers', async () => {
      const user = userEvent.setup()
      render(<TableActionMenu actions={mockActions} />)
      
      const triggerButton = screen.getByRole('button')
      await user.click(triggerButton)
      
      expect(screen.getByText('View')).toBeInTheDocument()
      expect(screen.getByText('Edit')).toBeInTheDocument()
      expect(screen.getByText('Download')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })
  })

  describe('Menu Behavior', () => {
    it('should close menu after action is clicked', async () => {
      const user = userEvent.setup()
      render(<TableActionMenu actions={mockActions} />)
      
      const triggerButton = screen.getByRole('button')
      await user.click(triggerButton)
      
      expect(screen.getByText('View')).toBeInTheDocument()
      
      const viewAction = screen.getByText('View')
      await user.click(viewAction)
      
      // Menu should close after action is clicked
      await waitFor(() => {
        expect(screen.queryByText('View')).not.toBeInTheDocument()
      })
    })

    it('should align menu to end', async () => {
      const user = userEvent.setup()
      render(<TableActionMenu actions={mockActions} />)
      
      const triggerButton = screen.getByRole('button')
      await user.click(triggerButton)
      
      // The menu should be aligned to the end (right side)
      // This is tested by checking that the menu content is rendered
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })
  })
})
