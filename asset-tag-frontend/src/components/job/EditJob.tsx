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

import { useState, useEffect } from &apos;react&apos;;
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from &apos;../ui/card&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Label } from &apos;../ui/label&apos;;
import { Separator } from &apos;../ui/separator&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import { PageHeader, PageLayout } from &apos;../common&apos;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &apos;../ui/select&apos;;
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from &apos;../ui/table&apos;;
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from &apos;../ui/dialog&apos;;
import { Switch } from &apos;../ui/switch&apos;;
import { DateTimeInput } from &apos;../ui/datetime-input&apos;;
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
} from &apos;lucide-react&apos;;
import { toast } from &apos;sonner&apos;;
import type {
  Job,
  UpdateJobInput,
  JobPriority,
  JobStatus,
} from &apos;../../types/job&apos;;
import { mockAssets } from &apos;../../data/mockData&apos;;
import { jobStatuses, teamMembers } from &apos;../../data/dropdownOptions&apos;;
import { JobInformationSection } from &apos;./JobInformationSection&apos;;
import { BudgetSection } from &apos;./BudgetSection&apos;;
import { NotesSection } from &apos;./NotesSection&apos;;
import { TagsSection } from &apos;./TagsSection&apos;;

interface EditJobProps {
  jobId: string;
  job: Job;
  onBack: () => void;
  onUpdateJob: (
    jobId: string,
    input: UpdateJobInput
  ) => Promise<{ success: boolean; job?: Job; error?: any }>;
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
  const [startDate, setStartDate] = useState(job.startDate.split(&apos;T&apos;)[0]); // Convert ISO to date string
  const [endDate, setEndDate] = useState(job.endDate.split(&apos;T&apos;)[0]); // Convert ISO to date string
  const [projectManager, setProjectManager] = useState(
    job.projectManager || &apos;&apos;
  );
  const [clientId, setClientId] = useState(job.clientId || &apos;&apos;);
  const [assignedTeam, setAssignedTeam] = useState<string[]>(
    job.assignedTeam || []
  );
  const [notes, setNotes] = useState(job.notes || &apos;&apos;);
  const [tags, setTags] = useState<string[]>(job.tags || []);

  // Budget state
  const [budgetTotal, setBudgetTotal] = useState(job.budget.total.toString());
  const [budgetLabor, setBudgetLabor] = useState(job.budget.labor.toString());
  const [budgetEquipment, setBudgetEquipment] = useState(
    job.budget.equipment.toString()
  );
  const [budgetMaterials, setBudgetMaterials] = useState(
    job.budget.materials.toString()
  );
  const [budgetOther, setBudgetOther] = useState(job.budget.other.toString());

  // Dialog states
  const [showAddAssetDialog, setShowAddAssetDialog] = useState(false);

  // Add asset dialog state
  const [selectedAssetId, setSelectedAssetId] = useState(&apos;&apos;);
  const [assetRequired, setAssetRequired] = useState(true);
  const [useFullJobDuration, setUseFullJobDuration] = useState(true);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();

  // Add team member inline state
  const [selectedTeamMember, setSelectedTeamMember] = useState(&apos;&apos;);

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
// console.log(
      &apos;EditJob - Available Assets:&apos;,
      availableAssets.length,
      availableAssets
    );
// console.log(&apos;EditJob - Job Assets:&apos;, job.assets);
// console.log(&apos;EditJob - Mock Assets:&apos;, mockAssets.length);
  }, [availableAssets, job.assets]);

  const handleSave = async () => {
    try {
      if (!name || !startDate || !endDate) {
        toast.error(&apos;Please fill in all required fields&apos;);
        return;
      }

      if (new Date(endDate) <= new Date(startDate)) {
        toast.error(&apos;End date must be after start date&apos;);
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
        toast.success(&apos;Job updated successfully&apos;);
        onBack();
      } else {
        toast.error(&apos;Failed to update job&apos;);
      }
    } catch (error) {
// console.error(&apos;Error updating job:&apos;, error);
      toast.error(&apos;An error occurred while updating the job&apos;);
    }
  };

  const handleAddAsset = async () => {
    if (!selectedAssetId) {
      toast.error(&apos;Please select an asset&apos;);
      return;
    }

    // Validate custom dates if not using full job duration
    if (!useFullJobDuration) {
      if (!customStartDate || !customEndDate) {
        toast.error(
          &apos;Please select both start and end date/time for custom assignment&apos;
        );
        return;
      }

      if (customEndDate <= customStartDate) {
        toast.error(&apos;End date/time must be after start date/time&apos;);
        return;
      }
    }

    const asset = mockAssets.find(a => a.id === selectedAssetId);
    if (!asset) {
      toast.error(&apos;Asset not found&apos;);
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
      toast.success(
        `${asset.name} added to job with ${useFullJobDuration ? &apos;full job duration&apos; : &apos;custom schedule&apos;}`
      );
      setShowAddAssetDialog(false);
      setSelectedAssetId(&apos;&apos;);
      setAssetRequired(true);
      setUseFullJobDuration(true);
      setCustomStartDate(undefined);
      setCustomEndDate(undefined);
    } else {
      toast.error(&apos;Failed to add asset to job&apos;);
    }
  };

  const handleRemoveAsset = async (assetId: string, assetName: string) => {
    if (!confirm(`Remove ${assetName} from this job?`)) return;

    const result = await onRemoveAssetFromJob(jobId, assetId);

    if (result.success) {
      toast.success(`${assetName} removed from job`);
    } else {
      toast.error(&apos;Failed to remove asset&apos;);
    }
  };

  const handleAddTeamMember = (memberId: string) => {
    if (!memberId || assignedTeam.includes(memberId)) {
      return;
    }

    setAssignedTeam([...assignedTeam, memberId]);
    setSelectedTeamMember(&apos;&apos;);
    const member = teamMembers.find(tm => tm.value === memberId);
    toast.success(`${member?.label || &apos;Team member&apos;} added`);
  };

  const handleRemoveTeamMember = (memberId: string) => {
    setAssignedTeam(assignedTeam.filter(id => id !== memberId));
    toast.success(&apos;Team member removed&apos;);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(&apos;en-US&apos;, {
      style: &apos;currency&apos;,
      currency: &apos;USD&apos;,
    }).format(value);
  };

  return (
    <PageLayout
      variant=&apos;narrow&apos;
      padding=&apos;md&apos;
      header={
        <PageHeader
          title={`Edit Job: ${job.jobNumber}`}
          description=&apos;Update job details, budget, assets, and team assignments&apos;
          actions={
            <div className=&apos;flex gap-2&apos;>
              <Button variant=&apos;outline&apos; onClick={onBack}>
                <ArrowLeft className=&apos;h-4 w-4 mr-2&apos; />
                Back
              </Button>
              <Button onClick={handleSave}>
                <Save className=&apos;h-4 w-4 mr-2&apos; />
                Save Changes
              </Button>
            </div>
          }
        />
      }
    >
      {/* Job Details */}
      <Card>
        <CardHeader>
          <CardTitle>Job Information</CardTitle>
          <CardDescription>Basic job details and timeline</CardDescription>
        </CardHeader>
        <CardContent className=&apos;space-y-4&apos;>
          {/* Status Field - Only shown in edit */}
          <div className=&apos;space-y-2&apos;>
            <Label htmlFor=&apos;status&apos;>Status</Label>
            <Select
              value={status}
              onValueChange={value => setStatus(value as JobStatus)}
            >
              <SelectTrigger id=&apos;status&apos;>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {jobStatuses.map(s => (
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
          <NotesSection notes={notes} onNotesChange={setNotes} />

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
          <CardTitle className=&apos;flex items-center gap-2&apos;>
            <DollarSign className=&apos;h-5 w-5&apos; />
            Budget
          </CardTitle>
          <CardDescription>Job budget breakdown</CardDescription>
        </CardHeader>
        <CardContent className=&apos;space-y-4&apos;>
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
          <div className=&apos;bg-muted p-4 rounded-lg&apos;>
            <div className=&apos;text-sm text-muted-foreground&apos;>
              Current Actual Costs
            </div>
            <div className=&apos;text-2xl mt-1&apos;>
              {formatCurrency(job.actualCosts.total)}
            </div>
            <div className=&apos;text-sm text-muted-foreground mt-2&apos;>
              Variance:{&apos; &apos;}
              <span
                className={
                  job.variance >= 0 ? &apos;text-green-600&apos; : &apos;text-red-600&apos;
                }
              >
                {formatCurrency(Math.abs(job.variance))} (
                {job.variancePercentage.toFixed(1)}%)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets */}
      <Card>
        <CardHeader>
          <div className=&apos;flex items-center justify-between&apos;>
            <div>
              <CardTitle className=&apos;flex items-center gap-2&apos;>
                <Package className=&apos;h-5 w-5&apos; />
                Assets ({job.assets.length})
              </CardTitle>
              <CardDescription>Assets assigned to this job</CardDescription>
            </div>
            <Button onClick={() => setShowAddAssetDialog(true)}>
              <Plus className=&apos;h-4 w-4 mr-2&apos; />
              Add Asset
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {job.assets.length === 0 ? (
            <div className=&apos;text-center py-8 text-muted-foreground&apos;>
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
                {job.assets.map(asset => (
                  <TableRow key={asset.assetId}>
                    <TableCell>{asset.assetName}</TableCell>
                    <TableCell className=&apos;capitalize&apos;>
                      {asset.assetType}
                    </TableCell>
                    <TableCell>
                      {asset.required ? (
                        <Badge
                          variant=&apos;outline&apos;
                          className=&apos;bg-red-100 text-red-700 border-red-200&apos;
                        >
                          Required
                        </Badge>
                      ) : (
                        <Badge variant=&apos;outline&apos;>Optional</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {asset.assignmentStartDate && asset.assignmentEndDate ? (
                        <div className=&apos;flex flex-col gap-0.5 text-sm&apos;>
                          <div className=&apos;flex items-center gap-1&apos;>
                            <Clock className=&apos;h-3 w-3 text-muted-foreground&apos; />
                            <span className=&apos;text-muted-foreground&apos;>From:</span>
                            <span>
                              {new Date(
                                asset.assignmentStartDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className=&apos;flex items-center gap-1&apos;>
                            <Clock className=&apos;h-3 w-3 text-muted-foreground&apos; />
                            <span className=&apos;text-muted-foreground&apos;>To:</span>
                            <span>
                              {new Date(
                                asset.assignmentEndDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className=&apos;text-sm text-muted-foreground&apos;>
                          Full job duration
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant=&apos;ghost&apos;
                        size=&apos;sm&apos;
                        onClick={() =>
                          handleRemoveAsset(asset.assetId, asset.assetName)
                        }
                      >
                        <Trash2 className=&apos;h-4 w-4 text-red-600&apos; />
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
          <CardTitle className=&apos;flex items-center gap-2&apos;>
            <Users className=&apos;h-5 w-5&apos; />
            Team Members ({assignedTeam.length})
          </CardTitle>
          <CardDescription>Personnel assigned to this job</CardDescription>
        </CardHeader>
        <CardContent className=&apos;space-y-4&apos;>
          {/* Inline Add Team Member - Better UX than modal */}
          {availableTeamMembers.length > 0 && (
            <div className=&apos;flex items-center gap-2&apos;>
              <Select
                value={selectedTeamMember}
                onValueChange={value => {
                  handleAddTeamMember(value);
                }}
              >
                <SelectTrigger className=&apos;w-[300px]&apos;>
                  <SelectValue placeholder=&apos;Add team member...&apos; />
                </SelectTrigger>
                <SelectContent>
                  {availableTeamMembers.map(tm => (
                    <SelectItem key={tm.value} value={tm.value}>
                      {tm.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className=&apos;text-sm text-muted-foreground&apos;>
                Select to add instantly
              </span>
            </div>
          )}

          {/* Current Team Members */}
          {assignedTeam.length === 0 ? (
            <div className=&apos;text-center py-4 text-muted-foreground&apos;>
              No team members assigned yet
            </div>
          ) : (
            <div className=&apos;flex flex-wrap gap-2&apos;>
              {assignedTeam.map(memberId => {
                const member = teamMembers.find(tm => tm.value === memberId);
                return member ? (
                  <Badge
                    key={memberId}
                    variant=&apos;secondary&apos;
                    className=&apos;px-3 py-2 flex items-center gap-2&apos;
                  >
                    {member.label}
                    <X
                      className=&apos;h-3 w-3 cursor-pointer hover:text-destructive transition-colors&apos;
                      onClick={() => handleRemoveTeamMember(memberId)}
                    />
                  </Badge>
                ) : null;
              })}
            </div>
          )}

          {availableTeamMembers.length === 0 && assignedTeam.length > 0 && (
            <p className=&apos;text-sm text-muted-foreground&apos;>
              All available team members have been assigned
            </p>
          )}
        </CardContent>
      </Card>

      {/* Add Asset Dialog */}
      <Dialog open={showAddAssetDialog} onOpenChange={setShowAddAssetDialog}>
        <DialogContent className=&apos;max-h-[90vh] overflow-y-auto&apos;>
          <DialogHeader>
            <DialogTitle>Add Asset to Job</DialogTitle>
            <DialogDescription>
              Select an asset and configure its assignment period with date and
              time
            </DialogDescription>
          </DialogHeader>

          <div className=&apos;space-y-4&apos;>
            <div className=&apos;space-y-2&apos;>
              <Label htmlFor=&apos;asset&apos;>Asset *</Label>
              <Select
                value={selectedAssetId}
                onValueChange={setSelectedAssetId}
              >
                <SelectTrigger id=&apos;asset&apos;>
                  <SelectValue placeholder=&apos;Select an asset&apos; />
                </SelectTrigger>
                <SelectContent>
                  {availableAssets.length === 0 ? (
                    <SelectItem value=&apos;no-assets&apos; disabled>
                      No available assets
                    </SelectItem>
                  ) : (
                    availableAssets.map(asset => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.name} - {asset.type}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {availableAssets.length === 0 && (
                <p className=&apos;text-sm text-muted-foreground&apos;>
                  All assets have been assigned to this job
                </p>
              )}
            </div>

            <div className=&apos;flex items-center justify-between&apos;>
              <div className=&apos;space-y-0.5&apos;>
                <Label>Required Asset</Label>
                <p className=&apos;text-sm text-muted-foreground&apos;>
                  Mark as required for this job
                </p>
              </div>
              <Switch
                checked={assetRequired}
                onCheckedChange={setAssetRequired}
              />
            </div>

            <Separator />

            <div className=&apos;flex items-center justify-between&apos;>
              <div className=&apos;space-y-0.5&apos;>
                <Label>Use Full Job Duration</Label>
                <p className=&apos;text-sm text-muted-foreground&apos;>
                  Assign for entire job period
                </p>
              </div>
              <Switch
                checked={useFullJobDuration}
                onCheckedChange={setUseFullJobDuration}
              />
            </div>

            {!useFullJobDuration && (
              <div className=&apos;space-y-4 pt-2 border-t&apos;>
                <p className=&apos;text-sm text-muted-foreground&apos;>
                  Configure custom assignment period with specific dates and
                  times
                </p>

                <DateTimeInput
                  label=&apos;Assignment Start Date & Time *&apos;
                  value={customStartDate}
                  onChange={setCustomStartDate}
                  placeholder=&apos;Select start date and time&apos;
                  minDate={new Date(startDate)}
                  maxDate={new Date(endDate)}
                />

                <DateTimeInput
                  label=&apos;Assignment End Date & Time *&apos;
                  value={customEndDate}
                  onChange={setCustomEndDate}
                  placeholder=&apos;Select end date and time&apos;
                  minDate={customStartDate || new Date(startDate)}
                  maxDate={new Date(endDate)}
                />

                {customStartDate &&
                  customEndDate &&
                  customEndDate <= customStartDate && (
                    <p className=&apos;text-sm text-destructive&apos;>
                      End date/time must be after start date/time
                    </p>
                  )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant=&apos;outline&apos;
              onClick={() => setShowAddAssetDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddAsset}
              disabled={availableAssets.length === 0}
            >
              Add Asset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
