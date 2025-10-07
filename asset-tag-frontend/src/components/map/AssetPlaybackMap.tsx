/**
 * @deprecated This component has been deprecated in favor of UnifiedAssetMap.
 * The playback functionality is now integrated directly into the main map view.
 * Use UnifiedAssetMap with playback mode instead.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import './AssetPlaybackMap.css';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
// import { Progress } from '../ui/progress'; // Not used in current implementation
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw,
  Settings,
  MapPin,
  Clock,
  Speed,
  Route,
  Eye,
  EyeOff
} from 'lucide-react';
import L from 'leaflet';
import { AssetLocationHistory, LocationHistoryPoint, getAllAssetLocationHistories } from '../../data/mockData';
import { format } from 'date-fns';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface AssetPlaybackMapProps {
  onBack?: () => void;
}

// Component to handle map updates and bounds
function MapUpdater({ 
  histories, 
  currentTime, 
  selectedAssets, 
  showPaths, 
  showMarkers 
}: { 
  histories: AssetLocationHistory[];
  currentTime: number;
  selectedAssets: string[];
  showPaths: boolean;
  showMarkers: boolean;
}) {
  const map = useMap();
  
  useEffect(() => {
    if (histories.length === 0) return;
    
    const visibleHistories = histories.filter(h => selectedAssets.includes(h.assetId));
    if (visibleHistories.length === 0) return;
    
    // Calculate bounds for all visible assets at current time
    const bounds = L.latLngBounds([]);
    let hasValidBounds = false;
    
    visibleHistories.forEach(history => {
      const pointsUpToCurrentTime = history.trackingPoints.filter(
        point => new Date(point.timestamp).getTime() <= currentTime
      );
      
      if (pointsUpToCurrentTime.length > 0) {
        pointsUpToCurrentTime.forEach(point => {
          bounds.extend([point.lat, point.lng]);
          hasValidBounds = true;
        });
      }
    });
    
    if (hasValidBounds && !bounds.isValid()) {
      // If bounds are invalid, use a default view
      map.setView([37.7749, -122.4194], 13);
    } else if (hasValidBounds) {
      // Add padding to bounds
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [histories, currentTime, selectedAssets, showPaths, showMarkers, map]);
  
  return null;
}

// Component to render animated markers
function AnimatedMarkers({ 
  histories, 
  currentTime, 
  selectedAssets 
}: { 
  histories: AssetLocationHistory[];
  currentTime: number;
  selectedAssets: string[];
}) {
  const visibleHistories = histories.filter(h => selectedAssets.includes(h.assetId));
  
  return (
    <>
      {visibleHistories.map(history => {
        // Find the most recent point up to current time
        const pointsUpToCurrentTime = history.trackingPoints.filter(
          point => new Date(point.timestamp).getTime() <= currentTime
        );
        
        if (pointsUpToCurrentTime.length === 0) return null;
        
        const currentPoint = pointsUpToCurrentTime[pointsUpToCurrentTime.length - 1];
        
        // Create custom icon with asset color
        const customIcon = L.divIcon({
          className: 'custom-asset-marker',
          html: `
            <div style="
              width: 20px;
              height: 20px;
              background-color: ${history.color};
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              color: white;
              font-weight: bold;
            ">
              ${history.assetName.charAt(0)}
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        
        return (
          <Marker
            key={`${history.assetId}-current`}
            position={[currentPoint.lat, currentPoint.lng]}
            icon={customIcon}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-sm">{history.assetName}</h3>
                <p className="text-xs text-muted-foreground">{history.assetType}</p>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Time:</span>
                    <span>{format(new Date(currentPoint.timestamp), 'MMM dd, HH:mm')}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Event:</span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {currentPoint.event}
                    </Badge>
                  </div>
                  {currentPoint.speed && (
                    <div className="flex justify-between text-xs">
                      <span>Speed:</span>
                      <span>{currentPoint.speed} km/h</span>
                    </div>
                  )}
                  {currentPoint.battery && (
                    <div className="flex justify-between text-xs">
                      <span>Battery:</span>
                      <span>{currentPoint.battery}%</span>
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

// Component to render path polylines
function PathPolylines({ 
  histories, 
  currentTime, 
  selectedAssets 
}: { 
  histories: AssetLocationHistory[];
  currentTime: number;
  selectedAssets: string[];
}) {
  const visibleHistories = histories.filter(h => selectedAssets.includes(h.assetId));
  
  return (
    <>
      {visibleHistories.map(history => {
        // Get points up to current time
        const pointsUpToCurrentTime = history.trackingPoints.filter(
          point => new Date(point.timestamp).getTime() <= currentTime
        );
        
        if (pointsUpToCurrentTime.length < 2) return null;
        
        // Convert to lat/lng pairs for polyline
        const pathCoordinates = pointsUpToCurrentTime.map(point => [point.lat, point.lng] as [number, number]);
        
        return (
          <Polyline
            key={`${history.assetId}-path`}
            positions={pathCoordinates}
            pathOptions={{
              color: history.color,
              weight: 4,
              opacity: 0.8,
              dashArray: history.assetType === 'Vehicle' ? '10, 5' : undefined
            }}
          />
        );
      })}
    </>
  );
}

export function AssetPlaybackMap({ onBack }: AssetPlaybackMapProps) {
  const [histories, setHistories] = useState<AssetLocationHistory[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [showPaths, setShowPaths] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [timeRange, setTimeRange] = useState<{ start: number; end: number }>({ start: 0, end: 0 });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load location histories on mount
  useEffect(() => {
    const allHistories = getAllAssetLocationHistories();
    console.log('🎬 Loaded histories:', allHistories.length, allHistories);
    setHistories(allHistories);
    setSelectedAssets(allHistories.map(h => h.assetId));
    
    if (allHistories.length > 0) {
      // Find the overall time range
      const allTimes = allHistories.flatMap(h => 
        h.trackingPoints.map(p => new Date(p.timestamp).getTime())
      );
      const startTime = Math.min(...allTimes);
      const endTime = Math.max(...allTimes);
      
      console.log('⏰ Time range:', { startTime, endTime, start: new Date(startTime), end: new Date(endTime) });
      
      setTimeRange({ start: startTime, end: endTime });
      setCurrentTime(startTime);
    }
  }, []);
  
  // Playback control
  useEffect(() => {
    console.log('🎮 Playback effect triggered:', { isPlaying, timeRange, playbackSpeed });
    
    if (isPlaying && timeRange.end > timeRange.start) {
      console.log('▶️ Starting playback interval');
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const nextTime = prev + (1000 * playbackSpeed); // 1 second per interval (faster for demo)
          console.log('⏭️ Time update:', { prev, nextTime, end: timeRange.end });
          if (nextTime >= timeRange.end) {
            console.log('🏁 Playback finished');
            setIsPlaying(false);
            return timeRange.end;
          }
          return nextTime;
        });
      }, 100); // Update every 100ms for smooth animation
    } else {
      if (intervalRef.current) {
        console.log('⏸️ Clearing playback interval');
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, timeRange]);
  
  const handlePlayPause = () => {
    console.log('🎯 Play/Pause clicked:', { currentIsPlaying: isPlaying, timeRange });
    setIsPlaying(!isPlaying);
  };
  
  const handleSkipBack = () => {
    const newTime = Math.max(timeRange.start, currentTime - (3600000 * playbackSpeed)); // 1 hour
    setCurrentTime(newTime);
  };
  
  const handleSkipForward = () => {
    const newTime = Math.min(timeRange.end, currentTime + (3600000 * playbackSpeed)); // 1 hour
    setCurrentTime(newTime);
  };
  
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(timeRange.start);
  };
  
  const handleTimeSliderChange = (value: number[]) => {
    const newTime = timeRange.start + (value[0] / 100) * (timeRange.end - timeRange.start);
    setCurrentTime(newTime);
  };
  
  const handleAssetToggle = (assetId: string) => {
    setSelectedAssets(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };
  
  const progress = timeRange.end > timeRange.start 
    ? ((currentTime - timeRange.start) / (timeRange.end - timeRange.start)) * 100 
    : 0;
    
  console.log('📊 Progress calculation:', { currentTime, timeRange, progress });
  
  // Show loading state if no data
  if (histories.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading asset data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              ← Back
            </Button>
          )}
          <h1 className="text-xl font-semibold">Asset Playback</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {format(new Date(currentTime), 'MMM dd, HH:mm')}
          </Badge>
        </div>
      </div>
      
      <div className="flex-1 flex">
        {/* Controls Panel */}
        <div className="w-80 border-r bg-background p-4 space-y-4 overflow-y-auto">
          {/* Playback Controls */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Playback Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSkipBack}
                  disabled={currentTime <= timeRange.start}
                >
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handlePlayPause}
                  className="flex-1"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSkipForward}
                  disabled={currentTime >= timeRange.end}
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Speed</span>
                  <span>{playbackSpeed}x</span>
                </div>
                <Slider
                  value={[playbackSpeed]}
                  onValueChange={(value) => setPlaybackSpeed(value[0])}
                  min={0.25}
                  max={4}
                  step={0.25}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Time</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Slider
                  value={[progress]}
                  onValueChange={handleTimeSliderChange}
                  min={0}
                  max={100}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{format(new Date(timeRange.start), 'MMM dd')}</span>
                  <span>{format(new Date(timeRange.end), 'MMM dd')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Display Options */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Display Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-paths"
                  checked={showPaths}
                  onCheckedChange={(checked) => setShowPaths(checked as boolean)}
                />
                <label htmlFor="show-paths" className="text-sm flex items-center gap-2">
                  <Route className="w-4 h-4" />
                  Show Paths
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-markers"
                  checked={showMarkers}
                  onCheckedChange={(checked) => setShowMarkers(checked as boolean)}
                />
                <label htmlFor="show-markers" className="text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Show Markers
                </label>
              </div>
            </CardContent>
          </Card>
          
          {/* Asset Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Assets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {histories.map(history => (
                <div key={history.assetId} className="flex items-center space-x-2">
                  <Checkbox
                    id={`asset-${history.assetId}`}
                    checked={selectedAssets.includes(history.assetId)}
                    onCheckedChange={() => handleAssetToggle(history.assetId)}
                  />
                  <label 
                    htmlFor={`asset-${history.assetId}`} 
                    className="text-sm flex items-center gap-2 flex-1"
                  >
                    <div 
                      className="w-3 h-3 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: history.color }}
                    />
                    <span className="truncate">{history.assetName}</span>
                    <Badge variant="outline" className="text-xs ml-auto">
                      {history.assetType}
                    </Badge>
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        
        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={[37.7749, -122.4194]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© OpenStreetMap contributors'
            />
            
            <MapUpdater
              histories={histories}
              currentTime={currentTime}
              selectedAssets={selectedAssets}
              showPaths={showPaths}
              showMarkers={showMarkers}
            />
            
            {showPaths && (
              <PathPolylines
                histories={histories}
                currentTime={currentTime}
                selectedAssets={selectedAssets}
              />
            )}
            
            {showMarkers && (
              <AnimatedMarkers
                histories={histories}
                currentTime={currentTime}
                selectedAssets={selectedAssets}
              />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
