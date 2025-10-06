import { useState, useEffect } from &apos;react&apos;;
import { Card, CardContent, CardHeader, CardTitle } from &apos;../ui/card&apos;;
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
import { Separator } from &apos;../ui/separator&apos;;
import {
  ArrowLeft,
  Circle,
  Pentagon,
  Save,
  MapPin,
  Shield,
} from &apos;lucide-react&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import { GeofenceMapEditor } from &apos;./GeofenceMapEditor&apos;;
import { PageLayout } from &apos;../common&apos;;

interface CreateGeofenceProps {
  onBack: () => void;
  onGeofenceCreated?: (geofenceId: string, siteId?: string) => void;
  onGeofenceUpdated?: (geofenceId: string, siteId?: string) => void;
  editMode?: boolean;
  existingGeofenceId?: string;
  initialData?: {
    siteId?: string;
    siteName?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    tolerance?: number;
    name?: string;
    alertOnEntry?: boolean;
    alertOnExit?: boolean;
  };
}

export function CreateGeofence({
  onBack,
  onGeofenceCreated,
  onGeofenceUpdated,
  editMode = false,
  existingGeofenceId,
  initialData,
}: CreateGeofenceProps) {
  const [name, setName] = useState(&apos;&apos;);
  const [geofenceType, setGeofenceType] = useState<&apos;authorized&apos; | &apos;restricted&apos;>(
    &apos;authorized&apos;
  );
  const [shape, setShape] = useState<&apos;circular&apos; | &apos;polygon&apos;>(&apos;circular&apos;);
  const [coordinates, setCoordinates] = useState({
    lat: 30.2672,
    lng: -97.7431,
    radius: 500,
  });
  const [tolerance, setTolerance] = useState(50);
  const [alertOnEntry, setAlertOnEntry] = useState(true);
  const [alertOnExit, setAlertOnExit] = useState(true);

  // Populate with initial data when provided (including from existing geofence)
  useEffect(() => {
    if (editMode && existingGeofenceId) {
      // Load existing geofence data
      import(&apos;../../data/mockData&apos;).then(({ getGeofenceById }) => {
        const geofence = getGeofenceById(existingGeofenceId);
        if (geofence) {
          setName(geofence.name);
          setGeofenceType(geofence.geofenceType || &apos;authorized&apos;);
          setShape(geofence.type);
          if (geofence.center) {
            setCoordinates({
              lat: geofence.center[0],
              lng: geofence.center[1],
              radius: geofence.radius || 500,
            });
          }
          if (geofence.tolerance !== undefined)
            setTolerance(geofence.tolerance);
          if (geofence.alertOnEntry !== undefined)
            setAlertOnEntry(geofence.alertOnEntry);
          if (geofence.alertOnExit !== undefined)
            setAlertOnExit(geofence.alertOnExit);
        }
      });
    } else if (initialData) {
      // Only auto-generate name if in create mode and name not provided
      if (!editMode && !initialData.name && initialData.siteName) {
        setName(`${initialData.siteName} Geofence`);
      } else if (initialData.name) {
        setName(initialData.name);
      }
      if (
        initialData.latitude !== undefined ||
        initialData.longitude !== undefined ||
        initialData.radius !== undefined
      ) {
        setCoordinates({
          lat: initialData.latitude ?? 30.2672,
          lng: initialData.longitude ?? -97.7431,
          radius: initialData.radius ?? 500,
        });
      }
      if (initialData.tolerance !== undefined)
        setTolerance(initialData.tolerance);
      if (initialData.alertOnEntry !== undefined)
        setAlertOnEntry(initialData.alertOnEntry);
      if (initialData.alertOnExit !== undefined)
        setAlertOnExit(initialData.alertOnExit);
    }
  }, [initialData, editMode, existingGeofenceId]);

  const handleSubmit = () => {
    const lat = coordinates.lat;
    const lng = coordinates.lng;
    const rad = coordinates.radius;

    if (editMode && existingGeofenceId) {
      // Update existing geofence
      import(&apos;../../data/mockData&apos;).then(({ updateGeofence }) => {
        const updates = {
          name: name || &apos;Unnamed Geofence&apos;,
          type: shape,
          center:
            shape === &apos;circular&apos; ? ([lat, lng] as [number, number]) : undefined,
          radius: shape === &apos;circular&apos; ? rad : undefined,
          tolerance,
          alertOnEntry,
          alertOnExit,
          geofenceType,
        };

        try {
          updateGeofence(existingGeofenceId, updates);

          // Notify parent component that geofence was updated
          if (onGeofenceUpdated) {
            onGeofenceUpdated(existingGeofenceId, initialData?.siteId);
          }

          // Show success notification
          import(&apos;sonner&apos;).then(({ toast }) => {
            toast.success(&apos;Geofence updated successfully&apos;);
          });

          onBack();
        } catch (error) {
// console.error(&apos;Error updating geofence:&apos;, error);
          import(&apos;sonner&apos;).then(({ toast }) => {
            toast.error(&apos;Failed to update geofence&apos;);
          });
        }
      });
    } else {
      // Create new geofence
      import(&apos;../../data/mockData&apos;).then(
        ({ createGeofence, generateGeofenceId }) => {
          const geofenceId = generateGeofenceId();

          const newGeofence = {
            id: geofenceId,
            name: name || &apos;Unnamed Geofence&apos;,
            type: shape,
            status: &apos;active&apos; as const,
            assets: 0,
            center:
              shape === &apos;circular&apos;
                ? ([lat, lng] as [number, number])
                : undefined,
            radius: shape === &apos;circular&apos; ? rad : undefined,
            siteId: initialData?.siteId,
            tolerance,
            alertOnEntry,
            alertOnExit,
            geofenceType,
          };

          try {
            createGeofence(newGeofence);

            // Notify parent component that geofence was created
            if (onGeofenceCreated) {
              onGeofenceCreated(geofenceId, initialData?.siteId);
            }

            // Show success notification
            import(&apos;sonner&apos;).then(({ toast }) => {
              toast.success(&apos;Geofence created successfully&apos;);
            });

            onBack();
          } catch (error) {
// console.error(&apos;Error creating geofence:&apos;, error);
            import(&apos;sonner&apos;).then(({ toast }) => {
              toast.error(&apos;Failed to create geofence&apos;);
            });
          }
        }
      );
    }
  };

  const getTypeColor = (typeValue: string) => {
    switch (typeValue) {
      case &apos;authorized&apos;:
        return &apos;bg-green-100 text-green-700 border-green-200&apos;;
      case &apos;restricted&apos;:
        return &apos;bg-red-100 text-red-700 border-red-200&apos;;
      case &apos;monitoring&apos;:
        return &apos;bg-blue-100 text-blue-700 border-blue-200&apos;;
      default:
        return &apos;bg-gray-100 text-gray-700 border-gray-200&apos;;
    }
  };

  return (
    <PageLayout variant=&apos;narrow&apos; padding=&apos;lg&apos;>
      {/* Header */}
      <div className=&apos;flex items-center justify-between&apos;>
        <div className=&apos;flex items-center gap-4&apos;>
          <Button variant=&apos;ghost&apos; size=&apos;icon&apos; onClick={onBack}>
            <ArrowLeft className=&apos;h-5 w-5&apos; />
          </Button>
          <div>
            <div className=&apos;flex items-center gap-3&apos;>
              <Shield className=&apos;h-6 w-6 text-blue-600&apos; />
              <h1>{editMode ? &apos;Edit Geofence&apos; : &apos;Create Geofence&apos;}</h1>
            </div>
            <p className=&apos;text-muted-foreground&apos;>
              {editMode
                ? `Editing geofence for ${initialData?.siteName || &apos;site&apos;}`
                : initialData?.siteName
                  ? `Creating geofence for ${initialData.siteName}`
                  : &apos;Define a geographic boundary for asset tracking and alerts&apos;}
            </p>
          </div>
        </div>
        <div className=&apos;flex items-center gap-3&apos;>
          <Button variant=&apos;outline&apos; onClick={onBack} size=&apos;lg&apos;>
            Cancel
          </Button>
          <Button onClick={handleSubmit} size=&apos;lg&apos;>
            <Save className=&apos;h-4 w-4 mr-2&apos; />
            {editMode ? &apos;Update Geofence&apos; : &apos;Create Geofence&apos;}
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <Card>
        <CardContent className=&apos;pt-6&apos;>
          <div className=&apos;flex items-center gap-6&apos;>
            <div className=&apos;flex-1&apos;>
              <div className=&apos;flex items-center gap-2 mb-2&apos;>
                <h4>Geofence Summary</h4>
                <Badge variant=&apos;outline&apos; className={getTypeColor(geofenceType)}>
                  {geofenceType}
                </Badge>
              </div>
              <div className=&apos;grid grid-cols-4 gap-4 text-sm&apos;>
                <div>
                  <p className=&apos;text-muted-foreground&apos;>Name</p>
                  <p>{name || &apos;Not set&apos;}</p>
                </div>
                <div>
                  <p className=&apos;text-muted-foreground&apos;>Shape</p>
                  <p className=&apos;capitalize&apos;>{shape}</p>
                </div>
                {shape === &apos;circular&apos; && (
                  <div>
                    <p className=&apos;text-muted-foreground&apos;>Radius</p>
                    <p>{coordinates.radius} feet</p>
                  </div>
                )}
                <div>
                  <p className=&apos;text-muted-foreground&apos;>Alerts</p>
                  <p>
                    {alertOnEntry && alertOnExit
                      ? &apos;Entry & Exit&apos;
                      : alertOnEntry
                        ? &apos;Entry only&apos;
                        : alertOnExit
                          ? &apos;Exit only&apos;
                          : &apos;None&apos;}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue=&apos;details&apos; className=&apos;space-y-6&apos;>
        <TabsList>
          <TabsTrigger value=&apos;details&apos;>Details</TabsTrigger>
          <TabsTrigger value=&apos;location&apos;>Location & Boundary</TabsTrigger>
          <TabsTrigger value=&apos;alerts&apos;>Alert Rules</TabsTrigger>
        </TabsList>

        <TabsContent value=&apos;details&apos; className=&apos;space-y-6&apos;>
          <Card>
            <CardHeader>
              <CardTitle>Geofence Details</CardTitle>
            </CardHeader>
            <CardContent className=&apos;space-y-6&apos;>
              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;name&apos;>Geofence Name</Label>
                <Input
                  id=&apos;name&apos;
                  placeholder=&apos;e.g., Construction Site A&apos;
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;type&apos;>Type</Label>
                <Select
                  value={geofenceType}
                  onValueChange={(v: &apos;authorized&apos; | &apos;restricted&apos;) =>
                    setGeofenceType(v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=&apos;authorized&apos;>Authorized Zone</SelectItem>
                    <SelectItem value=&apos;restricted&apos;>Restricted Zone</SelectItem>
                  </SelectContent>
                </Select>
                <p className=&apos;text-xs text-muted-foreground&apos;>
                  {geofenceType === &apos;authorized&apos; &&
                    &apos;Assets are expected to be in this zone&apos;}
                  {geofenceType === &apos;restricted&apos; &&
                    &apos;Assets should not enter this zone&apos;}
                </p>
              </div>

              <Separator />

              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;shape&apos;>Shape</Label>
                <Select
                  value={shape}
                  onValueChange={(v: &apos;circular&apos; | &apos;polygon&apos;) => setShape(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=&apos;circular&apos;>
                      <div className=&apos;flex items-center gap-2&apos;>
                        <Circle className=&apos;h-4 w-4&apos; />
                        Circular
                      </div>
                    </SelectItem>
                    <SelectItem value=&apos;polygon&apos;>
                      <div className=&apos;flex items-center gap-2&apos;>
                        <Pentagon className=&apos;h-4 w-4&apos; />
                        Polygon
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {shape === &apos;circular&apos; && (
                <div className=&apos;space-y-2&apos;>
                  <Label htmlFor=&apos;radius&apos;>Radius (feet)</Label>
                  <div className=&apos;space-y-3&apos;>
                    <Input
                      id=&apos;radius&apos;
                      type=&apos;number&apos;
                      placeholder=&apos;500&apos;
                      value={coordinates.radius}
                      onChange={e =>
                        setCoordinates(prev => ({
                          ...prev,
                          radius: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                    <input
                      type=&apos;range&apos;
                      min=&apos;50&apos;
                      max=&apos;2000&apos;
                      step=&apos;10&apos;
                      value={coordinates.radius}
                      onChange={e =>
                        setCoordinates(prev => ({
                          ...prev,
                          radius: parseInt(e.target.value),
                        }))
                      }
                      className=&apos;w-full&apos;
                    />
                  </div>
                </div>
              )}

              {initialData?.siteId && (
                <div className=&apos;p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg&apos;>
                  <div className=&apos;flex items-start gap-3&apos;>
                    <MapPin className=&apos;h-5 w-5 text-blue-600 mt-0.5&apos; />
                    <div>
                      <p className=&apos;text-sm&apos;>
                        <strong>Linked to Site:</strong> {initialData.siteName}
                      </p>
                      <p className=&apos;text-xs text-muted-foreground mt-1&apos;>
                        This geofence will be associated with the selected site
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value=&apos;location&apos; className=&apos;space-y-6&apos;>
          <Card>
            <CardHeader>
              <CardTitle>Location & Boundary</CardTitle>
            </CardHeader>
            <CardContent className=&apos;space-y-4&apos;>
              <GeofenceMapEditor
                coordinates={coordinates}
                tolerance={tolerance}
                name={name || &apos;Geofence&apos;}
                isEditing={true}
                onCoordinatesChange={setCoordinates}
                onToleranceChange={setTolerance}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value=&apos;alerts&apos; className=&apos;space-y-6&apos;>
          <Card>
            <CardHeader>
              <CardTitle>Alert Configuration</CardTitle>
            </CardHeader>
            <CardContent className=&apos;space-y-4&apos;>
              <div className=&apos;flex items-center justify-between p-4 border rounded-lg&apos;>
                <div className=&apos;flex-1&apos;>
                  <h4>Entry Alerts</h4>
                  <p className=&apos;text-sm text-muted-foreground&apos;>
                    Notify when assets enter this geofence
                  </p>
                </div>
                <input
                  type=&apos;checkbox&apos;
                  checked={alertOnEntry}
                  onChange={e => setAlertOnEntry(e.target.checked)}
                  className=&apos;h-5 w-5&apos;
                />
              </div>

              <div className=&apos;flex items-center justify-between p-4 border rounded-lg&apos;>
                <div className=&apos;flex-1&apos;>
                  <h4>Exit Alerts</h4>
                  <p className=&apos;text-sm text-muted-foreground&apos;>
                    Notify when assets leave this geofence
                  </p>
                </div>
                <input
                  type=&apos;checkbox&apos;
                  checked={alertOnExit}
                  onChange={e => setAlertOnExit(e.target.checked)}
                  className=&apos;h-5 w-5&apos;
                />
              </div>

              <Separator />

              <div className=&apos;p-4 bg-muted rounded-lg&apos;>
                <h4 className=&apos;mb-2&apos;>Advanced Alert Rules</h4>
                <p className=&apos;text-sm text-muted-foreground&apos;>
                  Additional alert rules such as dwell time alerts, specific
                  asset alerts, and schedule-based notifications can be
                  configured after creating the geofence in the Geofences
                  management page.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
