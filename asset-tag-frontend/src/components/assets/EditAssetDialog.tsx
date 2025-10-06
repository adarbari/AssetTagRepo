import React, { useState, useEffect } from &apos;react&apos;;
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from &apos;../ui/dialog&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Input } from &apos;../ui/input&apos;;
import { Label } from &apos;../ui/label&apos;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &apos;../ui/select&apos;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &apos;../ui/tabs&apos;;
import { Edit, Loader2 } from &apos;lucide-react&apos;;
import { toast } from &apos;sonner&apos;;
import type { Asset } from &apos;../../types&apos;;
import { useAssetMutations } from &apos;../../hooks/useAssetDetails&apos;;
import {
  assetTypes,
  assetStatuses,
  getOptionValue,
} from &apos;../../data/dropdownOptions&apos;;
import { mockAssets } from &apos;../../data/mockData&apos;;

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
  const [assignedTo, setAssignedTo] = useState(asset.assignedTo || &apos;&apos;);
  const [manufacturer, setManufacturer] = useState(asset.manufacturer || &apos;&apos;);
  const [model, setModel] = useState(asset.model || &apos;&apos;);
  const [serialNumber, setSerialNumber] = useState(asset.serialNumber || &apos;&apos;);

  // Use mutation hook for updating asset
  const { updateAsset, loading } = useAssetMutations(asset.id);

  // Reset form when asset changes or dialog opens
  useEffect(() => {
    if (open) {
      setName(asset.name);
      setType(getOptionValue(assetTypes, asset.type));
      setStatus(getOptionValue(assetStatuses, asset.status));
      setAssignedTo(asset.assignedTo || &apos;&apos;);
      setManufacturer(asset.manufacturer || &apos;&apos;);
      setModel(asset.model || &apos;&apos;);
      setSerialNumber(asset.serialNumber || &apos;&apos;);
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

      toast.success(&apos;Asset updated successfully&apos;);
      onOpenChange(false);
    } catch (error) {
      toast.error(&apos;Failed to update asset&apos;);
// // // // // // // console.error(&apos;Error updating asset:&apos;, error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=&apos;max-w-2xl max-h-[90vh] overflow-y-auto&apos;>
        <DialogHeader>
          <div className=&apos;flex items-center gap-3&apos;>
            <div className=&apos;p-2 rounded-lg bg-primary/10&apos;>
              <Edit className=&apos;h-5 w-5 text-primary&apos; />
            </div>
            <div>
              <DialogTitle>Edit Asset</DialogTitle>
              <DialogDescription>Asset ID: {asset.id}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue=&apos;basic&apos; className=&apos;space-y-4&apos;>
          <TabsList>
            <TabsTrigger value=&apos;basic&apos;>Basic Info</TabsTrigger>
            <TabsTrigger value=&apos;specifications&apos;>Specifications</TabsTrigger>
            <TabsTrigger value=&apos;assignment&apos;>Assignment</TabsTrigger>
          </TabsList>

          <TabsContent value=&apos;basic&apos; className=&apos;space-y-4&apos;>
            <div className=&apos;space-y-2&apos;>
              <Label htmlFor=&apos;name&apos;>Asset Name</Label>
              <Input
                id=&apos;name&apos;
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className=&apos;space-y-2&apos;>
              <Label htmlFor=&apos;type&apos;>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder=&apos;Select type&apos; />
                </SelectTrigger>
                <SelectContent position=&apos;popper&apos; sideOffset={4}>
                  {assetTypes.map(assetType => (
                    <SelectItem key={assetType.value} value={assetType.value}>
                      {assetType.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className=&apos;space-y-2&apos;>
              <Label htmlFor=&apos;status&apos;>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder=&apos;Select status&apos; />
                </SelectTrigger>
                <SelectContent position=&apos;popper&apos; sideOffset={4}>
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

          <TabsContent value=&apos;specifications&apos; className=&apos;space-y-4&apos;>
            <div className=&apos;grid grid-cols-2 gap-4&apos;>
              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;manufacturer&apos;>Manufacturer</Label>
                <Input
                  id=&apos;manufacturer&apos;
                  value={manufacturer}
                  onChange={e => setManufacturer(e.target.value)}
                />
              </div>

              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;model&apos;>Model</Label>
                <Input
                  id=&apos;model&apos;
                  value={model}
                  onChange={e => setModel(e.target.value)}
                />
              </div>
            </div>

            <div className=&apos;space-y-2&apos;>
              <Label htmlFor=&apos;serial&apos;>Serial Number</Label>
              <Input
                id=&apos;serial&apos;
                value={serialNumber}
                onChange={e => setSerialNumber(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value=&apos;assignment&apos; className=&apos;space-y-4&apos;>
            <div className=&apos;space-y-2&apos;>
              <Label htmlFor=&apos;assigned&apos;>Assigned To</Label>
              <Input
                id=&apos;assigned&apos;
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
                placeholder=&apos;Enter name or ID&apos;
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant=&apos;outline&apos;
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className=&apos;mr-2 h-4 w-4 animate-spin&apos; />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
