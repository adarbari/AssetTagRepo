import React, { useState } from &apos;react&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Card, CardContent } from &apos;../ui/card&apos;;
import { PageHeader, PageLayout } from &apos;../common&apos;;
import { useFormSubmit } from &apos;../../hooks/useFormSubmit&apos;;
import { Briefcase } from &apos;lucide-react&apos;;
import type { CreateJobInput, JobPriority } from &apos;../../types/job&apos;;
import { JobInformationSection } from &apos;./JobInformationSection&apos;;
import { BudgetSection } from &apos;./BudgetSection&apos;;
import { NotesSection } from &apos;./NotesSection&apos;;
import { TagsSection } from &apos;./TagsSection&apos;;

interface CreateJobProps {
  onBack: () => void;
  onCreateJob: (
    input: CreateJobInput
  ) => Promise<{ success: boolean; job?: any; error?: any }>;
}

export function CreateJob({ onBack, onCreateJob }: CreateJobProps) {
  // Job information state
  const [name, setName] = useState(&apos;&apos;);
  const [description, setDescription] = useState(&apos;&apos;);
  const [startDate, setStartDate] = useState(&apos;&apos;);
  const [endDate, setEndDate] = useState(&apos;&apos;);
  const [priority, setPriority] = useState<JobPriority>(&apos;medium&apos;);
  const [projectManager, setProjectManager] = useState(&apos;&apos;);
  const [clientId, setClientId] = useState(&apos;&apos;);
  const [notes, setNotes] = useState(&apos;&apos;);
  const [tags, setTags] = useState<string[]>([]);

  // Budget state
  const [totalBudget, setTotalBudget] = useState(&apos;&apos;);
  const [laborBudget, setLaborBudget] = useState(&apos;&apos;);
  const [equipmentBudget, setEquipmentBudget] = useState(&apos;&apos;);
  const [materialsBudget, setMaterialsBudget] = useState(&apos;&apos;);
  const [otherBudget, setOtherBudget] = useState(&apos;&apos;);

  const { handleSubmit, isSubmitting } = useFormSubmit(
    async (formData: any) => {
      const jobInput: CreateJobInput = {
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        priority: formData.priority,
        projectManager: formData.projectManager || undefined,
        clientId: formData.clientId || undefined,
        siteId: formData.siteId || undefined,
        groundStationGeofenceId: formData.groundStationGeofenceId || undefined,
        notes: formData.notes || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        budget: {
          total: formData.finalTotalBudget,
          labor: parseFloat(formData.laborBudget || &apos;0&apos;),
          equipment: parseFloat(formData.equipmentBudget || &apos;0&apos;),
          materials: parseFloat(formData.materialsBudget || &apos;0&apos;),
          other: parseFloat(formData.otherBudget || &apos;0&apos;),
        },
      };

      return await onCreateJob(jobInput);
    },
    {
      onSuccess: () => onBack(),
      successMessage: &apos;Job created successfully!&apos;,
      errorMessage: &apos;Failed to create job&apos;,
      validate: formData => {
        if (!formData.name || !formData.startDate || !formData.endDate) {
          return &apos;Please fill in all required fields&apos;;
        }

        if (new Date(formData.endDate) <= new Date(formData.startDate)) {
          return &apos;End date must be after start date&apos;;
        }

        if (formData.finalTotalBudget <= 0) {
          return &apos;Please enter a valid budget amount&apos;;
        }

        return null;
      },
    }
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate total budget if individual fields are filled
    const calculatedTotal =
      parseFloat(laborBudget || &apos;0&apos;) +
      parseFloat(equipmentBudget || &apos;0&apos;) +
      parseFloat(materialsBudget || &apos;0&apos;) +
      parseFloat(otherBudget || &apos;0&apos;);

    const finalTotalBudget = totalBudget
      ? parseFloat(totalBudget)
      : calculatedTotal;

    const formData = {
      name,
      description,
      startDate,
      endDate,
      priority,
      projectManager,
      clientId,
      siteId,
      groundStationGeofenceId,
      notes,
      tags,
      laborBudget,
      equipmentBudget,
      materialsBudget,
      otherBudget,
      totalBudget,
      finalTotalBudget,
    };

    await handleSubmit(formData);
  };

  return (
    <PageLayout
      variant=&apos;narrow&apos;
      padding=&apos;md&apos;
      header={
        <PageHeader
          title=&apos;Create New Job&apos;
          subtitle=&apos;Set up a new project with budget allocation and team assignments&apos;
          onBack={onBack}
        />
      }
    >
      <form onSubmit={onSubmit} className=&apos;space-y-6&apos;>
        <Card>
          <CardContent className=&apos;p-6&apos;>
            <div className=&apos;flex items-center gap-2 mb-6&apos;>
              <Briefcase className=&apos;h-5 w-5&apos; />
              <h2 className=&apos;text-lg font-semibold&apos;>Job Information</h2>
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
          <CardContent className=&apos;p-6&apos;>
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
          <CardContent className=&apos;p-6&apos;>
            <NotesSection notes={notes} onNotesChange={setNotes} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className=&apos;p-6&apos;>
            <TagsSection
              tags={tags}
              onTagsChange={setTags}
              showAsSection={true}
            />
          </CardContent>
        </Card>

        <div className=&apos;flex justify-end gap-3&apos;>
          <Button type=&apos;button&apos; variant=&apos;outline&apos; onClick={onBack}>
            Cancel
          </Button>
          <Button type=&apos;submit&apos; disabled={isSubmitting}>
            {isSubmitting ? &apos;Creating...&apos; : &apos;Create Job&apos;}
          </Button>
        </div>
      </form>
    </PageLayout>
  );
}
