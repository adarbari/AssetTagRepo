import React, { useState, useEffect } from &apos;react&apos;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &apos;../ui/card&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import { AlertTriangle, Edit, Package, Tag, Save } from &apos;lucide-react&apos;;
import { toast } from &apos;sonner&apos;;
import {
  PageHeader,
  SeverityBadge,
  StatusBadge,
  AuditLogList,
  LoadingState,
  PageLayout,
} from &apos;../common&apos;;
import { getIssueById } from &apos;../../data/mockIssueData&apos;;
import { IssueForm, IssueFormData } from &apos;./IssueForm&apos;;
import { formatAuditDate } from &apos;../../utils/dateFormatter&apos;;
import type { Issue, UpdateIssueInput } from &apos;../../types/issue&apos;;
import type { AuditLogEntry } from &apos;../common&apos;;

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
        toast.error(&apos;Issue not found&apos;);
        onBack();
      }
    } catch (error) {
      toast.error(&apos;Failed to load issue&apos;);
// // // // // // // console.error(&apos;Error loading issue:&apos;, error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockAuditLog = (issueData: Issue) => {
    const mockAuditLog: AuditLogEntry[] = [
      {
        id: &apos;audit-1&apos;,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        action: &apos;created&apos;,
        field: &apos;issue&apos;,
        oldValue: &apos;&apos;,
        newValue: issueData.title,
        changedBy: &apos;John Smith&apos;,
      },
      {
        id: &apos;audit-2&apos;,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        action: &apos;updated&apos;,
        field: &apos;status&apos;,
        oldValue: &apos;open&apos;,
        newValue: issueData.status,
        changedBy: &apos;Sarah Johnson&apos;,
      },
      {
        id: &apos;audit-3&apos;,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        action: &apos;updated&apos;,
        field: &apos;assignedTo&apos;,
        oldValue: &apos;&apos;,
        newValue: issueData.assignedTo || &apos;Unassigned&apos;,
        changedBy: &apos;Mike Wilson&apos;,
      },
      {
        id: &apos;audit-4&apos;,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        action: &apos;updated&apos;,
        field: &apos;notes&apos;,
        oldValue: &apos;&apos;,
        newValue: issueData.notes || &apos;No notes&apos;,
        changedBy: &apos;Current User&apos;,
      },
    ];

    setAuditLog(mockAuditLog);
  };

  const handleFormSubmit = async (
    formData: IssueFormData
  ): Promise<{ success: boolean; error?: any }> => {
    if (!issue) {
      return { success: false, error: &apos;No issue found&apos; };
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
        toast.success(&apos;Issue updated successfully&apos;);

        // Add audit log entry for this update
        const newAuditEntry: AuditLogEntry = {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: &apos;updated&apos;,
          field: &apos;multiple&apos;,
          oldValue: &apos;previous values&apos;,
          newValue: &apos;updated values&apos;,
          changedBy: &apos;Current User&apos;,
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
        toast.error(&apos;Failed to update issue&apos;);
        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error(&apos;Failed to update issue&apos;);
// // // // // // // console.error(&apos;Error updating issue:&apos;, error);
      return { success: false, error };
    } finally {
      setSaving(false);
    }
  };

  // Using generic components for badges and date formatting

  if (loading) {
    return (
      <div className=&apos;p-6&apos;>
        <PageHeader title=&apos;Issue Details&apos; onBack={onBack} />
        <LoadingState message=&apos;Loading issue details...&apos; />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className=&apos;p-6&apos;>
        <PageHeader title=&apos;Issue Details&apos; onBack={onBack} />
        <div className=&apos;text-center py-8&apos;>
          <AlertTriangle className=&apos;h-12 w-12 text-muted-foreground mx-auto mb-4&apos; />
          <h3 className=&apos;text-lg font-semibold mb-2&apos;>Issue Not Found</h3>
          <p className=&apos;text-muted-foreground mb-4&apos;>
            The requested issue could not be found.
          </p>
          <Button onClick={onBack}>Back to Issues</Button>
        </div>
      </div>
    );
  }

  return (
    <PageLayout
      variant=&apos;standard&apos;
      padding=&apos;md&apos;
      header={
        <PageHeader
          title={`${issue.id} - ${issue.title}`}
          onBack={onBack}
          description={`Asset: ${issue.assetName} (${issue.assetId})`}
          actions={
            <div className=&apos;flex items-center gap-2&apos;>
              {isEditing ? (
                <>
                  <Button variant=&apos;outline&apos; onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button type=&apos;submit&apos; form=&apos;issue-form&apos;>
                    <Save className=&apos;h-4 w-4 mr-2&apos; />
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className=&apos;h-4 w-4 mr-2&apos; />
                  Edit Issue
                </Button>
              )}
            </div>
          }
        />
      }
    >
      {/* Status Badges */}
      <div className=&apos;flex gap-2&apos;>
        <StatusBadge status={issue.status} />
        <SeverityBadge severity={issue.severity} />
      </div>

      {/* Unified Form Interface */}
      <div className=&apos;space-y-6&apos;>
        {isEditing ? (
          <Card>
            <CardHeader>
              <CardTitle>Edit Issue</CardTitle>
              <CardDescription>Update the issue information</CardDescription>
            </CardHeader>
            <CardContent>
              <IssueForm
                mode=&apos;edit&apos;
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
          <div className=&apos;grid gap-6 lg:grid-cols-2&apos;>
            {/* Issue Information */}
            <Card>
              <CardHeader>
                <CardTitle>Issue Information</CardTitle>
              </CardHeader>
              <CardContent className=&apos;space-y-4&apos;>
                <div className=&apos;grid gap-4&apos;>
                  <div>
                    <label className=&apos;text-sm font-medium text-muted-foreground&apos;>
                      Issue Type
                    </label>
                    <p className=&apos;text-sm&apos;>{issue.type}</p>
                  </div>
                  <div>
                    <label className=&apos;text-sm font-medium text-muted-foreground&apos;>
                      Severity
                    </label>
                    <div className=&apos;mt-1&apos;>
                      <SeverityBadge severity={issue.severity} />
                    </div>
                  </div>
                  <div>
                    <label className=&apos;text-sm font-medium text-muted-foreground&apos;>
                      Status
                    </label>
                    <div className=&apos;mt-1&apos;>
                      <StatusBadge status={issue.status} />
                    </div>
                  </div>
                  <div>
                    <label className=&apos;text-sm font-medium text-muted-foreground&apos;>
                      Reported
                    </label>
                    <p className=&apos;text-sm&apos;>
                      {formatAuditDate(issue.reportedDate)}
                    </p>
                  </div>
                  <div>
                    <label className=&apos;text-sm font-medium text-muted-foreground&apos;>
                      Reported By
                    </label>
                    <p className=&apos;text-sm&apos;>{issue.reportedBy}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Asset Information */}
            <Card>
              <CardHeader>
                <CardTitle className=&apos;flex items-center gap-2&apos;>
                  <Package className=&apos;h-5 w-5&apos; />
                  Asset Information
                </CardTitle>
              </CardHeader>
              <CardContent className=&apos;space-y-4&apos;>
                <div className=&apos;grid gap-4&apos;>
                  <div>
                    <label className=&apos;text-sm font-medium text-muted-foreground&apos;>
                      Asset Name
                    </label>
                    <p className=&apos;text-sm font-medium&apos;>{issue.assetName}</p>
                  </div>
                  <div>
                    <label className=&apos;text-sm font-medium text-muted-foreground&apos;>
                      Asset ID
                    </label>
                    <p className=&apos;text-sm font-mono&apos;>{issue.assetId}</p>
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
            <p className=&apos;text-sm whitespace-pre-wrap&apos;>{issue.description}</p>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <div className=&apos;grid gap-6 lg:grid-cols-2&apos;>
          <Card>
            <CardHeader>
              <CardTitle>Assignment & Notes</CardTitle>
            </CardHeader>
            <CardContent className=&apos;space-y-4&apos;>
              <div>
                <label className=&apos;text-sm font-medium text-muted-foreground&apos;>
                  Assigned To
                </label>
                <p className=&apos;text-sm&apos;>{issue.assignedTo || &apos;Unassigned&apos;}</p>
              </div>
              <div>
                <label className=&apos;text-sm font-medium text-muted-foreground&apos;>
                  Notes
                </label>
                <p className=&apos;text-sm whitespace-pre-wrap&apos;>
                  {issue.notes || &apos;No notes&apos;}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className=&apos;flex items-center gap-2&apos;>
                <Tag className=&apos;h-5 w-5&apos; />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              {issue.tags && issue.tags.length > 0 ? (
                <div className=&apos;flex flex-wrap gap-2&apos;>
                  {issue.tags.map((tag, index) => (
                    <Badge key={index} variant=&apos;secondary&apos;>
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className=&apos;text-sm text-muted-foreground&apos;>No tags</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Audit Log */}
        <AuditLogList
          entries={auditLog}
          title=&apos;Audit Log&apos;
          description=&apos;Complete history of all changes made to this issue&apos;
          formatDate={formatAuditDate}
        />
      </div>
    </PageLayout>
  );
}
