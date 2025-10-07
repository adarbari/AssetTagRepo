import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw,
  Settings,
  Clock,
  Gauge,
  Route,
  Eye,
  EyeOff,
  CalendarIcon,
  X
} from 'lucide-react';
import { format } from 'date-fns';

interface PlaybackControlPanelProps {
  // Playback state
  isPlaying: boolean;
  playbackSpeed: number;
  currentTime: number;
  timeRange: { start: number; end: number };
  progress: number;
  
  // Display options
  showPaths: boolean;
  showMarkers: boolean;
  selectedAssetsCount: number;
  
  // Event handlers
  onPlayPause: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onTimeChange: (time: number) => void;
  onShowPathsChange: (show: boolean) => void;
  onShowMarkersChange: (show: boolean) => void;
  onDateRangeChange: (start: Date, end: Date) => void;
  onClose: () => void;
  
  // Date range
  selectedDateRange?: { from: Date; to: Date };
}

export function PlaybackControlPanel({
  isPlaying,
  playbackSpeed,
  currentTime,
  timeRange,
  progress,
  showPaths,
  showMarkers,
  selectedAssetsCount,
  onPlayPause,
  onSkipBack,
  onSkipForward,
  onReset,
  onSpeedChange,
  onTimeChange,
  onShowPathsChange,
  onShowMarkersChange,
  onDateRangeChange,
  onClose,
  selectedDateRange
}: PlaybackControlPanelProps) {
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState<{from: Date | undefined, to: Date | undefined}>({
    from: selectedDateRange?.from,
    to: selectedDateRange?.to
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when panel is visible and not in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          onPlayPause();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          onSkipBack();
          break;
        case 'ArrowRight':
          event.preventDefault();
          onSkipForward();
          break;
        case 'ArrowUp':
          event.preventDefault();
          const fasterSpeed = Math.min(8, playbackSpeed * 2);
          onSpeedChange(fasterSpeed);
          break;
        case 'ArrowDown':
          event.preventDefault();
          const slowerSpeed = Math.max(0.25, playbackSpeed / 2);
          onSpeedChange(slowerSpeed);
          break;
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onPlayPause, onSkipBack, onSkipForward, onSpeedChange, onClose, playbackSpeed]);

  const handleTimeSliderChange = (value: number[]) => {
    const newTime = timeRange.start + (value[0] / 100) * (timeRange.end - timeRange.start);
    onTimeChange(newTime);
  };

  const handleDateRangeApply = () => {
    if (tempDateRange.from && tempDateRange.to) {
      onDateRangeChange(tempDateRange.from, tempDateRange.to);
      setIsDateRangeOpen(false);
    }
  };

  const formatTime = (timestamp: number) => {
    return format(new Date(timestamp), 'MMM dd, HH:mm');
  };

  const formatDuration = (start: number, end: number) => {
    const duration = end - start;
    const days = Math.floor(duration / (1000 * 60 * 60 * 24));
    const hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    return `${hours}h`;
  };

  return (
    <div className="w-full bg-background/95 backdrop-blur-sm border-t shadow-lg max-w-full playback-controls-mobile">
      {/* Main Playback Controls */}
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        {/* Timeline Scrubber */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatDuration(timeRange.start, timeRange.end)}</span>
            <span>{formatTime(timeRange.end)}</span>
          </div>
          <Slider
            value={[progress]}
            onValueChange={handleTimeSliderChange}
            min={0}
            max={100}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Main Controls Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          {/* Left: Playback Controls */}
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onSkipBack}
              disabled={currentTime <= timeRange.start}
              className="h-8 w-8 p-0"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            
            <Button
              variant="default"
              size="sm"
              onClick={onPlayPause}
              className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 shadow-md"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onSkipForward}
              disabled={currentTime >= timeRange.end}
              className="h-8 w-8 p-0"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="h-8 w-8 p-0"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* Center: Speed Control */}
          <div className="flex items-center space-x-2 order-3 sm:order-2">
            <Gauge className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Speed:</span>
            <div className="flex items-center space-x-1">
              {[0.5, 1, 2, 4, 8].map(speed => (
                <Button
                  key={speed}
                  size="sm"
                  variant={playbackSpeed === speed ? "default" : "ghost"}
                  className="h-7 px-2 text-xs"
                  onClick={() => onSpeedChange(speed)}
                >
                  {speed}x
                </Button>
              ))}
            </div>
          </div>

          {/* Right: Date Range & Close */}
          <div className="flex items-center space-x-3 order-2 sm:order-3">
            <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {selectedDateRange?.from && selectedDateRange?.to 
                    ? `${format(selectedDateRange.from, 'MMM dd')} - ${format(selectedDateRange.to, 'MMM dd')}` 
                    : 'Select Range'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end" side="top" sideOffset={5}>
                <div className="p-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Select Time Range</h4>
                      <p className="text-xs text-muted-foreground">Choose the date range for playback</p>
                    </div>
                    
                    {/* Quick Preset Buttons */}
                    <div className="flex items-center justify-between gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => {
                          const today = new Date();
                          const yesterday = new Date(today);
                          yesterday.setDate(yesterday.getDate() - 1);
                          setTempDateRange({ from: yesterday, to: today });
                        }}
                      >
                        Last 24h
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => {
                          const today = new Date();
                          const weekAgo = new Date(today);
                          weekAgo.setDate(weekAgo.getDate() - 7);
                          setTempDateRange({ from: weekAgo, to: today });
                        }}
                      >
                        Last 7 days
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => {
                          const today = new Date();
                          const monthAgo = new Date(today);
                          monthAgo.setDate(monthAgo.getDate() - 30);
                          setTempDateRange({ from: monthAgo, to: today });
                        }}
                      >
                        Last 30 days
                      </Button>
                    </div>
                    
                    {/* Calendar */}
                    <div className="border rounded-lg p-3 bg-white">
                      <Calendar
                        mode="range"
                        selected={tempDateRange}
                        onSelect={(range) => {
                          if (range?.from && range?.to) {
                            setTempDateRange({ from: range.from, to: range.to });
                          } else if (range?.from) {
                            setTempDateRange({ from: range.from, to: undefined });
                          }
                        }}
                        numberOfMonths={1}
                        className="rounded-md"
                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                      />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2 pt-2 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => {
                          setTempDateRange({ from: selectedDateRange?.from, to: selectedDateRange?.to });
                          setIsDateRangeOpen(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        className="text-xs"
                        onClick={handleDateRangeApply}
                        disabled={!tempDateRange.from || !tempDateRange.to}
                      >
                        Apply Range
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Secondary Controls Row */}
      <div className="px-4 sm:px-6 py-3 bg-muted/30 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Display Options */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground font-medium">Display:</span>
              <div className="flex items-center space-x-1">
                <Button 
                  size="sm" 
                  variant={showPaths ? "default" : "ghost"} 
                  className="h-7 px-2 text-xs"
                  onClick={() => onShowPathsChange(!showPaths)}
                >
                  {showPaths ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                  Paths
                </Button>
                <Button 
                  size="sm" 
                  variant={showMarkers ? "default" : "ghost"} 
                  className="h-7 px-2 text-xs"
                  onClick={() => onShowMarkersChange(!showMarkers)}
                >
                  {showMarkers ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                  Markers
                </Button>
              </div>
            </div>

            {/* Asset Count */}
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {selectedAssetsCount} Assets
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Status Indicator */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Playback Mode</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
