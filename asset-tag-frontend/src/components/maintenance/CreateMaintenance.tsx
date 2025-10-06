import { useState, useEffect } from 'react';
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
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Card, CardContent } from '../ui/card';
import { PageHeader, AssetContextCard, PageLayout } from '../common';
import { cn } from '../ui/utils';
import {
  Calendar as CalendarIcon,
  Wrench,
  History,
  ArrowLeft,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  maintenanceTypes,
  maintenancePriorities,
  technicians,
} from '../../data/dropdownOptions';
import { getAllAssets } from '../../data/mockData';
import type { Asset } from '../../types';

interface CreateMaintenanceProps {
  onBack: () => void;
  preSelectedAsset?: string;
  preSelectedAssetName?: string;
  assetContext?: Asset;
}

export function CreateMaintenance({
  onBack,
  preSelectedAsset,
  preSelectedAssetName,
  assetContext,
}: CreateMaintenanceProps) {
  const [selectedAsset, setSelectedAsset] = useState(preSelectedAsset || '');
  const [maintenanceType, setMaintenanceType] = useState('');
  const [priority, setPriority] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [description, setDescription] = useState('');
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [estimatedCost, setEstimatedCost] = useState('');

  useEffect(() => {
    // Load all assets for dropdown
    setAvailableAssets(getAllAssets());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !selectedAsset ||
      !maintenanceType ||
      !priority ||
      !assignedTo ||
      !scheduledDate
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    // TODO: Backend integration - save maintenance task
    // await api.createMaintenanceTask({ ... });

    toast.success('Maintenance scheduled successfully', {
      description: `Task created and logged to audit trail`,
    });

    onBack();
  };

  return (
    <PageLayout
      variant='narrow'
      padding='md'
      header={
        <PageHeader
          title='Schedule Maintenance'
          description='Create a new maintenance task for an asset'
          onBack={onBack}
          actions={
            <Button type='submit' form='create-maintenance-form'>
              <Wrench className='h-4 w-4 mr-2' />
              Schedule Task
            </Button>
          }
        />
      }
    >
      {/* Asset Context Card */}
      {(preSelectedAsset || assetContext) &&
        (preSelectedAssetName || assetContext?.name) && (
          <AssetContextCard
            assetId={assetContext?.id || preSelectedAsset || ''}
            assetName={assetContext?.name || preSelectedAssetName || ''}
            assetContext={assetContext}
            description='Scheduling maintenance for:'
            variant='compact'
          />
        )}

      {/* Main Form */}
      <Card>
        <CardContent className='pt-6'>
          <form
            id='create-maintenance-form'
            onSubmit={handleSubmit}
            className='space-y-6'
          >
            <div className='grid md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='asset'>Asset *</Label>
                <Select
                  value={selectedAsset}
                  onValueChange={setSelectedAsset}
                  disabled={!!preSelectedAsset}
                >
                  <SelectTrigger id='asset'>
                    <SelectValue placeholder='Select asset' />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAssets.map(asset => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.name} - {asset.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='type'>Maintenance Type *</Label>
                <Select
                  value={maintenanceType}
                  onValueChange={setMaintenanceType}
                >
                  <SelectTrigger id='type'>
                    <SelectValue placeholder='Select type' />
                  </SelectTrigger>
                  <SelectContent>
                    {maintenanceTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='grid md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='priority'>Priority *</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger id='priority'>
                    <SelectValue placeholder='Select priority' />
                  </SelectTrigger>
                  <SelectContent>
                    {maintenancePriorities.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='assigned'>Assign To *</Label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger id='assigned'>
                    <SelectValue placeholder='Select technician' />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians.map(tech => (
                      <SelectItem key={tech.value} value={tech.value}>
                        {tech.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='space-y-2'>
              <Label>Scheduled Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className={cn(
                      'w-full justify-start text-left',
                      !scheduledDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {scheduledDate
                      ? format(scheduledDate, 'PPP')
                      : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    initialFocus
                    disabled={date => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Task Description</Label>
              <Textarea
                id='description'
                placeholder='Describe the maintenance task, required parts, expected duration, etc.'
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='estimated-cost'>Estimated Cost (Optional)</Label>
              <Input
                id='estimated-cost'
                type='number'
                placeholder='0.00'
                value={estimatedCost}
                onChange={e => setEstimatedCost(e.target.value)}
                min='0'
                step='0.01'
              />
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Audit Trail Notice */}
      <Card className='bg-blue-50 border-blue-200'>
        <CardContent className='pt-6'>
          <div className='flex items-start gap-2'>
            <History className='h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0' />
            <p className='text-sm text-blue-900'>
              Creating this maintenance task will be logged in the audit trail
              with your user information and timestamp.
            </p>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
