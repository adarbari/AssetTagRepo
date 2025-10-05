import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { PageHeader } from "./common";
import { ArrowLeft, Briefcase } from "lucide-react";
import { toast } from "sonner";
import type { CreateJobInput, JobPriority } from "../types/job";
import { JobInformationSection } from "./job/JobInformationSection";
import { BudgetSection } from "./job/BudgetSection";
import { NotesSection } from "./job/NotesSection";
import { TagsSection } from "./job/TagsSection";

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

    // Calculate total budget if individual fields are filled
    const calculatedTotal = 
      parseFloat(laborBudget || "0") +
      parseFloat(equipmentBudget || "0") +
      parseFloat(materialsBudget || "0") +
      parseFloat(otherBudget || "0");

    const finalTotalBudget = totalBudget ? parseFloat(totalBudget) : calculatedTotal;

    if (finalTotalBudget <= 0) {
      toast.error("Please enter a valid budget amount");
      return;
    }

    const jobInput: CreateJobInput = {
      name,
      description,
      startDate,
      endDate,
      priority,
      projectManager: projectManager || undefined,
      clientId: clientId || undefined,
      siteId: siteId || undefined,
      groundStationGeofenceId: groundStationGeofenceId || undefined,
      notes: notes || undefined,
      tags: tags.length > 0 ? tags : undefined,
      budget: {
        total: finalTotalBudget,
        labor: parseFloat(laborBudget || "0"),
        equipment: parseFloat(equipmentBudget || "0"),
        materials: parseFloat(materialsBudget || "0"),
        other: parseFloat(otherBudget || "0"),
      },
    };

    try {
      const result = await onCreateJob(jobInput);
      
      if (result.success) {
        toast.success("Job created successfully!");
        onBack();
      } else {
        toast.error("Failed to create job");
      }
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error("An error occurred while creating the job");
    }
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Create New Job"
        subtitle="Set up a new project with budget allocation and team assignments"
        actions={
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Briefcase className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">Job Information</h2>
                </div>
                
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

            <Card>
              <CardContent className="p-6">
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

            <Card>
              <CardContent className="p-6">
                <NotesSection
                  notes={notes}
                  onNotesChange={setNotes}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <TagsSection
                  tags={tags}
                  onTagsChange={setTags}
                  showAsSection={true}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button type="submit">
                Create Job
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
