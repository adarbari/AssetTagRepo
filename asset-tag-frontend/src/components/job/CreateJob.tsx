import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { PageHeader, PageLayout } from '../common';
import { useFormSubmit } from '../../hooks/useFormSubmit';
import { ArrowLeft, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import type { CreateJobInput, JobPriority } from '../../types/job';
import { JobInformationSection } from './JobInformationSection';
import { BudgetSection } from './BudgetSection';
import { NotesSection } from './NotesSection';
import { TagsSection } from './TagsSection';

interface CreateJobProps {
  onBack: () => void;
  onCreateJob: (
    input: CreateJobInput
  ) => Promise<{ success: boolean; job?: any; error?: any }>;
}

export function CreateJob({ onBack, onCreateJob }: CreateJobProps) {
  // Job information state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priority, setPriority] = useState<JobPriority>('medium');
  const [projectManager, setProjectManager] = useState('');
  const [clientId, setClientId] = useState('');
  const [siteId, setSiteId] = useState('');
  const [groundStationGeofenceId, setGroundStationGeofenceId] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // Budget state
  const [totalBudget, setTotalBudget] = useState('');
  const [laborBudget, setLaborBudget] = useState('');
  const [equipmentBudget, setEquipmentBudget] = useState('');
  const [materialsBudget, setMaterialsBudget] = useState('');
  const [otherBudget, setOtherBudget] = useState('');

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
          labor: parseFloat(formData.laborBudget || '0'),
          equipment: parseFloat(formData.equipmentBudget || '0'),
          materials: parseFloat(formData.materialsBudget || '0'),
          other: parseFloat(formData.otherBudget || '0'),
        },
      };

      return await onCreateJob(jobInput);
    },
    {
      onSuccess: () => onBack(),
      successMessage: 'Job created successfully!',
      errorMessage: 'Failed to create job',
      validate: formData => {
        if (!formData.name || !formData.startDate || !formData.endDate) {
          return 'Please fill in all required fields';
        }

        if (new Date(formData.endDate) <= new Date(formData.startDate)) {
          return 'End date must be after start date';
        }

        if (formData.finalTotalBudget <= 0) {
          return 'Please enter a valid budget amount';
        }

        return null;
      },
    }
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate total budget if individual fields are filled
    const calculatedTotal =
      parseFloat(laborBudget || '0') +
      parseFloat(equipmentBudget || '0') +
      parseFloat(materialsBudget || '0') +
      parseFloat(otherBudget || '0');

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
      variant='narrow'
      padding='md'
      header={
        <PageHeader
          title='Create New Job'
          subtitle='Set up a new project with budget allocation and team assignments'
          onBack={onBack}
        />
      }
    >
      <form onSubmit={onSubmit} className='space-y-6'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-2 mb-6'>
              <Briefcase className='h-5 w-5' />
              <h2 className='text-lg font-semibold'>Job Information</h2>
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
          <CardContent className='p-6'>
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
          <CardContent className='p-6'>
            <NotesSection notes={notes} onNotesChange={setNotes} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <TagsSection
              tags={tags}
              onTagsChange={setTags}
              showAsSection={true}
            />
          </CardContent>
        </Card>

        <div className='flex justify-end gap-3'>
          <Button type='button' variant='outline' onClick={onBack}>
            Cancel
          </Button>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Job'}
          </Button>
        </div>
      </form>
    </PageLayout>
  );
}
