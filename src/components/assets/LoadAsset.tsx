import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { PageHeader, LoadingState } from "../common";
import { Truck, Package, ArrowLeft, Plus, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  fetchAvailableVehicles,
  fetchAvailableAssets,
  type DropdownOption,
} from "../../services/configService";
import { Alert, AlertDescription } from "../ui/alert";

interface LoadAssetProps {
  onBack: () => void;
  onAssetsLoaded?: (data: { vehicleId: string; assetIds: string[] }) => void;
  preselectedVehicleId?: string;
}

export function LoadAsset({ onBack, onAssetsLoaded, preselectedVehicleId }: LoadAssetProps) {
  const [selectedVehicle, setSelectedVehicle] = useState(preselectedVehicleId || "");
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [assetToAdd, setAssetToAdd] = useState("");
  
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
      console.error("Error loading configuration data:", error);
      toast.error("Failed to load configuration data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAsset = () => {
    if (!assetToAdd) {
      toast.error("Please select an asset to add");
      return;
    }

    if (selectedAssets.includes(assetToAdd)) {
      toast.error("Asset already added");
      return;
    }

    if (vehicleCapacity && selectedAssets.length >= vehicleCapacity) {
      toast.error("Vehicle capacity reached");
      return;
    }

    setSelectedAssets((prev) => [...prev, assetToAdd]);
    setAssetToAdd("");
    toast.success("Asset added to load list");
  };

  const handleRemoveAsset = (assetId: string) => {
    setSelectedAssets((prev) => prev.filter((id) => id !== assetId));
    toast.success("Asset removed from load list");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedVehicle) {
      toast.error("Please select a vehicle");
      return;
    }

    if (selectedAssets.length === 0) {
      toast.error("Please add at least one asset to load");
      return;
    }

    try {
      // Create backend-ready object
      const loadData = {
        vehicleId: selectedVehicle,
        assetIds: selectedAssets,
        loadedAt: new Date().toISOString(),
        loadedBy: "current-user", // Would come from auth context
      };

      // TODO: Replace with actual API call
      // await api.loadAssets(loadData);

      toast.success("Assets loaded successfully", {
        description: `${selectedAssets.length} asset(s) loaded onto vehicle`,
      });

      console.log("Backend-ready load data:", loadData);

      if (onAssetsLoaded) {
        onAssetsLoaded({ vehicleId: selectedVehicle, assetIds: selectedAssets });
      }

      onBack();
    } catch (error) {
      console.error("Error loading assets:", error);
      toast.error("Failed to load assets", {
        description: "Please try again",
      });
    }
  };

  const getAssetLabel = (assetId: string): string => {
    return assets.find((a) => a.value === assetId)?.label || assetId;
  };

  const getVehicleLabel = (vehicleId: string): string => {
    return vehicles.find((v) => v.value === vehicleId)?.label || vehicleId;
  };

  // Filter out already selected assets
  const availableAssets = assets.filter((asset) => !selectedAssets.includes(asset.value));

  if (loading) {
    return <LoadingState message="Loading assets and vehicles..." fullScreen />;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <PageHeader
        title="Load Assets"
        description="Assign assets to a vehicle for transport or deployment"
        onBack={onBack}
        actions={
          <Button type="submit" form="load-asset-form">
            <Truck className="h-4 w-4 mr-2" />
            Load Assets
          </Button>
        }
      />

      {/* Form Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-3xl mx-auto">
          <form id="load-asset-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Vehicle Selection */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3>Select Vehicle</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="vehicle">Vehicle *</Label>
                  <Select 
                    value={selectedVehicle} 
                    onValueChange={setSelectedVehicle}
                    disabled={!!preselectedVehicleId}
                  >
                    <SelectTrigger id="vehicle">
                      <SelectValue placeholder="Select a vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.value} value={vehicle.value}>
                          {vehicle.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {preselectedVehicleId && (
                    <p className="text-sm text-muted-foreground">
                      Vehicle pre-selected from previous screen
                    </p>
                  )}
                </div>

                {selectedVehicle && vehicleCapacity && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Vehicle Capacity:</span>
                      <Badge variant="outline">
                        {selectedAssets.length} / {vehicleCapacity}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Asset Selection */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3>Add Assets</h3>
                  <Badge variant="outline">
                    {selectedAssets.length} asset{selectedAssets.length !== 1 ? 's' : ''} selected
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select value={assetToAdd} onValueChange={setAssetToAdd}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an asset to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableAssets.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            No more assets available
                          </div>
                        ) : (
                          availableAssets.map((asset) => (
                            <SelectItem key={asset.value} value={asset.value}>
                              {asset.label}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    type="button" 
                    onClick={handleAddAsset}
                    disabled={!assetToAdd || (vehicleCapacity !== null && selectedAssets.length >= vehicleCapacity)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                {vehicleCapacity && selectedAssets.length >= vehicleCapacity && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Vehicle has reached maximum capacity ({vehicleCapacity} assets)
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Selected Assets List */}
            {selectedAssets.length > 0 && (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <h3>Assets to Load ({selectedAssets.length})</h3>
                  
                  <div className="space-y-2">
                    {selectedAssets.map((assetId, index) => (
                      <div
                        key={assetId}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-8 justify-center">
                            {index + 1}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span>{getAssetLabel(assetId)}</span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAsset(assetId)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Summary */}
            {selectedVehicle && selectedAssets.length > 0 && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <h3 className="mb-4">Load Summary</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Vehicle:</span>
                      <span>{getVehicleLabel(selectedVehicle)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Assets:</span>
                      <Badge>{selectedAssets.length}</Badge>
                    </div>
                    {vehicleCapacity && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Capacity Used:</span>
                        <span>{Math.round((selectedAssets.length / vehicleCapacity) * 100)}%</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
