import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  AlertTriangle,
  ArrowLeft,
  Edit,
  History,
  User,
  Calendar,
  Package,
  Clock,
  MessageSquare,
  Tag,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  PageHeader,
  SeverityBadge,
  StatusBadge,
  AuditLogList,
  LoadingState,
  PageLayout,
} from '../common';
import { getIssueById } from '../../data/mockIssueData';
import { IssueForm, IssueFormData } from './IssueForm';
import { formatAuditDate } from '../../utils/dateFormatter';
import type { Issue, UpdateIssueInput } from '../../types/issue';
import type { AuditLogEntry } from '../common';

interface IssueDetailsProps {
  issueId: string;
  onBack: () => void;
  onUpdateIssue: (
    issueId: string,
    input: UpdateIssueInput
  ) => Promise<{ success: boolean; issue?: Issue; error?: any }>;
}

// AuditLogEntry type is now imported from common components

export function IssueDetails({
  issueId,
  onBack,
  onUpdateIssue,
}: IssueDetailsProps) {
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    loadIssue();
  }, [issueId]);

  const loadIssue = async () => {
    try {
      setLoading(true);
      const issueData = getIssueById(issueId);
      if (issueData) {
        setIssue(issueData);
        // Generate mock audit log
        generateMockAuditLog(issueData);
      } else {
        toast.error('Issue not found');
        onBack();
      }
    } catch (error) {
      toast.error('Failed to load issue');
      console.error('Error loading issue:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockAuditLog = (issueData: Issue) => {
    const mockAuditLog: AuditLogEntry[] = [
      {
        id: 'audit-1',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        action: 'created',
        field: 'issue',
        oldValue: '',
        newValue: issueData.title,
        changedBy: 'John Smith',
      },
      {
        id: 'audit-2',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        action: 'updated',
        field: 'status',
        oldValue: 'open',
        newValue: issueData.status,
        changedBy: 'Sarah Johnson',
      },
      {
        id: 'audit-3',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        action: 'updated',
        field: 'assignedTo',
        oldValue: '',
        newValue: issueData.assignedTo || 'Unassigned',
        changedBy: 'Mike Wilson',
      },
      {
        id: 'audit-4',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        action: 'updated',
        field: 'notes',
        oldValue: '',
        newValue: issueData.notes || 'No notes',
        changedBy: 'Current User',
      },
    ];

    setAuditLog(mockAuditLog);
  };

  const handleFormSubmit = async (
    formData: IssueFormData
  ): Promise<{ success: boolean; error?: any }> => {
    if (!issue) {
      return { success: false, error: 'No issue found' };
    }

    setSaving(true);

    try {
      const updateData: UpdateIssueInput = {
        type: formData.type,
        severity: formData.severity,
        status: formData.status,
        title: formData.title.trim(),
        description: formData.description.trim(),
        assignedTo: formData.assignedTo?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
        tags: formData.tags,
      };

      const result = await onUpdateIssue(issueId, updateData);

      if (result.success) {
        toast.success('Issue updated successfully');

        // Add audit log entry for this update
        const newAuditEntry: AuditLogEntry = {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'updated',
          field: 'multiple',
          oldValue: 'previous values',
          newValue: 'updated values',
          changedBy: 'Current User',
        };

        setAuditLog(prev => [newAuditEntry, ...prev]);

        // Update local issue state
        if (result.issue) {
          setIssue(result.issue);
        }

        // Navigate back to issue tracking
        onBack();
        return { success: true };
      } else {
        toast.error('Failed to update issue');
        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error('Failed to update issue');
      console.error('Error updating issue:', error);
      return { success: false, error };
    } finally {
      setSaving(false);
    }
  };

  // Using generic components for badges and date formatting

  if (loading) {
    return (
      <div className='p-6'>
        <PageHeader title='Issue Details' onBack={onBack} />
        <LoadingState message='Loading issue details...' />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className='p-6'>
        <PageHeader title='Issue Details' onBack={onBack} />
        <div className='text-center py-8'>
          <AlertTriangle className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
          <h3 className='text-lg font-semibold mb-2'>Issue Not Found</h3>
          <p className='text-muted-foreground mb-4'>
            The requested issue could not be found.
          </p>
          <Button onClick={onBack}>Back to Issues</Button>
        </div>
      </div>
    );
  }

  return (
    <PageLayout
      variant='standard'
      padding='md'
      header={
        <PageHeader
          title={`${issue.id} - ${issue.title}`}
          onBack={onBack}
          description={`Asset: ${issue.assetName} (${issue.assetId})`}
          actions={
            <div className='flex items-center gap-2'>
              {isEditing ? (
                <>
                  <Button variant='outline' onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button type='submit' form='issue-form'>
                    <Save className='h-4 w-4 mr-2' />
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className='h-4 w-4 mr-2' />
                  Edit Issue
                </Button>
              )}
            </div>
          }
        />
      }
    >
      {/* Status Badges */}
      <div className='flex gap-2'>
        <StatusBadge status={issue.status} />
        <SeverityBadge severity={issue.severity} />
      </div>

      {/* Unified Form Interface */}
      <div className='space-y-6'>
        {isEditing ? (
          <Card>
            <CardHeader>
              <CardTitle>Edit Issue</CardTitle>
              <CardDescription>Update the issue information</CardDescription>
            </CardHeader>
            <CardContent>
              <IssueForm
                mode='edit'
                initialData={{
                  type: issue.type,
                  severity: issue.severity,
                  status: issue.status,
                  title: issue.title,
                  description: issue.description,
                  assignedTo: issue.assignedTo,
                  notes: issue.notes,
                  tags: issue.tags,
                }}
                assetId={issue.assetId}
                assetName={issue.assetName}
                onSubmit={handleFormSubmit}
                onCancel={() => setIsEditing(false)}
                isSubmitting={saving}
                showAssetInfo={false}
                showStatusField={true}
                showAdvancedFields={true}
              />
            </CardContent>
          </Card>
        ) : (
          <div className='grid gap-6 lg:grid-cols-2'>
            {/* Issue Information */}
            <Card>
              <CardHeader>
                <CardTitle>Issue Information</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid gap-4'>
                  <div>
                    <label className='text-sm font-medium text-muted-foreground'>
                      Issue Type
                    </label>
                    <p className='text-sm'>{issue.type}</p>
                  </div>
                  <div>
                    <label className='text-sm font-medium text-muted-foreground'>
                      Severity
                    </label>
                    <div className='mt-1'>
                      <SeverityBadge severity={issue.severity} />
                    </div>
                  </div>
                  <div>
                    <label className='text-sm font-medium text-muted-foreground'>
                      Status
                    </label>
                    <div className='mt-1'>
                      <StatusBadge status={issue.status} />
                    </div>
                  </div>
                  <div>
                    <label className='text-sm font-medium text-muted-foreground'>
                      Reported
                    </label>
                    <p className='text-sm'>
                      {formatAuditDate(issue.reportedDate)}
                    </p>
                  </div>
                  <div>
                    <label className='text-sm font-medium text-muted-foreground'>
                      Reported By
                    </label>
                    <p className='text-sm'>{issue.reportedBy}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Asset Information */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Package className='h-5 w-5' />
                  Asset Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid gap-4'>
                  <div>
                    <label className='text-sm font-medium text-muted-foreground'>
                      Asset Name
                    </label>
                    <p className='text-sm font-medium'>{issue.assetName}</p>
                  </div>
                  <div>
                    <label className='text-sm font-medium text-muted-foreground'>
                      Asset ID
                    </label>
                    <p className='text-sm font-mono'>{issue.assetId}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm whitespace-pre-wrap'>{issue.description}</p>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <div className='grid gap-6 lg:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle>Assignment & Notes</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>
                  Assigned To
                </label>
                <p className='text-sm'>{issue.assignedTo || 'Unassigned'}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>
                  Notes
                </label>
                <p className='text-sm whitespace-pre-wrap'>
                  {issue.notes || 'No notes'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Tag className='h-5 w-5' />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              {issue.tags && issue.tags.length > 0 ? (
                <div className='flex flex-wrap gap-2'>
                  {issue.tags.map((tag, index) => (
                    <Badge key={index} variant='secondary'>
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>No tags</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Audit Log */}
        <AuditLogList
          entries={auditLog}
          title='Audit Log'
          description='Complete history of all changes made to this issue'
          formatDate={formatAuditDate}
        />
      </div>
    </PageLayout>
  );
}
