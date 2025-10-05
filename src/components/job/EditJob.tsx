/**
 * Edit Job Component
 * 
 * Comprehensive job editing interface with:
 * - Job details (name, description, dates)
 * - Budget management
 * - Asset assignment with custom date ranges (uses modal for complex configuration)
 * - Team member assignment (inline dropdown for quick selection)
 * - Vehicle assignment
 * - Status and priority management
 * 
 * UX Design Notes:
 * - Add Asset uses a modal dialog (appropriate for complex multi-field configuration)
 * - Add Team Member uses an inline dropdown (better UX for simple single-field selection)
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { PageHeader } from "../common";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Switch } from "../ui/switch";
import { DateTimeInput } from "../ui/datetime-input";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Package,
  Users,
  DollarSign,
  Clock,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Job, UpdateJobInput, JobPriority, JobStatus } from "../../types/job";
import type { Asset } from "../types";
import { mockAssets } from "../../data/mockData";
import {
  jobStatuses,
  teamMembers,
} from "../../data/dropdownOptions";
import { JobInformationSection } from "./JobInformationSection";
import { BudgetSection } from "./BudgetSection";
import { NotesSection } from "./NotesSection";
import { TagsSection } from "./TagsSection";

interface EditJobProps {
  jobId: string;
  job: Job;
  onBack: () => void;
  onUpdateJob: (jobId: string, input: UpdateJobInput) => Promise<{ success: boolean; job?: Job; error?: any }>;
  onAddAssetToJob: (
    jobId: string,
    assetId: string,
    assetName: string,
    assetType: string,
    required: boolean,
    useFullJobDuration?: boolean,
    customStartDate?: string,
    customEndDate?: string
  ) => Promise<any>;
  onRemoveAssetFromJob: (jobId: string, assetId: string) => Promise<any>;
}

export function EditJob({
  jobId,
  job,
  onBack,
  onUpdateJob,
  onAddAssetToJob,
  onRemoveAssetFromJob,
}: EditJobProps) {
  // Form state - using strings for dates to match CreateJob
  const [name, setName] = useState(job.name);
  const [description, setDescription] = useState(job.description);
  const [status, setStatus] = useState<JobStatus>(job.status);
  const [priority, setPriority] = useState<JobPriority>(job.priority);
  const [startDate, setStartDate] = useState(job.startDate.split('T')[0]); // Convert ISO to date string
  const [endDate, setEndDate] = useState(job.endDate.split('T')[0]); // Convert ISO to date string
  const [projectManager, setProjectManager] = useState(job.projectManager || "");
  const [clientId, setClientId] = useState(job.clientId || "");
  const [assignedTeam, setAssignedTeam] = useState<string[]>(job.assignedTeam || []);
  const [notes, setNotes] = useState(job.notes || "");
  const [tags, setTags] = useState<string[]>(job.tags || []);

  // Budget state
  const [budgetTotal, setBudgetTotal] = useState(job.budget.total.toString());
  const [budgetLabor, setBudgetLabor] = useState(job.budget.labor.toString());
  const [budgetEquipment, setBudgetEquipment] = useState(job.budget.equipment.toString());
  const [budgetMaterials, setBudgetMaterials] = useState(job.budget.materials.toString());
  const [budgetOther, setBudgetOther] = useState(job.budget.other.toString());

  // Dialog states
  const [showAddAssetDialog, setShowAddAssetDialog] = useState(false);

  // Add asset dialog state
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [assetRequired, setAssetRequired] = useState(true);
  const [useFullJobDuration, setUseFullJobDuration] = useState(true);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();

  // Add team member inline state
  const [selectedTeamMember, setSelectedTeamMember] = useState("");

  // Get available assets (not already assigned to this job)
  const availableAssets = mockAssets.filter(
    asset => !job.assets.some(ja => ja.assetId === asset.id)
  );

  // Get available team members (not already assigned)
  const availableTeamMembers = teamMembers.filter(
    tm => !assignedTeam.includes(tm.value)
  );

  // Debug logging
  useEffect(() => {
    console.log("EditJob - Available Assets:", availableAssets.length, availableAssets);
    console.log("EditJob - Job Assets:", job.assets);
    console.log("EditJob - Mock Assets:", mockAssets.length);
  }, [availableAssets, job.assets]);

  const handleSave = async () => {
    try {
      if (!name || !startDate || !endDate) {
        toast.error("Please fill in all required fields");
        return;
      }

      if (new Date(endDate) <= new Date(startDate)) {
        toast.error("End date must be after start date");
        return;
      }

      const updateInput: UpdateJobInput = {
        name,
        description,
        status,
        priority,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        projectManager: projectManager || undefined,
        clientId: clientId || undefined,
        assignedTeam,
        notes: notes || undefined,
        tags: tags.length > 0 ? tags : undefined,
        budget: {
          total: parseFloat(budgetTotal) || 0,
          labor: parseFloat(budgetLabor) || 0,
          equipment: parseFloat(budgetEquipment) || 0,
          materials: parseFloat(budgetMaterials) || 0,
          other: parseFloat(budgetOther) || 0,
        },
      };

      const result = await onUpdateJob(jobId, updateInput);

      if (result.success) {
        toast.success("Job updated successfully");
        onBack();
      } else {
        toast.error("Failed to update job");
      }
    } catch (error) {
      console.error("Error updating job:", error);
      toast.error("An error occurred while updating the job");
    }
  };

  const handleAddAsset = async () => {
    if (!selectedAssetId) {
      toast.error("Please select an asset");
      return;
    }

    // Validate custom dates if not using full job duration
    if (!useFullJobDuration) {
      if (!customStartDate || !customEndDate) {
        toast.error("Please select both start and end date/time for custom assignment");
        return;
      }

      if (customEndDate <= customStartDate) {
        toast.error("End date/time must be after start date/time");
        return;
      }
    }

    const asset = mockAssets.find(a => a.id === selectedAssetId);
    if (!asset) {
      toast.error("Asset not found");
      return;
    }

    const customStart = customStartDate?.toISOString();
    const customEnd = customEndDate?.toISOString();

    const result = await onAddAssetToJob(
      jobId,
      asset.id,
      asset.name,
      asset.type,
      assetRequired,
      useFullJobDuration,
      customStart,
      customEnd
    );

    if (result.success) {
      toast.success(`${asset.name} added to job with ${useFullJobDuration ? 'full job duration' : 'custom schedule'}`);
      setShowAddAssetDialog(false);
      setSelectedAssetId("");
      setAssetRequired(true);
      setUseFullJobDuration(true);
      setCustomStartDate(undefined);
      setCustomEndDate(undefined);
    } else {
      toast.error("Failed to add asset to job");
    }
  };

  const handleRemoveAsset = async (assetId: string, assetName: string) => {
    if (!confirm(`Remove ${assetName} from this job?`)) return;

    const result = await onRemoveAssetFromJob(jobId, assetId);

    if (result.success) {
      toast.success(`${assetName} removed from job`);
    } else {
      toast.error("Failed to remove asset");
    }
  };

  const handleAddTeamMember = (memberId: string) => {
    if (!memberId || assignedTeam.includes(memberId)) {
      return;
    }

    setAssignedTeam([...assignedTeam, memberId]);
    setSelectedTeamMember("");
    const member = teamMembers.find(tm => tm.value === memberId);
    toast.success(`${member?.label || "Team member"} added`);
  };

  const handleRemoveTeamMember = (memberId: string) => {
    setAssignedTeam(assignedTeam.filter(id => id !== memberId));
    toast.success("Team member removed");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title={`Edit Job: ${job.jobNumber}`}
        description="Update job details, budget, assets, and team assignments"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
              <CardDescription>Basic job details and timeline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status Field - Only shown in edit */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as JobStatus)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {jobStatuses.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Reusable Job Information Section */}
              <JobInformationSection
                name={name}
                onNameChange={setName}
                description={description}
                onDescriptionChange={setDescription}
                startDate={startDate}
                onStartDateChange={setStartDate}
                endDate={endDate}
                onEndDateChange={setEndDate}
                priority={priority}
                onPriorityChange={setPriority}
                projectManager={projectManager}
                onProjectManagerChange={setProjectManager}
                clientId={clientId}
                onClientIdChange={setClientId}
                jobNumber={job.jobNumber}
                showClientField={true}
              />

              <Separator />

              {/* Notes - Inline */}
              <NotesSection
                notes={notes}
                onNotesChange={setNotes}
              />

              <Separator />

              {/* Tags - Inline */}
              <TagsSection
                tags={tags}
                onTagsChange={setTags}
                showAsSection={false}
              />
            </CardContent>
          </Card>

          {/* Budget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Budget
              </CardTitle>
              <CardDescription>Job budget breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Reusable Budget Section */}
              <BudgetSection
                totalBudget={budgetTotal}
                onTotalBudgetChange={setBudgetTotal}
                laborBudget={budgetLabor}
                onLaborBudgetChange={setBudgetLabor}
                equipmentBudget={budgetEquipment}
                onEquipmentBudgetChange={setBudgetEquipment}
                materialsBudget={budgetMaterials}
                onMaterialsBudgetChange={setBudgetMaterials}
                otherBudget={budgetOther}
                onOtherBudgetChange={setBudgetOther}
              />

              <Separator />

              {/* Actual Costs - Only shown in edit mode */}
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Current Actual Costs</div>
                <div className="text-2xl mt-1">{formatCurrency(job.actualCosts.total)}</div>
                <div className="text-sm text-muted-foreground mt-2">
                  Variance: <span className={job.variance >= 0 ? "text-green-600" : "text-red-600"}>
                    {formatCurrency(Math.abs(job.variance))} ({job.variancePercentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assets */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Assets ({job.assets.length})
                  </CardTitle>
                  <CardDescription>Assets assigned to this job</CardDescription>
                </div>
                <Button onClick={() => setShowAddAssetDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Asset
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {job.assets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No assets assigned yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Required</TableHead>
                      <TableHead>Assignment Period</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {job.assets.map((asset) => (
                      <TableRow key={asset.assetId}>
                        <TableCell>{asset.assetName}</TableCell>
                        <TableCell className="capitalize">{asset.assetType}</TableCell>
                        <TableCell>
                          {asset.required ? (
                            <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                              Required
                            </Badge>
                          ) : (
                            <Badge variant="outline">Optional</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {asset.assignmentStartDate && asset.assignmentEndDate ? (
                            <div className="flex flex-col gap-0.5 text-sm">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">From:</span>
                                <span>{new Date(asset.assignmentStartDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">To:</span>
                                <span>{new Date(asset.assignmentEndDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Full job duration</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAsset(asset.assetId, asset.assetName)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members ({assignedTeam.length})
              </CardTitle>
              <CardDescription>Personnel assigned to this job</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Inline Add Team Member - Better UX than modal */}
              {availableTeamMembers.length > 0 && (
                <div className="flex items-center gap-2">
                  <Select 
                    value={selectedTeamMember} 
                    onValueChange={(value) => {
                      handleAddTeamMember(value);
                    }}
                  >
                    <SelectTrigger className="w-[300px]">
                      <SelectValue placeholder="Add team member..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTeamMembers.map((tm) => (
                        <SelectItem key={tm.value} value={tm.value}>
                          {tm.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">
                    Select to add instantly
                  </span>
                </div>
              )}

              {/* Current Team Members */}
              {assignedTeam.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No team members assigned yet
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {assignedTeam.map((memberId) => {
                    const member = teamMembers.find(tm => tm.value === memberId);
                    return member ? (
                      <Badge key={memberId} variant="secondary" className="px-3 py-2 flex items-center gap-2">
                        {member.label}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors"
                          onClick={() => handleRemoveTeamMember(memberId)}
                        />
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}

              {availableTeamMembers.length === 0 && assignedTeam.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  All available team members have been assigned
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Asset Dialog */}
      <Dialog open={showAddAssetDialog} onOpenChange={setShowAddAssetDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Asset to Job</DialogTitle>
            <DialogDescription>
              Select an asset and configure its assignment period with date and time
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="asset">Asset *</Label>
              <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                <SelectTrigger id="asset">
                  <SelectValue placeholder="Select an asset" />
                </SelectTrigger>
                <SelectContent>
                  {availableAssets.length === 0 ? (
                    <SelectItem value="no-assets" disabled>
                      No available assets
                    </SelectItem>
                  ) : (
                    availableAssets.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.name} - {asset.type}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {availableAssets.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  All assets have been assigned to this job
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Required Asset</Label>
                <p className="text-sm text-muted-foreground">
                  Mark as required for this job
                </p>
              </div>
              <Switch checked={assetRequired} onCheckedChange={setAssetRequired} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Use Full Job Duration</Label>
                <p className="text-sm text-muted-foreground">
                  Assign for entire job period
                </p>
              </div>
              <Switch
                checked={useFullJobDuration}
                onCheckedChange={setUseFullJobDuration}
              />
            </div>

            {!useFullJobDuration && (
              <div className="space-y-4 pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  Configure custom assignment period with specific dates and times
                </p>
                
                <DateTimeInput
                  label="Assignment Start Date & Time *"
                  value={customStartDate}
                  onChange={setCustomStartDate}
                  placeholder="Select start date and time"
                  minDate={new Date(startDate)}
                  maxDate={new Date(endDate)}
                />

                <DateTimeInput
                  label="Assignment End Date & Time *"
                  value={customEndDate}
                  onChange={setCustomEndDate}
                  placeholder="Select end date and time"
                  minDate={customStartDate || new Date(startDate)}
                  maxDate={new Date(endDate)}
                />

                {customStartDate && customEndDate && customEndDate <= customStartDate && (
                  <p className="text-sm text-destructive">
                    End date/time must be after start date/time
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAssetDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAsset} disabled={availableAssets.length === 0}>
              Add Asset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </div>
  );
}
