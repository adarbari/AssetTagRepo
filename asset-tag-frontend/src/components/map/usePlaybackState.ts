import { useState, useEffect, useRef, useCallback } from 'react';
import { AssetLocationHistory, getAllAssetLocationHistories } from '../../data/mockData';

interface PlaybackState {
  // Data
  histories: AssetLocationHistory[];
  selectedAssets: string[];
  
  // Playback control
  isPlaying: boolean;
  playbackSpeed: number;
  currentTime: number;
  timeRange: { start: number; end: number };
  
  // Display options
  showPaths: boolean;
  showMarkers: boolean;
  
  // Date range
  selectedDateRange?: { from: Date; to: Date };
}

interface UsePlaybackStateReturn extends PlaybackState {
  // Actions
  loadHistoricalData: (assetIds: string[]) => void;
  setSelectedAssets: (assets: string[]) => void;
  toggleAsset: (assetId: string) => void;
  playPause: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setCurrentTime: (time: number) => void;
  skipBack: () => void;
  skipForward: () => void;
  reset: () => void;
  setShowPaths: (show: boolean) => void;
  setShowMarkers: (show: boolean) => void;
  setDateRange: (from: Date, to: Date) => void;
  
  // Computed values
  progress: number;
  visibleHistories: AssetLocationHistory[];
}

export function usePlaybackState(): UsePlaybackStateReturn {
  const [state, setState] = useState<PlaybackState>({
    histories: [],
    selectedAssets: [],
    isPlaying: false,
    playbackSpeed: 1,
    currentTime: 0,
    timeRange: { start: 0, end: 0 },
    showPaths: true,
    showMarkers: true,
    selectedDateRange: undefined
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load historical data for specified assets
  const loadHistoricalData = useCallback((assetIds: string[]) => {
    console.log('🔄 Loading historical data for assets:', assetIds);
    const allHistories = getAllAssetLocationHistories();
    console.log('📊 All available histories:', allHistories.length, allHistories.map(h => h.assetId));
    
    const filteredHistories = allHistories.filter(h => assetIds.includes(h.assetId));
    console.log('✅ Filtered histories for selected assets:', filteredHistories.length, filteredHistories.map(h => ({
      assetId: h.assetId,
      assetName: h.assetName,
      pointsCount: h.trackingPoints.length,
      timeRange: { start: h.startDate, end: h.endDate }
    })));
    
    setState(prev => {
      let newTimeRange = prev.timeRange;
      let newCurrentTime = prev.currentTime;
      
      if (filteredHistories.length > 0) {
        // Find the overall time range
        const allTimes = filteredHistories.flatMap(h => 
          h.trackingPoints.map(p => new Date(p.timestamp).getTime())
        );
        const startTime = Math.min(...allTimes);
        const endTime = Math.max(...allTimes);
        
        newTimeRange = { start: startTime, end: endTime };
        newCurrentTime = startTime;
        
        console.log('⏰ Time range calculated:', {
          start: new Date(startTime).toISOString(),
          end: new Date(endTime).toISOString(),
          duration: (endTime - startTime) / (1000 * 60 * 60), // hours
          currentTime: new Date(newCurrentTime).toISOString()
        });
      }
      
      return {
        ...prev,
        histories: filteredHistories,
        selectedAssets: assetIds,
        timeRange: newTimeRange,
        currentTime: newCurrentTime,
        isPlaying: false // Stop playback when loading new data
      };
    });
  }, []);

  // Set selected assets
  const setSelectedAssets = useCallback((assets: string[]) => {
    setState(prev => ({ ...prev, selectedAssets: assets }));
  }, []);

  // Toggle individual asset
  const toggleAsset = useCallback((assetId: string) => {
    setState(prev => ({
      ...prev,
      selectedAssets: prev.selectedAssets.includes(assetId)
        ? prev.selectedAssets.filter(id => id !== assetId)
        : [...prev.selectedAssets, assetId]
    }));
  }, []);

  // Play/pause toggle
  const playPause = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  // Set playback speed
  const setPlaybackSpeed = useCallback((speed: number) => {
    setState(prev => ({ ...prev, playbackSpeed: speed }));
  }, []);

  // Set current time
  const setCurrentTime = useCallback((time: number) => {
    setState(prev => ({ 
      ...prev, 
      currentTime: Math.max(prev.timeRange.start, Math.min(prev.timeRange.end, time))
    }));
  }, []);

  // Skip backward (1 hour)
  const skipBack = useCallback(() => {
    setState(prev => {
      const newTime = Math.max(prev.timeRange.start, prev.currentTime - (3600000 * prev.playbackSpeed));
      return { ...prev, currentTime: newTime };
    });
  }, []);

  // Skip forward (1 hour)
  const skipForward = useCallback(() => {
    setState(prev => {
      const newTime = Math.min(prev.timeRange.end, prev.currentTime + (3600000 * prev.playbackSpeed));
      return { ...prev, currentTime: newTime };
    });
  }, []);

  // Reset to beginning
  const reset = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      currentTime: prev.timeRange.start, 
      isPlaying: false 
    }));
  }, []);

  // Set show paths
  const setShowPaths = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showPaths: show }));
  }, []);

  // Set show markers
  const setShowMarkers = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showMarkers: show }));
  }, []);

  // Set date range
  const setDateRange = useCallback((from: Date, to: Date) => {
    setState(prev => {
      // Filter histories based on the new date range
      const filteredHistories = prev.histories.map(history => ({
        ...history,
        trackingPoints: history.trackingPoints.filter(point => {
          const pointTime = new Date(point.timestamp).getTime();
          return pointTime >= from.getTime() && pointTime <= to.getTime();
        })
      })).filter(history => history.trackingPoints.length > 0);

      // Calculate new time range based on filtered data
      let newTimeRange = prev.timeRange;
      let newCurrentTime = prev.currentTime;

      if (filteredHistories.length > 0) {
        // Find the overall time range from filtered data
        const allTimes = filteredHistories.flatMap(h => 
          h.trackingPoints.map(p => new Date(p.timestamp).getTime())
        );
        
        if (allTimes.length > 0) {
          const startTime = Math.min(...allTimes);
          const endTime = Math.max(...allTimes);
          
          newTimeRange = { start: startTime, end: endTime };
          newCurrentTime = startTime; // Reset to start of new range
          
          console.log('📅 Date range updated:', {
            from: from.toISOString(),
            to: to.toISOString(),
            newTimeRange: {
              start: new Date(startTime).toISOString(),
              end: new Date(endTime).toISOString()
            },
            filteredPoints: allTimes.length,
            histories: filteredHistories.length
          });
        }
      }

      return { 
        ...prev, 
        histories: filteredHistories,
        selectedDateRange: { from, to },
        timeRange: newTimeRange,
        currentTime: newCurrentTime,
        isPlaying: false // Stop playback when changing date range
      };
    });
  }, []);

  // Playback animation effect
  useEffect(() => {
    if (state.isPlaying && state.timeRange.end > state.timeRange.start) {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          const nextTime = prev.currentTime + (1000 * prev.playbackSpeed); // 1 second per interval
          if (nextTime >= prev.timeRange.end) {
            return { ...prev, currentTime: prev.timeRange.end, isPlaying: false };
          }
          return { ...prev, currentTime: nextTime };
        });
      }, 100); // Update every 100ms for smooth animation
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isPlaying, state.playbackSpeed, state.timeRange]);

  // Computed values
  const progress = state.timeRange.end > state.timeRange.start 
    ? ((state.currentTime - state.timeRange.start) / (state.timeRange.end - state.timeRange.start)) * 100 
    : 0;

  const visibleHistories = state.histories.filter(h => state.selectedAssets.includes(h.assetId));

  return {
    ...state,
    loadHistoricalData,
    setSelectedAssets,
    toggleAsset,
    playPause,
    setPlaybackSpeed,
    setCurrentTime,
    skipBack,
    skipForward,
    reset,
    setShowPaths,
    setShowMarkers,
    setDateRange,
    progress,
    visibleHistories
  };
}
