# Asset Playback Feature

## Overview

The Asset Playback feature provides a comprehensive time-based visualization of asset movements over time. It allows users to replay historical asset tracking data with full control over playback speed, time range, and asset selection.

## Features

### 🎬 Playback Controls
- **Play/Pause**: Start and stop the playback animation
- **Speed Control**: Adjust playback speed from 0.25x to 4x
- **Time Scrubbing**: Jump to any point in time using the timeline slider
- **Skip Controls**: Jump backward/forward by 1 hour intervals
- **Reset**: Return to the beginning of the time range

### 🎨 Visual Features
- **Color-Coded Paths**: Each asset has a unique color for easy identification
- **Dynamic Zoom**: Map automatically adjusts zoom level based on asset movement bounds
- **Smooth Animation**: Assets move smoothly along their historical paths
- **Custom Markers**: Each asset has a distinctive marker with its initial letter
- **Path Visualization**: Historical paths are shown as colored polylines

### 🎛️ Display Options
- **Show/Hide Paths**: Toggle path visualization on/off
- **Show/Hide Markers**: Toggle current position markers on/off
- **Asset Selection**: Choose which assets to display in the playback

### 📊 Asset Information
- **Real-time Popups**: Click on any marker to see current asset status
- **Event Tracking**: Shows arrival, departure, moving, idle, and stopped events
- **Speed Information**: Displays current speed when available
- **Battery Status**: Shows battery level at each point in time

## Usage

### Accessing Playback Mode
1. Navigate to the Asset Intelligence Map
2. Click the "Playback" button in the top-right corner
3. The interface will switch to playback mode

### Controlling Playback
1. **Start Playback**: Click the Play button
2. **Adjust Speed**: Use the speed slider (0.25x to 4x)
3. **Jump in Time**: Use the timeline slider or skip buttons
4. **Select Assets**: Check/uncheck assets in the left panel
5. **Toggle Display**: Use the display options to show/hide paths and markers

### Data Structure

The playback feature uses the following data structure:

```typescript
interface LocationHistoryPoint {
  id: string;
  assetId: string;
  timestamp: string;
  location: string;
  lat: number;
  lng: number;
  event: 'arrived' | 'departed' | 'moving' | 'idle' | 'stopped';
  speed?: number;
  heading?: number;
  distance?: number;
  accuracy?: number;
  battery?: number;
}

interface AssetLocationHistory {
  assetId: string;
  assetName: string;
  assetType: string;
  color: string; // Unique color for this asset
  startDate: string;
  endDate: string;
  trackingPoints: LocationHistoryPoint[];
  totalDistance?: number;
  averageSpeed?: number;
  maxSpeed?: number;
}
```

## Technical Implementation

### Components
- **AssetPlaybackMap**: Main playback component
- **MapUpdater**: Handles dynamic map bounds and zoom
- **AnimatedMarkers**: Renders current position markers
- **PathPolylines**: Renders historical paths

### Key Features
- **Real-time Bounds Calculation**: Automatically adjusts map view based on visible assets
- **Smooth Animation**: Uses requestAnimationFrame for smooth marker movement
- **Memory Efficient**: Only renders visible assets and paths
- **Responsive Design**: Works on desktop and mobile devices

### Performance Optimizations
- **Lazy Loading**: Only loads data for selected assets
- **Efficient Rendering**: Uses React.memo for expensive components
- **Debounced Updates**: Prevents excessive re-renders during playback
- **Bounds Caching**: Caches calculated bounds for better performance

## Customization

### Colors
Asset colors are defined in the `generateLocationHistory` function in `mockData.ts`:

```typescript
const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];
```

### Time Intervals
Default data points are generated every 30 minutes. This can be adjusted in the `generateLocationHistory` function:

```typescript
const intervalMs = 30 * 60 * 1000; // 30 minutes
```

### Playback Speed
Speed range can be modified in the AssetPlaybackMap component:

```typescript
<Slider
  value={[playbackSpeed]}
  onValueChange={(value) => setPlaybackSpeed(value[0])}
  min={0.25}
  max={4}
  step={0.25}
/>
```

## Future Enhancements

### Planned Features
- **Export Functionality**: Export playback as video or GIF
- **Event Markers**: Show specific events (maintenance, alerts) on timeline
- **Multi-Select Timeline**: Select multiple time ranges for comparison
- **Heatmap Overlay**: Show asset density over time
- **Route Optimization**: Analyze and suggest optimal routes

### Integration Opportunities
- **Real-time Data**: Connect to live asset tracking APIs
- **Alert Integration**: Show alerts that occurred during playback
- **Analytics**: Provide insights on asset utilization patterns
- **Reporting**: Generate reports based on playback analysis

## Troubleshooting

### Common Issues
1. **Map Not Loading**: Check internet connection and Leaflet dependencies
2. **No Data**: Ensure asset location history is properly generated
3. **Performance Issues**: Reduce number of selected assets or time range
4. **Styling Issues**: Verify CSS imports and Tailwind configuration

### Debug Mode
Enable debug logging by setting `console.log` statements in the component lifecycle methods.

## Dependencies

- **React Leaflet**: Map rendering and interaction
- **Leaflet**: Core mapping library
- **Radix UI**: UI components (Slider, Checkbox, etc.)
- **Lucide React**: Icons
- **date-fns**: Date formatting and manipulation
