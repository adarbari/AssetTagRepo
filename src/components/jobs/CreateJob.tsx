import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { PageHeader } from "../common";
import { ArrowLeft, Briefcase } from "lucide-react";
import { toast } from "sonner@2.0.3";
import type { CreateJobInput, JobPriority } from "../../types/job";
import { JobInformationSection } from "../job/JobInformationSection";
import { BudgetSection } from "../job/BudgetSection";
import { NotesSection } from "../job/NotesSection";
import { TagsSection } from "../job/TagsSection";

interface CreateJobProps {
  onBack: () => void;
  onCreateJob: (input: CreateJobInput) => Promise<{ success: boolean; job?: any; error?: any }>;
}

export function CreateJob({ onBack, onCreateJob }: CreateJobProps) {
  // Job information state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState<JobPriority>("medium");
  const [projectManager, setProjectManager] = useState("");
  const [clientId, setClientId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [groundStationGeofenceId, setGroundStationGeofenceId] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  
  // Budget state
  const [totalBudget, setTotalBudget] = useState("");
  const [laborBudget, setLaborBudget] = useState("");
  const [equipmentBudget, setEquipmentBudget] = useState("");
  const [materialsBudget, setMaterialsBudget] = useState("");
  const [otherBudget, setOtherBudget] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !startDate || !endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      toast.error("End date must be after start date");
      return;
    }

    const createInput: CreateJobInput = {
      name,
      description,
      startDate,
      endDate,
      budget: {
        total: parseFloat(totalBudget) || 0,
        labor: parseFloat(laborBudget) || 0,
        equipment: parseFloat(equipmentBudget) || 0,
        materials: parseFloat(materialsBudget) || 0,
        other: parseFloat(otherBudget) || 0,
      },
      priority,
      projectManager: projectManager || undefined,
      clientId: clientId || undefined,
      siteId: siteId || undefined,
      groundStationGeofenceId: groundStationGeofenceId || undefined,
      notes: notes || undefined,
      tags: tags.length > 0 ? tags : undefined,
    };

    const result = await onCreateJob(createInput);

    if (result.success) {
      toast.success("Job created successfully", {
        description: `${name} has been added to your jobs`,
      });
      onBack();
    } else {
      toast.error("Failed to create job", {
        description: "Please try again",
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <PageHeader
        title="Create New Job"
        description="Set up a new job with budget tracking and asset assignments"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" form="create-job-form">
              <Briefcase className="h-4 w-4 mr-2" />
              Create Job
            </Button>
          </div>
        }
      />

      {/* Form Content */}
      <div className="flex-1 overflow-auto p-8">
        <form id="create-job-form" onSubmit={handleSubmit}>
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Basic Information */}
            <Card>
              <CardContent className="pt-6">
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
                  showClientField={true}
                />
              </CardContent>
            </Card>

            {/* Budget Information */}
            <Card>
              <CardContent className="pt-6">
                <BudgetSection
                  totalBudget={totalBudget}
                  onTotalBudgetChange={setTotalBudget}
                  laborBudget={laborBudget}
                  onLaborBudgetChange={setLaborBudget}
                  equipmentBudget={equipmentBudget}
                  onEquipmentBudgetChange={setEquipmentBudget}
                  materialsBudget={materialsBudget}
                  onMaterialsBudgetChange={setMaterialsBudget}
                  otherBudget={otherBudget}
                  onOtherBudgetChange={setOtherBudget}
                />
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
              <CardContent className="pt-6">
                <NotesSection
                  notes={notes}
                  onNotesChange={setNotes}
                />
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardContent className="pt-6">
                <TagsSection
                  tags={tags}
                  onTagsChange={setTags}
                  showAsSection={true}
                />
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-2">
                  <Briefcase className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-900">
                    <p className="mb-1">After creating the job, you can:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Assign assets and vehicles to this job</li>
                      <li>Configure job-specific alert rules</li>
                      <li>Track actual costs against budget</li>
                      <li>Generate cost reports and analysis</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}
