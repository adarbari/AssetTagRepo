import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AuditLogList, type AuditLogEntry } from '../common/AuditLogList'

describe('AuditLogList Component', () => {
  const mockEntries: AuditLogEntry[] = [
    {
      id: '1',
      timestamp: '2023-10-27T10:00:00Z',
      action: 'created',
      field: 'status',
      oldValue: '',
      newValue: 'active',
      changedBy: 'John Doe',
      notes: 'Initial creation',
    },
    {
      id: '2',
      timestamp: '2023-10-27T11:00:00Z',
      action: 'updated',
      field: 'priority',
      oldValue: 'low',
      newValue: 'high',
      changedBy: 'Jane Smith',
      changes: [
        { field: 'priority', from: 'low', to: 'high' },
        { field: 'status', from: 'active', to: 'in-progress' },
      ],
    },
  ]

  describe('Empty State', () => {
    it('should render empty state when no entries provided', () => {
      render(<AuditLogList entries={[]} />)
      
      expect(screen.getByText('Audit Log')).toBeInTheDocument()
      expect(screen.getByText('Complete history of all changes')).toBeInTheDocument()
      expect(screen.getByText('No Audit Log Entries')).toBeInTheDocument()
      expect(screen.getByText(/No changes have been recorded yet/)).toBeInTheDocument()
    })

    it('should render custom empty message', () => {
      render(<AuditLogList entries={[]} emptyMessage="No changes recorded yet." />)
      
      expect(screen.getByText(/No changes have been recorded yet/)).toBeInTheDocument()
    })

    it('should render custom title and description', () => {
      render(
        <AuditLogList 
          entries={[]} 
          title="Change History" 
          description="Track all modifications"
        />
      )
      
      expect(screen.getByText('Change History')).toBeInTheDocument()
      expect(screen.getByText('Track all modifications')).toBeInTheDocument()
    })
  })

  describe('Default Variant (Card-based)', () => {
    it('should render entries in card format', () => {
      render(<AuditLogList entries={mockEntries} />)
      
      expect(screen.getByText('Audit Log')).toBeInTheDocument()
      expect(screen.getByText('Complete history of all changes')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    it('should display entry details correctly', () => {
      render(<AuditLogList entries={[mockEntries[0]]} />)
      
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText(/Created status/)).toBeInTheDocument()
      expect(screen.getByText(/Created status/)).toBeInTheDocument()
    })

    it('should display timestamp with default formatter', () => {
      render(<AuditLogList entries={[mockEntries[0]]} />)
      
      // Should display formatted timestamp
      expect(screen.getByText(/10\/27\/2023/)).toBeInTheDocument()
    })

    it('should use custom date formatter', () => {
      const customFormatter = vi.fn().mockReturnValue('Custom Date Format')
      render(<AuditLogList entries={[mockEntries[0]]} formatDate={customFormatter} />)
      
      expect(customFormatter).toHaveBeenCalledWith('2023-10-27T10:00:00Z')
      expect(screen.getByText('Custom Date Format')).toBeInTheDocument()
    })
  })

  describe('Dialog Variant (Timeline)', () => {
    it('should render entries in timeline format', () => {
      render(<AuditLogList entries={mockEntries} variant="dialog" />)
      
      expect(screen.getByText('created')).toBeInTheDocument()
      expect(screen.getByText('updated')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    it('should display action badges in timeline', () => {
      render(<AuditLogList entries={[mockEntries[0]]} variant="dialog" />)
      
      const badge = screen.getByText('created')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('bg-primary/10')
    })

    it('should display changes in timeline format', () => {
      render(<AuditLogList entries={[mockEntries[1]]} variant="dialog" />)
      
      expect(screen.getAllByText('priority:')).toHaveLength(2) // One from changes array, one from oldValue/newValue
      expect(screen.getAllByText('low')).toHaveLength(2) // Both from changes array and oldValue/newValue
      expect(screen.getAllByText('high')).toHaveLength(2) // Both from changes array and oldValue/newValue
      expect(screen.getByText('status:')).toBeInTheDocument()
      expect(screen.getByText('active')).toBeInTheDocument()
      expect(screen.getByText('in-progress')).toBeInTheDocument()
    })

    it('should display notes in timeline format', () => {
      render(<AuditLogList entries={[mockEntries[0]]} variant="dialog" />)
      
      expect(screen.getByText('Initial creation')).toBeInTheDocument()
    })

    it('should render timeline dots and separators', () => {
      render(<AuditLogList entries={mockEntries} variant="dialog" />)
      
      // Should have timeline dots (bg-primary rounded-full)
      const dots = document.querySelectorAll('.bg-primary.rounded-full')
      expect(dots.length).toBeGreaterThan(0)
    })
  })

  describe('Entry Data Handling', () => {
    it('should handle entries without changes array', () => {
      const entryWithoutChanges: AuditLogEntry = {
        id: '3',
        timestamp: '2023-10-27T12:00:00Z',
        action: 'deleted',
        changedBy: 'Admin User',
      }
      
      render(<AuditLogList entries={[entryWithoutChanges]} variant="dialog" />)
      
      expect(screen.getByText('deleted')).toBeInTheDocument()
      expect(screen.getByText('Admin User')).toBeInTheDocument()
    })

    it('should handle entries without notes', () => {
      const entryWithoutNotes: AuditLogEntry = {
        id: '4',
        timestamp: '2023-10-27T13:00:00Z',
        action: 'updated',
        field: 'name',
        oldValue: 'Old Name',
        newValue: 'New Name',
        changedBy: 'User',
      }
      
      render(<AuditLogList entries={[entryWithoutNotes]} />)
      
      expect(screen.getByText('User')).toBeInTheDocument()
      expect(screen.getByText(/Updated name/)).toBeInTheDocument()
    })

    it('should handle entries with only changes array', () => {
      const entryWithOnlyChanges: AuditLogEntry = {
        id: '5',
        timestamp: '2023-10-27T14:00:00Z',
        action: 'bulk_update',
        changedBy: 'System',
        changes: [
          { field: 'field1', from: 'old1', to: 'new1' },
          { field: 'field2', from: 'old2', to: 'new2' },
        ],
      }
      
      render(<AuditLogList entries={[entryWithOnlyChanges]} variant="dialog" />)
      
      expect(screen.getByText('bulk_update')).toBeInTheDocument()
      expect(screen.getByText('field1:')).toBeInTheDocument()
      expect(screen.getByText('field2:')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<AuditLogList entries={mockEntries} />)
      
      const heading = screen.getByRole('heading', { name: 'Audit Log' })
      expect(heading).toBeInTheDocument()
    })

    it('should have proper list structure in timeline variant', () => {
      render(<AuditLogList entries={mockEntries} variant="timeline" />)
      
      // Timeline should be accessible
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })
  })

  describe('Custom Props', () => {
    it('should accept custom className', () => {
      const { container } = render(
        <AuditLogList entries={mockEntries} className="custom-audit-log" />
      )
      
      expect(container.firstChild).toHaveClass('custom-audit-log')
    })

    it('should handle custom formatDate function', () => {
      const formatDate = (dateString: string) => `Custom: ${dateString}`
      render(<AuditLogList entries={[mockEntries[0]]} formatDate={formatDate} />)
      
      expect(screen.getByText('Custom: 2023-10-27T10:00:00Z')).toBeInTheDocument()
    })
  })
})
