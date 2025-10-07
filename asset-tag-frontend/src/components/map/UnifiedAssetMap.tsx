import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PageLayout } from '../common/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Slider } from '../ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { StatusBadge } from '../common/StatusBadge';
import { useOverlayState } from '../../hooks/useOverlayState';
import { mockAssets as sharedMockAssets, mockGeofences as sharedMockGeofences, mockSites as sharedMockSites } from '../../data/mockData';
import { Asset, Geofence } from '../../types/asset';
import { format } from 'date-fns';
import {
  Search,
  Layers,
  MapPin,
  Truck,
  Wrench,
  PackageIcon,
  Container,
  Battery,
  Clock,
  X,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  CalendarIcon,
  Activity,
  Settings,
  Filter,
  Focus,
  List,
  Maximize2,
  Minimize2,
  CheckSquare,
  Square,
  Eye,
  EyeOff,
  Info,
  GripVertical,
} from 'lucide-react';

interface UnifiedAssetMapProps {
  onAssetClick?: (asset: Asset) => void;
  onTrackHistory?: (asset: Asset) => void;
  highlightAsset?: Asset | null;
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
  console.log('🚀 UnifiedAssetMap component rendering...');
  
  // Map refs - simplified approach
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<unknown[]>([]);
  const pathLinesRef = useRef<unknown[]>([]);
  const layerOverlayRef = useRef<HTMLDivElement>(null);

  // State management - simplified
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInitFailed, setMapInitFailed] = useState(false);
  
  console.log('📊 Current state:', { mapLoaded, mapInitFailed });
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [timeMode, setTimeMode] = useState<'live' | 'today' | 'custom'>('live');
  const [customStartDate, setCustomStartDate] = useState<Date>(new Date());
  const [customEndDate, setCustomEndDate] = useState<Date>(new Date());
  const [showGeofences, setShowGeofences] = useState(true);
  const [showSites, setShowSites] = useState(true);
  const [showClusters, setShowClusters] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [maxHistoricalLength] = useState(100); // Mock data length

  // Overlay state management with localStorage persistence (removed focus state)
  const [isLayerControlsExpanded, setIsLayerControlsExpanded] = useOverlayState('map-layers-expanded', false);

  // Filter assets based on search and filters
  const filteredAssets = sharedMockAssets.filter(asset => {
    const matchesSearch = asset.name?.toLowerCase().includes(searchText.toLowerCase()) ||
                         asset.id?.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = typeFilter === 'all' || asset.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    const matchesFilteredIds = !filteredAssetIds || filteredAssetIds.includes(asset.id);
    
    return matchesSearch && matchesType && matchesStatus && matchesFilteredIds;
  });

  // Helper function to format time
  const formatTime = (index: number) => {
    if (timeMode === 'live') return 'Live';
    if (timeMode === 'today') {
      const hours = Math.floor(index / 4); // Assuming 15-minute intervals
      const minutes = (index % 4) * 15;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    // For custom mode, show date + time
    const date = new Date(customStartDate);
    date.setHours(Math.floor(index / 4));
    date.setMinutes((index % 4) * 15);
    return format(date, 'MMM dd, HH:mm');
  };

  // Click outside to close layer overlay
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (layerOverlayRef.current && !layerOverlayRef.current.contains(event.target as Node)) {
        setIsLayerControlsExpanded(false);
      }
    };
    
    if (isLayerControlsExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isLayerControlsExpanded]);

  // Playback animation
  useEffect(() => {
    if (isPlaying && timeMode !== 'live') {
      const interval = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= maxHistoricalLength) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
      
      return () => clearInterval(interval);
    }
  }, [isPlaying, playbackSpeed, maxHistoricalLength, timeMode]);

  // Load Leaflet CSS on component mount
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet/dist/leaflet.css';
      document.head.appendChild(link);
    }
  }, []);


  // Initialize map when component mounts - runs only once
  useEffect(() => {
    console.log('🎯 Map useEffect triggered (mount only)');
    
    const timer = setTimeout(() => {
      console.log('⏰ Timer fired after 100ms');
      if (mapRef.current && !mapLoaded && !mapInitFailed) {
        console.log('✅ Initializing map on mount...');
        
        import('leaflet')
          .then(L => {
            if (!mapRef.current) return;
            
            // Create new map
            const map = L.map(mapRef.current).setView([37.7749, -122.4194], 13);
            mapInstanceRef.current = map;

            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 19,
            }).addTo(map);

            // Add test marker
            L.marker([37.7749, -122.4194])
              .addTo(map)
              .bindPopup('Test marker - Map is working!');

            // Add asset markers
            filteredAssets.forEach(asset => {
              if (asset.coordinates && asset.coordinates.length >= 2) {
                const marker = L.marker([asset.coordinates[1], asset.coordinates[0]])
                  .addTo(map)
                  .bindPopup(`
                    <div>
                      <h3>${asset.name}</h3>
                      <p>ID: ${asset.id}</p>
                      <p>Type: ${asset.type}</p>
                      <p>Status: ${asset.status}</p>
                      <p>Battery: ${asset.battery}%</p>
                    </div>
                  `);
                markersRef.current.push(marker);
              }
            });

            setMapLoaded(true);
            console.log('Map initialized successfully on mount');
          })
          .catch(error => {
            console.error('Failed to initialize map:', error);
            setMapInitFailed(true);
          });
      }
    }, 100);
    
    return () => {
      console.log('🧹 Cleaning up mount timer');
      clearTimeout(timer);
    };
  }, []); // Empty dependency array - runs only once on mount

  // Update geofences when showGeofences state changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    const map = mapInstanceRef.current;
    
    // Remove existing geofence layers
    map.eachLayer((layer: any) => {
      if (layer.options && layer.options.isGeofence) {
        map.removeLayer(layer);
      }
    });

    // Add geofences if enabled
    if (showGeofences) {
      sharedMockGeofences.forEach(geofence => {
        let geofenceLayer;
        
        if (geofence.type === 'circular' && geofence.center && geofence.radius) {
          // Create circular geofence
          geofenceLayer = L.circle([geofence.center[0], geofence.center[1]], {
            radius: geofence.radius * 0.3048, // Convert feet to meters
            color: geofence.geofenceType === 'restricted' ? '#ef4444' : '#3b82f6',
            weight: 2,
            opacity: 0.8,
            fillColor: geofence.geofenceType === 'restricted' ? '#fecaca' : '#dbeafe',
            fillOpacity: 0.2,
            isGeofence: true
          });
        } else if (geofence.type === 'polygon' && geofence.coordinates) {
          // Create polygon geofence
          const latLngs = geofence.coordinates.map(coord => [coord[0], coord[1]]);
          geofenceLayer = L.polygon(latLngs, {
            color: geofence.geofenceType === 'restricted' ? '#ef4444' : '#3b82f6',
            weight: 2,
            opacity: 0.8,
            fillColor: geofence.geofenceType === 'restricted' ? '#fecaca' : '#dbeafe',
            fillOpacity: 0.2,
            isGeofence: true
          });
        }

        if (geofenceLayer) {
          geofenceLayer.addTo(map);
          geofenceLayer.bindPopup(`
            <div>
              <h3>${geofence.name}</h3>
              <p>Type: ${geofence.type}</p>
              <p>Status: ${geofence.status}</p>
              <p>Assets: ${geofence.assets}</p>
              <p>Geofence Type: ${geofence.geofenceType}</p>
            </div>
          `);
        }
      });
    }
  }, [showGeofences, mapLoaded]);

  // Update sites when showSites state changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    const map = mapInstanceRef.current;
    
    // Remove existing site layers
    map.eachLayer((layer: any) => {
      if (layer.options && layer.options.isSite) {
        map.removeLayer(layer);
      }
    });

    // Add sites if enabled
    if (showSites) {
      sharedMockSites.forEach(site => {
        if (site.coordinates) {
          // Create site marker
          const siteMarker = L.marker([site.coordinates.lat, site.coordinates.lng], {
            isSite: true
          }).addTo(map);
          
          // Add site icon (you can customize this)
          siteMarker.bindPopup(`
            <div>
              <h3>${site.name}</h3>
              <p>Location: ${site.location}</p>
              <p>Assets: ${site.assets}</p>
              <p>Area: ${site.area}</p>
              <p>Manager: ${site.manager}</p>
              <p>Status: ${site.status}</p>
            </div>
          `);

          // Add site boundary circle if radius is available
          if (site.coordinates.radius) {
            const siteCircle = L.circle([site.coordinates.lat, site.coordinates.lng], {
              radius: site.coordinates.radius * 0.3048, // Convert feet to meters
              color: '#10b981',
              weight: 2,
              opacity: 0.6,
              fillColor: '#d1fae5',
              fillOpacity: 0.1,
              isSite: true
            }).addTo(map);
          }
        }
      });
    }
  }, [showSites, mapLoaded]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current = [];
      pathLinesRef.current = [];
    };
  }, []);

  // Asset selection handlers
  const handleAssetSelect = (assetId: string) => {
    setSelectedAssets(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleSelectAllAssets = () => {
    setSelectedAssets(filteredAssets.map(asset => asset.id));
  };

  const handleClearSelection = () => {
    setSelectedAssets([]);
  };

  // Fly to asset on map
  const flyToAsset = (asset: Asset) => {
    if (mapInstanceRef.current && asset.coordinates) {
      mapInstanceRef.current.setView([asset.coordinates[1], asset.coordinates[0]], 16);
      setSelectedAsset(asset);
    }
  };

  // Find shared asset for callbacks
  const findSharedAsset = (asset: Asset): Asset | undefined => {
    return sharedMockAssets.find(a => a.id === asset.id);
  };

  // Get asset icon
  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'vehicles': return <Truck className='h-4 w-4' />;
      case 'tools': return <Wrench className='h-4 w-4' />;
      case 'equipment': return <PackageIcon className='h-4 w-4' />;
      case 'containers': return <Container className='h-4 w-4' />;
      default: return <PackageIcon className='h-4 w-4' />;
    }
  };

  // Playback controls
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSliderChange = (value: number[]) => {
    setCurrentIndex(value[0]);
  };

  // Component render - Following the EXACT same pattern as UnifiedAssetMap.tsx
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
                {sharedMockAssets.length} Assets
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

      {/* Top Search Bar - Responsive */}
      <div className='border-b bg-background p-4 -mx-6 mb-6'>
        <div className='flex flex-col md:flex-row items-stretch md:items-center gap-4'>
          {/* Search Input */}
          <div className='flex-1 relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search assets by name or ID...'
              className='pl-10'
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
          </div>

          {/* Filters Row */}
          <div className='flex items-center gap-4'>
            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className='w-32 md:w-40'>
                <SelectValue placeholder='Type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Types</SelectItem>
                <SelectItem value='vehicles'>Vehicles</SelectItem>
                <SelectItem value='tools'>Tools</SelectItem>
                <SelectItem value='equipment'>Equipment</SelectItem>
                <SelectItem value='containers'>Containers</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-32 md:w-40'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='idle'>Idle</SelectItem>
                <SelectItem value='in-transit'>In Transit</SelectItem>
                <SelectItem value='offline'>Offline</SelectItem>
              </SelectContent>
            </Select>

            {/* Results Count */}
            <div className='text-sm text-muted-foreground hidden sm:block'>
              {filteredAssets.length} assets
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Layout - EXACT same pattern as UnifiedAssetMap.tsx */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Map Area with Overlays - lg:col-span-2 */}
        <div className='lg:col-span-2 relative'>
          {/* Map Container */}
          <div className='h-[600px] rounded-lg border overflow-hidden relative'>
        {/* Always render the map container div so ref can be attached */}
        <div 
          ref={(el) => {
            console.log('🏗️ Map container div created:', {
              element: el,
              elementType: typeof el,
              elementTagName: el?.tagName,
              elementOffsetWidth: el?.offsetWidth,
              elementOffsetHeight: el?.offsetHeight
            });
            mapRef.current = el;
          }}
          className='w-full h-full bg-blue-100 border-2 border-blue-300 relative'
          style={{ minHeight: '600px' }}
        >
          {mapInitFailed ? (
            <div className='absolute inset-0 bg-muted/20 flex items-center justify-center z-10'>
              <div className='text-center'>
                <MapPin className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
                <p className='text-muted-foreground'>Failed to load map</p>
                <p className='text-sm text-muted-foreground'>Please check your internet connection</p>
                <Button 
                  onClick={() => {
                    setMapInitFailed(false);
                    setMapLoaded(false);
                    // Clean up existing map
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.remove();
                      mapInstanceRef.current = null;
                    }
                    markersRef.current = [];
                    pathLinesRef.current = [];
                    // Force re-render to trigger initialization
                    window.location.reload();
                  }}
                  className='mt-4'
                  size='sm'
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : !mapLoaded && !mapInitFailed ? (
            <div className='absolute inset-0 bg-gray-100 flex items-center justify-center z-10'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
                <p className='text-muted-foreground'>Loading map...</p>
              </div>
            </div>
          ) : null}
        </div>

            {/* Map Legend Overlay - Always Visible with Transparent Background */}
            <div className='absolute bottom-4 left-4 z-10 hidden md:block'>
              <Card className='w-48 bg-background/90 backdrop-blur-sm shadow-lg border'>
                <CardHeader className='pb-2 pt-3 px-3'>
                  <CardTitle className='text-xs font-semibold'>Legend</CardTitle>
                </CardHeader>
                <CardContent className='px-3 pb-3'>
                  <div className='space-y-1.5'>
                    <div className='flex items-center gap-2'>
                      <div className='w-3 h-3 rounded-full bg-green-500' />
                      <span className='text-xs'>Active</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='w-3 h-3 rounded-full bg-yellow-500' />
                      <span className='text-xs'>Idle</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='w-3 h-3 rounded-full bg-blue-500' />
                      <span className='text-xs'>In Transit</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='w-3 h-3 rounded-full bg-gray-500' />
                      <span className='text-xs'>Offline</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='w-3 h-3 rounded-full bg-red-500 border-2 border-white' />
                      <span className='text-xs'>Violation</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Map Layer Controls Overlay (Top-Right) - Desktop Only with Click Outside */}
          <div ref={layerOverlayRef} className='absolute top-4 right-4 z-10 hidden md:block'>
            <Collapsible open={isLayerControlsExpanded} onOpenChange={setIsLayerControlsExpanded}>
              <CollapsibleTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  className='bg-background shadow-lg border'
                >
                  <Layers className='h-4 w-4 mr-2' />
                  Layers
                  <ChevronDown className='h-3 w-3 ml-2' />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Card className='mt-2 w-56 bg-background shadow-lg border'>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-sm'>Map Layers</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2'>
                        <Checkbox
                          id='geofences'
                          checked={showGeofences}
                          onCheckedChange={checked => setShowGeofences(checked as boolean)}
                        />
                        <label htmlFor='geofences' className='text-sm cursor-pointer'>
                          Geofences
                        </label>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Checkbox
                          id='sites'
                          checked={showSites}
                          onCheckedChange={checked => setShowSites(checked as boolean)}
                        />
                        <label htmlFor='sites' className='text-sm cursor-pointer'>
                          Site Boundaries
                        </label>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Checkbox
                          id='clusters'
                          checked={showClusters}
                          onCheckedChange={checked => setShowClusters(checked as boolean)}
                        />
                        <label htmlFor='clusters' className='text-sm cursor-pointer'>
                          Clusters
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Playback Control Bar - Bottom of Map (Hidden in Live Mode) */}
          {timeMode !== 'live' && (
            <div className='absolute bottom-0 left-0 right-0 z-10 bg-background/95 backdrop-blur-sm border-t'>
              <div className='px-4 py-2'>
                <div className='flex items-center gap-4'>
                  {/* Left: Time Range Selector */}
                  <Select value={timeMode} onValueChange={(value: any) => setTimeMode(value)}>
                    <SelectTrigger className='w-32 h-8'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='live'>Live</SelectItem>
                      <SelectItem value='today'>Today</SelectItem>
                      <SelectItem value='custom'>Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Center: Play Controls + Progress Bar */}
                  <div className='flex-1 flex items-center gap-3'>
                    <Button size='sm' variant='ghost' onClick={handlePlayPause}>
                      {isPlaying ? <Pause className='h-4 w-4' /> : <Play className='h-4 w-4' />}
                    </Button>
                    
                    <div className='flex-1 flex items-center gap-2'>
                      <span className='text-xs text-muted-foreground'>
                        {formatTime(currentIndex)}
                      </span>
                      <Slider
                        value={[currentIndex]}
                        onValueChange={handleSliderChange}
                        max={maxHistoricalLength}
                        step={1}
                        className='flex-1'
                      />
                      <span className='text-xs text-muted-foreground'>
                        {formatTime(maxHistoricalLength)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Right: Speed Controls */}
                  <Select value={playbackSpeed.toString()} onValueChange={(v) => setPlaybackSpeed(Number(v))}>
                    <SelectTrigger className='w-20 h-8'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='1'>1x</SelectItem>
                      <SelectItem value='2'>2x</SelectItem>
                      <SelectItem value='4'>4x</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Custom Date Range Pickers - Show when custom mode */}
                {timeMode === 'custom' && (
                  <div className='flex gap-2 mt-2'>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant='outline' size='sm' className='h-8'>
                          <CalendarIcon className='h-3 w-3 mr-2' />
                          Start: {format(customStartDate, 'PP')}
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
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant='outline' size='sm' className='h-8'>
                          <CalendarIcon className='h-3 w-3 mr-2' />
                          End: {format(customEndDate, 'PP')}
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
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Asset List - lg:col-span-1 */}
        <div className='lg:col-span-1 space-y-4'>
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm'>Assets ({filteredAssets.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2 max-h-96 overflow-y-auto'>
                {filteredAssets.map(asset => {
                  const isSelected = selectedAssets.includes(asset.id);
                  const isHighlighted = selectedAsset?.id === asset.id;
                  
                  return (
                    <div
                      key={asset.id}
                      className={`w-full p-3 rounded-lg border transition-all cursor-pointer ${
                        isHighlighted
                          ? 'bg-primary/5 border-primary shadow-sm'
                          : isSelected
                            ? 'bg-blue-50 border-blue-200 shadow-sm'
                            : 'bg-card hover:bg-accent hover:shadow-sm'
                      }`}
                      onClick={() => flyToAsset(asset)}
                    >
                      <div className='flex items-start justify-between gap-2'>
                        <div className='flex items-start gap-3 flex-1'>
                          {/* Selection Checkbox */}
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleAssetSelect(asset.id)}
                            onClick={(e) => e.stopPropagation()}
                            className='mt-0.5'
                          />
                          
                          {/* Asset Info */}
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-2 mb-1'>
                              {getAssetIcon(asset.type)}
                              <div className='text-sm font-medium truncate'>{asset.name}</div>
                              {isSelected && (
                                <div className='w-2 h-2 rounded-full bg-blue-500' />
                              )}
                            </div>
                            <div className='text-xs text-muted-foreground mb-2'>
                              {asset.id}
                            </div>
                            <div className='flex items-center gap-2'>
                              <StatusBadge status={asset.status} className='text-xs' />
                              <span className='text-xs text-muted-foreground flex items-center gap-1'>
                                <Battery className='h-3 w-3' />
                                {asset.battery}%
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className='flex gap-1'>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={(e) => {
                              e.stopPropagation();
                              const sharedAsset = findSharedAsset(asset);
                              if (sharedAsset) onAssetClick?.(sharedAsset);
                            }}
                            className='h-7 w-7 p-0'
                            title='View Details'
                          >
                            <Eye className='h-3 w-3' />
                          </Button>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={(e) => {
                              e.stopPropagation();
                              const sharedAsset = findSharedAsset(asset);
                              if (sharedAsset) onTrackHistory?.(sharedAsset);
                            }}
                            className='h-7 w-7 p-0'
                            title='Track History'
                          >
                            <Clock className='h-3 w-3' />
                          </Button>
                        </div>
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
