import React, { useState, useEffect } from &apos;react&apos;;
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
import { Switch } from &apos;../ui/switch&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import { Card, CardContent } from &apos;../ui/card&apos;;
import { PageHeader, LoadingState, PageLayout } from &apos;../common&apos;;
import { Package, X } from &apos;lucide-react&apos;;
import { toast } from &apos;sonner&apos;;
import {
  fetchConfig,
  fetchAvailableSites,
  fetchAvailableGeofences,
  type BackendAsset,
} from &apos;../../services/configService&apos;;
import type { DropdownOption } from &apos;../../data/dropdownOptions&apos;;
import { addAsset } from &apos;../../data/mockData&apos;;

interface CreateAssetProps {
  onBack: () => void;
  onAssetCreated?: (asset: any) => void;
}

export function CreateAsset({ onBack, onAssetCreated }: CreateAssetProps) {
  // Form state
  const [assetName, setAssetName] = useState(&apos;&apos;);
  const [barcodeRfid, setBarcodeRfid] = useState(&apos;&apos;);
  const [owner, setOwner] = useState(&apos;&apos;);
  const [assetType, setAssetType] = useState(&apos;&apos;);
  const [project, setProject] = useState(&apos;&apos;);
  const [cost, setCost] = useState(&apos;&apos;);
  const [inMotion, setInMotion] = useState(false);
  const [offHourMovement, setOffHourMovement] = useState(false);
  const [site, setSite] = useState(&apos;&apos;);
  const [geofenceBoundary, setGeofenceBoundary] = useState(&apos;&apos;);
  const [notificationChannels, setNotificationChannels] = useState<string[]>(
    []
  );
  const [lostItemMechanism, setLostItemMechanism] = useState(&apos;&apos;);
  const [manufacturer, setManufacturer] = useState(&apos;&apos;);
  const [model, setModel] = useState(&apos;&apos;);
  const [serialNumber, setSerialNumber] = useState(&apos;&apos;);

  // Configuration options from backend
  const [assetTypes, setAssetTypes] = useState<DropdownOption[]>([]);
  const [assetOwners, setAssetOwners] = useState<DropdownOption[]>([]);
  const [projects, setProjects] = useState<DropdownOption[]>([]);
  const [availableSites, setAvailableSites] = useState<DropdownOption[]>([]);
  const [availableGeofences, setAvailableGeofences] = useState<
    DropdownOption[]
  >([]);
  const [lostItemMechanisms, setLostItemMechanisms] = useState<
    DropdownOption[]
  >([]);
  const [availabilityOptions, setAvailabilityOptions] = useState<
    DropdownOption[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [hourlyRate, setHourlyRate] = useState(&apos;&apos;);
  const [availability, setAvailability] = useState(&apos;available&apos;);

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
        fetchConfig(&apos;assetTypes&apos;),
        fetchConfig(&apos;assetOwners&apos;),
        fetchConfig(&apos;projects&apos;),
        fetchAvailableSites(),
        fetchAvailableGeofences(),
        fetchConfig(&apos;lostItemMechanisms&apos;),
        fetchConfig(&apos;assetAvailability&apos;),
      ]);

      setAssetTypes(typesData);
      setAssetOwners(ownersData);
      setProjects(projectsData);
      setAvailableSites(sitesData);
      setAvailableGeofences(geofencesData);
      setLostItemMechanisms(mechanismsData);
      setAvailabilityOptions(availabilityData);
    } catch (error) {
// // // // // // // console.error(&apos;Error loading configuration data:&apos;, error);
      toast.error(&apos;Failed to load configuration data&apos;);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!assetName || !barcodeRfid || !assetType) {
      toast.error(&apos;Please fill in all required fields&apos;);
      return;
    }

    try {
      // Create backend-ready object
      const backendAsset: BackendAsset = {
        name: assetName,
        barcodeRfid,
        type: assetType,
        owner: owner || undefined,
        project: project !== &apos;none&apos; ? project : undefined,
        cost: cost ? parseFloat(cost) : undefined,
        manufacturer: manufacturer || undefined,
        model: model || undefined,
        serialNumber: serialNumber || barcodeRfid,
        site: site !== &apos;no-site&apos; ? site : undefined,
        geofence:
          geofenceBoundary !== &apos;no-boundary&apos; ? geofenceBoundary : undefined,
        inMotionTracking: inMotion,
        offHourMovementAlert: offHourMovement,
        notificationChannels:
          notificationChannels.length > 0 ? notificationChannels : undefined,
        lostItemMechanism: lostItemMechanism || undefined,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        availability: availability || undefined,
        createdAt: new Date().toISOString(),
        metadata: {
          // Any additional fields that don&apos;t fit the schema
        },
      };

      // TODO: Replace with actual API call
      // const response = await api.createAsset(backendAsset);
      // const createdAsset = response.data;

      // For now, use mock data function
      const assetTypeLabel =
        assetTypes.find(t => t.value === assetType)?.label || assetType;
      const ownerLabel =
        assetOwners.find(o => o.value === owner)?.label ||
        owner ||
        &apos;Unassigned&apos;;
      const siteLabel =
        site && site !== &apos;no-site&apos;
          ? availableSites.find(s => s.value === site)?.label || &apos;&apos;
          : &apos;&apos;;

      const newAsset = addAsset({
        name: assetName,
        type: assetTypeLabel,
        status: &apos;active&apos; as const,
        location: siteLabel || &apos;Unassigned&apos;,
        site: siteLabel,
        lastSeen: &apos;Just now&apos;,
        battery: 100,
        assignedTo: ownerLabel,
        serialNumber: serialNumber || barcodeRfid,
        manufacturer: manufacturer || &apos;N/A&apos;,
        model: model || &apos;N/A&apos;,
        purchaseDate: new Date().toISOString().split(&apos;T&apos;)[0],
        coordinates: [37.7749, -122.4194],
        temperature: 70,
        movement: &apos;stationary&apos; as const,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        availability: (availability as any) || &apos;available&apos;,
      });

      toast.success(&apos;Asset created successfully&apos;, {
        description: `${assetName} has been added to the inventory`,
      });

      // Log backend-ready object for reference
// // // // // // // console.log(&apos;Backend-ready asset object:&apos;, backendAsset);

      if (onAssetCreated) {
        onAssetCreated(newAsset);
      }

      onBack();
    } catch (error) {
// // // // // // // console.error(&apos;Error creating asset:&apos;, error);
      toast.error(&apos;Failed to create asset&apos;, {
        description: &apos;Please try again&apos;,
      });
    }
  };

  const toggleNotificationChannel = (channel: string) => {
    setNotificationChannels(prev =>
      prev.includes(channel)
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  if (loading) {
    return <LoadingState message=&apos;Loading configuration...&apos; fullScreen />;
  }

  return (
    <PageLayout
      variant=&apos;narrow&apos;
      padding=&apos;md&apos;
      header={
        <PageHeader
          title=&apos;Add New Asset&apos;
          description=&apos;Register a new asset to the tracking system&apos;
          onBack={onBack}
          actions={
            <Button type=&apos;submit&apos; form=&apos;create-asset-form&apos;>
              <Package className=&apos;h-4 w-4 mr-2&apos; />
              Add Asset
            </Button>
          }
        />
      }
    >
      <form
        id=&apos;create-asset-form&apos;
        onSubmit={handleSubmit}
        className=&apos;space-y-6&apos;
      >
        {/* Basic Information */}
        <Card>
          <CardContent className=&apos;pt-6 space-y-4&apos;>
            <h3>Basic Information</h3>

            <div className=&apos;space-y-2&apos;>
              <Label htmlFor=&apos;asset-name&apos;>Asset Name *</Label>
              <Input
                id=&apos;asset-name&apos;
                placeholder=&apos;Enter asset name&apos;
                value={assetName}
                onChange={e => setAssetName(e.target.value)}
                required
              />
            </div>

            <div className=&apos;space-y-2&apos;>
              <Label htmlFor=&apos;barcode&apos;>Barcode / RFID Tag *</Label>
              <Input
                id=&apos;barcode&apos;
                placeholder=&apos;Enter barcode or RFID tag number&apos;
                value={barcodeRfid}
                onChange={e => setBarcodeRfid(e.target.value)}
                required
              />
            </div>

            <div className=&apos;grid gap-4 md:grid-cols-2&apos;>
              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;owner&apos;>Owner / Assigned To</Label>
                <Select value={owner} onValueChange={setOwner}>
                  <SelectTrigger id=&apos;owner&apos;>
                    <SelectValue placeholder=&apos;Select owner&apos; />
                  </SelectTrigger>
                  <SelectContent>
                    {assetOwners.map(ownerOption => (
                      <SelectItem
                        key={ownerOption.value}
                        value={ownerOption.value}
                      >
                        {ownerOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;type&apos;>Asset Type *</Label>
                <Select value={assetType} onValueChange={setAssetType} required>
                  <SelectTrigger id=&apos;type&apos;>
                    <SelectValue placeholder=&apos;Select asset type&apos; />
                  </SelectTrigger>
                  <SelectContent>
                    {assetTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className=&apos;grid gap-4 md:grid-cols-3&apos;>
              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;manufacturer&apos;>Manufacturer</Label>
                <Input
                  id=&apos;manufacturer&apos;
                  placeholder=&apos;e.g., Caterpillar&apos;
                  value={manufacturer}
                  onChange={e => setManufacturer(e.target.value)}
                />
              </div>

              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;model&apos;>Model</Label>
                <Input
                  id=&apos;model&apos;
                  placeholder=&apos;e.g., 320 GC&apos;
                  value={model}
                  onChange={e => setModel(e.target.value)}
                />
              </div>

              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;serial&apos;>Serial Number</Label>
                <Input
                  id=&apos;serial&apos;
                  placeholder=&apos;Serial number&apos;
                  value={serialNumber}
                  onChange={e => setSerialNumber(e.target.value)}
                />
              </div>
            </div>

            <div className=&apos;grid gap-4 md:grid-cols-2&apos;>
              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;project&apos;>Project / Work Order</Label>
                <Select value={project} onValueChange={setProject}>
                  <SelectTrigger id=&apos;project&apos;>
                    <SelectValue placeholder=&apos;Select project (optional)&apos; />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(proj => (
                      <SelectItem key={proj.value} value={proj.value}>
                        {proj.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;cost&apos;>Cost (USD)</Label>
                <Input
                  id=&apos;cost&apos;
                  type=&apos;number&apos;
                  placeholder=&apos;0.00&apos;
                  value={cost}
                  onChange={e => setCost(e.target.value)}
                  min=&apos;0&apos;
                  step=&apos;0.01&apos;
                />
              </div>
            </div>

            <div className=&apos;grid gap-4 md:grid-cols-2&apos;>
              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;hourly-rate&apos;>Hourly Rate (USD)</Label>
                <Input
                  id=&apos;hourly-rate&apos;
                  type=&apos;number&apos;
                  placeholder=&apos;0.00&apos;
                  value={hourlyRate}
                  onChange={e => setHourlyRate(e.target.value)}
                  min=&apos;0&apos;
                  step=&apos;0.01&apos;
                />
                <p className=&apos;text-sm text-muted-foreground&apos;>
                  Rental or usage cost per hour
                </p>
              </div>

              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;availability&apos;>Availability Status</Label>
                <Select value={availability} onValueChange={setAvailability}>
                  <SelectTrigger id=&apos;availability&apos;>
                    <SelectValue placeholder=&apos;Select availability&apos; />
                  </SelectTrigger>
                  <SelectContent>
                    {availabilityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className=&apos;text-sm text-muted-foreground&apos;>
                  Current availability for job assignment
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tracking Settings */}
        <Card>
          <CardContent className=&apos;pt-6 space-y-4&apos;>
            <h3>Tracking Settings</h3>

            <div className=&apos;space-y-2&apos;>
              <Label htmlFor=&apos;site&apos;>Assigned Site</Label>
              <Select value={site} onValueChange={setSite}>
                <SelectTrigger id=&apos;site&apos;>
                  <SelectValue placeholder=&apos;Select a site (optional)&apos; />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=&apos;no-site&apos;>No Site</SelectItem>
                  {availableSites.map(siteOption => (
                    <SelectItem key={siteOption.value} value={siteOption.value}>
                      {siteOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className=&apos;text-sm text-muted-foreground&apos;>
                Select the physical site where this asset is located
              </p>
            </div>

            <div className=&apos;space-y-2&apos;>
              <Label htmlFor=&apos;geofence&apos;>Geo-location Boundary</Label>
              <Select
                value={geofenceBoundary}
                onValueChange={setGeofenceBoundary}
              >
                <SelectTrigger id=&apos;geofence&apos;>
                  <SelectValue placeholder=&apos;Select a geofence (optional)&apos; />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=&apos;no-boundary&apos;>No Boundary</SelectItem>
                  {availableGeofences.map(geofence => (
                    <SelectItem key={geofence.value} value={geofence.value}>
                      {geofence.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className=&apos;text-sm text-muted-foreground&apos;>
                Optional: Define a specific zone within the site
              </p>
            </div>

            <div className=&apos;space-y-3&apos;>
              <div className=&apos;flex items-center justify-between&apos;>
                <div className=&apos;space-y-0.5&apos;>
                  <Label htmlFor=&apos;in-motion&apos;>In-Motion Tracking</Label>
                  <p className=&apos;text-sm text-muted-foreground&apos;>
                    Enable real-time movement detection
                  </p>
                </div>
                <Switch
                  id=&apos;in-motion&apos;
                  checked={inMotion}
                  onCheckedChange={setInMotion}
                />
              </div>

              <div className=&apos;flex items-center justify-between&apos;>
                <div className=&apos;space-y-0.5&apos;>
                  <Label htmlFor=&apos;off-hour&apos;>Off-Hour Movement Alert</Label>
                  <p className=&apos;text-sm text-muted-foreground&apos;>
                    Alert when asset moves outside business hours
                  </p>
                </div>
                <Switch
                  id=&apos;off-hour&apos;
                  checked={offHourMovement}
                  onCheckedChange={setOffHourMovement}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardContent className=&apos;pt-6 space-y-4&apos;>
            <h3>Notification Settings</h3>

            <div className=&apos;space-y-2&apos;>
              <Label>Notification Channels</Label>
              <p className=&apos;text-sm text-muted-foreground&apos;>
                Select how you want to be notified about this asset
              </p>
              <div className=&apos;flex flex-wrap gap-2 pt-2&apos;>
                {[&apos;email&apos;, &apos;sms&apos;, &apos;push&apos;, &apos;webhook&apos;].map(channel => (
                  <Badge
                    key={channel}
                    variant={
                      notificationChannels.includes(channel)
                        ? &apos;default&apos;
                        : &apos;outline&apos;
                    }
                    className=&apos;cursor-pointer&apos;
                    onClick={() => toggleNotificationChannel(channel)}
                  >
                    {notificationChannels.includes(channel) && (
                      <X className=&apos;h-3 w-3 mr-1&apos; />
                    )}
                    {channel.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>

            <div className=&apos;space-y-2&apos;>
              <Label htmlFor=&apos;lost-mechanism&apos;>
                Lost Item Notification Mechanism
              </Label>
              <Select
                value={lostItemMechanism}
                onValueChange={setLostItemMechanism}
              >
                <SelectTrigger id=&apos;lost-mechanism&apos;>
                  <SelectValue placeholder=&apos;Select notification trigger&apos; />
                </SelectTrigger>
                <SelectContent>
                  {lostItemMechanisms.map(mechanism => (
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
