import React from &apos;react&apos;;
import { useState, useEffect } from &apos;react&apos;;
import { Card, CardDescription, CardHeader, CardTitle } from &apos;../ui/card&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import { AlertTriangle } from &apos;lucide-react&apos;;
import { toast } from &apos;sonner&apos;;
import {
  PageHeader,
  LoadingState,
  AuditLogList,
  PageLayout,
  type AuditLogEntry,
} from &apos;../common&apos;;
import { getIssueById } from &apos;../../data/mockIssueData&apos;;
import { IssueForm, IssueFormData } from &apos;./IssueForm&apos;;
import type { Issue, UpdateIssueInput } from &apos;../../types/issue&apos;;

interface EditIssueProps {
  issueId: string;
  onBack: () => void;
  onUpdateIssue: (
    issueId: string,
    input: UpdateIssueInput
  ) => Promise<{ success: boolean; issue?: Issue; error?: any }>;
}

export function EditIssue({ issueId, onBack, onUpdateIssue }: EditIssueProps) {
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
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
        timestamp: issueData.reportedDate,
        action: &apos;created&apos;,
        field: &apos;issue&apos;,
        oldValue: &apos;&apos;,
        newValue: issueData.title,
        changedBy: issueData.reportedBy,
      },
      {
        id: &apos;audit-2&apos;,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        action: &apos;updated&apos;,
        field: &apos;status&apos;,
        oldValue: &apos;open&apos;,
        newValue: issueData.status,
        changedBy: issueData.assignedTo || &apos;System&apos;,
      },
    ];

    if (issueData.assignedTo) {
      mockAuditLog.push({
        id: &apos;audit-3&apos;,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        action: &apos;updated&apos;,
        field: &apos;assignedTo&apos;,
        oldValue: &apos;&apos;,
        newValue: issueData.assignedTo,
        changedBy: &apos;System&apos;,
      });
    }

    setAuditLog(mockAuditLog);
  };

  const handleFormSubmit = async (formData: IssueFormData) => {
    if (!issue) return;

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
          changedBy: &apos;Current User&apos;, // In real app, this would be the actual user
        };

        setAuditLog(prev => [newAuditEntry, ...prev]);

        // Update local issue state
        if (result.issue) {
          setIssue(result.issue);
        }
      } else {
        toast.error(&apos;Failed to update issue&apos;);
      }
    } catch (error) {
      toast.error(&apos;Failed to update issue&apos;);
// // // // // // // console.error(&apos;Error updating issue:&apos;, error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className=&apos;p-6&apos;>
        <PageHeader title=&apos;Edit Issue&apos; onBack={onBack} />
        <LoadingState message=&apos;Loading issue...&apos; />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className=&apos;p-6&apos;>
        <PageHeader title=&apos;Edit Issue&apos; onBack={onBack} />
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
      variant=&apos;narrow&apos;
      padding=&apos;md&apos;
      header={<PageHeader title=&apos;Edit Issue&apos; onBack={onBack} />}
    >
      {/* Issue Info Header */}
      <Card>
        <CardHeader>
          <div className=&apos;flex items-center justify-between&apos;>
            <div>
              <CardTitle className=&apos;flex items-center gap-2&apos;>
                <AlertTriangle className=&apos;h-5 w-5 text-orange-500&apos; />
                {issue.id} - {issue.title}
              </CardTitle>
              <CardDescription>
                Asset: {issue.assetName} ({issue.assetId})
              </CardDescription>
            </div>
            <div className=&apos;flex gap-2&apos;>
              <Badge
                variant=&apos;outline&apos;
                className=&apos;bg-red-100 text-red-700 border-red-300&apos;
              >
                {issue.status.replace(&apos;-&apos;, &apos; &apos;)}
              </Badge>
              <Badge
                variant=&apos;outline&apos;
                className=&apos;bg-orange-100 text-orange-700 border-orange-300&apos;
              >
                {issue.severity}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className=&apos;grid gap-6 lg:grid-cols-2&apos;>
        {/* Edit Form */}
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
          onCancel={onBack}
          isSubmitting={saving}
          showAssetInfo={false}
          showStatusField={true}
          showAdvancedFields={true}
        />

        {/* Audit Log */}
        <AuditLogList
          entries={auditLog}
          title=&apos;Audit Log&apos;
          description=&apos;Track all changes made to this issue&apos;
          variant=&apos;card&apos;
        />
      </div>
    </PageLayout>
  );
}
