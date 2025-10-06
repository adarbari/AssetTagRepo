import React, { useState } from &apos;react&apos;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &apos;../ui/card&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Label } from &apos;../ui/label&apos;;
import { Textarea } from &apos;../ui/textarea&apos;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &apos;../ui/select&apos;;
import { AlertTriangle, Camera, Upload } from &apos;lucide-react&apos;;
import { toast } from &apos;sonner&apos;;
import {
  AssetContextCard,
  PageLayout,
  PageHeaderWithBreadcrumbs,
} from &apos;../common&apos;;
import { issueTypes, issueSeverities } from &apos;../../data/dropdownOptions&apos;;
import type { Asset } from &apos;../../types&apos;;
import type {
  CreateIssueInput,
  IssueType,
  IssueSeverity,
} from &apos;../../types/issue&apos;;

interface CreateIssueProps {
  onBack: () => void;
  assetId: string;
  assetName: string;
  assetContext?: Asset;
  onCreateIssue: (
    input: CreateIssueInput
  ) => Promise<{ success: boolean; issue?: any; error?: any }>;
}

export function CreateIssue({
  onBack,
  assetId,
  assetName,
  assetContext,
  onCreateIssue,
}: CreateIssueProps) {
  const [issueType, setIssueType] = useState<string>(&apos;&apos;);
  const [severity, setSeverity] = useState<string>(&apos;medium&apos;);
  const [description, setDescription] = useState(&apos;&apos;);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!issueType || !description.trim()) {
      toast.error(&apos;Please fill in all required fields&apos;);
      return;
    }

    setIsSubmitting(true);

    const issueInput: CreateIssueInput = {
      assetId,
      assetName,
      type: issueType as IssueType,
      severity: severity as IssueSeverity,
      title:
        issueType.replace(&apos;-&apos;, &apos; &apos;).charAt(0).toUpperCase() +
        issueType.slice(1).replace(&apos;-&apos;, &apos; &apos;),
      description,
      reportedBy: &apos;Current User&apos;, // TODO: Get from auth context
      notes: &apos;&apos;,
      tags: [],
    };

    const result = await onCreateIssue(issueInput);

    setIsSubmitting(false);

    if (result.success) {
      toast.success(&apos;Issue reported successfully&apos;, {
        description: `Issue #${result.issue?.id} has been created and assigned to the maintenance team.`,
      });
      onBack();
    } else {
      toast.error(&apos;Failed to report issue&apos;, {
        description: &apos;Please try again&apos;,
      });
    }
  };

  return (
    <PageLayout
      variant=&apos;narrow&apos;
      padding=&apos;md&apos;
      header={
        <PageHeaderWithBreadcrumbs
          title=&apos;Report Issue&apos;
          description={`Report a problem or issue with ${assetName}`}
          icon={AlertTriangle}
          onBack={onBack}
          breadcrumbParent={assetName}
          breadcrumbCurrent=&apos;Report Issue&apos;
        />
      }
    >
      {/* Asset Info Card */}
      <AssetContextCard
        assetId={assetId}
        assetName={assetName}
        assetContext={assetContext}
        title=&apos;Asset Information&apos;
      />

      {/* Issue Form Card */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Issue Details</CardTitle>
            <CardDescription>
              Provide detailed information about the issue you&apos;re reporting
            </CardDescription>
          </CardHeader>
          <CardContent className=&apos;space-y-6&apos;>
            <div className=&apos;grid gap-2&apos;>
              <Label htmlFor=&apos;issue-type&apos;>Issue Type *</Label>
              <Select value={issueType} onValueChange={setIssueType}>
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
              <Select value={severity} onValueChange={setSeverity}>
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

            <div className=&apos;grid gap-2&apos;>
              <Label htmlFor=&apos;description&apos;>Description *</Label>
              <Textarea
                id=&apos;description&apos;
                placeholder=&apos;Describe the issue in detail...&apos;
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={8}
                className=&apos;resize-none&apos;
              />
              <p className=&apos;text-xs text-muted-foreground&apos;>
                Please include relevant details such as when the issue occurred,
                what you were doing, and any error messages.
              </p>
            </div>

            <div className=&apos;grid gap-2&apos;>
              <Label htmlFor=&apos;attachments&apos;>Attachments (Optional)</Label>
              <div className=&apos;border-2 border-dashed rounded-lg p-6 text-center&apos;>
                <div className=&apos;flex flex-col items-center gap-2&apos;>
                  <div className=&apos;flex gap-2&apos;>
                    <Upload className=&apos;h-8 w-8 text-muted-foreground&apos; />
                    <Camera className=&apos;h-8 w-8 text-muted-foreground&apos; />
                  </div>
                  <div>
                    <p className=&apos;text-sm&apos;>
                      <Button
                        type=&apos;button&apos;
                        variant=&apos;link&apos;
                        className=&apos;p-0 h-auto&apos;
                        onClick={() =>
                          toast.info(
                            &apos;File upload functionality would be implemented here&apos;
                          )
                        }
                      >
                        Click to upload
                      </Button>{&apos; &apos;}
                      or drag and drop
                    </p>
                    <p className=&apos;text-xs text-muted-foreground mt-1&apos;>
                      Photos, videos, or documents (Max 10MB)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Banner */}
            <div className=&apos;p-4 bg-blue-50 border border-blue-200 rounded-lg&apos;>
              <div className=&apos;flex items-start gap-2&apos;>
                <AlertTriangle className=&apos;h-5 w-5 text-blue-600 mt-0.5&apos; />
                <div className=&apos;flex-1&apos;>
                  <h4 className=&apos;text-blue-900&apos;>Issue Tracking</h4>
                  <p className=&apos;text-sm text-blue-700&apos;>
                    A ticket will be created and assigned to the maintenance
                    team. You&apos;ll receive updates via your configured
                    notification channels.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className=&apos;flex items-center justify-end gap-2 mt-6&apos;>
          <Button
            type=&apos;button&apos;
            variant=&apos;outline&apos;
            onClick={onBack}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type=&apos;submit&apos; disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <AlertTriangle className=&apos;h-4 w-4 mr-2 animate-pulse&apos; />
                Submitting...
              </>
            ) : (
              <>
                <AlertTriangle className=&apos;h-4 w-4 mr-2&apos; />
                Submit Issue
              </>
            )}
          </Button>
        </div>
      </form>
    </PageLayout>
  );
}
