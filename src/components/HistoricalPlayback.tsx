import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Navigation,
  Activity,
  ChevronLeft,
} from "lucide-react";
import { format } from "date-fns";
import type { Asset } from "../types";
import { mockAssets as allMockAssets } from "../data/mockData";

interface LocationPoint {
  timestamp: string;
  lat: number;
  lng: number;
  speed: number;
  battery: number;
  event?: string;
}

// Generate mock historical data
const generateHistoricalData = (startDate: Date): LocationPoint[] => {
  const points: LocationPoint[] = [];
  const baseLatDelta = 0.001;
  const baseLngDelta = 0.001;
  
  for (let i = 0; i < 100; i++) {
    const time = new Date(startDate);
    time.setMinutes(startDate.getMinutes() + i * 5);
    
    points.push({
      timestamp: time.toISOString(),
      lat: 40.7128 + (Math.sin(i / 10) * baseLatDelta * 20) + (i * baseLatDelta),
      lng: -74.0060 + (Math.cos(i / 10) * baseLngDelta * 20) + (i * baseLngDelta),
      speed: Math.random() * 30,
      battery: 100 - (i * 0.5),
      event: i % 20 === 0 ? (i % 40 === 0 ? "Stop" : "Geofence Entry") : undefined,
    });
  }
  
  return points;
};

interface HistoricalPlaybackProps {
  onBack?: () => void;
  preselectedAsset?: Asset;
}

export function HistoricalPlayback({ onBack, preselectedAsset }: HistoricalPlaybackProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const pathLineRef = useRef<any>(null);
  const currentMarkerRef = useRef<any>(null);
  const eventMarkersRef = useRef<any[]>([]);
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(preselectedAsset?.id || allMockAssets[0]?.id || "AST-1045");
  const [dateRangeOption, setDateRangeOption] = useState("today");
  const [customStartDate, setCustomStartDate] = useState<Date>(new Date(2024, 9, 1, 9, 0));
  const [customEndDate, setCustomEndDate] = useState<Date>(new Date(2024, 9, 1, 17, 0));
  const [playbackSpeed, setPlaybackSpeed] = useState("1");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [historicalData, setHistoricalData] = useState<LocationPoint[]>([]);

  // Calculate the actual start and end dates based on the selected option
  const getDateRange = (): { start: Date; end: Date } => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateRangeOption) {
      case "today":
        return {
          start: new Date(today.getTime()),
          end: new Date(now.getTime()),
        };
      case "last-24h":
        return {
          start: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          end: new Date(now.getTime()),
        };
      case "last-7d":
        return {
          start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          end: new Date(now.getTime()),
        };
      case "last-30d":
        return {
          start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          end: new Date(now.getTime()),
        };
      case "custom":
        return {
          start: customStartDate,
          end: customEndDate,
        };
      default:
        return {
          start: today,
          end: now,
        };
    }
  };

  const { start: startDate, end: endDate } = getDateRange();

  // Initialize historical data
  useEffect(() => {
    setHistoricalData(generateHistoricalData(startDate));
    setCurrentIndex(0);
  }, [selectedAsset, dateRangeOption, customStartDate, customEndDate]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapLoaded) return;

    setMapLoading(true);

    const initMap = async () => {
      try {
        // Load Leaflet CSS
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        const L = await import("leaflet");

        // Fix for default marker icon issue with webpack/vite
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        const map = L.map(mapRef.current).setView([40.7128, -74.0060], 13);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        mapInstanceRef.current = map;
        setMapLoaded(true);
        setMapLoading(false);
      } catch (error) {
        console.error("Error loading map:", error);
        setMapLoading(false);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map visualization when currentIndex changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded || historicalData.length === 0) return;

    const updateMapVisualization = async () => {
      const L = await import("leaflet");

      // Clear existing visualizations
      if (pathLineRef.current) {
        mapInstanceRef.current.removeLayer(pathLineRef.current);
      }
      if (currentMarkerRef.current) {
        mapInstanceRef.current.removeLayer(currentMarkerRef.current);
      }
      eventMarkersRef.current.forEach(marker => {
        mapInstanceRef.current.removeLayer(marker);
      });
      eventMarkersRef.current = [];

      const pathUpToCurrent = historicalData.slice(0, currentIndex + 1);
      const currentPoint = historicalData[currentIndex];

      if (!currentPoint) return;

      // Draw path up to current point
      const pathCoordinates = pathUpToCurrent.map(p => [p.lat, p.lng] as [number, number]);
      pathLineRef.current = L.polyline(pathCoordinates, {
        color: '#3b82f6',
        weight: 3,
        opacity: 0.7,
      }).addTo(mapInstanceRef.current);

      // Add event markers
      pathUpToCurrent.forEach((point, idx) => {
        if (point.event) {
          const eventMarker = L.circleMarker([point.lat, point.lng], {
            radius: 6,
            fillColor: '#ef4444',
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8,
          }).addTo(mapInstanceRef.current);

          eventMarker.bindPopup(`
            <div style="min-width: 150px;">
              <div style="font-weight: 600; margin-bottom: 4px;">${point.event}</div>
              <div style="font-size: 11px; color: #666;">${format(new Date(point.timestamp), "PPP 'at' HH:mm")}</div>
            </div>
          `);

          eventMarkersRef.current.push(eventMarker);
        }
      });

      // Add current position marker
      const asset = mockAssets.find(a => a.id === selectedAsset);
      const currentMarkerHtml = `
        <div style="
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        ">
          <div style="
            background: white;
            border: 2px solid #3b82f6;
            border-radius: 6px;
            padding: 4px 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            white-space: nowrap;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 4px;
          ">${asset?.name || 'Asset'}</div>
          <div style="
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #3b82f6;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>
        </div>
      `;

      currentMarkerRef.current = L.marker([currentPoint.lat, currentPoint.lng], {
        icon: L.divIcon({
          html: currentMarkerHtml,
          className: 'custom-marker',
          iconSize: [100, 50],
          iconAnchor: [50, 50],
        }),
      }).addTo(mapInstanceRef.current);

      // Center map on current position
      mapInstanceRef.current.setView([currentPoint.lat, currentPoint.lng], mapInstanceRef.current.getZoom());
    };

    updateMapVisualization();
  }, [currentIndex, historicalData, mapLoaded, selectedAsset]);

  // Playback animation
  useEffect(() => {
    if (!isPlaying) return;

    const speed = parseFloat(playbackSpeed);
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= historicalData.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, historicalData.length]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStepBack = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    setIsPlaying(false);
  };

  const handleStepForward = () => {
    setCurrentIndex((prev) => Math.min(historicalData.length - 1, prev + 1));
    setIsPlaying(false);
  };

  const handleSliderChange = (value: number[]) => {
    setCurrentIndex(value[0]);
    setIsPlaying(false);
  };

  const currentPoint = historicalData[currentIndex];
  const asset = allMockAssets.find(a => a.id === selectedAsset);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="flex items-center gap-2">
              <Activity className="h-6 w-6" />
              Historical Location Playback
              {preselectedAsset && asset && (
                <Badge variant="outline" className="ml-2">
                  {asset.name} ({asset.id})
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">
              Replay asset movement and analyze historical location data
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Visualization */}
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <div className="h-[600px] relative">
              <div ref={mapRef} className="h-full w-full rounded-lg overflow-hidden" />
              {mapLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading map...</p>
                  </div>
                </div>
              )}
              
              {/* Legend */}
              {mapLoaded && (
                <div className="absolute bottom-4 left-4 bg-white border rounded-lg p-3 shadow-sm z-[1000]">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>Current Position</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-0.5 bg-blue-500"></div>
                      <span>Path Traveled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border-2 border-red-500 bg-white"></div>
                      <span>Events</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="space-y-4">
          {/* Asset Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Asset Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allMockAssets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name} ({asset.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Date Range */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Date Range</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Time Period</label>
                <Select value={dateRangeOption} onValueChange={setDateRangeOption}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="last-24h">Last 24 Hours</SelectItem>
                    <SelectItem value="last-7d">Last 7 Days</SelectItem>
                    <SelectItem value="last-30d">Last 30 Days</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dateRangeOption === "custom" && (
                <>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Start Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(customStartDate, "PPP HH:mm")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={customStartDate}
                          onSelect={(date) => date && setCustomStartDate(date)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">End Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(customEndDate, "PPP HH:mm")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={customEndDate}
                          onSelect={(date) => date && setCustomEndDate(date)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </>
              )}

              {dateRangeOption !== "custom" && (
                <div className="pt-2 pb-1">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>From:</span>
                      <span>{format(startDate, "PPP HH:mm")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>To:</span>
                      <span>{format(endDate, "PPP HH:mm")}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Status */}
          {currentPoint && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Current Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Time</span>
                  </div>
                  <span className="text-sm">
                    {format(new Date(currentPoint.timestamp), "HH:mm:ss")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Navigation className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Speed</span>
                  </div>
                  <span className="text-sm">{currentPoint.speed.toFixed(1)} mph</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Battery</span>
                  </div>
                  <span className="text-sm">{currentPoint.battery.toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Location</span>
                  </div>
                  <span className="text-sm font-mono text-xs">
                    {currentPoint.lat.toFixed(5)}, {currentPoint.lng.toFixed(5)}
                  </span>
                </div>
                {currentPoint.event && (
                  <div className="pt-2">
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      {currentPoint.event}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Playback Speed */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Playback Speed</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={playbackSpeed} onValueChange={setPlaybackSpeed}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">0.5x</SelectItem>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
                  <SelectItem value="5">5x</SelectItem>
                  <SelectItem value="10">10x</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Playback Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                variant="outline"
                onClick={handleStepBack}
                disabled={currentIndex === 0}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={handlePlayPause}>
                {isPlaying ? (
                  <Pause className="h-4 w-4 mr-2" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isPlaying ? "Pause" : "Play"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleStepForward}
                disabled={currentIndex === historicalData.length - 1}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <Slider
                  value={[currentIndex]}
                  onValueChange={handleSliderChange}
                  max={historicalData.length - 1}
                  step={1}
                  className="flex-1"
                />
              </div>
              <span className="text-sm text-muted-foreground min-w-[100px] text-right">
                {currentIndex + 1} / {historicalData.length}
              </span>
            </div>
            {currentPoint && (
              <div className="text-sm text-center text-muted-foreground">
                {format(new Date(currentPoint.timestamp), "PPP 'at' HH:mm:ss")}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
