/**
 * Job Information Section
 *
 * Reusable component for job basic information fields
 * Used in both CreateJob and EditJob components
 */

import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Calendar as CalendarIcon, Briefcase } from 'lucide-react';
import type { JobPriority } from '../../types/job';
import {
  jobPriorities,
  projectManagers,
  clients,
} from '../../data/dropdownOptions';

interface JobInformationSectionProps {
  name: string;
  onNameChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  priority: JobPriority;
  onPriorityChange: (value: JobPriority) => void;
  projectManager?: string;
  onProjectManagerChange: (value: string) => void;
  clientId?: string;
  onClientIdChange: (value: string) => void;
  jobNumber?: string; // Only shown in edit mode
  showClientField?: boolean; // Whether to show client field
}

export function JobInformationSection({
  name,
  onNameChange,
  description,
  onDescriptionChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  priority,
  onPriorityChange,
  projectManager,
  onProjectManagerChange,
  clientId,
  onClientIdChange,
  jobNumber,
  showClientField = false,
}: JobInformationSectionProps) {
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='flex items-center gap-2 mb-4'>
          <Briefcase className='h-5 w-5' />
          Job Information
        </h3>
        <p className='text-sm text-muted-foreground mb-6'>
          Enter the basic details for this job
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label htmlFor='job-name'>Job Name *</Label>
          <Input
            id='job-name'
            placeholder='e.g., Downtown Office Renovation'
            value={name}
            onChange={e => onNameChange(e.target.value)}
            required
          />
        </div>

        {jobNumber && (
          <div className='space-y-2'>
            <Label htmlFor='job-number'>Job Number</Label>
            <Input
              id='job-number'
              value={jobNumber}
              disabled
              className='bg-muted'
            />
          </div>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='description'>Description</Label>
        <Textarea
          id='description'
          placeholder='Brief description of the job...'
          value={description}
          onChange={e => onDescriptionChange(e.target.value)}
          rows={3}
        />
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label htmlFor='start-date'>Start Date *</Label>
          <div className='relative'>
            <CalendarIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none' />
            <Input
              id='start-date'
              type='date'
              value={startDate}
              onChange={e => onStartDateChange(e.target.value)}
              className='pl-9'
              required
            />
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='end-date'>End Date *</Label>
          <div className='relative'>
            <CalendarIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none' />
            <Input
              id='end-date'
              type='date'
              value={endDate}
              onChange={e => onEndDateChange(e.target.value)}
              className='pl-9'
              required
            />
          </div>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label htmlFor='priority'>Priority</Label>
          <Select
            value={priority}
            onValueChange={value => onPriorityChange(value as JobPriority)}
          >
            <SelectTrigger id='priority'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {jobPriorities.map(p => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='project-manager'>Project Manager</Label>
          <Select value={projectManager} onValueChange={onProjectManagerChange}>
            <SelectTrigger id='project-manager'>
              <SelectValue placeholder='Select project manager (optional)' />
            </SelectTrigger>
            <SelectContent>
              {projectManagers.map(pm => (
                <SelectItem key={pm.value} value={pm.value}>
                  {pm.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {showClientField && (
        <div className='space-y-2'>
          <Label htmlFor='client'>Client</Label>
          <Select value={clientId} onValueChange={onClientIdChange}>
            <SelectTrigger id='client'>
              <SelectValue placeholder='Select client (optional)' />
            </SelectTrigger>
            <SelectContent>
              {clients.map(c => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
