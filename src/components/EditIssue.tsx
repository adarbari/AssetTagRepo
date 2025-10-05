import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { AlertTriangle, History, User, Calendar } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "./common";
import { getIssueById } from "../data/mockIssueData";
import { IssueForm, IssueFormData } from "./IssueForm";
import type { Issue, UpdateIssueInput } from "../types/issue";

interface EditIssueProps {
  issueId: string;
  onBack: () => void;
  onUpdateIssue: (issueId: string, input: UpdateIssueInput) => Promise<{ success: boolean; issue?: Issue; error?: any }>;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
}

export function EditIssue({
  issueId,
  onBack,
  onUpdateIssue,
}: EditIssueProps) {
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
        toast.error("Issue not found");
        onBack();
      }
    } catch (error) {
      toast.error("Failed to load issue");
      console.error("Error loading issue:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockAuditLog = (issueData: Issue) => {
    const mockAuditLog: AuditLogEntry[] = [
      {
        id: "audit-1",
        timestamp: issueData.reportedDate,
        action: "created",
        field: "issue",
        oldValue: "",
        newValue: issueData.title,
        changedBy: issueData.reportedBy,
      },
      {
        id: "audit-2",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        action: "updated",
        field: "status",
        oldValue: "open",
        newValue: issueData.status,
        changedBy: issueData.assignedTo || "System",
      },
    ];
    
    if (issueData.assignedTo) {
      mockAuditLog.push({
        id: "audit-3",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        action: "updated",
        field: "assignedTo",
        oldValue: "",
        newValue: issueData.assignedTo,
        changedBy: "System",
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
        toast.success("Issue updated successfully");
        
        // Add audit log entry for this update
        const newAuditEntry: AuditLogEntry = {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: "updated",
          field: "multiple",
          oldValue: "previous values",
          newValue: "updated values",
          changedBy: "Current User", // In real app, this would be the actual user
        };
        
        setAuditLog(prev => [newAuditEntry, ...prev]);
        
        // Update local issue state
        if (result.issue) {
          setIssue(result.issue);
        }
      } else {
        toast.error("Failed to update issue");
      }
    } catch (error) {
      toast.error("Failed to update issue");
      console.error("Error updating issue:", error);
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="p-6">
        <PageHeader title="Edit Issue" onBack={onBack} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading issue...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="p-6">
        <PageHeader title="Edit Issue" onBack={onBack} />
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Issue Not Found</h3>
          <p className="text-muted-foreground mb-4">The requested issue could not be found.</p>
          <Button onClick={onBack}>Back to Issues</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Edit Issue" onBack={onBack} />
      
      {/* Issue Info Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                {issue.id} - {issue.title}
              </CardTitle>
              <CardDescription>
                Asset: {issue.assetName} ({issue.assetId})
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                {issue.status.replace("-", " ")}
              </Badge>
              <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                {issue.severity}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Edit Form */}
        <IssueForm
          mode="edit"
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Audit Log
            </CardTitle>
            <CardDescription>Track all changes made to this issue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {auditLog.map((entry) => (
                <div key={entry.id} className="flex gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{entry.changedBy}</span>
                      <Badge variant="outline" className="text-xs">
                        {entry.action}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {entry.field === "multiple" 
                        ? "Updated multiple fields"
                        : `Updated ${entry.field} from "${entry.oldValue}" to "${entry.newValue}"`
                      }
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
