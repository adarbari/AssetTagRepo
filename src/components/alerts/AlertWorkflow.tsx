import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Alert, AlertType } from "../../types";
import {
  Shield,
  Battery,
  AlertTriangle,
  TrendingDown,
  WifiOff,
  MapPin,
  Wrench,
  Bell,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Clock,
  MapPinned,
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface AlertWorkflowProps {
  alert: Alert;
  onBack: () => void;
  onActionComplete?: () => void;
}

const alertTypeConfig: Record<AlertType, {
  icon: any;
  color: string;
  bgColor: string;
  workflows: {
    label: string;
    description: string;
    value: string;
    requiresInput?: boolean;
    inputLabel?: string;
    inputType?: string;
  }[];
}> = {
  theft: {
    icon: Shield,
    color: "text-red-600",
    bgColor: "bg-red-50 border-red-200",
    workflows: [
      {
        label: "Notify Security Team",
        description: "Alert security personnel and initiate theft protocol",
        value: "notify-security",
      },
      {
        label: "Contact Law Enforcement",
        description: "File police report and provide tracking information",
        value: "contact-police",
      },
      {
        label: "Lock Asset Remotely",
        description: "Disable asset if remote lock feature is available",
        value: "lock-asset",
      },
      {
        label: "Contact Last User",
        description: "Verify with last authorized user",
        value: "contact-user",
        requiresInput: true,
        inputLabel: "User to contact",
        inputType: "select",
      },
      {
        label: "Mark as Stolen",
        description: "Update asset status and notify all stakeholders",
        value: "mark-stolen",
      },
    ],
  },
  battery: {
    icon: Battery,
    color: "text-orange-600",
    bgColor: "bg-orange-50 border-orange-200",
    workflows: [
      {
        label: "Schedule Battery Replacement",
        description: "Create work order for battery replacement",
        value: "schedule-replacement",
        requiresInput: true,
        inputLabel: "Scheduled date",
        inputType: "date",
      },
      {
        label: "Send Reminder to Technician",
        description: "Notify assigned technician about battery issue",
        value: "notify-technician",
        requiresInput: true,
        inputLabel: "Technician name",
        inputType: "select",
      },
      {
        label: "Order Replacement Battery",
        description: "Initiate battery procurement process",
        value: "order-battery",
      },
      {
        label: "Temporary Deactivation",
        description: "Take asset offline until battery is replaced",
        value: "deactivate-asset",
      },
    ],
  },
  compliance: {
    icon: AlertTriangle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 border-yellow-200",
    workflows: [
      {
        label: "Return to Authorized Zone",
        description: "Notify operator to return asset to compliant location",
        value: "return-to-zone",
      },
      {
        label: "Update Compliance Requirements",
        description: "Adjust geofence or certification requirements",
        value: "update-requirements",
      },
      {
        label: "Schedule Recertification",
        description: "Book certification inspection",
        value: "schedule-certification",
        requiresInput: true,
        inputLabel: "Inspection date",
        inputType: "date",
      },
      {
        label: "Document Exception",
        description: "Create compliance exception with approval",
        value: "document-exception",
        requiresInput: true,
        inputLabel: "Exception reason",
        inputType: "text",
      },
      {
        label: "Restrict Asset Use",
        description: "Prevent further use until compliant",
        value: "restrict-use",
      },
    ],
  },
  underutilized: {
    icon: TrendingDown,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
    workflows: [
      {
        label: "Relocate to Active Site",
        description: "Move asset to location with higher demand",
        value: "relocate-asset",
        requiresInput: true,
        inputLabel: "Target site",
        inputType: "select",
      },
      {
        label: "List for Internal Rental",
        description: "Make available for other departments",
        value: "list-rental",
      },
      {
        label: "Schedule for Disposition",
        description: "Initiate asset sale or disposal process",
        value: "schedule-disposal",
      },
      {
        label: "Analyze Usage Pattern",
        description: "Generate detailed utilization report",
        value: "analyze-usage",
      },
      {
        label: "Reassign to Project",
        description: "Allocate to specific project or job",
        value: "reassign-project",
        requiresInput: true,
        inputLabel: "Project name",
        inputType: "text",
      },
    ],
  },
  offline: {
    icon: WifiOff,
    color: "text-gray-600",
    bgColor: "bg-gray-50 border-gray-200",
    workflows: [
      {
        label: "Dispatch Technician",
        description: "Send technician to physically locate and inspect",
        value: "dispatch-tech",
        requiresInput: true,
        inputLabel: "Technician name",
        inputType: "select",
      },
      {
        label: "Replace Tracker",
        description: "Schedule tracker hardware replacement",
        value: "replace-tracker",
      },
      {
        label: "Check Last Known Location",
        description: "Investigate asset at last GPS coordinates",
        value: "check-location",
      },
      {
        label: "Contact Asset Operator",
        description: "Reach out to last known operator",
        value: "contact-operator",
        requiresInput: true,
        inputLabel: "Contact method",
        inputType: "select",
      },
      {
        label: "Mark for Physical Audit",
        description: "Flag for next inventory audit",
        value: "flag-audit",
      },
    ],
  },
  "unauthorized-zone": {
    icon: MapPin,
    color: "text-red-600",
    bgColor: "bg-red-50 border-red-200",
    workflows: [
      {
        label: "Immediate Exit Required",
        description: "Contact operator to exit restricted zone immediately",
        value: "exit-zone",
      },
      {
        label: "Request Authorization",
        description: "Submit request for zone access approval",
        value: "request-auth",
        requiresInput: true,
        inputLabel: "Justification",
        inputType: "text",
      },
      {
        label: "Log Security Incident",
        description: "Create formal security incident report",
        value: "log-incident",
      },
      {
        label: "Notify Zone Manager",
        description: "Alert restricted area manager",
        value: "notify-manager",
      },
      {
        label: "Suspend Asset Access",
        description: "Revoke access permissions temporarily",
        value: "suspend-access",
      },
    ],
  },
  "predictive-maintenance": {
    icon: Wrench,
    color: "text-purple-600",
    bgColor: "bg-purple-50 border-purple-200",
    workflows: [
      {
        label: "Schedule Immediate Inspection",
        description: "Book urgent maintenance inspection",
        value: "urgent-inspection",
        requiresInput: true,
        inputLabel: "Inspection date/time",
        inputType: "datetime",
      },
      {
        label: "Order Replacement Parts",
        description: "Procure parts based on predicted failure",
        value: "order-parts",
        requiresInput: true,
        inputLabel: "Parts needed",
        inputType: "text",
      },
      {
        label: "Stop Operations",
        description: "Immediately cease asset usage to prevent damage",
        value: "stop-ops",
      },
      {
        label: "Create Maintenance Ticket",
        description: "Generate work order for preventive maintenance",
        value: "create-ticket",
      },
      {
        label: "Notify Asset Owner",
        description: "Alert asset owner/department of predicted issue",
        value: "notify-owner",
      },
      {
        label: "Arrange Backup Asset",
        description: "Deploy replacement while maintenance performed",
        value: "deploy-backup",
        requiresInput: true,
        inputLabel: "Backup asset ID",
        inputType: "text",
      },
    ],
  },
};

export function AlertWorkflow({
  alert,
  onBack,
  onActionComplete,
}: AlertWorkflowProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>("");
  const [workflowInput, setWorkflowInput] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const config = alertTypeConfig[alert.type];
  
  // Fallback if alert type is not configured
  if (!config) {
    return (
      <div className="h-screen flex flex-col">
        <div className="border-b bg-background px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1>Alert Workflow</h1>
              <p className="text-muted-foreground">Alert Type: {alert.type}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-8">
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <div>
                  <h3>Configuration Error</h3>
                  <p className="text-sm mt-1">
                    No workflow configuration found for alert type: <span className="font-mono">{alert.type}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please contact your system administrator to add workflow actions for this alert type.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  const Icon = config.icon;
  const selectedWorkflowConfig = config.workflows.find(w => w.value === selectedWorkflow);

  const handleExecuteWorkflow = async () => {
    if (!selectedWorkflow) {
      toast.error("Please select an action");
      return;
    }

    if (selectedWorkflowConfig?.requiresInput && !workflowInput) {
      toast.error(`Please provide ${selectedWorkflowConfig.inputLabel}`);
      return;
    }

    setIsProcessing(true);

    // Simulate workflow execution
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success("Action executed successfully", {
      description: selectedWorkflowConfig?.label,
    });

    setIsProcessing(false);
    onActionComplete?.();
  };

  const handleAcknowledge = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    toast.success("Alert acknowledged");
    setIsProcessing(false);
    onActionComplete?.();
  };

  const handleResolve = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    toast.success("Alert resolved");
    setIsProcessing(false);
    onActionComplete?.();
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now.getTime() - alertTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1>Alert Workflow</h1>
          <p className="text-muted-foreground">Take action on this alert</p>
        </div>
      </div>

      {/* Alert Overview */}
      <Card className={`border-2 ${config.bgColor}`}>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg bg-background ${config.color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <CardTitle>{alert.asset}</CardTitle>
                  <p className="text-muted-foreground mt-1">{alert.message}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={alert.severity === "critical" ? "destructive" : "outline"}>
                    {alert.severity}
                  </Badge>
                  <Badge variant="outline">{alert.status}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {getTimeAgo(alert.timestamp)}
                </div>
                {alert.location && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MapPinned className="h-3 w-3" />
                      {alert.location}
                    </div>
                  </>
                )}
                <span>•</span>
                <span>{alert.id}</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Context Information */}
      {(alert.reason || alert.suggestedAction || alert.metadata) && (
        <Card>
          <CardHeader>
            <CardTitle>Alert Context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {alert.reason && (
              <div>
                <Label>Reason</Label>
                <p className="text-sm text-muted-foreground mt-1">{alert.reason}</p>
              </div>
            )}
            
            {alert.suggestedAction && (
              <div className={`p-4 rounded-lg border-2 ${config.bgColor}`}>
                <div className="flex items-start gap-2">
                  <Bell className={`h-5 w-5 ${config.color} mt-0.5`} />
                  <div className="flex-1">
                    <Label>Suggested Action</Label>
                    <p className="text-sm text-muted-foreground mt-1">{alert.suggestedAction}</p>
                  </div>
                </div>
              </div>
            )}

            {alert.metadata && Object.keys(alert.metadata).length > 0 && (
              <div>
                <Label>Additional Information</Label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  {Object.entries(alert.metadata).map(([key, value]) => {
                    // Skip complex objects and arrays
                    if (typeof value === 'object' && !Array.isArray(value)) return null;
                    
                    return (
                      <div key={key} className="text-sm">
                        <div className="text-muted-foreground">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </div>
                        <div>{Array.isArray(value) ? value.join(', ') : String(value)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Workflow Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Select Action</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Available Actions</Label>
            <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
              <SelectTrigger>
                <SelectValue placeholder="Choose workflow action..." />
              </SelectTrigger>
              <SelectContent>
                {config.workflows.map((workflow) => (
                  <SelectItem key={workflow.value} value={workflow.value}>
                    <div className="py-1">
                      <div>{workflow.label}</div>
                      <div className="text-xs text-muted-foreground">{workflow.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Workflow Input */}
          {selectedWorkflowConfig?.requiresInput && (
            <div className="space-y-2">
              <Label>{selectedWorkflowConfig.inputLabel}</Label>
              {selectedWorkflowConfig.inputType === "date" ? (
                <Input
                  type="date"
                  value={workflowInput}
                  onChange={(e) => setWorkflowInput(e.target.value)}
                />
              ) : selectedWorkflowConfig.inputType === "datetime" ? (
                <Input
                  type="datetime-local"
                  value={workflowInput}
                  onChange={(e) => setWorkflowInput(e.target.value)}
                />
              ) : selectedWorkflowConfig.inputType === "select" ? (
                <Select value={workflowInput} onValueChange={setWorkflowInput}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tech-1">Mike Johnson</SelectItem>
                    <SelectItem value="tech-2">Sarah Williams</SelectItem>
                    <SelectItem value="tech-3">David Chen</SelectItem>
                    <SelectItem value="site-1">Main Warehouse</SelectItem>
                    <SelectItem value="site-2">Construction Site A</SelectItem>
                    <SelectItem value="contact-phone">Phone Call</SelectItem>
                    <SelectItem value="contact-email">Email</SelectItem>
                    <SelectItem value="contact-sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={workflowInput}
                  onChange={(e) => setWorkflowInput(e.target.value)}
                  placeholder={`Enter ${selectedWorkflowConfig.inputLabel.toLowerCase()}`}
                />
              )}
            </div>
          )}

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label>Additional Notes (Optional)</Label>
            <Textarea
              placeholder="Add any additional notes or context..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2">
          {alert.status === "active" && (
            <Button
              variant="outline"
              onClick={handleAcknowledge}
              disabled={isProcessing}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Acknowledge
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleResolve}
            disabled={isProcessing}
            className="text-green-600 hover:text-green-700"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Mark Resolved
          </Button>
        </div>
        <Button
          onClick={handleExecuteWorkflow}
          disabled={!selectedWorkflow || isProcessing}
          size="lg"
        >
          {isProcessing ? "Processing..." : "Execute Action"}
        </Button>
      </div>
    </div>
  );
}
