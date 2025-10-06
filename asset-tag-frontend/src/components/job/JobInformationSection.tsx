/**
 * Job Information Section
 *
 * Reusable component for job basic information fields
 * Used in both CreateJob and EditJob components
 */

import React from &apos;react&apos;;
import { Label } from &apos;../ui/label&apos;;
import { Input } from &apos;../ui/input&apos;;
import { Textarea } from &apos;../ui/textarea&apos;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &apos;../ui/select&apos;;
import { Calendar as CalendarIcon, Briefcase } from &apos;lucide-react&apos;;
import type { JobPriority } from &apos;../../types/job&apos;;
import {
  jobPriorities,
  projectManagers,
  clients,
} from &apos;../../data/dropdownOptions&apos;;

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
    <div className=&apos;space-y-6&apos;>
      <div>
        <h3 className=&apos;flex items-center gap-2 mb-4&apos;>
          <Briefcase className=&apos;h-5 w-5&apos; />
          Job Information
        </h3>
        <p className=&apos;text-sm text-muted-foreground mb-6&apos;>
          Enter the basic details for this job
        </p>
      </div>

      <div className=&apos;grid gap-4 md:grid-cols-2&apos;>
        <div className=&apos;space-y-2&apos;>
          <Label htmlFor=&apos;job-name&apos;>Job Name *</Label>
          <Input
            id=&apos;job-name&apos;
            placeholder=&apos;e.g., Downtown Office Renovation&apos;
            value={name}
            onChange={e => onNameChange(e.target.value)}
            required
          />
        </div>

        {jobNumber && (
          <div className=&apos;space-y-2&apos;>
            <Label htmlFor=&apos;job-number&apos;>Job Number</Label>
            <Input
              id=&apos;job-number&apos;
              value={jobNumber}
              disabled
              className=&apos;bg-muted&apos;
            />
          </div>
        )}
      </div>

      <div className=&apos;space-y-2&apos;>
        <Label htmlFor=&apos;description&apos;>Description</Label>
        <Textarea
          id=&apos;description&apos;
          placeholder=&apos;Brief description of the job...&apos;
          value={description}
          onChange={e => onDescriptionChange(e.target.value)}
          rows={3}
        />
      </div>

      <div className=&apos;grid gap-4 md:grid-cols-2&apos;>
        <div className=&apos;space-y-2&apos;>
          <Label htmlFor=&apos;start-date&apos;>Start Date *</Label>
          <div className=&apos;relative&apos;>
            <CalendarIcon className=&apos;absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none&apos; />
            <Input
              id=&apos;start-date&apos;
              type=&apos;date&apos;
              value={startDate}
              onChange={e => onStartDateChange(e.target.value)}
              className=&apos;pl-9&apos;
              required
            />
          </div>
        </div>

        <div className=&apos;space-y-2&apos;>
          <Label htmlFor=&apos;end-date&apos;>End Date *</Label>
          <div className=&apos;relative&apos;>
            <CalendarIcon className=&apos;absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none&apos; />
            <Input
              id=&apos;end-date&apos;
              type=&apos;date&apos;
              value={endDate}
              onChange={e => onEndDateChange(e.target.value)}
              className=&apos;pl-9&apos;
              required
            />
          </div>
        </div>
      </div>

      <div className=&apos;grid gap-4 md:grid-cols-2&apos;>
        <div className=&apos;space-y-2&apos;>
          <Label htmlFor=&apos;priority&apos;>Priority</Label>
          <Select
            value={priority}
            onValueChange={value => onPriorityChange(value as JobPriority)}
          >
            <SelectTrigger id=&apos;priority&apos;>
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

        <div className=&apos;space-y-2&apos;>
          <Label htmlFor=&apos;project-manager&apos;>Project Manager</Label>
          <Select value={projectManager} onValueChange={onProjectManagerChange}>
            <SelectTrigger id=&apos;project-manager&apos;>
              <SelectValue placeholder=&apos;Select project manager (optional)&apos; />
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
        <div className=&apos;space-y-2&apos;>
          <Label htmlFor=&apos;client&apos;>Client</Label>
          <Select value={clientId} onValueChange={onClientIdChange}>
            <SelectTrigger id=&apos;client&apos;>
              <SelectValue placeholder=&apos;Select client (optional)&apos; />
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
