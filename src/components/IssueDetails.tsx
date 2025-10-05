import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
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
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "./common";
import { getIssueById } from "../data/mockIssueData";
import { IssueForm, IssueFormData } from "./IssueForm";
import type { Issue, UpdateIssueInput } from "../types/issue";

interface IssueDetailsProps {
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
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        action: "created",
        field: "issue",
        oldValue: "",
        newValue: issueData.title,
        changedBy: "John Smith"
      },
      {
        id: "audit-2",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        action: "updated",
        field: "status",
        oldValue: "open",
        newValue: issueData.status,
        changedBy: "Sarah Johnson"
      },
      {
        id: "audit-3",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        action: "updated",
        field: "assignedTo",
        oldValue: "",
        newValue: issueData.assignedTo || "Unassigned",
        changedBy: "Mike Wilson"
      },
      {
        id: "audit-4",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        action: "updated",
        field: "notes",
        oldValue: "",
        newValue: issueData.notes || "No notes",
        changedBy: "Current User"
      }
    ];
    
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
          changedBy: "Current User",
        };
        
        setAuditLog(prev => [newAuditEntry, ...prev]);
        
        // Update local issue state
        if (result.issue) {
          setIssue(result.issue);
        }
        
        // Exit edit mode
        setIsEditing(false);
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: string; className: string; icon: any }> = {
      open: { variant: "default", className: "bg-red-100 text-red-700 border-red-300", icon: AlertCircle },
      acknowledged: { variant: "default", className: "bg-yellow-100 text-yellow-700 border-yellow-300", icon: Clock },
      "in-progress": { variant: "default", className: "bg-blue-100 text-blue-700 border-blue-300", icon: Clock },
      resolved: { variant: "default", className: "bg-green-100 text-green-700 border-green-300", icon: CheckCircle2 },
      closed: { variant: "default", className: "bg-gray-100 text-gray-700 border-gray-300", icon: XCircle },
      cancelled: { variant: "default", className: "bg-gray-100 text-gray-700 border-gray-300", icon: XCircle },
    };
    
    const variant = variants[status] || variants.open;
    const Icon = variant.icon;
    
    return (
      <Badge variant="outline" className={variant.className}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace("-", " ")}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, { variant: string; className: string }> = {
      low: { variant: "default", className: "bg-green-100 text-green-700 border-green-300" },
      medium: { variant: "default", className: "bg-yellow-100 text-yellow-700 border-yellow-300" },
      high: { variant: "default", className: "bg-orange-100 text-orange-700 border-orange-300" },
      critical: { variant: "default", className: "bg-red-100 text-red-700 border-red-300" },
    };
    
    const variant = variants[severity] || variants.medium;
    return (
      <Badge variant="outline" className={variant.className}>
        {severity}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="p-6">
        <PageHeader title="Issue Details" onBack={onBack} />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="p-6">
        <PageHeader title="Issue Details" onBack={onBack} />
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
      <PageHeader 
        title={`${issue.id} - ${issue.title}`} 
        onBack={onBack}
        description={`Asset: ${issue.assetName} (${issue.assetId})`}
      />
      
      {/* Status Badges */}
      <div className="flex gap-2">
        {getStatusBadge(issue.status)}
        {getSeverityBadge(issue.severity)}
      </div>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Issue Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Issue Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Issue Type</label>
                      <p className="text-sm">{issue.type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Severity</label>
                      <div className="mt-1">
                        {getSeverityBadge(issue.severity)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div className="mt-1">
                        {getStatusBadge(issue.status)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Reported</label>
                      <p className="text-sm">{formatDate(issue.reportedDate)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Reported By</label>
                      <p className="text-sm">{issue.reportedBy}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Asset Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Asset Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Asset Name</label>
                      <p className="text-sm font-medium">{issue.assetName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Asset ID</label>
                      <p className="text-sm font-mono">{issue.assetId}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{issue.description}</p>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Assignment & Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
                    <p className="text-sm">{issue.assignedTo || "Unassigned"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Notes</label>
                    <p className="text-sm whitespace-pre-wrap">{issue.notes || "No notes"}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {issue.tags && issue.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {issue.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No tags</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Edit Tab */}
          <TabsContent value="edit">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold">Edit Issue</h2>
                <p className="text-muted-foreground">Update the issue information</p>
              </div>
              <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? "Cancel Edit" : "Edit Issue"}
              </Button>
            </div>

            {isEditing ? (
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
                onCancel={() => setIsEditing(false)}
                isSubmitting={saving}
                showAssetInfo={false}
                showStatusField={true}
                showAdvancedFields={true}
              />
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <Edit className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Ready to Edit</h3>
                    <p className="text-muted-foreground mb-4">
                      Click "Edit Issue" to modify the issue information
                    </p>
                    <Button onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Start Editing
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Audit Log
                </CardTitle>
                <CardDescription>
                  Complete history of all changes made to this issue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditLog.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{entry.changedBy}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(entry.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {entry.action === "created" ? "Created" : "Updated"} {entry.field}
                          {entry.oldValue && entry.newValue && (
                            <span className="ml-1">
                              from "{entry.oldValue}" to "{entry.newValue}"
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  );
}
