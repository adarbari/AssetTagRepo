import { useState, useEffect, useRef } from &apos;react&apos;;
import { Card, CardContent, CardHeader, CardTitle } from &apos;../ui/card&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Slider } from &apos;../ui/slider&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &apos;../ui/select&apos;;
import { Calendar } from &apos;../ui/calendar&apos;;
import { Popover, PopoverContent, PopoverTrigger } from &apos;../ui/popover&apos;;
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
} from &apos;lucide-react&apos;;
import { format } from &apos;date-fns&apos;;
import { LoadingState, PageLayout } from &apos;../common&apos;;
import type { Asset } from &apos;../../types&apos;;
import { mockAssets as allMockAssets } from &apos;../../data/mockData&apos;;

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
      lat: 40.7128 + Math.sin(i / 10) * baseLatDelta * 20 + i * baseLatDelta,
      lng: -74.006 + Math.cos(i / 10) * baseLngDelta * 20 + i * baseLngDelta,
      speed: Math.random() * 30,
      battery: 100 - i * 0.5,
      event:
        i % 20 === 0 ? (i % 40 === 0 ? &apos;Stop&apos; : &apos;Geofence Entry&apos;) : undefined,
    });
  }

  return points;
};

interface HistoricalPlaybackProps {
  onBack?: () => void;
  preselectedAsset?: Asset;
}

export function HistoricalPlayback({
  onBack,
  preselectedAsset,
}: HistoricalPlaybackProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const pathLineRef = useRef<any>(null);
  const currentMarkerRef = useRef<any>(null);
  const eventMarkersRef = useRef<unknown[]>([]);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(
    preselectedAsset?.id || allMockAssets[0]?.id || &apos;AST-1045&apos;
  );
  const [dateRangeOption, setDateRangeOption] = useState(&apos;today&apos;);
  const [customStartDate, setCustomStartDate] = useState<Date>(
    new Date(2024, 9, 1, 9, 0)
  );
  const [customEndDate, setCustomEndDate] = useState<Date>(
    new Date(2024, 9, 1, 17, 0)
  );
  const [playbackSpeed, setPlaybackSpeed] = useState(&apos;1&apos;);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [historicalData, setHistoricalData] = useState<LocationPoint[]>([]);

  // Calculate the actual start and end dates based on the selected option
  const getDateRange = (): { start: Date; end: Date } => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (dateRangeOption) {
      case &apos;today&apos;:
        return {
          start: new Date(today.getTime()),
          end: new Date(now.getTime()),
        };
      case &apos;last-24h&apos;:
        return {
          start: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          end: new Date(now.getTime()),
        };
      case &apos;last-7d&apos;:
        return {
          start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          end: new Date(now.getTime()),
        };
      case &apos;last-30d&apos;:
        return {
          start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          end: new Date(now.getTime()),
        };
      case &apos;custom&apos;:
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
        if (!document.getElementById(&apos;leaflet-css&apos;)) {
          const link = document.createElement(&apos;link&apos;);
          link.id = &apos;leaflet-css&apos;;
          link.rel = &apos;stylesheet&apos;;
          link.href = &apos;https://unpkg.com/leaflet/dist/leaflet.css&apos;;
          document.head.appendChild(link);
        }

        const L = await import(&apos;leaflet&apos;);

        // Fix for default marker icon issue with webpack/vite
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            &apos;https://unpkg.com/leaflet/dist/images/marker-icon-2x.png&apos;,
          iconUrl: &apos;https://unpkg.com/leaflet/dist/images/marker-icon.png&apos;,
          shadowUrl: &apos;https://unpkg.com/leaflet/dist/images/marker-shadow.png&apos;,
        });

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        const map = L.map(mapRef.current).setView([40.7128, -74.006], 13);

        L.tileLayer(&apos;https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png&apos;, {
          attribution:
            &apos;&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors&apos;,
        }).addTo(map);

        mapInstanceRef.current = map;
        setMapLoaded(true);
        setMapLoading(false);
      } catch (error) {
        // console.error(&apos;Error loading map:&apos;, error);
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
    if (!mapInstanceRef.current || !mapLoaded || historicalData.length === 0)
      return;

    const updateMapVisualization = async () => {
      const L = await import(&apos;leaflet&apos;);

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
      const pathCoordinates = pathUpToCurrent.map(
        p => [p.lat, p.lng] as [number, number]
      );
      pathLineRef.current = L.polyline(pathCoordinates, {
        color: &apos;#3b82f6&apos;,
        weight: 3,
        opacity: 0.7,
      }).addTo(mapInstanceRef.current);

      // Add event markers
      pathUpToCurrent.forEach((point, _idx) => {
        if (point.event) {
          const eventMarker = L.circleMarker([point.lat, point.lng], {
            radius: 6,
            fillColor: &apos;#ef4444&apos;,
            color: &apos;#fff&apos;,
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8,
          }).addTo(mapInstanceRef.current);

          eventMarker.bindPopup(`
            <div style=&quot;min-width: 150px;&quot;>
              <div style=&quot;font-weight: 600; margin-bottom: 4px;&quot;>${point.event}</div>
              <div style=&quot;font-size: 11px; color: #666;&quot;>${format(new Date(point.timestamp), &quot;PPP &apos;at&apos; HH:mm&quot;)}</div>
            </div>
          `);

          eventMarkersRef.current.push(eventMarker);
        }
      });

      // Add current position marker
      const asset = mockAssets.find(a => a.id === selectedAsset);
      const currentMarkerHtml = `
        <div style=&quot;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        &quot;>
          <div style=&quot;
            background: white;
            border: 2px solid #3b82f6;
            border-radius: 6px;
            padding: 4px 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            white-space: nowrap;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 4px;
          &quot;>${asset?.name || &apos;Asset&apos;}</div>
          <div style=&quot;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #3b82f6;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          &quot;></div>
        </div>
      `;

      currentMarkerRef.current = L.marker(
        [currentPoint.lat, currentPoint.lng],
        {
          icon: L.divIcon({
            html: currentMarkerHtml,
            className: &apos;custom-marker&apos;,
            iconSize: [100, 50],
            iconAnchor: [50, 50],
          }),
        }
      ).addTo(mapInstanceRef.current);

      // Center map on current position
      mapInstanceRef.current.setView(
        [currentPoint.lat, currentPoint.lng],
        mapInstanceRef.current.getZoom()
      );
    };

    updateMapVisualization();
  }, [currentIndex, historicalData, mapLoaded, selectedAsset]);

  // Playback animation
  useEffect(() => {
    if (!isPlaying) return;

    const speed = parseFloat(playbackSpeed);
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
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
    setCurrentIndex(prev => Math.max(0, prev - 1));
    setIsPlaying(false);
  };

  const handleStepForward = () => {
    setCurrentIndex(prev => Math.min(historicalData.length - 1, prev + 1));
    setIsPlaying(false);
  };

  const handleSliderChange = (value: number[]) => {
    setCurrentIndex(value[0]);
    setIsPlaying(false);
  };

  const currentPoint = historicalData[currentIndex];
  const asset = allMockAssets.find(a => a.id === selectedAsset);

  return (
    <PageLayout variant=&apos;full&apos; padding=&apos;md&apos;>
      {/* Header */}
      <div className=&apos;flex items-center justify-between&apos;>
        <div className=&apos;flex items-center gap-4&apos;>
          {onBack && (
            <Button variant=&apos;ghost&apos; size=&apos;icon&apos; onClick={onBack}>
              <ChevronLeft className=&apos;h-5 w-5&apos; />
            </Button>
          )}
          <div>
            <h1 className=&apos;flex items-center gap-2&apos;>
              <Activity className=&apos;h-6 w-6&apos; />
              Historical Location Playback
              {preselectedAsset && asset && (
                <Badge variant=&apos;outline&apos; className=&apos;ml-2&apos;>
                  {asset.name} ({asset.id})
                </Badge>
              )}
            </h1>
            <p className=&apos;text-muted-foreground&apos;>
              Replay asset movement and analyze historical location data
            </p>
          </div>
        </div>
      </div>

      <div className=&apos;grid grid-cols-1 lg:grid-cols-3 gap-6&apos;>
        {/* Map Visualization */}
        <Card className=&apos;lg:col-span-2&apos;>
          <CardContent className=&apos;p-0&apos;>
            <div className=&apos;h-[600px] relative&apos;>
              <div
                ref={mapRef}
                className=&apos;h-full w-full rounded-lg overflow-hidden&apos;
              />
              {mapLoading && (
                <div className=&apos;absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg&apos;>
                  <LoadingState message=&apos;Loading map...&apos; size=&apos;sm&apos; />
                </div>
              )}

              {/* Legend */}
              {mapLoaded && (
                <div className=&apos;absolute bottom-4 left-4 bg-white border rounded-lg p-3 shadow-sm z-[1000]&apos;>
                  <div className=&apos;space-y-2 text-sm&apos;>
                    <div className=&apos;flex items-center gap-2&apos;>
                      <div className=&apos;w-3 h-3 rounded-full bg-blue-500&apos;></div>
                      <span>Current Position</span>
                    </div>
                    <div className=&apos;flex items-center gap-2&apos;>
                      <div className=&apos;w-8 h-0.5 bg-blue-500&apos;></div>
                      <span>Path Traveled</span>
                    </div>
                    <div className=&apos;flex items-center gap-2&apos;>
                      <div className=&apos;w-3 h-3 rounded-full border-2 border-red-500 bg-white&apos;></div>
                      <span>Events</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className=&apos;space-y-4&apos;>
          {/* Asset Selection */}
          <Card>
            <CardHeader className=&apos;pb-3&apos;>
              <CardTitle className=&apos;text-sm&apos;>Asset Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allMockAssets.map(asset => (
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
            <CardHeader className=&apos;pb-3&apos;>
              <CardTitle className=&apos;text-sm&apos;>Date Range</CardTitle>
            </CardHeader>
            <CardContent className=&apos;space-y-3&apos;>
              <div>
                <label className=&apos;text-sm text-muted-foreground mb-2 block&apos;>
                  Time Period
                </label>
                <Select
                  value={dateRangeOption}
                  onValueChange={setDateRangeOption}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=&apos;today&apos;>Today</SelectItem>
                    <SelectItem value=&apos;last-24h&apos;>Last 24 Hours</SelectItem>
                    <SelectItem value=&apos;last-7d&apos;>Last 7 Days</SelectItem>
                    <SelectItem value=&apos;last-30d&apos;>Last 30 Days</SelectItem>
                    <SelectItem value=&apos;custom&apos;>Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dateRangeOption === &apos;custom&apos; && (
                <>
                  <div>
                    <label className=&apos;text-sm text-muted-foreground mb-2 block&apos;>
                      Start Date
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant=&apos;outline&apos;
                          className=&apos;w-full justify-start&apos;
                        >
                          <CalendarIcon className=&apos;mr-2 h-4 w-4&apos; />
                          {format(customStartDate, &apos;PPP HH:mm&apos;)}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className=&apos;w-auto p-0&apos;>
                        <Calendar
                          mode=&apos;single&apos;
                          selected={customStartDate}
                          onSelect={date => date && setCustomStartDate(date)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className=&apos;text-sm text-muted-foreground mb-2 block&apos;>
                      End Date
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant=&apos;outline&apos;
                          className=&apos;w-full justify-start&apos;
                        >
                          <CalendarIcon className=&apos;mr-2 h-4 w-4&apos; />
                          {format(customEndDate, &apos;PPP HH:mm&apos;)}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className=&apos;w-auto p-0&apos;>
                        <Calendar
                          mode=&apos;single&apos;
                          selected={customEndDate}
                          onSelect={date => date && setCustomEndDate(date)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </>
              )}

              {dateRangeOption !== &apos;custom&apos; && (
                <div className=&apos;pt-2 pb-1&apos;>
                  <div className=&apos;text-xs text-muted-foreground space-y-1&apos;>
                    <div className=&apos;flex justify-between&apos;>
                      <span>From:</span>
                      <span>{format(startDate, &apos;PPP HH:mm&apos;)}</span>
                    </div>
                    <div className=&apos;flex justify-between&apos;>
                      <span>To:</span>
                      <span>{format(endDate, &apos;PPP HH:mm&apos;)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Status */}
          {currentPoint && (
            <Card>
              <CardHeader className=&apos;pb-3&apos;>
                <CardTitle className=&apos;text-sm&apos;>Current Status</CardTitle>
              </CardHeader>
              <CardContent className=&apos;space-y-3&apos;>
                <div className=&apos;flex items-center justify-between&apos;>
                  <div className=&apos;flex items-center gap-2 text-sm&apos;>
                    <Clock className=&apos;h-4 w-4 text-muted-foreground&apos; />
                    <span className=&apos;text-muted-foreground&apos;>Time</span>
                  </div>
                  <span className=&apos;text-sm&apos;>
                    {format(new Date(currentPoint.timestamp), &apos;HH:mm:ss&apos;)}
                  </span>
                </div>
                <div className=&apos;flex items-center justify-between&apos;>
                  <div className=&apos;flex items-center gap-2 text-sm&apos;>
                    <Navigation className=&apos;h-4 w-4 text-muted-foreground&apos; />
                    <span className=&apos;text-muted-foreground&apos;>Speed</span>
                  </div>
                  <span className=&apos;text-sm&apos;>
                    {currentPoint.speed.toFixed(1)} mph
                  </span>
                </div>
                <div className=&apos;flex items-center justify-between&apos;>
                  <div className=&apos;flex items-center gap-2 text-sm&apos;>
                    <Activity className=&apos;h-4 w-4 text-muted-foreground&apos; />
                    <span className=&apos;text-muted-foreground&apos;>Battery</span>
                  </div>
                  <span className=&apos;text-sm&apos;>
                    {currentPoint.battery.toFixed(0)}%
                  </span>
                </div>
                <div className=&apos;flex items-center justify-between&apos;>
                  <div className=&apos;flex items-center gap-2 text-sm&apos;>
                    <MapPin className=&apos;h-4 w-4 text-muted-foreground&apos; />
                    <span className=&apos;text-muted-foreground&apos;>Location</span>
                  </div>
                  <span className=&apos;text-sm font-mono text-xs&apos;>
                    {currentPoint.lat.toFixed(5)}, {currentPoint.lng.toFixed(5)}
                  </span>
                </div>
                {currentPoint.event && (
                  <div className=&apos;pt-2&apos;>
                    <Badge
                      variant=&apos;outline&apos;
                      className=&apos;bg-red-50 text-red-700 border-red-200&apos;
                    >
                      {currentPoint.event}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Playback Speed */}
          <Card>
            <CardHeader className=&apos;pb-3&apos;>
              <CardTitle className=&apos;text-sm&apos;>Playback Speed</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={playbackSpeed} onValueChange={setPlaybackSpeed}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=&apos;0.5&apos;>0.5x</SelectItem>
                  <SelectItem value=&apos;1&apos;>1x</SelectItem>
                  <SelectItem value=&apos;2&apos;>2x</SelectItem>
                  <SelectItem value=&apos;5&apos;>5x</SelectItem>
                  <SelectItem value=&apos;10&apos;>10x</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Playback Controls */}
      <Card>
        <CardContent className=&apos;p-4&apos;>
          <div className=&apos;space-y-4&apos;>
            <div className=&apos;flex items-center gap-4&apos;>
              <Button
                size=&apos;sm&apos;
                variant=&apos;outline&apos;
                onClick={handleStepBack}
                disabled={currentIndex === 0}
              >
                <SkipBack className=&apos;h-4 w-4&apos; />
              </Button>
              <Button size=&apos;sm&apos; onClick={handlePlayPause}>
                {isPlaying ? (
                  <Pause className=&apos;h-4 w-4 mr-2&apos; />
                ) : (
                  <Play className=&apos;h-4 w-4 mr-2&apos; />
                )}
                {isPlaying ? &apos;Pause&apos; : &apos;Play&apos;}
              </Button>
              <Button
                size=&apos;sm&apos;
                variant=&apos;outline&apos;
                onClick={handleStepForward}
                disabled={currentIndex === historicalData.length - 1}
              >
                <SkipForward className=&apos;h-4 w-4&apos; />
              </Button>
              <div className=&apos;flex-1&apos;>
                <Slider
                  value={[currentIndex]}
                  onValueChange={handleSliderChange}
                  max={historicalData.length - 1}
                  step={1}
                  className=&apos;flex-1&apos;
                />
              </div>
              <span className=&apos;text-sm text-muted-foreground min-w-[100px] text-right&apos;>
                {currentIndex + 1} / {historicalData.length}
              </span>
            </div>
            {currentPoint && (
              <div className=&apos;text-sm text-center text-muted-foreground&apos;>
                {format(new Date(currentPoint.timestamp), &quot;PPP &apos;at&apos; HH:mm:ss&quot;)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
