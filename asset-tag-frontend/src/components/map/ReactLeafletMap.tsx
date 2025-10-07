import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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
import { mockAssets as sharedMockAssets, mockGeofences as sharedMockGeofences } from '../../data/mockData';
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
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ReactLeafletMapProps {
  assets?: Asset[];
  geofences?: Geofence[];
  selectedAssetId?: string;
  onAssetSelect?: (assetId: string) => void;
  showGeofences?: boolean;
  showPaths?: boolean;
  timeRange?: { start: Date; end: Date };
  playbackSpeed?: number;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  onTimeChange?: (time: Date) => void;
  filteredAssetIds?: string[];
  violationMode?: boolean;
  violatingGeofenceId?: string;
  expectedAssetIds?: string[];
  actualAssetIds?: string[];
}

// Component to update map when assets change
function MapUpdater({ assets }: { assets: Asset[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (assets.length > 0) {
      // Fit map to show all assets
      const bounds = L.latLngBounds(
        assets
          .filter(asset => asset.coordinates && asset.coordinates.length >= 2)
          .map(asset => [asset.coordinates[1], asset.coordinates[0]])
      );
      if (!bounds.isValid()) return;
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [assets, map]);

  return null;
}

export function ReactLeafletMap({
  assets = sharedMockAssets,
  geofences = sharedMockGeofences,
  selectedAssetId,
  onAssetSelect,
  showGeofences = true,
  showPaths = false,
  timeRange,
  playbackSpeed = 1,
  isPlaying = false,
  onPlayPause,
  onTimeChange,
  filteredAssetIds,
  violationMode = false,
  violatingGeofenceId,
  expectedAssetIds,
  actualAssetIds,
}: ReactLeafletMapProps = {}) {
  console.log('🚀 ReactLeafletMap component rendering...');
  
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Overlay states
  const { isOpen: isLayersOpen, toggle: toggleLayers } = useOverlayState('layers');
  const { isOpen: isPlaybackOpen, toggle: togglePlayback } = useOverlayState('playback');

  console.log('🚀 Component state:', { 
    searchText, 
    selectedAsset, 
    isLayersOpen, 
    isPlaybackOpen,
    assetsCount: assets.length 
  });

  // Filter assets based on search and filters
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name?.toLowerCase().includes(searchText.toLowerCase()) ||
                         asset.id?.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = typeFilter === 'all' || asset.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    const matchesFilteredIds = !filteredAssetIds || filteredAssetIds.includes(asset.id);
    
    return matchesSearch && matchesType && matchesStatus && matchesFilteredIds;
  });

  // Asset selection handlers
  const handleAssetSelect = (assetId: string) => {
    setSelectedAssets(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
    onAssetSelect?.(assetId);
  };

  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset);
    handleAssetSelect(asset.id);
  };

  // Get asset icon based on type
  const getAssetIcon = (type: string) => {
    switch (type?.toLowerCase() || 'unknown') {
      case 'vehicle': return <Truck className="h-4 w-4" />;
      case 'equipment': return <Wrench className="h-4 w-4" />;
      case 'container': return <Container className="h-4 w-4" />;
      default: return <PackageIcon className="h-4 w-4" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase() || 'unknown') {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <PageLayout variant="full">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Asset Intelligence Map</h1>
            <p className="text-muted-foreground">
              Real-time asset tracking and geofence monitoring
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Top Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search assets by name or ID..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="vehicle">Vehicle</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="container">Container</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Area with Overlays - lg:col-span-2 */}
          <div className="lg:col-span-2 relative">
            {/* Map Container */}
            <div 
              className="h-[600px] rounded-lg border overflow-hidden relative bg-gray-100"
              style={{ minHeight: '600px' }}
            >
              <MapContainer
                center={[51.505, -0.09]}
                zoom={13}
                style={{ height: '100%', width: '100%', backgroundColor: '#e5e7eb' }}
                key="main-map" // Key ensures proper re-initialization
                whenReady={() => {
                  console.log('🗺️ Map is ready!');
                  console.log('🗺️ Map container size:', document.querySelector('.leaflet-container')?.getBoundingClientRect());
                }}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  attribution='© OpenStreetMap contributors © CARTO'
                  eventHandlers={{
                    loading: () => console.log('🔄 Loading CartoDB tiles...'),
                    load: () => console.log('✅ CartoDB tiles loaded successfully!'),
                    tileerror: (e) => {
                      console.error('❌ CartoDB tile loading error:', e);
                      console.log('Error details:', e);
                    },
                  }}
                />
                
                {/* Update map bounds when assets change */}
                <MapUpdater assets={filteredAssets} />
                
                {/* Test Marker - London */}
                <Marker position={[51.505, -0.09]}>
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold">Test Marker</h3>
                      <p className="text-sm">London [51.505, -0.09]</p>
                    </div>
                  </Popup>
                </Marker>

                {/* Asset Markers */}
                {filteredAssets.map(asset => {
                  if (!asset.coordinates || asset.coordinates.length < 2) {
                    console.log(`❌ Asset ${asset.id} has invalid coordinates:`, asset.coordinates);
                    return null;
                  }
                  
                  console.log(`📍 Asset ${asset.id} at coordinates:`, [asset.coordinates[0], asset.coordinates[1]]);
                  
                  return (
                    <Marker
                      key={asset.id}
                      position={[asset.coordinates[0], asset.coordinates[1]]}
                      eventHandlers={{
                        click: () => handleAssetClick(asset),
                      }}
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-semibold">{asset.name}</h3>
                          <p className="text-sm text-muted-foreground">ID: {asset.id}</p>
                          <p className="text-sm">Type: {asset.type}</p>
                          <p className="text-sm">Status: {asset.status}</p>
                          <p className="text-sm">Battery: {asset.battery}%</p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>

              {/* Map Legend Overlay - Always Visible with Transparent Background */}
              <div className="absolute bottom-4 left-4 z-10 hidden md:block">
                <Card className="w-48 bg-background/90 backdrop-blur-sm shadow-lg border">
                  <CardHeader className="pb-2 pt-3 px-3">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Legend
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3 space-y-2">
                    <div className="flex items-center text-xs">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span>Active Assets</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                      <span>Maintenance</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <span>Error/Offline</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <span>Other Assets</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Layers Overlay */}
              <div className="absolute top-4 right-4 z-10">
                <Popover open={isLayersOpen} onOpenChange={toggleLayers}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-background/90 backdrop-blur-sm">
                      <Layers className="h-4 w-4 mr-2" />
                      Layers
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64" align="end">
                    <div className="space-y-3">
                      <h4 className="font-medium">Map Layers</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="assets" defaultChecked />
                          <label htmlFor="assets" className="text-sm">Asset Markers</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="geofences" defaultChecked={showGeofences} />
                          <label htmlFor="geofences" className="text-sm">Geofences</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="paths" defaultChecked={showPaths} />
                          <label htmlFor="paths" className="text-sm">Asset Paths</label>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Playback Controls Overlay */}
              <div className="absolute bottom-4 right-4 z-10">
                <Popover open={isPlaybackOpen} onOpenChange={togglePlayback}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-background/90 backdrop-blur-sm">
                      <Play className="h-4 w-4 mr-2" />
                      Playback
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="space-y-4">
                      <h4 className="font-medium">Historical Playback</h4>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Time Range</label>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm text-muted-foreground">
                            {timeRange ? format(timeRange.start, 'MMM dd, yyyy') : 'No range set'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Playback Speed</label>
                        <Slider
                          value={[playbackSpeed]}
                          onValueChange={(value) => console.log('Speed changed:', value)}
                          max={5}
                          min={0.5}
                          step={0.5}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0.5x</span>
                          <span>5x</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <SkipBack className="h-4 w-4" />
                          </Button>
                          <Button size="sm" onClick={onPlayPause}>
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button size="sm" variant="outline">
                            <SkipForward className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button size="sm" variant="outline">
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Right Panel - Asset List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <List className="h-5 w-5 mr-2" />
                  Assets ({filteredAssets.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[600px] overflow-y-auto">
                  {filteredAssets.map(asset => (
                    <div
                      key={asset.id}
                      className={`p-4 border-b cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedAssets.includes(asset.id) ? 'bg-muted' : ''
                      }`}
                      onClick={() => handleAssetClick(asset)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getAssetIcon(asset.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{asset.name}</h4>
                            <p className="text-xs text-muted-foreground">ID: {asset.id}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {asset.type}
                              </Badge>
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(asset.status)}`}></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Battery className="h-3 w-3 mr-1" />
                            {asset.battery}%
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {asset.lastSeen && !isNaN(new Date(asset.lastSeen).getTime()) 
                              ? format(new Date(asset.lastSeen), 'HH:mm') 
                              : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
