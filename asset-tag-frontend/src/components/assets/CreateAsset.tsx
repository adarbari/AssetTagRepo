import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { PageHeader, LoadingState, PageLayout } from "../common";
import { Package, ArrowLeft, X } from "lucide-react";
import { toast } from "sonner";
import {
  fetchConfig,
  fetchAvailableSites,
  fetchAvailableGeofences,
  type BackendAsset,
} from "../../services/configService";
import type { DropdownOption } from "../../data/dropdownOptions";
import { addAsset } from "../../data/mockData";

interface CreateAssetProps {
  onBack: () => void;
  onAssetCreated?: (asset: any) => void;
}

export function CreateAsset({ onBack, onAssetCreated }: CreateAssetProps) {
  // Form state
  const [assetName, setAssetName] = useState("");
  const [barcodeRfid, setBarcodeRfid] = useState("");
  const [owner, setOwner] = useState("");
  const [assetType, setAssetType] = useState("");
  const [project, setProject] = useState("");
  const [cost, setCost] = useState("");
  const [inMotion, setInMotion] = useState(false);
  const [offHourMovement, setOffHourMovement] = useState(false);
  const [site, setSite] = useState("");
  const [geofenceBoundary, setGeofenceBoundary] = useState("");
  const [notificationChannels, setNotificationChannels] = useState<string[]>([]);
  const [lostItemMechanism, setLostItemMechanism] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");

  // Configuration options from backend
  const [assetTypes, setAssetTypes] = useState<DropdownOption[]>([]);
  const [assetOwners, setAssetOwners] = useState<DropdownOption[]>([]);
  const [projects, setProjects] = useState<DropdownOption[]>([]);
  const [availableSites, setAvailableSites] = useState<DropdownOption[]>([]);
  const [availableGeofences, setAvailableGeofences] = useState<DropdownOption[]>([]);
  const [lostItemMechanisms, setLostItemMechanisms] = useState<DropdownOption[]>([]);
  const [availabilityOptions, setAvailabilityOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [hourlyRate, setHourlyRate] = useState("");
  const [availability, setAvailability] = useState("available");

  useEffect(() => {
    loadConfigData();
  }, []);

  const loadConfigData = async () => {
    try {
      setLoading(true);
      // Load all dropdown options from backend/config service
      const [
        typesData,
        ownersData,
        projectsData,
        sitesData,
        geofencesData,
        mechanismsData,
        availabilityData,
      ] = await Promise.all([
        fetchConfig("assetTypes"),
        fetchConfig("assetOwners"),
        fetchConfig("projects"),
        fetchAvailableSites(),
        fetchAvailableGeofences(),
        fetchConfig("lostItemMechanisms"),
        fetchConfig("assetAvailability"),
      ]);

      setAssetTypes(typesData);
      setAssetOwners(ownersData);
      setProjects(projectsData);
      setAvailableSites(sitesData);
      setAvailableGeofences(geofencesData);
      setLostItemMechanisms(mechanismsData);
      setAvailabilityOptions(availabilityData);
    } catch (error) {
      console.error("Error loading configuration data:", error);
      toast.error("Failed to load configuration data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!assetName || !barcodeRfid || !assetType) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Create backend-ready object
      const backendAsset: BackendAsset = {
        name: assetName,
        barcodeRfid,
        type: assetType,
        owner: owner || undefined,
        project: project !== "none" ? project : undefined,
        cost: cost ? parseFloat(cost) : undefined,
        manufacturer: manufacturer || undefined,
        model: model || undefined,
        serialNumber: serialNumber || barcodeRfid,
        site: site !== "no-site" ? site : undefined,
        geofence: geofenceBoundary !== "no-boundary" ? geofenceBoundary : undefined,
        inMotionTracking: inMotion,
        offHourMovementAlert: offHourMovement,
        notificationChannels: notificationChannels.length > 0 ? notificationChannels : undefined,
        lostItemMechanism: lostItemMechanism || undefined,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        availability: availability || undefined,
        createdAt: new Date().toISOString(),
        metadata: {
          // Any additional fields that don't fit the schema
        },
      };

      // TODO: Replace with actual API call
      // const response = await api.createAsset(backendAsset);
      // const createdAsset = response.data;

      // For now, use mock data function
      const assetTypeLabel = assetTypes.find(t => t.value === assetType)?.label || assetType;
      const ownerLabel = assetOwners.find(o => o.value === owner)?.label || owner || "Unassigned";
      const siteLabel = (site && site !== "no-site") ? availableSites.find(s => s.value === site)?.label || "" : "";

      const newAsset = addAsset({
        name: assetName,
        type: assetTypeLabel,
        status: "active" as const,
        location: siteLabel || "Unassigned",
        site: siteLabel,
        lastSeen: "Just now",
        battery: 100,
        assignedTo: ownerLabel,
        serialNumber: serialNumber || barcodeRfid,
        manufacturer: manufacturer || "N/A",
        model: model || "N/A",
        purchaseDate: new Date().toISOString().split('T')[0],
        coordinates: [37.7749, -122.4194],
        temperature: 70,
        movement: "stationary" as const,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        availability: (availability as any) || "available",
      });

      toast.success("Asset created successfully", {
        description: `${assetName} has been added to the inventory`,
      });

      // Log backend-ready object for reference
      console.log("Backend-ready asset object:", backendAsset);

      if (onAssetCreated) {
        onAssetCreated(newAsset);
      }

      onBack();
    } catch (error) {
      console.error("Error creating asset:", error);
      toast.error("Failed to create asset", {
        description: "Please try again",
      });
    }
  };

  const toggleNotificationChannel = (channel: string) => {
    setNotificationChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel]
    );
  };

  if (loading) {
    return <LoadingState message="Loading configuration..." fullScreen />;
  }

  return (
    <PageLayout 
      variant="narrow" 
      padding="md"
      header={
        <PageHeader
          title="Add New Asset"
          description="Register a new asset to the tracking system"
          onBack={onBack}
          actions={
            <Button type="submit" form="create-asset-form">
              <Package className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
          }
        />
      }
    >
      <form id="create-asset-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3>Basic Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="asset-name">Asset Name *</Label>
                  <Input
                    id="asset-name"
                    placeholder="Enter asset name"
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode / RFID Tag *</Label>
                  <Input
                    id="barcode"
                    placeholder="Enter barcode or RFID tag number"
                    value={barcodeRfid}
                    onChange={(e) => setBarcodeRfid(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="owner">Owner / Assigned To</Label>
                    <Select value={owner} onValueChange={setOwner}>
                      <SelectTrigger id="owner">
                        <SelectValue placeholder="Select owner" />
                      </SelectTrigger>
                      <SelectContent>
                        {assetOwners.map((ownerOption) => (
                          <SelectItem key={ownerOption.value} value={ownerOption.value}>
                            {ownerOption.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Asset Type *</Label>
                    <Select value={assetType} onValueChange={setAssetType} required>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select asset type" />
                      </SelectTrigger>
                      <SelectContent>
                        {assetTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="manufacturer">Manufacturer</Label>
                    <Input
                      id="manufacturer"
                      placeholder="e.g., Caterpillar"
                      value={manufacturer}
                      onChange={(e) => setManufacturer(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      placeholder="e.g., 320 GC"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serial">Serial Number</Label>
                    <Input
                      id="serial"
                      placeholder="Serial number"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="project">Project / Work Order</Label>
                    <Select value={project} onValueChange={setProject}>
                      <SelectTrigger id="project">
                        <SelectValue placeholder="Select project (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((proj) => (
                          <SelectItem key={proj.value} value={proj.value}>
                            {proj.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cost">Cost (USD)</Label>
                    <Input
                      id="cost"
                      type="number"
                      placeholder="0.00"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="hourly-rate">Hourly Rate (USD)</Label>
                    <Input
                      id="hourly-rate"
                      type="number"
                      placeholder="0.00"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      min="0"
                      step="0.01"
                    />
                    <p className="text-sm text-muted-foreground">
                      Rental or usage cost per hour
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availability">Availability Status</Label>
                    <Select value={availability} onValueChange={setAvailability}>
                      <SelectTrigger id="availability">
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        {availabilityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Current availability for job assignment
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tracking Settings */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3>Tracking Settings</h3>

                <div className="space-y-2">
                  <Label htmlFor="site">Assigned Site</Label>
                  <Select value={site} onValueChange={setSite}>
                    <SelectTrigger id="site">
                      <SelectValue placeholder="Select a site (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-site">No Site</SelectItem>
                      {availableSites.map((siteOption) => (
                        <SelectItem key={siteOption.value} value={siteOption.value}>
                          {siteOption.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Select the physical site where this asset is located
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="geofence">Geo-location Boundary</Label>
                  <Select value={geofenceBoundary} onValueChange={setGeofenceBoundary}>
                    <SelectTrigger id="geofence">
                      <SelectValue placeholder="Select a geofence (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-boundary">No Boundary</SelectItem>
                      {availableGeofences.map((geofence) => (
                        <SelectItem key={geofence.value} value={geofence.value}>
                          {geofence.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Optional: Define a specific zone within the site
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="in-motion">In-Motion Tracking</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable real-time movement detection
                      </p>
                    </div>
                    <Switch
                      id="in-motion"
                      checked={inMotion}
                      onCheckedChange={setInMotion}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="off-hour">Off-Hour Movement Alert</Label>
                      <p className="text-sm text-muted-foreground">
                        Alert when asset moves outside business hours
                      </p>
                    </div>
                    <Switch
                      id="off-hour"
                      checked={offHourMovement}
                      onCheckedChange={setOffHourMovement}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3>Notification Settings</h3>

                <div className="space-y-2">
                  <Label>Notification Channels</Label>
                  <p className="text-sm text-muted-foreground">
                    Select how you want to be notified about this asset
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {["email", "sms", "push", "webhook"].map((channel) => (
                      <Badge
                        key={channel}
                        variant={
                          notificationChannels.includes(channel)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => toggleNotificationChannel(channel)}
                      >
                        {notificationChannels.includes(channel) && (
                          <X className="h-3 w-3 mr-1" />
                        )}
                        {channel.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lost-mechanism">Lost Item Notification Mechanism</Label>
                  <Select value={lostItemMechanism} onValueChange={setLostItemMechanism}>
                    <SelectTrigger id="lost-mechanism">
                      <SelectValue placeholder="Select notification trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      {lostItemMechanisms.map((mechanism) => (
                        <SelectItem key={mechanism.value} value={mechanism.value}>
                          {mechanism.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
      </form>
    </PageLayout>
  );
}
