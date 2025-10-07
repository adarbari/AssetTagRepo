import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { StatusBadge, PageLayout } from '../common';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Slider } from '../ui/slider';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  Search,
  Layers,
  Maximize2,
  MapPin,
  Navigation,
  Truck,
  Wrench,
  Package as PackageIcon,
  Container,
  Battery,
  Clock,
  X,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Calendar as CalendarIcon,
  Activity,
} from 'lucide-react';
import { format } from 'date-fns';
import type {
  Asset as SharedAsset,
  Geofence as SharedGeofence,
} from '../../types';
import {
  mockAssets as sharedMockAssets,
  mockGeofences as sharedMockGeofences,
} from '../../data/mockData';

// Local types for this component
type AssetStatus = 'active' | 'idle' | 'in-transit' | 'offline';
type AssetType = 'tools' | 'vehicles' | 'equipment' | 'containers';
type TimeMode = 'live' | 'today' | 'custom';

interface Asset {
  id: string;
  name: string;
  type: AssetType;
  lat: number;
  lng: number;
  status: AssetStatus;
  battery: number;
  lastUpdate: string;
}

interface LocationPoint {
  timestamp: string;
  lat: number;
  lng: number;
  speed: number;
  battery: number;
  event?: string;
}

interface AssetDisplayState {
  id: string;
  state: 'live' | 'focused' | 'context';
  historicalPath?: LocationPoint[];
  color: string;
  opacity: number;
  currentPosition?: LocationPoint;
}

interface Site {
  id: string;
  name: string;
  center: [number, number];
  radius: number;
}

// Convert shared assets to local format for map display
const mockAssets: Asset[] = sharedMockAssets
  .filter(asset => asset.coordinates && asset.coordinates.length >= 2)
  .map(asset => ({
    id: asset.id,
    name: asset.name,
    type: asset.type.toLowerCase().includes('vehicle')
      ? 'vehicles'
      : asset.type.toLowerCase().includes('tool')
        ? 'tools'
        : asset.type.toLowerCase().includes('container')
          ? 'containers'
          : 'equipment',
    lat: asset.coordinates?.[0] || 0,
    lng: asset.coordinates?.[1] || 0,
    status: asset.status as AssetStatus,
    battery: asset.battery,
    lastUpdate: asset.lastSeen,
  }));

const mockSites: Site[] = [
  {
    id: 'ST-1',
    name: 'Main Warehouse',
    center: [37.7849, -122.4194],
    radius: 100,
  },
  {
    id: 'ST-2',
    name: 'Construction Site B',
    center: [37.7649, -122.4194],
    radius: 150,
  },
];

// Generate mock historical data
const generateHistoricalData = (assetId: string, startDate: Date): LocationPoint[] => {
  const points: LocationPoint[] = [];
  const baseLat = 37.7749 + (Math.random() - 0.5) * 0.01;
  const baseLng = -122.4194 + (Math.random() - 0.5) * 0.01;
  
  for (let i = 0; i < 100; i++) {
    const timestamp = new Date(startDate.getTime() + i * 60000); // 1 minute intervals
    points.push({
      timestamp: timestamp.toISOString(),
      lat: baseLat + (Math.random() - 0.5) * 0.005,
      lng: baseLng + (Math.random() - 0.5) * 0.005,
      speed: Math.random() * 50,
      battery: Math.max(0, 100 - i * 0.5),
      event: Math.random() > 0.95 ? 'battery_low' : undefined,
    });
  }
  
  return points;
};

// Asset colors for historical paths
const getAssetColor = (assetId: string): string => {
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
  const index = assetId.charCodeAt(assetId.length - 1) % colors.length;
  return colors[index];
};

interface UnifiedAssetMapProps {
  onAssetClick?: (asset: SharedAsset) => void;
  onTrackHistory?: (asset: SharedAsset) => void;
  highlightAsset?: SharedAsset | null;
  onClearHighlight?: () => void;
  onBack?: () => void;
  filteredAssetIds?: string[];
  violationMode?: boolean;
  violatingGeofenceId?: string;
  expectedAssetIds?: string[];
  actualAssetIds?: string[];
}

export function UnifiedAssetMap({
  onAssetClick,
  onTrackHistory,
  highlightAsset,
  onClearHighlight,
  onBack,
  filteredAssetIds,
  violationMode = false,
  violatingGeofenceId,
  expectedAssetIds,
  actualAssetIds,
}: UnifiedAssetMapProps = {}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<unknown[]>([]);
  const pathLinesRef = useRef<unknown[]>([]);
  const leafletRef = useRef<any>(null);
  const isMountedRef = useRef<boolean>(true);

  // Core state
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [timeMode, setTimeMode] = useState<TimeMode>('live');
  const [customStartDate, setCustomStartDate] = useState<Date>(new Date());
  const [customEndDate, setCustomEndDate] = useState<Date>(new Date());
  
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState('1');
  
  // Map state
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showGeofences, setShowGeofences] = useState(true);
  const [showClusters, setShowClusters] = useState(true);
  const [showSites, setShowSites] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInitFailed, setMapInitFailed] = useState(false);
  
  // Historical data
  const [historicalData, setHistoricalData] = useState<Map<string, LocationPoint[]>>(new Map());

  // Reset mounted ref on component mount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Track mapRef changes
  useEffect(() => {
    if (mapRef.current) {
      // Map div is ready
    }
  }, [mapRef.current]);

  // Helper functions
  const findSharedAsset = (localAsset: Asset): SharedAsset | undefined => {
    return sharedMockAssets.find(a => a.id === localAsset.id);
  };

  const toLocalAsset = (sharedAsset: SharedAsset): Asset | null => {
    if (!sharedAsset.coordinates || sharedAsset.coordinates.length < 2)
      return null;
    return {
      id: sharedAsset.id,
      name: sharedAsset.name,
      type: sharedAsset.type as AssetType,
      lat: sharedAsset.coordinates[0],
      lng: sharedAsset.coordinates[1],
      status: sharedAsset.status as AssetStatus,
      battery: sharedAsset.battery,
      lastUpdate: sharedAsset.lastSeen,
    };
  };

  // Get asset display states based on current selection and time mode
  const getAssetDisplayStates = (): AssetDisplayState[] => {
    return mockAssets.map(asset => {
      const isFocused = selectedAssets.includes(asset.id);
      const hasHistoricalData = timeMode !== 'live' && isFocused;
      
      return {
        id: asset.id,
        state: isFocused ? 'focused' : 'context',
        historicalPath: hasHistoricalData ? historicalData.get(asset.id) : undefined,
        color: getAssetColor(asset.id),
        opacity: isFocused ? 1.0 : 0.5,
        currentPosition: {
          timestamp: new Date().toISOString(),
          lat: asset.lat,
          lng: asset.lng,
          speed: 0,
          battery: asset.battery,
        },
      };
    });
  };

  // Filter assets based on search and filters
  const filteredAssets = mockAssets.filter(asset => {
    const matchesSearch = searchText === '' || 
      asset.name.toLowerCase().includes(searchText.toLowerCase()) ||
      asset.id.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesType = typeFilter === 'all' || asset.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    const matchesFilter = !filteredAssetIds || filteredAssetIds.includes(asset.id);
    
    return matchesSearch && matchesType && matchesStatus && matchesFilter;
  });

  // Load historical data for selected assets
  useEffect(() => {
    if (timeMode !== 'live' && selectedAssets.length > 0) {
      const newHistoricalData = new Map<string, LocationPoint[]>();
      
      selectedAssets.forEach(assetId => {
        const startDate = timeMode === 'today' 
          ? new Date(new Date().setHours(0, 0, 0, 0))
          : customStartDate;
        
        newHistoricalData.set(assetId, generateHistoricalData(assetId, startDate));
      });
      
      setHistoricalData(newHistoricalData);
      setCurrentIndex(0);
    }
  }, [selectedAssets, timeMode, customStartDate]);

  // Initialize map
  useEffect(() => {
    if (mapLoaded) return;

    const initMap = async () => {
      try {
        // Wait for mapRef to be available
        if (!mapRef.current) {
          setTimeout(initMap, 100);
          return;
        }

        // Load Leaflet CSS
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Import Leaflet
        const L = await import('leaflet');
        leafletRef.current = L;

        // Fix for default marker icons
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet/dist/images/marker-shadow.png',
        });

        // Remove existing map if any
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        // Create map
        const map = L.map(mapRef.current).setView([37.7749, -122.4194], 13);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
        }).addTo(map);

        mapInstanceRef.current = map;
        setMapLoaded(true);

        // Invalidate size after a short delay
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 100);

      } catch (error) {
        console.error('Failed to initialize map:', error);
        setMapInitFailed(true);
      }
    };

    initMap();

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map visualization
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !leafletRef.current) return;

    const L = leafletRef.current;

    // Clear existing markers and paths
    markersRef.current.forEach(marker => {
      if (marker && typeof marker === 'object' && 'remove' in marker) {
        (marker as any).remove();
      }
    });
    markersRef.current = [];

    pathLinesRef.current.forEach(path => {
      if (path && typeof path === 'object' && 'remove' in path) {
        (path as any).remove();
      }
    });
    pathLinesRef.current = [];

    const assetStates = getAssetDisplayStates();

    // Add asset markers and paths
    assetStates.forEach(assetState => {
      const asset = mockAssets.find(a => a.id === assetState.id);
      if (!asset) return;

      // Add current position marker
      const marker = L.marker([asset.lat, asset.lng], {
        opacity: assetState.opacity,
      }).addTo(mapInstanceRef.current);

      // Customize marker based on state
      if (assetState.state === 'focused') {
        marker.setIcon(L.divIcon({
          className: 'custom-marker focused',
          html: `<div style="background-color: ${assetState.color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        }));
      } else {
        marker.setIcon(L.divIcon({
          className: 'custom-marker context',
          html: `<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 2px rgba(0,0,0,0.3);"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        }));
      }

      marker.bindPopup(`
        <div>
          <strong>${asset.name}</strong><br/>
          ID: ${asset.id}<br/>
          Status: ${asset.status}<br/>
          Battery: ${asset.battery}%
        </div>
      `);

      marker.on('click', () => {
        setSelectedAsset(asset);
      });

      markersRef.current.push(marker);

      // Add historical path if available
      if (assetState.historicalPath && assetState.historicalPath.length > 0) {
        const pathCoords = assetState.historicalPath.map(point => [point.lat, point.lng]);
        const pathLine = L.polyline(pathCoords, {
          color: assetState.color,
          weight: 3,
          opacity: 0.7,
        }).addTo(mapInstanceRef.current);
        
        pathLinesRef.current.push(pathLine);
      }
    });

    // Add geofences
    if (showGeofences && !violationMode) {
      sharedMockGeofences.forEach(geofence => {
        if (geofence.type === 'circular' && geofence.center) {
          const circle = L.circle(geofence.center as [number, number], {
            color: '#8b5cf6',
            fillColor: '#8b5cf6',
            fillOpacity: 0.1,
            radius: geofence.radius || 100,
            weight: 2,
            dashArray: '5, 5',
          }).addTo(mapInstanceRef.current);
          
          circle.bindPopup(`<strong>${geofence.name}</strong>`);
          markersRef.current.push(circle);
        }
      });
    }

    // Add sites
    if (showSites && !violationMode) {
      mockSites.forEach(site => {
        const circle = L.circle(site.center, {
          color: '#f59e0b',
          fillColor: '#f59e0b',
          fillOpacity: 0.1,
          radius: site.radius,
          weight: 2,
          dashArray: '5, 5',
        }).addTo(mapInstanceRef.current);
        
        circle.bindPopup(`<strong>${site.name}</strong>`);
        markersRef.current.push(circle);
      });
    }
  }, [
    mapLoaded,
    selectedAssets,
    timeMode,
    historicalData,
    showGeofences,
    showSites,
    violationMode,
  ]);

  // Playback controls
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStepBack = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
    setIsPlaying(false);
  };

  const handleStepForward = () => {
    const maxIndex = Math.max(...Array.from(historicalData.values()).map(path => path.length - 1));
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
    setIsPlaying(false);
  };

  const handleSliderChange = (value: number[]) => {
    setCurrentIndex(value[0]);
    setIsPlaying(false);
  };

  // Asset selection handlers
  const handleAssetSelect = (assetId: string) => {
    setSelectedAssets(prev => {
      if (prev.includes(assetId)) {
        return prev.filter(id => id !== assetId);
      } else {
        return [...prev, assetId];
      }
    });
  };

  const handleSelectAllAssets = () => {
    setSelectedAssets(filteredAssets.map(asset => asset.id));
  };

  const handleClearSelection = () => {
    setSelectedAssets([]);
    setTimeMode('live');
  };

  // Map controls
  const recenterMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([37.7749, -122.4194], 13);
    }
  };

  const flyToAsset = (asset: Asset) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([asset.lat, asset.lng], 16, {
        duration: 1,
      });
      setSelectedAsset(asset);
    }
  };

  const getAssetIcon = (type: AssetType) => {
    switch (type) {
      case 'equipment':
        return <Wrench className='h-4 w-4' />;
      case 'vehicles':
        return <Truck className='h-4 w-4' />;
      case 'tools':
        return <PackageIcon className='h-4 w-4' />;
      case 'containers':
        return <Container className='h-4 w-4' />;
    }
  };

  const assetStates = getAssetDisplayStates();
  const maxHistoricalLength = Math.max(...Array.from(historicalData.values()).map(path => path.length));

  // Component render
  return (
      <PageLayout variant='full' padding='md'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            {onBack && (
            <Button variant='ghost' size='icon' onClick={onBack}>
              <ArrowLeft className='h-5 w-5' />
            </Button>
          )}
          <div>
            <h1>Asset Intelligence Map</h1>
            <p className='text-muted-foreground'>
              {violationMode
                ? 'Showing assets outside their designated geofence boundaries'
                : 'Unified live tracking and historical analysis'}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {violationMode && (
            <Badge
              variant='outline'
              className='bg-red-50 text-red-700 border-red-200'
            >
              ⚠️ {filteredAssets.length} Violation
              {filteredAssets.length !== 1 ? 's' : ''}
            </Badge>
          )}
          {!violationMode && (
            <>
              <Badge variant='outline'>
                {sharedMockAssets.filter(a => a.coordinates && a.coordinates.length >= 2).length} Assets
              </Badge>
              {selectedAssets.length > 0 && (
                <Badge variant='outline' className='bg-blue-50 text-blue-700 border-blue-200'>
                  {selectedAssets.length} Focused
                </Badge>
              )}
            </>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Map Visualization */}
        <Card className='lg:col-span-2'>
          <CardContent className='p-0'>
            <div className='h-[600px] relative'>
              <div 
                ref={mapRef} 
                className='h-full w-full rounded-lg overflow-hidden'
                style={{ 
                  backgroundColor: mapLoaded ? 'transparent' : '#f0f0f0',
                  border: mapLoaded ? 'none' : '2px dashed #ccc',
                  minHeight: '600px',
                  minWidth: '100%'
                }}
              />
              
              {/* Loading/Failed overlay */}
              {(!mapLoaded || mapInitFailed) && (
                <div className='absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50'>
                  <div className='text-center'>
                    {mapInitFailed ? (
                      <>
                        <div className='text-red-500 mb-4'>
                          <svg className='w-12 h-12 mx-auto' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' />
                          </svg>
                        </div>
                        <h3 className='text-lg font-semibold text-red-600 mb-2'>Map Initialization Failed</h3>
                        <p className='text-muted-foreground mb-4'>
                          Unable to initialize the map. This might be due to network issues or browser compatibility.
                        </p>
                        <Button 
                          onClick={() => {
                            setMapInitFailed(false);
                            setMapLoaded(false);
                            // Trigger re-initialization by updating a dependency
                            window.location.reload();
                          }}
                        >
                          Retry
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
                        <p className='text-muted-foreground'>Loading Asset Intelligence Map...</p>
                        <p className='text-xs text-muted-foreground mt-2'>
                          Initializing map components...
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Map Controls */}
              {mapLoaded && (
                <div className='absolute top-4 right-4 flex flex-col gap-2 z-[1000]'>
                  <Button
                    size='icon'
                    variant='secondary'
                    className='bg-background shadow-lg'
                    onClick={recenterMap}
                    title='Recenter map'
                  >
                    <Navigation className='h-4 w-4' />
                  </Button>
                  <Button
                    size='icon'
                    variant='secondary'
                    className='bg-background shadow-lg'
                    title='Fullscreen'
                  >
                    <Maximize2 className='h-4 w-4' />
                  </Button>
                </div>
              )}

              {/* Selected Asset Info Card */}
              {selectedAsset && (
                <Card className='absolute bottom-4 left-4 w-96 z-[1000] shadow-xl'>
                  <CardHeader className='pb-3'>
                    <div className='flex items-start justify-between'>
                      <div className='flex items-center gap-2'>
                        {getAssetIcon(selectedAsset.type)}
                        <CardTitle className='text-base'>
                          {selectedAsset.name}
                        </CardTitle>
                      </div>
                      <Button
                        size='icon'
                        variant='ghost'
                        className='h-6 w-6'
                        onClick={() => setSelectedAsset(null)}
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Asset ID:</span>
                      <span className='font-mono'>{selectedAsset.id}</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Type:</span>
                      <span className='capitalize'>{selectedAsset.type}</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Status:</span>
                      <StatusBadge status={selectedAsset.status} />
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Battery:</span>
                      <span
                        className={
                          selectedAsset.battery < 20
                            ? 'text-red-600'
                            : 'text-green-600'
                        }
                      >
                        {selectedAsset.battery}%
                      </span>
                    </div>
                    <div className='pt-3 border-t flex gap-2'>
                      <Button
                        size='sm'
                        className='flex-1'
                        onClick={() => {
                          const sharedAsset = findSharedAsset(selectedAsset);
                          if (sharedAsset) onAssetClick?.(sharedAsset);
                        }}
                      >
                        View Details
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        className='flex-1'
                        onClick={() => {
                          handleAssetSelect(selectedAsset.id);
                          setTimeMode('today');
                        }}
                      >
                        Track History
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className='space-y-4'>
          {/* Asset Focus Controls */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Asset Focus</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <label className='text-sm mb-2 block'>Selected Assets</label>
                <div className='flex gap-2'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={handleSelectAllAssets}
                    disabled={selectedAssets.length === filteredAssets.length}
                  >
                    Select All
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={handleClearSelection}
                    disabled={selectedAssets.length === 0}
                  >
                    Clear
                  </Button>
                </div>
                {selectedAssets.length > 0 && (
                  <div className='mt-2 text-sm text-muted-foreground'>
                    {selectedAssets.length} asset{selectedAssets.length !== 1 ? 's' : ''} selected
                  </div>
                )}
              </div>

              <div>
                <label className='text-sm mb-2 block'>Time Range</label>
                <Select value={timeMode} onValueChange={(value: TimeMode) => setTimeMode(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='live'>Live</SelectItem>
                    <SelectItem value='today'>Today</SelectItem>
                    <SelectItem value='custom'>Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {timeMode === 'custom' && (
                <div className='grid grid-cols-2 gap-2'>
                  <div>
                    <label className='text-sm mb-1 block'>Start Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant='outline' size='sm' className='w-full justify-start'>
                          <CalendarIcon className='h-4 w-4 mr-2' />
                          {format(customStartDate, 'MMM dd')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0'>
                        <Calendar
                          mode='single'
                          selected={customStartDate}
                          onSelect={(date) => date && setCustomStartDate(date)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className='text-sm mb-1 block'>End Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant='outline' size='sm' className='w-full justify-start'>
                          <CalendarIcon className='h-4 w-4 mr-2' />
                          {format(customEndDate, 'MMM dd')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0'>
                        <Calendar
                          mode='single'
                          selected={customEndDate}
                          onSelect={(date) => date && setCustomEndDate(date)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}

              {/* Playback Controls */}
              {timeMode !== 'live' && selectedAssets.length > 0 && maxHistoricalLength > 0 && (
                <Card>
                  <CardContent className='p-4'>
                    <div className='space-y-4'>
                      <div className='flex items-center gap-4'>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={handleStepBack}
                          disabled={currentIndex === 0}
                        >
                          <SkipBack className='h-4 w-4' />
                        </Button>
                        <Button size='sm' onClick={handlePlayPause}>
                          {isPlaying ? (
                            <Pause className='h-4 w-4 mr-2' />
                          ) : (
                            <Play className='h-4 w-4 mr-2' />
                          )}
                          {isPlaying ? 'Pause' : 'Play'}
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={handleStepForward}
                          disabled={currentIndex >= maxHistoricalLength - 1}
                        >
                          <SkipForward className='h-4 w-4' />
                        </Button>
                        <div className='flex-1'>
                          <Slider
                            value={[currentIndex]}
                            onValueChange={handleSliderChange}
                            max={maxHistoricalLength - 1}
                            step={1}
                            className='flex-1'
                          />
                        </div>
                        <span className='text-sm text-muted-foreground min-w-[100px] text-right'>
                          {currentIndex + 1} / {maxHistoricalLength}
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <label className='text-sm'>Speed:</label>
                        <Select value={playbackSpeed} onValueChange={setPlaybackSpeed}>
                          <SelectTrigger className='w-20'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='0.5'>0.5x</SelectItem>
                            <SelectItem value='1'>1x</SelectItem>
                            <SelectItem value='2'>2x</SelectItem>
                            <SelectItem value='4'>4x</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Search & Filters</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <label className='text-sm mb-2 block'>Search Assets</label>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Search by name or ID...'
                    className='pl-9'
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    disabled={!!highlightAsset || violationMode}
                  />
                </div>
              </div>

              <div>
                <label className='text-sm mb-2 block'>Asset Type</label>
                <Select
                  value={typeFilter}
                  onValueChange={setTypeFilter}
                  disabled={!!highlightAsset || violationMode}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Types</SelectItem>
                    <SelectItem value='tools'>Tools</SelectItem>
                    <SelectItem value='vehicles'>Vehicles</SelectItem>
                    <SelectItem value='equipment'>Equipment</SelectItem>
                    <SelectItem value='containers'>Containers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className='text-sm mb-2 block'>Status</label>
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  disabled={!!highlightAsset || violationMode}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Statuses</SelectItem>
                    <SelectItem value='active'>Active</SelectItem>
                    <SelectItem value='idle'>Idle</SelectItem>
                    <SelectItem value='in-transit'>In Transit</SelectItem>
                    <SelectItem value='offline'>Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!violationMode && (
                <div className='pt-4 border-t'>
                  <div className='flex items-center justify-between mb-3'>
                    <span className='text-sm'>Map Layers</span>
                    <Layers className='h-4 w-4 text-muted-foreground' />
                  </div>
                  <div className='space-y-3'>
                    <div className='flex items-center gap-2'>
                      <Checkbox
                        id='geofences'
                        checked={showGeofences}
                        onCheckedChange={checked =>
                          setShowGeofences(checked as boolean)
                        }
                      />
                      <label
                        htmlFor='geofences'
                        className='text-sm cursor-pointer'
                      >
                        Geofences
                      </label>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Checkbox
                        id='sites'
                        checked={showSites}
                        onCheckedChange={checked =>
                          setShowSites(checked as boolean)
                        }
                      />
                      <label htmlFor='sites' className='text-sm cursor-pointer'>
                        Site Boundaries
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className='pt-4 border-t'>
                <div className='text-sm mb-3'>Legend</div>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-sm'>
                    <div className='w-3 h-3 rounded-full bg-blue-500'></div>
                    <span>Live Assets</span>
                  </div>
                  <div className='flex items-center gap-2 text-sm'>
                    <div className='w-4 h-4 rounded-full border-2 border-blue-500 bg-white'></div>
                    <span>Focused Assets</span>
                  </div>
                  <div className='flex items-center gap-2 text-sm'>
                    <div className='w-8 h-0.5 bg-blue-500'></div>
                    <span>Historical Paths</span>
                  </div>
                  <div className='flex items-center gap-2 text-sm'>
                    <div className='w-3 h-3 rounded-full bg-purple-500'></div>
                    <span>Geofences</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Asset List */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>
                Assets ({filteredAssets.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2 max-h-64 overflow-y-auto'>
                {filteredAssets.map(asset => {
                  const isSelected = selectedAssets.includes(asset.id);
                  const assetState = assetStates.find(state => state.id === asset.id);
                  
                  return (
                    <div
                      key={asset.id}
                      onClick={() => flyToAsset(asset)}
                      className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                        selectedAsset?.id === asset.id
                          ? 'bg-primary/5 border-primary shadow-sm'
                          : isSelected
                            ? 'bg-blue-50 border-blue-200 shadow-sm'
                            : 'bg-card hover:bg-accent hover:shadow-sm'
                      }`}
                    >
                      <div className='flex items-start justify-between gap-2'>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-2 mb-1'>
                            {getAssetIcon(asset.type)}
                            <div className='text-sm truncate'>{asset.name}</div>
                            {isSelected && (
                              <div 
                                className='w-2 h-2 rounded-full'
                                style={{ backgroundColor: assetState?.color }}
                              />
                            )}
                          </div>
                          <div className='text-xs text-muted-foreground mb-2'>
                            {asset.id}
                          </div>
                          <div className='flex items-center gap-2'>
                            <StatusBadge
                              status={asset.status}
                              className='text-xs'
                            />
                            <span className='text-xs text-muted-foreground flex items-center gap-1'>
                              <Battery className='h-3 w-3' />
                              {asset.battery}%
                            </span>
                          </div>
                        </div>
                        <Button
                          size='sm'
                          variant={isSelected ? 'default' : 'outline'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssetSelect(asset.id);
                          }}
                        >
                          {isSelected ? 'Focused' : 'Focus'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
