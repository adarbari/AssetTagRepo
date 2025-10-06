import React, { useState, useEffect } from &apos;react&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Input } from &apos;../ui/input&apos;;
import { Label } from &apos;../ui/label&apos;;
import { Textarea } from &apos;../ui/textarea&apos;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &apos;../ui/select&apos;;
import { Calendar } from &apos;../ui/calendar&apos;;
import { Popover, PopoverContent, PopoverTrigger } from &apos;../ui/popover&apos;;
import { Card, CardContent } from &apos;../ui/card&apos;;
import { PageHeader, AssetContextCard, PageLayout } from &apos;../common&apos;;
import { cn } from &apos;../ui/utils&apos;;
import { Calendar as CalendarIcon, Wrench, History } from &apos;lucide-react&apos;;
import { format } from &apos;date-fns&apos;;
import { toast } from &apos;sonner&apos;;
import {
  maintenanceTypes,
  maintenancePriorities,
  technicians,
} from &apos;../../data/dropdownOptions&apos;;
import { getAllAssets } from &apos;../../data/mockData&apos;;
import type { Asset } from &apos;../../types&apos;;

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
  const [selectedAsset, setSelectedAsset] = useState(preSelectedAsset || &apos;&apos;);
  const [maintenanceType, setMaintenanceType] = useState(&apos;&apos;);
  const [priority, setPriority] = useState(&apos;&apos;);
  const [assignedTo, setAssignedTo] = useState(&apos;&apos;);
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [description, setDescription] = useState(&apos;&apos;);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [estimatedCost, setEstimatedCost] = useState(&apos;&apos;);

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
      toast.error(&apos;Please fill in all required fields&apos;);
      return;
    }

    // TODO: Backend integration - save maintenance task
    // await api.createMaintenanceTask({ ... });

    toast.success(&apos;Maintenance scheduled successfully&apos;, {
      description: `Task created and logged to audit trail`,
    });

    onBack();
  };

  return (
    <PageLayout
      variant=&apos;narrow&apos;
      padding=&apos;md&apos;
      header={
        <PageHeader
          title=&apos;Schedule Maintenance&apos;
          description=&apos;Create a new maintenance task for an asset&apos;
          onBack={onBack}
          actions={
            <Button type=&apos;submit&apos; form=&apos;create-maintenance-form&apos;>
              <Wrench className=&apos;h-4 w-4 mr-2&apos; />
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
            assetId={assetContext?.id || preSelectedAsset || &apos;&apos;}
            assetName={assetContext?.name || preSelectedAssetName || &apos;&apos;}
            assetContext={assetContext}
            description=&apos;Scheduling maintenance for:&apos;
            variant=&apos;compact&apos;
          />
        )}

      {/* Main Form */}
      <Card>
        <CardContent className=&apos;pt-6&apos;>
          <form
            id=&apos;create-maintenance-form&apos;
            onSubmit={handleSubmit}
            className=&apos;space-y-6&apos;
          >
            <div className=&apos;grid md:grid-cols-2 gap-4&apos;>
              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;asset&apos;>Asset *</Label>
                <Select
                  value={selectedAsset}
                  onValueChange={setSelectedAsset}
                  disabled={!!preSelectedAsset}
                >
                  <SelectTrigger id=&apos;asset&apos;>
                    <SelectValue placeholder=&apos;Select asset&apos; />
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

              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;type&apos;>Maintenance Type *</Label>
                <Select
                  value={maintenanceType}
                  onValueChange={setMaintenanceType}
                >
                  <SelectTrigger id=&apos;type&apos;>
                    <SelectValue placeholder=&apos;Select type&apos; />
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

            <div className=&apos;grid md:grid-cols-2 gap-4&apos;>
              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;priority&apos;>Priority *</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger id=&apos;priority&apos;>
                    <SelectValue placeholder=&apos;Select priority&apos; />
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

              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;assigned&apos;>Assign To *</Label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger id=&apos;assigned&apos;>
                    <SelectValue placeholder=&apos;Select technician&apos; />
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

            <div className=&apos;space-y-2&apos;>
              <Label>Scheduled Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant=&apos;outline&apos;
                    className={cn(
                      &apos;w-full justify-start text-left&apos;,
                      !scheduledDate && &apos;text-muted-foreground&apos;
                    )}
                  >
                    <CalendarIcon className=&apos;mr-2 h-4 w-4&apos; />
                    {scheduledDate
                      ? format(scheduledDate, &apos;PPP&apos;)
                      : &apos;Pick a date&apos;}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className=&apos;w-auto p-0&apos; align=&apos;start&apos;>
                  <Calendar
                    mode=&apos;single&apos;
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    initialFocus
                    disabled={date => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className=&apos;space-y-2&apos;>
              <Label htmlFor=&apos;description&apos;>Task Description</Label>
              <Textarea
                id=&apos;description&apos;
                placeholder=&apos;Describe the maintenance task, required parts, expected duration, etc.&apos;
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className=&apos;space-y-2&apos;>
              <Label htmlFor=&apos;estimated-cost&apos;>Estimated Cost (Optional)</Label>
              <Input
                id=&apos;estimated-cost&apos;
                type=&apos;number&apos;
                placeholder=&apos;0.00&apos;
                value={estimatedCost}
                onChange={e => setEstimatedCost(e.target.value)}
                min=&apos;0&apos;
                step=&apos;0.01&apos;
              />
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Audit Trail Notice */}
      <Card className=&apos;bg-blue-50 border-blue-200&apos;>
        <CardContent className=&apos;pt-6&apos;>
          <div className=&apos;flex items-start gap-2&apos;>
            <History className=&apos;h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0&apos; />
            <p className=&apos;text-sm text-blue-900&apos;>
              Creating this maintenance task will be logged in the audit trail
              with your user information and timestamp.
            </p>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
