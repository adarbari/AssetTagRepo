import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "./ui/utils";
import {
  LogIn,
  LogOut,
  User,
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { PageHeader } from "./common";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb";
import type { Asset } from "../types";

interface CreateCheckInOutProps {
  onBack: () => void;
  assetId: string;
  assetName: string;
  currentStatus: Asset["status"];
  mode: "check-in" | "check-out";
  assetContext?: Asset;
  onComplete?: (updates: Partial<Asset>) => void;
}

export function CreateCheckInOut({
  onBack,
  assetId,
  assetName,
  currentStatus,
  mode,
  assetContext,
  onComplete,
}: CreateCheckInOutProps) {
  const [assignedTo, setAssignedTo] = useState("");
  const [project, setProject] = useState("");
  const [location, setLocation] = useState("");
  const [expectedReturn, setExpectedReturn] = useState<Date>();
  const [condition, setCondition] = useState("good");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    const updates: Partial<Asset> = {};
    
    if (mode === "check-out") {
      // Update status to checked-out
      updates.status = "checked-out";
      
      // Update assignment if provided
      if (assignedTo) {
        updates.assignedTo = assignedTo;
      }
      
      toast.success(`${assetName} checked out successfully`, {
        description: `Assigned to ${assignedTo || "unassigned"}`,
      });
    } else {
      // Update status back to active on check-in
      updates.status = "active";
      
      // If asset is damaged or in poor condition, mark for maintenance
      if (condition === "damaged" || condition === "poor") {
        updates.status = "maintenance";
      }
      
      toast.success(`${assetName} checked in successfully`, {
        description: `Condition: ${condition}`,
      });
    }
    
    // Update the asset via callback
    if (onComplete) {
      onComplete(updates);
    }
    
    // Update mock data for persistence across components
    import("../data/mockData").then(({ updateAsset }) => {
      try {
        updateAsset(assetId, updates);
      } catch (error) {
        console.error("Error updating asset in mock data:", error);
      }
    });
    
    // Navigate back
    onBack();
  };

  const getConditionColor = (cond: string) => {
    switch (cond) {
      case "excellent":
        return "bg-green-100 text-green-700 border-green-200";
      case "good":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "fair":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "poor":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "damaged":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header with Breadcrumbs */}
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
                <BreadcrumbPage>
                  {mode === "check-out" ? "Check Out" : "Check In"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <PageHeader
          title={mode === "check-out" ? "Check Out Asset" : "Check In Asset"}
          description={
            mode === "check-out"
              ? "Assign this asset to a user or project"
              : "Return this asset and assess its condition"
          }
          icon={mode === "check-out" ? LogOut : LogIn}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Asset Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Asset Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4>{assetName}</h4>
                    <p className="text-sm text-muted-foreground">{assetId}</p>
                    {assetContext && (
                      <div className="mt-2 text-sm space-y-1">
                        <p><span className="text-muted-foreground">Type:</span> {assetContext.type}</p>
                        <p><span className="text-muted-foreground">Location:</span> {assetContext.location}</p>
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                    {currentStatus}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Card */}
          <Card>
            <CardHeader>
              <CardTitle>{mode === "check-out" ? "Check-Out Details" : "Check-In Details"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {mode === "check-out" ? (
                <>
                  {/* Check-out Form */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="assigned-to">
                        <User className="h-4 w-4 inline mr-2" />
                        Assign To
                      </Label>
                      <Select value={assignedTo} onValueChange={setAssignedTo}>
                        <SelectTrigger id="assigned-to">
                          <SelectValue placeholder="Select user or team" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="john-smith">John Smith</SelectItem>
                          <SelectItem value="sarah-johnson">Sarah Johnson</SelectItem>
                          <SelectItem value="mike-wilson">Mike Wilson</SelectItem>
                          <SelectItem value="team-alpha">Team Alpha</SelectItem>
                          <SelectItem value="team-beta">Team Beta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="project">
                        <FileText className="h-4 w-4 inline mr-2" />
                        Project / Job Site
                      </Label>
                      <Select value={project} onValueChange={setProject}>
                        <SelectTrigger id="project">
                          <SelectValue placeholder="Select project (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="job-alpha">Job Site Alpha</SelectItem>
                          <SelectItem value="job-beta">Job Site Beta</SelectItem>
                          <SelectItem value="warehouse">Warehouse District</SelectItem>
                          <SelectItem value="campus">Corporate Campus</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">
                        <MapPin className="h-4 w-4 inline mr-2" />
                        Destination Location
                      </Label>
                      <Input
                        id="location"
                        placeholder="Enter location or address"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expected-return-date">
                        <CalendarIcon className="h-4 w-4 inline mr-2" />
                        Expected Return Date
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="expected-return-date"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left",
                              !expectedReturn && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {expectedReturn ? format(expectedReturn, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={expectedReturn}
                            onSelect={setExpectedReturn}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="checkout-notes">
                        <FileText className="h-4 w-4 inline mr-2" />
                        Notes (Optional)
                      </Label>
                      <Textarea
                        id="checkout-notes"
                        placeholder="Add any notes about this checkout..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Check-in Form */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>
                        <AlertCircle className="h-4 w-4 inline mr-2" />
                        Asset Condition
                      </Label>
                      <RadioGroup value={condition} onValueChange={setCondition}>
                        <div className="space-y-2">
                          {[
                            { value: "excellent", label: "Excellent", desc: "Perfect condition, no issues" },
                            { value: "good", label: "Good", desc: "Normal wear, fully functional" },
                            { value: "fair", label: "Fair", desc: "Some wear, may need minor service" },
                            { value: "poor", label: "Poor", desc: "Significant wear, needs attention" },
                            { value: "damaged", label: "Damaged", desc: "Requires immediate repair" },
                          ].map((option) => (
                            <div
                              key={option.value}
                              className={cn(
                                "flex items-start space-x-3 p-3 rounded-lg border",
                                condition === option.value && "border-primary bg-accent"
                              )}
                            >
                              <RadioGroupItem value={option.value} id={option.value} />
                              <div className="flex-1">
                                <Label
                                  htmlFor={option.value}
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  {option.label}
                                  <Badge variant="outline" className={getConditionColor(option.value)}>
                                    {option.label}
                                  </Badge>
                                </Label>
                                <p className="text-sm text-muted-foreground">{option.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="return-location">
                        <MapPin className="h-4 w-4 inline mr-2" />
                        Return Location
                      </Label>
                      <Select defaultValue="warehouse">
                        <SelectTrigger id="return-location">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="warehouse">Warehouse District</SelectItem>
                          <SelectItem value="depot">Service Depot C</SelectItem>
                          <SelectItem value="campus">Corporate Campus</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {condition === "damaged" || condition === "poor" ? (
                      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-orange-900">Maintenance Required</h4>
                            <p className="text-sm text-orange-700">
                              This asset will be flagged for maintenance review
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    <div className="space-y-2">
                      <Label htmlFor="checkin-notes">
                        <FileText className="h-4 w-4 inline mr-2" />
                        Inspection Notes
                      </Label>
                      <Textarea
                        id="checkin-notes"
                        placeholder="Describe any issues, damage, or observations..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Timestamp */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t">
                <Clock className="h-4 w-4" />
                <span>
                  {mode === "check-out" ? "Check-out" : "Check-in"} time:{" "}
                  {format(new Date(), "PPpp")}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={onBack}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {mode === "check-out" ? (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  Check Out
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Check In
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
