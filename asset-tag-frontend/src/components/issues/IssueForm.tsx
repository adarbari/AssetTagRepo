import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import { AlertTriangle, Save, Upload, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { SeverityBadge, StatusBadge } from '../common';
import { issueTypes, issueSeverities } from '../../data/dropdownOptions';
import type { IssueType, IssueSeverity, IssueStatus } from '../../types/issue';

export interface IssueFormData {
  type: IssueType;
  severity: IssueSeverity;
  status?: IssueStatus;
  title: string;
  description: string;
  assignedTo?: string;
  notes?: string;
  tags?: string[];
}

interface IssueFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<IssueFormData>;
  assetId?: string;
  assetName?: string;
  assetContext?: any;
  onSubmit: (data: IssueFormData) => Promise<{ success: boolean; error?: any }>;
  onCancel: () => void;
  isSubmitting?: boolean;
  showAssetInfo?: boolean;
  showStatusField?: boolean;
  showAdvancedFields?: boolean;
}

export function IssueForm({
  mode,
  initialData = {},
  assetId,
  assetName,
  assetContext,
  onSubmit,
  onCancel,
  isSubmitting = false,
  showAssetInfo = true,
  showStatusField = false,
  showAdvancedFields = false,
}: IssueFormProps) {
  const [formData, setFormData] = useState<IssueFormData>({
    type: initialData.type || '',
    severity: initialData.severity || 'medium',
    status: initialData.status || 'open',
    title: initialData.title || '',
    description: initialData.description || '',
    assignedTo: initialData.assignedTo || '',
    notes: initialData.notes || '',
    tags: initialData.tags || [],
  });

  const [tagsInput, setTagsInput] = useState(
    initialData.tags ? initialData.tags.join(', ') : ''
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.type || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (mode === 'edit' && !formData.title.trim()) {
      toast.error('Please provide a title for the issue');
      return;
    }

    // Process tags
    const processedData = {
      ...formData,
      tags: tagsInput.trim() ? tagsInput.split(',').map(tag => tag.trim()) : [],
    };

    await onSubmit(processedData);
  };

  // Using generic SeverityBadge component

  return (
    <div className='space-y-6'>
      {/* Asset Info Card */}
      {showAssetInfo && assetId && assetName && (
        <Card>
          <CardHeader>
            <CardTitle>Asset Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='p-4 bg-muted rounded-lg'>
              <div className='flex items-center justify-between'>
                <div>
                  <h4>{assetName}</h4>
                  <p className='text-sm text-muted-foreground'>{assetId}</p>
                  {assetContext && (
                    <div className='mt-2 text-sm space-y-1'>
                      <p>
                        <span className='text-muted-foreground'>Type:</span>{' '}
                        {assetContext.type}
                      </p>
                      <p>
                        <span className='text-muted-foreground'>Status:</span>{' '}
                        {assetContext.status}
                      </p>
                      <p>
                        <span className='text-muted-foreground'>Location:</span>{' '}
                        {assetContext.location}
                      </p>
                    </div>
                  )}
                </div>
                <div className='flex gap-2'>
                  {formData.status && <StatusBadge status={formData.status} />}
                  <SeverityBadge severity={formData.severity} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Issue Form Card */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Issue Details</CardTitle>
            <CardDescription>
              {mode === 'create'
                ? "Provide detailed information about the issue you're reporting"
                : 'Update the issue information'}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Title field for edit mode */}
            {mode === 'edit' && (
              <div className='grid gap-2'>
                <Label htmlFor='title'>Title *</Label>
                <Input
                  id='title'
                  value={formData.title}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, title: e.target.value }))
                  }
                  placeholder='Issue title'
                />
              </div>
            )}

            <div className='grid gap-2'>
              <Label htmlFor='issue-type'>Issue Type *</Label>
              <Select
                value={formData.type}
                onValueChange={value =>
                  setFormData(prev => ({ ...prev, type: value as IssueType }))
                }
              >
                <SelectTrigger id='issue-type'>
                  <SelectValue placeholder='Select issue type' />
                </SelectTrigger>
                <SelectContent>
                  {issueTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='severity'>Severity</Label>
              <Select
                value={formData.severity}
                onValueChange={value =>
                  setFormData(prev => ({
                    ...prev,
                    severity: value as IssueSeverity,
                  }))
                }
              >
                <SelectTrigger id='severity'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {issueSeverities.map(sev => {
                    const colorMap: Record<string, string> = {
                      low: 'bg-yellow-500',
                      medium: 'bg-orange-500',
                      high: 'bg-red-500',
                      critical: 'bg-red-700',
                    };
                    return (
                      <SelectItem key={sev.value} value={sev.value}>
                        <div className='flex items-center gap-2'>
                          <div
                            className={`h-2 w-2 rounded-full ${colorMap[sev.value]}`}
                          />
                          {sev.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Status field for edit mode */}
            {showStatusField && (
              <div className='grid gap-2'>
                <Label htmlFor='status'>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={value =>
                    setFormData(prev => ({
                      ...prev,
                      status: value as IssueStatus,
                    }))
                  }
                >
                  <SelectTrigger id='status'>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='open'>Open</SelectItem>
                    <SelectItem value='acknowledged'>Acknowledged</SelectItem>
                    <SelectItem value='in-progress'>In Progress</SelectItem>
                    <SelectItem value='resolved'>Resolved</SelectItem>
                    <SelectItem value='closed'>Closed</SelectItem>
                    <SelectItem value='cancelled'>Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className='grid gap-2'>
              <Label htmlFor='description'>Description *</Label>
              <Textarea
                id='description'
                placeholder='Describe the issue in detail...'
                value={formData.description}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={8}
                className='resize-none'
              />
              <p className='text-xs text-muted-foreground'>
                Please include relevant details such as when the issue occurred,
                what you were doing, and any error messages.
              </p>
            </div>

            {/* Advanced fields for edit mode */}
            {showAdvancedFields && (
              <>
                <div className='grid gap-2'>
                  <Label htmlFor='assignedTo'>Assigned To</Label>
                  <Input
                    id='assignedTo'
                    value={formData.assignedTo}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        assignedTo: e.target.value,
                      }))
                    }
                    placeholder='Technician or team member'
                  />
                </div>

                <div className='grid gap-2'>
                  <Label htmlFor='notes'>Notes</Label>
                  <Textarea
                    id='notes'
                    value={formData.notes}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, notes: e.target.value }))
                    }
                    placeholder='Additional notes or comments'
                    rows={3}
                  />
                </div>

                <div className='grid gap-2'>
                  <Label htmlFor='tags'>Tags</Label>
                  <Input
                    id='tags'
                    value={tagsInput}
                    onChange={e => setTagsInput(e.target.value)}
                    placeholder='Comma-separated tags'
                  />
                </div>
              </>
            )}

            {/* Attachments section for create mode */}
            {mode === 'create' && (
              <div className='grid gap-2'>
                <Label htmlFor='attachments'>Attachments (Optional)</Label>
                <div className='border-2 border-dashed rounded-lg p-6 text-center'>
                  <div className='flex flex-col items-center gap-2'>
                    <div className='flex gap-2'>
                      <Upload className='h-8 w-8 text-muted-foreground' />
                      <Camera className='h-8 w-8 text-muted-foreground' />
                    </div>
                    <div>
                      <p className='text-sm font-medium'>
                        Upload files or take photos
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        Drag and drop files here, or click to browse
                      </p>
                    </div>
                    <Button type='button' variant='outline' size='sm'>
                      Choose Files
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className='flex gap-2 pt-4'>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                    {mode === 'create' ? 'Creating...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save className='h-4 w-4 mr-2' />
                    {mode === 'create' ? 'Create Issue' : 'Save Changes'}
                  </>
                )}
              </Button>
              <Button type='button' variant='outline' onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
