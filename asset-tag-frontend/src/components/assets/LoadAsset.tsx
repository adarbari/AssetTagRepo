import React, { useState, useEffect } from &apos;react&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Label } from &apos;../ui/label&apos;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &apos;../ui/select&apos;;
import { Card, CardContent } from &apos;../ui/card&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import { PageHeader, LoadingState, PageLayout } from &apos;../common&apos;;
import { Truck, Package, Plus, X, AlertCircle } from &apos;lucide-react&apos;;
import { toast } from &apos;sonner&apos;;
import {
  fetchAvailableVehicles,
  fetchAvailableAssets,
  type DropdownOption,
} from &apos;../../services/configService&apos;;
import { Alert, AlertDescription } from &apos;../ui/alert&apos;;

interface LoadAssetProps {
  onBack: () => void;
  onAssetsLoaded?: (data: { vehicleId: string; assetIds: string[] }) => void;
  preselectedVehicleId?: string;
}

export function LoadAsset({
  onBack,
  onAssetsLoaded,
  preselectedVehicleId,
}: LoadAssetProps) {
  const [selectedVehicle, setSelectedVehicle] = useState(
    preselectedVehicleId || &apos;&apos;
  );
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [assetToAdd, setAssetToAdd] = useState(&apos;&apos;);

  // Configuration options
  const [vehicles, setVehicles] = useState<DropdownOption[]>([]);
  const [assets, setAssets] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Vehicle details (mocked - would come from API)
  const [vehicleCapacity, setVehicleCapacity] = useState<number | null>(null);

  useEffect(() => {
    loadConfigData();
  }, []);

  useEffect(() => {
    if (selectedVehicle) {
      // TODO: Fetch vehicle details from API
      // For now, mock capacity
      setVehicleCapacity(10);
    } else {
      setVehicleCapacity(null);
    }
  }, [selectedVehicle]);

  const loadConfigData = async () => {
    try {
      setLoading(true);
      const [vehiclesData, assetsData] = await Promise.all([
        fetchAvailableVehicles(),
        fetchAvailableAssets(),
      ]);

      setVehicles(vehiclesData);
      setAssets(assetsData);
    } catch (error) {
      // console.error(&apos;Error loading configuration data:&apos;, error);
      toast.error(&apos;Failed to load configuration data&apos;);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAsset = () => {
    if (!assetToAdd) {
      toast.error(&apos;Please select an asset to add&apos;);
      return;
    }

    if (selectedAssets.includes(assetToAdd)) {
      toast.error(&apos;Asset already added&apos;);
      return;
    }

    if (vehicleCapacity && selectedAssets.length >= vehicleCapacity) {
      toast.error(&apos;Vehicle capacity reached&apos;);
      return;
    }

    setSelectedAssets(prev => [...prev, assetToAdd]);
    setAssetToAdd(&apos;&apos;);
    toast.success(&apos;Asset added to load list&apos;);
  };

  const handleRemoveAsset = (assetId: string) => {
    setSelectedAssets(prev => prev.filter(id => id !== assetId));
    toast.success(&apos;Asset removed from load list&apos;);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedVehicle) {
      toast.error(&apos;Please select a vehicle&apos;);
      return;
    }

    if (selectedAssets.length === 0) {
      toast.error(&apos;Please add at least one asset to load&apos;);
      return;
    }

    try {
      // Create backend-ready object
      const loadData = {
        vehicleId: selectedVehicle,
        assetIds: selectedAssets,
        loadedAt: new Date().toISOString(),
        loadedBy: &apos;current-user&apos;, // Would come from auth context
      };

      // TODO: Replace with actual API call
      // await api.loadAssets(loadData);

      toast.success(&apos;Assets loaded successfully&apos;, {
        description: `${selectedAssets.length} asset(s) loaded onto vehicle`,
      });

      // console.log(&apos;Backend-ready load data:&apos;, loadData);

      if (onAssetsLoaded) {
        onAssetsLoaded({
          vehicleId: selectedVehicle,
          assetIds: selectedAssets,
        });
      }

      onBack();
    } catch (error) {
      // console.error(&apos;Error loading assets:&apos;, error);
      toast.error(&apos;Failed to load assets&apos;, {
        description: &apos;Please try again&apos;,
      });
    }
  };

  const getAssetLabel = (assetId: string): string => {
    return assets.find(a => a.value === assetId)?.label || assetId;
  };

  const getVehicleLabel = (vehicleId: string): string => {
    return vehicles.find(v => v.value === vehicleId)?.label || vehicleId;
  };

  // Filter out already selected assets
  const availableAssets = assets.filter(
    asset => !selectedAssets.includes(asset.value)
  );

  if (loading) {
    return <LoadingState message=&apos;Loading assets and vehicles...&apos; fullScreen />;
  }

  return (
    <PageLayout
      variant=&apos;narrow&apos;
      padding=&apos;md&apos;
      header={
        <PageHeader
          title=&apos;Load Assets&apos;
          description=&apos;Assign assets to a vehicle for transport or deployment&apos;
          onBack={onBack}
          actions={
            <Button type=&apos;submit&apos; form=&apos;load-asset-form&apos;>
              <Truck className=&apos;h-4 w-4 mr-2&apos; />
              Load Assets
            </Button>
          }
        />
      }
    >
      <form id=&apos;load-asset-form&apos; onSubmit={handleSubmit} className=&apos;space-y-6&apos;>
        {/* Vehicle Selection */}
        <Card>
          <CardContent className=&apos;pt-6 space-y-4&apos;>
            <h3>Select Vehicle</h3>

            <div className=&apos;space-y-2&apos;>
              <Label htmlFor=&apos;vehicle&apos;>Vehicle *</Label>
              <Select
                value={selectedVehicle}
                onValueChange={setSelectedVehicle}
                disabled={!!preselectedVehicleId}
              >
                <SelectTrigger id=&apos;vehicle&apos;>
                  <SelectValue placeholder=&apos;Select a vehicle&apos; />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map(vehicle => (
                    <SelectItem key={vehicle.value} value={vehicle.value}>
                      {vehicle.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {preselectedVehicleId && (
                <p className=&apos;text-sm text-muted-foreground&apos;>
                  Vehicle pre-selected from previous screen
                </p>
              )}
            </div>

            {selectedVehicle && vehicleCapacity && (
              <div className=&apos;p-3 bg-blue-50 border border-blue-200 rounded-md&apos;>
                <div className=&apos;flex items-center justify-between&apos;>
                  <span className=&apos;text-sm&apos;>Vehicle Capacity:</span>
                  <Badge variant=&apos;outline&apos;>
                    {selectedAssets.length} / {vehicleCapacity}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Asset Selection */}
        <Card>
          <CardContent className=&apos;pt-6 space-y-4&apos;>
            <div className=&apos;flex items-center justify-between&apos;>
              <h3>Add Assets</h3>
              <Badge variant=&apos;outline&apos;>
                {selectedAssets.length} asset
                {selectedAssets.length !== 1 ? &apos;s&apos; : &apos;&apos;} selected
              </Badge>
            </div>

            <div className=&apos;flex gap-2&apos;>
              <div className=&apos;flex-1&apos;>
                <Select value={assetToAdd} onValueChange={setAssetToAdd}>
                  <SelectTrigger>
                    <SelectValue placeholder=&apos;Select an asset to add&apos; />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAssets.length === 0 ? (
                      <div className=&apos;p-2 text-sm text-muted-foreground text-center&apos;>
                        No more assets available
                      </div>
                    ) : (
                      availableAssets.map(asset => (
                        <SelectItem key={asset.value} value={asset.value}>
                          {asset.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type=&apos;button&apos;
                onClick={handleAddAsset}
                disabled={
                  !assetToAdd ||
                  (vehicleCapacity !== null &&
                    selectedAssets.length >= vehicleCapacity)
                }
              >
                <Plus className=&apos;h-4 w-4 mr-2&apos; />
                Add
              </Button>
            </div>

            {vehicleCapacity && selectedAssets.length >= vehicleCapacity && (
              <Alert variant=&apos;destructive&apos;>
                <AlertCircle className=&apos;h-4 w-4&apos; />
                <AlertDescription>
                  Vehicle has reached maximum capacity ({vehicleCapacity}{&apos; &apos;}
                  assets)
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Selected Assets List */}
        {selectedAssets.length > 0 && (
          <Card>
            <CardContent className=&apos;pt-6 space-y-4&apos;>
              <h3>Assets to Load ({selectedAssets.length})</h3>

              <div className=&apos;space-y-2&apos;>
                {selectedAssets.map((assetId, index) => (
                  <div
                    key={assetId}
                    className=&apos;flex items-center justify-between p-3 bg-muted rounded-lg&apos;
                  >
                    <div className=&apos;flex items-center gap-3&apos;>
                      <Badge variant=&apos;outline&apos; className=&apos;w-8 justify-center&apos;>
                        {index + 1}
                      </Badge>
                      <div className=&apos;flex items-center gap-2&apos;>
                        <Package className=&apos;h-4 w-4 text-muted-foreground&apos; />
                        <span>{getAssetLabel(assetId)}</span>
                      </div>
                    </div>
                    <Button
                      type=&apos;button&apos;
                      variant=&apos;ghost&apos;
                      size=&apos;icon&apos;
                      onClick={() => handleRemoveAsset(assetId)}
                    >
                      <X className=&apos;h-4 w-4&apos; />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        {selectedVehicle && selectedAssets.length > 0 && (
          <Card className=&apos;bg-primary/5 border-primary/20&apos;>
            <CardContent className=&apos;pt-6&apos;>
              <h3 className=&apos;mb-4&apos;>Load Summary</h3>
              <div className=&apos;space-y-2&apos;>
                <div className=&apos;flex items-center justify-between&apos;>
                  <span className=&apos;text-muted-foreground&apos;>Vehicle:</span>
                  <span>{getVehicleLabel(selectedVehicle)}</span>
                </div>
                <div className=&apos;flex items-center justify-between&apos;>
                  <span className=&apos;text-muted-foreground&apos;>Total Assets:</span>
                  <Badge>{selectedAssets.length}</Badge>
                </div>
                {vehicleCapacity && (
                  <div className=&apos;flex items-center justify-between&apos;>
                    <span className=&apos;text-muted-foreground&apos;>
                      Capacity Used:
                    </span>
                    <span>
                      {Math.round(
                        (selectedAssets.length / vehicleCapacity) * 100
                      )}
                      %
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </PageLayout>
  );
}
