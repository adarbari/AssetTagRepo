import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { AlertTriangle, Camera, Upload, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, AssetContextCard, PageLayout } from "../common";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../ui/breadcrumb";
import { issueTypes, issueSeverities } from "../../data/dropdownOptions";
import type { Asset } from "../../types";
import type { CreateIssueInput, IssueType, IssueSeverity } from "../../types/issue";

interface CreateIssueProps {
  onBack: () => void;
  assetId: string;
  assetName: string;
  assetContext?: Asset;
  onCreateIssue: (input: CreateIssueInput) => Promise<{ success: boolean; issue?: any; error?: any }>;
}

export function CreateIssue({
  onBack,
  assetId,
  assetName,
  assetContext,
  onCreateIssue,
}: CreateIssueProps) {
  const [issueType, setIssueType] = useState<string>("");
  const [severity, setSeverity] = useState<string>("medium");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!issueType || !description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    const issueInput: CreateIssueInput = {
      assetId,
      assetName,
      type: issueType as IssueType,
      severity: severity as IssueSeverity,
      title: issueType.replace("-", " ").charAt(0).toUpperCase() + issueType.slice(1).replace("-", " "),
      description,
      reportedBy: "Current User", // TODO: Get from auth context
      notes: "",
      tags: [],
    };

    const result = await onCreateIssue(issueInput);

    setIsSubmitting(false);

    if (result.success) {
      toast.success("Issue reported successfully", {
        description: `Issue #${result.issue?.id} has been created and assigned to the maintenance team.`,
      });
      onBack();
    } else {
      toast.error("Failed to report issue", {
        description: "Please try again",
      });
    }
  };

  return (
    <PageLayout 
      variant="narrow" 
      padding="md"
      header={
        <div className="border-b bg-background px-8 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={onBack} className="cursor-pointer">
                  {assetName}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Report Issue</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <PageHeader
          title="Report Issue"
          description={`Report a problem or issue with ${assetName}`}
          icon={AlertTriangle}
        />
      </div>
      }
    >
          {/* Asset Info Card */}
          <AssetContextCard
            assetId={assetId}
            assetName={assetName}
            assetContext={assetContext}
            title="Asset Information"
          />

          {/* Issue Form Card */}
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Issue Details</CardTitle>
                <CardDescription>
                  Provide detailed information about the issue you're reporting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="issue-type">Issue Type *</Label>
                  <Select value={issueType} onValueChange={setIssueType}>
                    <SelectTrigger id="issue-type">
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                    <SelectContent>
                      {issueTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="severity">Severity</Label>
                  <Select value={severity} onValueChange={setSeverity}>
                    <SelectTrigger id="severity">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {issueSeverities.map((sev) => {
                        const colorMap: Record<string, string> = {
                          low: "bg-yellow-500",
                          medium: "bg-orange-500",
                          high: "bg-red-500",
                          critical: "bg-red-700",
                        };
                        return (
                          <SelectItem key={sev.value} value={sev.value}>
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${colorMap[sev.value]}`} />
                              {sev.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the issue in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={8}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Please include relevant details such as when the issue occurred, what you were doing, and any error messages.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="attachments">Attachments (Optional)</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex gap-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <Camera className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm">
                          <Button
                            type="button"
                            variant="link"
                            className="p-0 h-auto"
                            onClick={() => toast.info("File upload functionality would be implemented here")}
                          >
                            Click to upload
                          </Button>
                          {" "}or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Photos, videos, or documents (Max 10MB)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Banner */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-blue-900">Issue Tracking</h4>
                      <p className="text-sm text-blue-700">
                        A ticket will be created and assigned to the maintenance team. You'll receive updates via your configured notification channels.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2 animate-pulse" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Submit Issue
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
    </PageLayout>
  );
}
