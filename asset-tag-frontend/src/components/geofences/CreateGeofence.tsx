import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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
import { Separator } from '../ui/separator';
import {
  ArrowLeft,
  Circle,
  Pentagon,
  Save,
  MapPin,
  Shield,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { GeofenceMapEditor } from './GeofenceMapEditor';
import { PageLayout } from '../common';

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
  const [name, setName] = useState('');
  const [geofenceType, setGeofenceType] = useState<'authorized' | 'restricted'>(
    'authorized'
  );
  const [shape, setShape] = useState<'circular' | 'polygon'>('circular');
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
      import('../../data/mockData').then(({ getGeofenceById }) => {
        const geofence = getGeofenceById(existingGeofenceId);
        if (geofence) {
          setName(geofence.name);
          setGeofenceType(geofence.geofenceType || 'authorized');
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
      import('../../data/mockData').then(({ updateGeofence }) => {
        const updates = {
          name: name || 'Unnamed Geofence',
          type: shape,
          center:
            shape === 'circular' ? ([lat, lng] as [number, number]) : undefined,
          radius: shape === 'circular' ? rad : undefined,
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
          import('sonner').then(({ toast }) => {
            toast.success('Geofence updated successfully');
          });

          onBack();
        } catch (error) {
          console.error('Error updating geofence:', error);
          import('sonner').then(({ toast }) => {
            toast.error('Failed to update geofence');
          });
        }
      });
    } else {
      // Create new geofence
      import('../../data/mockData').then(
        ({ createGeofence, generateGeofenceId }) => {
          const geofenceId = generateGeofenceId();

          const newGeofence = {
            id: geofenceId,
            name: name || 'Unnamed Geofence',
            type: shape,
            status: 'active' as const,
            assets: 0,
            center:
              shape === 'circular'
                ? ([lat, lng] as [number, number])
                : undefined,
            radius: shape === 'circular' ? rad : undefined,
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
            import('sonner').then(({ toast }) => {
              toast.success('Geofence created successfully');
            });

            onBack();
          } catch (error) {
            console.error('Error creating geofence:', error);
            import('sonner').then(({ toast }) => {
              toast.error('Failed to create geofence');
            });
          }
        }
      );
    }
  };

  const getTypeColor = (typeValue: string) => {
    switch (typeValue) {
      case 'authorized':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'restricted':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'monitoring':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <PageLayout variant='narrow' padding='lg'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='icon' onClick={onBack}>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div>
            <div className='flex items-center gap-3'>
              <Shield className='h-6 w-6 text-blue-600' />
              <h1>{editMode ? 'Edit Geofence' : 'Create Geofence'}</h1>
            </div>
            <p className='text-muted-foreground'>
              {editMode
                ? `Editing geofence for ${initialData?.siteName || 'site'}`
                : initialData?.siteName
                  ? `Creating geofence for ${initialData.siteName}`
                  : 'Define a geographic boundary for asset tracking and alerts'}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <Button variant='outline' onClick={onBack} size='lg'>
            Cancel
          </Button>
          <Button onClick={handleSubmit} size='lg'>
            <Save className='h-4 w-4 mr-2' />
            {editMode ? 'Update Geofence' : 'Create Geofence'}
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex items-center gap-6'>
            <div className='flex-1'>
              <div className='flex items-center gap-2 mb-2'>
                <h4>Geofence Summary</h4>
                <Badge variant='outline' className={getTypeColor(geofenceType)}>
                  {geofenceType}
                </Badge>
              </div>
              <div className='grid grid-cols-4 gap-4 text-sm'>
                <div>
                  <p className='text-muted-foreground'>Name</p>
                  <p>{name || 'Not set'}</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Shape</p>
                  <p className='capitalize'>{shape}</p>
                </div>
                {shape === 'circular' && (
                  <div>
                    <p className='text-muted-foreground'>Radius</p>
                    <p>{coordinates.radius} feet</p>
                  </div>
                )}
                <div>
                  <p className='text-muted-foreground'>Alerts</p>
                  <p>
                    {alertOnEntry && alertOnExit
                      ? 'Entry & Exit'
                      : alertOnEntry
                        ? 'Entry only'
                        : alertOnExit
                          ? 'Exit only'
                          : 'None'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue='details' className='space-y-6'>
        <TabsList>
          <TabsTrigger value='details'>Details</TabsTrigger>
          <TabsTrigger value='location'>Location & Boundary</TabsTrigger>
          <TabsTrigger value='alerts'>Alert Rules</TabsTrigger>
        </TabsList>

        <TabsContent value='details' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Geofence Details</CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Geofence Name</Label>
                <Input
                  id='name'
                  placeholder='e.g., Construction Site A'
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='type'>Type</Label>
                <Select
                  value={geofenceType}
                  onValueChange={(v: 'authorized' | 'restricted') =>
                    setGeofenceType(v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='authorized'>Authorized Zone</SelectItem>
                    <SelectItem value='restricted'>Restricted Zone</SelectItem>
                  </SelectContent>
                </Select>
                <p className='text-xs text-muted-foreground'>
                  {geofenceType === 'authorized' &&
                    'Assets are expected to be in this zone'}
                  {geofenceType === 'restricted' &&
                    'Assets should not enter this zone'}
                </p>
              </div>

              <Separator />

              <div className='space-y-2'>
                <Label htmlFor='shape'>Shape</Label>
                <Select
                  value={shape}
                  onValueChange={(v: 'circular' | 'polygon') => setShape(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='circular'>
                      <div className='flex items-center gap-2'>
                        <Circle className='h-4 w-4' />
                        Circular
                      </div>
                    </SelectItem>
                    <SelectItem value='polygon'>
                      <div className='flex items-center gap-2'>
                        <Pentagon className='h-4 w-4' />
                        Polygon
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {shape === 'circular' && (
                <div className='space-y-2'>
                  <Label htmlFor='radius'>Radius (feet)</Label>
                  <div className='space-y-3'>
                    <Input
                      id='radius'
                      type='number'
                      placeholder='500'
                      value={coordinates.radius}
                      onChange={e =>
                        setCoordinates(prev => ({
                          ...prev,
                          radius: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                    <input
                      type='range'
                      min='50'
                      max='2000'
                      step='10'
                      value={coordinates.radius}
                      onChange={e =>
                        setCoordinates(prev => ({
                          ...prev,
                          radius: parseInt(e.target.value),
                        }))
                      }
                      className='w-full'
                    />
                  </div>
                </div>
              )}

              {initialData?.siteId && (
                <div className='p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
                  <div className='flex items-start gap-3'>
                    <MapPin className='h-5 w-5 text-blue-600 mt-0.5' />
                    <div>
                      <p className='text-sm'>
                        <strong>Linked to Site:</strong> {initialData.siteName}
                      </p>
                      <p className='text-xs text-muted-foreground mt-1'>
                        This geofence will be associated with the selected site
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='location' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Location & Boundary</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <GeofenceMapEditor
                coordinates={coordinates}
                tolerance={tolerance}
                name={name || 'Geofence'}
                isEditing={true}
                onCoordinatesChange={setCoordinates}
                onToleranceChange={setTolerance}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='alerts' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Alert Configuration</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between p-4 border rounded-lg'>
                <div className='flex-1'>
                  <h4>Entry Alerts</h4>
                  <p className='text-sm text-muted-foreground'>
                    Notify when assets enter this geofence
                  </p>
                </div>
                <input
                  type='checkbox'
                  checked={alertOnEntry}
                  onChange={e => setAlertOnEntry(e.target.checked)}
                  className='h-5 w-5'
                />
              </div>

              <div className='flex items-center justify-between p-4 border rounded-lg'>
                <div className='flex-1'>
                  <h4>Exit Alerts</h4>
                  <p className='text-sm text-muted-foreground'>
                    Notify when assets leave this geofence
                  </p>
                </div>
                <input
                  type='checkbox'
                  checked={alertOnExit}
                  onChange={e => setAlertOnExit(e.target.checked)}
                  className='h-5 w-5'
                />
              </div>

              <Separator />

              <div className='p-4 bg-muted rounded-lg'>
                <h4 className='mb-2'>Advanced Alert Rules</h4>
                <p className='text-sm text-muted-foreground'>
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
