import React, { useState } from &apos;react&apos;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &apos;../ui/card&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Input } from &apos;../ui/input&apos;;
import { Label } from &apos;../ui/label&apos;;
import { Textarea } from &apos;../ui/textarea&apos;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &apos;../ui/select&apos;;
import { Save, Upload, Camera } from &apos;lucide-react&apos;;
import { toast } from &apos;sonner&apos;;
import { SeverityBadge, StatusBadge } from &apos;../common&apos;;
import { issueTypes, issueSeverities } from &apos;../../data/dropdownOptions&apos;;
import type { IssueType, IssueSeverity, IssueStatus } from &apos;../../types/issue&apos;;

export interface IssueFormData {
  type: IssueType;
  severity: IssueSeverity;
  status?: IssueStatus;
  title: string;
  description: string;
  assignedTo?: string;
  notes?: string;
  tags?: string[];
}

interface IssueFormProps {
  mode: &apos;create&apos; | &apos;edit&apos;;
  initialData?: Partial<IssueFormData>;
  assetId?: string;
  assetName?: string;
  assetContext?: any;
  onSubmit: (data: IssueFormData) => Promise<{ success: boolean; error?: any }>;
  onCancel: () => void;
  isSubmitting?: boolean;
  showAssetInfo?: boolean;
  showStatusField?: boolean;
  showAdvancedFields?: boolean;
}

export function IssueForm({
  mode,
  initialData = {},
  assetId,
  assetName,
  assetContext,
  onSubmit,
  onCancel,
  isSubmitting = false,
  showAssetInfo = true,
  showStatusField = false,
  showAdvancedFields = false,
}: IssueFormProps) {
  const [formData, setFormData] = useState<IssueFormData>({
    type: initialData.type || &apos;&apos;,
    severity: initialData.severity || &apos;medium&apos;,
    status: initialData.status || &apos;open&apos;,
    title: initialData.title || &apos;&apos;,
    description: initialData.description || &apos;&apos;,
    assignedTo: initialData.assignedTo || &apos;&apos;,
    notes: initialData.notes || &apos;&apos;,
    tags: initialData.tags || [],
  });

  const [tagsInput, setTagsInput] = useState(
    initialData.tags ? initialData.tags.join(&apos;, &apos;) : &apos;&apos;
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.type || !formData.description.trim()) {
      toast.error(&apos;Please fill in all required fields&apos;);
      return;
    }

    if (mode === &apos;edit&apos; && !formData.title.trim()) {
      toast.error(&apos;Please provide a title for the issue&apos;);
      return;
    }

    // Process tags
    const processedData = {
      ...formData,
      tags: tagsInput.trim() ? tagsInput.split(&apos;,&apos;).map(tag => tag.trim()) : [],
    };

    await onSubmit(processedData);
  };

  // Using generic SeverityBadge component

  return (
    <div className=&apos;space-y-6&apos;>
      {/* Asset Info Card */}
      {showAssetInfo && assetId && assetName && (
        <Card>
          <CardHeader>
            <CardTitle>Asset Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className=&apos;p-4 bg-muted rounded-lg&apos;>
              <div className=&apos;flex items-center justify-between&apos;>
                <div>
                  <h4>{assetName}</h4>
                  <p className=&apos;text-sm text-muted-foreground&apos;>{assetId}</p>
                  {assetContext && (
                    <div className=&apos;mt-2 text-sm space-y-1&apos;>
                      <p>
                        <span className=&apos;text-muted-foreground&apos;>Type:</span>{&apos; &apos;}
                        {assetContext.type}
                      </p>
                      <p>
                        <span className=&apos;text-muted-foreground&apos;>Status:</span>{&apos; &apos;}
                        {assetContext.status}
                      </p>
                      <p>
                        <span className=&apos;text-muted-foreground&apos;>Location:</span>{&apos; &apos;}
                        {assetContext.location}
                      </p>
                    </div>
                  )}
                </div>
                <div className=&apos;flex gap-2&apos;>
                  {formData.status && <StatusBadge status={formData.status} />}
                  <SeverityBadge severity={formData.severity} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Issue Form Card */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Issue Details</CardTitle>
            <CardDescription>
              {mode === &apos;create&apos;
                ? &quot;Provide detailed information about the issue you&apos;re reporting&quot;
                : &apos;Update the issue information&apos;}
            </CardDescription>
          </CardHeader>
          <CardContent className=&apos;space-y-6&apos;>
            {/* Title field for edit mode */}
            {mode === &apos;edit&apos; && (
              <div className=&apos;grid gap-2&apos;>
                <Label htmlFor=&apos;title&apos;>Title *</Label>
                <Input
                  id=&apos;title&apos;
                  value={formData.title}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, title: e.target.value }))
                  }
                  placeholder=&apos;Issue title&apos;
                />
              </div>
            )}

            <div className=&apos;grid gap-2&apos;>
              <Label htmlFor=&apos;issue-type&apos;>Issue Type *</Label>
              <Select
                value={formData.type}
                onValueChange={value =>
                  setFormData(prev => ({ ...prev, type: value as IssueType }))
                }
              >
                <SelectTrigger id=&apos;issue-type&apos;>
                  <SelectValue placeholder=&apos;Select issue type&apos; />
                </SelectTrigger>
                <SelectContent>
                  {issueTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className=&apos;grid gap-2&apos;>
              <Label htmlFor=&apos;severity&apos;>Severity</Label>
              <Select
                value={formData.severity}
                onValueChange={value =>
                  setFormData(prev => ({
                    ...prev,
                    severity: value as IssueSeverity,
                  }))
                }
              >
                <SelectTrigger id=&apos;severity&apos;>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {issueSeverities.map(sev => {
                    const colorMap: Record<string, string> = {
                      low: &apos;bg-yellow-500&apos;,
                      medium: &apos;bg-orange-500&apos;,
                      high: &apos;bg-red-500&apos;,
                      critical: &apos;bg-red-700&apos;,
                    };
                    return (
                      <SelectItem key={sev.value} value={sev.value}>
                        <div className=&apos;flex items-center gap-2&apos;>
                          <div
                            className={`h-2 w-2 rounded-full ${colorMap[sev.value]}`}
                          />
                          {sev.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Status field for edit mode */}
            {showStatusField && (
              <div className=&apos;grid gap-2&apos;>
                <Label htmlFor=&apos;status&apos;>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={value =>
                    setFormData(prev => ({
                      ...prev,
                      status: value as IssueStatus,
                    }))
                  }
                >
                  <SelectTrigger id=&apos;status&apos;>
                    <SelectValue placeholder=&apos;Select status&apos; />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=&apos;open&apos;>Open</SelectItem>
                    <SelectItem value=&apos;acknowledged&apos;>Acknowledged</SelectItem>
                    <SelectItem value=&apos;in-progress&apos;>In Progress</SelectItem>
                    <SelectItem value=&apos;resolved&apos;>Resolved</SelectItem>
                    <SelectItem value=&apos;closed&apos;>Closed</SelectItem>
                    <SelectItem value=&apos;cancelled&apos;>Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className=&apos;grid gap-2&apos;>
              <Label htmlFor=&apos;description&apos;>Description *</Label>
              <Textarea
                id=&apos;description&apos;
                placeholder=&apos;Describe the issue in detail...&apos;
                value={formData.description}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={8}
                className=&apos;resize-none&apos;
              />
              <p className=&apos;text-xs text-muted-foreground&apos;>
                Please include relevant details such as when the issue occurred,
                what you were doing, and any error messages.
              </p>
            </div>

            {/* Advanced fields for edit mode */}
            {showAdvancedFields && (
              <>
                <div className=&apos;grid gap-2&apos;>
                  <Label htmlFor=&apos;assignedTo&apos;>Assigned To</Label>
                  <Input
                    id=&apos;assignedTo&apos;
                    value={formData.assignedTo}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        assignedTo: e.target.value,
                      }))
                    }
                    placeholder=&apos;Technician or team member&apos;
                  />
                </div>

                <div className=&apos;grid gap-2&apos;>
                  <Label htmlFor=&apos;notes&apos;>Notes</Label>
                  <Textarea
                    id=&apos;notes&apos;
                    value={formData.notes}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, notes: e.target.value }))
                    }
                    placeholder=&apos;Additional notes or comments&apos;
                    rows={3}
                  />
                </div>

                <div className=&apos;grid gap-2&apos;>
                  <Label htmlFor=&apos;tags&apos;>Tags</Label>
                  <Input
                    id=&apos;tags&apos;
                    value={tagsInput}
                    onChange={e => setTagsInput(e.target.value)}
                    placeholder=&apos;Comma-separated tags&apos;
                  />
                </div>
              </>
            )}

            {/* Attachments section for create mode */}
            {mode === &apos;create&apos; && (
              <div className=&apos;grid gap-2&apos;>
                <Label htmlFor=&apos;attachments&apos;>Attachments (Optional)</Label>
                <div className=&apos;border-2 border-dashed rounded-lg p-6 text-center&apos;>
                  <div className=&apos;flex flex-col items-center gap-2&apos;>
                    <div className=&apos;flex gap-2&apos;>
                      <Upload className=&apos;h-8 w-8 text-muted-foreground&apos; />
                      <Camera className=&apos;h-8 w-8 text-muted-foreground&apos; />
                    </div>
                    <div>
                      <p className=&apos;text-sm font-medium&apos;>
                        Upload files or take photos
                      </p>
                      <p className=&apos;text-xs text-muted-foreground&apos;>
                        Drag and drop files here, or click to browse
                      </p>
                    </div>
                    <Button type=&apos;button&apos; variant=&apos;outline&apos; size=&apos;sm&apos;>
                      Choose Files
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className=&apos;flex gap-2 pt-4&apos;>
              <Button type=&apos;submit&apos; disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className=&apos;animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2&apos;></div>
                    {mode === &apos;create&apos; ? &apos;Creating...&apos; : &apos;Saving...&apos;}
                  </>
                ) : (
                  <>
                    <Save className=&apos;h-4 w-4 mr-2&apos; />
                    {mode === &apos;create&apos; ? &apos;Create Issue&apos; : &apos;Save Changes&apos;}
                  </>
                )}
              </Button>
              <Button type=&apos;button&apos; variant=&apos;outline&apos; onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
