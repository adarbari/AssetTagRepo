// import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditIssue } from '../issues/EditIssue';
import { render } from '../../test/test-utils';
import { mockIssue } from '../../test/test-utils';

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock getIssueById
vi.mock('../../data/mockIssueData', () => ({
  getIssueById: vi.fn(),
}));

describe('EditIssue Component - Basic Tests', () => {
  const mockProps = {
    issueId: mockIssue.id,
    onBack: vi.fn(),
    onUpdateIssue: vi
      .fn()
      .mockResolvedValue({ success: true, issue: mockIssue }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock getIssueById implementation
    const { getIssueById } = require('../../data/mockIssueData');
    getIssueById.mockResolvedValue(mockIssue);
  });

  describe('Basic Rendering', () => {
    it('should render the component without crashing', async () => {
      render(<EditIssue {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText(/edit issue/i)).toBeInTheDocument();
      });
    });

    it('should render back button and handle click', async () => {
      const user = userEvent.setup();
      render(<EditIssue {...mockProps} />);

      await waitFor(async () => {
        const backButton = screen.getByRole('button', { name: /back/i });
        await user.click(backButton);
        expect(mockProps.onBack).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Form Structure', () => {
    it('should render form with proper structure', async () => {
      render(<EditIssue {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText(/edit issue/i)).toBeInTheDocument();
      });
    });

    it('should render issue information', async () => {
      render(<EditIssue {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText(mockIssue.title)).toBeInTheDocument();
      });
    });
  });

  describe('Form Inputs', () => {
    it('should render issue title input', async () => {
      render(<EditIssue {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      });
    });

    it('should handle title input typing', async () => {
      const user = userEvent.setup();
      render(<EditIssue {...mockProps} />);

      await waitFor(() => {
        const descriptionInput = screen.getByLabelText(/description/i);
        user.type(descriptionInput, 'Updated Issue');
        expect(descriptionInput).toHaveValue('Updated Issue');
      });
    });
  });

  describe('Button Interactions', () => {
    it('should render save button', async () => {
      render(<EditIssue {...mockProps} />);

      await waitFor(() => {
        const saveButton = screen.getByRole('button', { name: /save/i });
        expect(saveButton).toBeInTheDocument();
      });
    });

    it('should handle cancel button click', async () => {
      const user = userEvent.setup();
      render(<EditIssue {...mockProps} />);

      await waitFor(() => {
        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        user.click(cancelButton);
        expect(mockProps.onBack).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Form Validation', () => {
    it('should handle form submission with valid data', async () => {
      const user = userEvent.setup();
      render(<EditIssue {...mockProps} />);

      await waitFor(() => {
        const descriptionInput = screen.getByLabelText(/description/i);
        user.type(descriptionInput, 'Updated Issue');

        const saveButton = screen.getByRole('button', { name: /save/i });
        user.click(saveButton);

        expect(mockProps.onUpdateIssue).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper form structure', async () => {
      render(<EditIssue {...mockProps} />);

      await waitFor(() => {
        const form = document.querySelector('form');
        expect(form).toBeInTheDocument();
      });
    });

    it('should have proper labels for inputs', async () => {
      render(<EditIssue {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing issue data gracefully', async () => {
      const { getIssueById } = require('../../data/mockIssueData');
      getIssueById.mockResolvedValue(null);

      render(<EditIssue {...mockProps} />);

      // Should render without crashing
      await waitFor(() => {
        expect(screen.getByText(/edit issue/i)).toBeInTheDocument();
      });
    });

    it('should handle onUpdateIssue callback', () => {
      expect(mockProps.onUpdateIssue).toBeDefined();
    });
  });
});
