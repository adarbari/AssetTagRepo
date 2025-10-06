/**
 * Issue Management Hook
 *
 * Manages issue state and operations
 */

import { useState, useCallback } from 'react';
import { mockIssues } from '../data/mockIssueData';
import type {
  Issue,
  CreateIssueInput,
  UpdateIssueInput,
  IssueStatus,
} from '../types/issue';

export function useIssueManagement() {
  const [issues, setIssues] = useState<Issue[]>(mockIssues);

  const createIssue = useCallback(
    async (
      input: CreateIssueInput
    ): Promise<{ success: boolean; issue?: Issue; error?: any }> => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        const newIssue: Issue = {
          id: `ISS-${String(issues.length + 1).padStart(3, '0')}`,
          ...input,
          status: 'open',
          reportedDate: new Date().toISOString(),
        };

        setIssues(prev => [newIssue, ...prev]);

        return { success: true, issue: newIssue };
      } catch (error) {
        console.error('Error creating issue:', error);
        return { success: false, error };
      }
    },
    [issues.length]
  );

  const updateIssue = useCallback(
    async (
      issueId: string,
      input: UpdateIssueInput
    ): Promise<{ success: boolean; issue?: Issue; error?: any }> => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        let updatedIssue: Issue | undefined;

        setIssues(prev =>
          prev.map(issue => {
            if (issue.id === issueId) {
              updatedIssue = { ...issue, ...input };
              return updatedIssue;
            }
            return issue;
          })
        );

        return { success: true, issue: updatedIssue };
      } catch (error) {
        console.error('Error updating issue:', error);
        return { success: false, error };
      }
    },
    []
  );

  const updateIssueStatus = useCallback(
    async (
      issueId: string,
      status: IssueStatus
    ): Promise<{ success: boolean; error?: any }> => {
      try {
        const updateData: UpdateIssueInput = {
          status,
          ...(status === 'resolved'
            ? { resolvedDate: new Date().toISOString() }
            : {}),
        };

        return await updateIssue(issueId, updateData);
      } catch (error) {
        console.error('Error updating issue status:', error);
        return { success: false, error };
      }
    },
    [updateIssue]
  );

  const deleteIssue = useCallback(
    async (issueId: string): Promise<{ success: boolean; error?: any }> => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        setIssues(prev => prev.filter(issue => issue.id !== issueId));

        return { success: true };
      } catch (error) {
        console.error('Error deleting issue:', error);
        return { success: false, error };
      }
    },
    []
  );

  const getIssuesByAsset = useCallback(
    (assetId: string): Issue[] => {
      return issues.filter(issue => issue.assetId === assetId);
    },
    [issues]
  );

  const getOpenIssuesCount = useCallback((): number => {
    return issues.filter(
      issue =>
        issue.status === 'open' ||
        issue.status === 'acknowledged' ||
        issue.status === 'in-progress'
    ).length;
  }, [issues]);

  return {
    issues,
    createIssue,
    updateIssue,
    updateIssueStatus,
    deleteIssue,
    getIssuesByAsset,
    getOpenIssuesCount,
  };
}
