import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Edit, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Asset } from '../../types';
import { useAssetMutations } from '../../hooks/useAssetDetails';
import {
  assetTypes,
  assetStatuses,
  getOptionValue,
} from '../../data/dropdownOptions';
import { mockAssets } from '../../data/mockData';

interface EditAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset;
  onAssetUpdate?: (updatedAsset: Asset) => void;
}

export function EditAssetDialog({
  open,
  onOpenChange,
  asset,
  onAssetUpdate,
}: EditAssetDialogProps) {
  const [name, setName] = useState(asset.name);
  const [type, setType] = useState(() => {
    // Convert asset type label to value for the select
    return getOptionValue(assetTypes, asset.type);
  });
  const [status, setStatus] = useState(() => {
    // Convert asset status to value for the select
    return getOptionValue(assetStatuses, asset.status);
  });
  const [assignedTo, setAssignedTo] = useState(asset.assignedTo || '');
  const [manufacturer, setManufacturer] = useState(asset.manufacturer || '');
  const [model, setModel] = useState(asset.model || '');
  const [serialNumber, setSerialNumber] = useState(asset.serialNumber || '');

  // Use mutation hook for updating asset
  const { updateAsset, loading } = useAssetMutations(asset.id);

  // Reset form when asset changes or dialog opens
  useEffect(() => {
    if (open) {
      setName(asset.name);
      setType(getOptionValue(assetTypes, asset.type));
      setStatus(getOptionValue(assetStatuses, asset.status));
      setAssignedTo(asset.assignedTo || '');
      setManufacturer(asset.manufacturer || '');
      setModel(asset.model || '');
      setSerialNumber(asset.serialNumber || '');
    }
  }, [open, asset]);

  const handleSave = async () => {
    try {
      // Get the label for the selected type and status
      const typeLabel = assetTypes.find(t => t.value === type)?.label || type;
      const statusValue =
        assetStatuses.find(s => s.value === status)?.value || status;

      const updatedAsset = await updateAsset({
        name,
        type: typeLabel,
        status: statusValue,
        assignedTo: assignedTo || undefined,
        manufacturer: manufacturer || undefined,
        model: model || undefined,
        serialNumber: serialNumber || undefined,
      });

      // Call the callback to update the asset in parent component
      if (onAssetUpdate) {
        onAssetUpdate(updatedAsset);
      }

      // Also update mock data for consistency across components
      const assetIndex = mockAssets.findIndex(a => a.id === asset.id);
      if (assetIndex !== -1) {
        Object.assign(mockAssets[assetIndex], updatedAsset);
      }

      toast.success('Asset updated successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update asset');
// // // // // // // console.error('Error updating asset:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <div className='flex items-center gap-3'>
            <div className='p-2 rounded-lg bg-primary/10'>
              <Edit className='h-5 w-5 text-primary' />
            </div>
            <div>
              <DialogTitle>Edit Asset</DialogTitle>
              <DialogDescription>Asset ID: {asset.id}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue='basic' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='basic'>Basic Info</TabsTrigger>
            <TabsTrigger value='specifications'>Specifications</TabsTrigger>
            <TabsTrigger value='assignment'>Assignment</TabsTrigger>
          </TabsList>

          <TabsContent value='basic' className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Asset Name</Label>
              <Input
                id='name'
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='type'>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder='Select type' />
                </SelectTrigger>
                <SelectContent position='popper' sideOffset={4}>
                  {assetTypes.map(assetType => (
                    <SelectItem key={assetType.value} value={assetType.value}>
                      {assetType.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='status'>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder='Select status' />
                </SelectTrigger>
                <SelectContent position='popper' sideOffset={4}>
                  {assetStatuses.map(assetStatus => (
                    <SelectItem
                      key={assetStatus.value}
                      value={assetStatus.value}
                    >
                      {assetStatus.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value='specifications' className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='manufacturer'>Manufacturer</Label>
                <Input
                  id='manufacturer'
                  value={manufacturer}
                  onChange={e => setManufacturer(e.target.value)}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='model'>Model</Label>
                <Input
                  id='model'
                  value={model}
                  onChange={e => setModel(e.target.value)}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='serial'>Serial Number</Label>
              <Input
                id='serial'
                value={serialNumber}
                onChange={e => setSerialNumber(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value='assignment' className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='assigned'>Assigned To</Label>
              <Input
                id='assigned'
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
                placeholder='Enter name or ID'
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
