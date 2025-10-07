import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Slider } from '../ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { 
  Layers, 
  MapPin, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  EyeOff,
  Settings,
  Truck,
  Wrench,
  PackageIcon,
  Container,
  Route,
  Activity,
  AlertTriangle,
  Shield,
  Building,
  GripVertical
} from 'lucide-react';
import { useOverlayState } from '../../hooks/useOverlayState';
import './map-controls.css';

interface LayerGroup {
  id: string;
  name: string;
  icon: React.ReactNode;
  layers: LayerItem[];
  defaultVisible: boolean;
  opacity: number;
}

interface LayerItem {
  id: string;
  name: string;
  icon?: React.ReactNode;
  visible: boolean;
  count?: number;
  description?: string;
}

interface LegendItem {
  id: string;
  name: string;
  color: string;
  icon?: React.ReactNode;
  category: string;
  visible: boolean;
}

interface MapControlPanelProps {
  // Layer data
  layerGroups: LayerGroup[];
  onLayerToggle: (groupId: string, layerId: string, visible: boolean) => void;
  onLayerGroupToggle: (groupId: string, visible: boolean) => void;
  onOpacityChange: (groupId: string, opacity: number) => void;
  
  // Legend data
  legendItems: LegendItem[];
  onLegendItemClick?: (itemId: string) => void;
  
  // Panel state
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  defaultCollapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
  
  // Responsive behavior
  isMobile?: boolean;
}

export function MapControlPanel({
  layerGroups,
  onLayerToggle,
  onLayerGroupToggle,
  onOpacityChange,
  legendItems,
  onLegendItemClick,
  position = 'bottom-left',
  defaultCollapsed = false,
  onToggle,
  isMobile = false
}: MapControlPanelProps) {
  
  const [isCollapsed, setIsCollapsed] = useOverlayState('map-controls-collapsed', defaultCollapsed);
  const [activeTab, setActiveTab] = useState<'layers' | 'legend'>('layers');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['boundaries', 'assets']));
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle collapse toggle
  const handleToggle = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onToggle?.(newCollapsed);
  };

  // Handle group expansion
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  // Handle show all/hide all for a group
  const handleGroupShowAll = (groupId: string) => {
    const group = layerGroups.find(g => g.id === groupId);
    if (group) {
      group.layers.forEach(layer => {
        if (!layer.visible) {
          onLayerToggle(groupId, layer.id, true);
        }
      });
    }
  };

  const handleGroupHideAll = (groupId: string) => {
    const group = layerGroups.find(g => g.id === groupId);
    if (group) {
      group.layers.forEach(layer => {
        if (layer.visible) {
          onLayerToggle(groupId, layer.id, false);
        }
      });
    }
  };

  // Group legend items by category
  const groupedLegendItems = legendItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, LegendItem[]>);

  // Get visible legend items only
  const visibleLegendItems = legendItems.filter(item => item.visible);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'l' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setActiveTab('layers');
        if (isCollapsed) handleToggle();
      } else if (e.key === 'g' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setActiveTab('legend');
        if (isCollapsed) handleToggle();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isCollapsed]);

  // Panel positioning classes
  const getPositionClasses = () => {
    // Use absolute positioning within the map container
    const baseClasses = 'absolute z-20';
    switch (position) {
      case 'bottom-left':
        return `${baseClasses} bottom-4 left-4`;
      case 'bottom-right':
        return `${baseClasses} bottom-4 right-4`;
      case 'top-left':
        return `${baseClasses} top-4 left-4`;
      case 'top-right':
        return `${baseClasses} top-4 right-4`;
      default:
        return `${baseClasses} bottom-4 left-4`;
    }
  };

  // Mobile drawer classes
  const getMobileClasses = () => {
    if (!isMobile) return '';
    return isCollapsed 
      ? 'map-controls-mobile-collapsed' 
      : 'map-controls-mobile-expanded';
  };

  // Collapsed view - just show toggle button
  if (isCollapsed) {
    return (
      <div className={`${getPositionClasses()} ${getMobileClasses()}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggle}
          className="bg-red-500/90 backdrop-blur-sm shadow-lg border h-10 w-10 p-0"
          title="Map Controls"
        >
          <Layers className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`${getPositionClasses()} ${getMobileClasses()}`} ref={panelRef}>
      <Card className="w-80 bg-background/90 backdrop-blur-sm shadow-lg border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center">
              <Layers className="h-4 w-4 mr-2" />
              Map Controls
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggle}
              className="h-6 w-6 p-0"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'layers' | 'legend')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="layers" className="text-xs">
                <Layers className="h-3 w-3 mr-1" />
                Layers
              </TabsTrigger>
              <TabsTrigger value="legend" className="text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                Legend
                {visibleLegendItems.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                    {visibleLegendItems.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="layers" className="mt-4 space-y-4">
              {layerGroups.map(group => {
                const isExpanded = expandedGroups.has(group.id);
                const visibleLayers = group.layers.filter(layer => layer.visible);
                const hasVisibleLayers = visibleLayers.length > 0;
                
                return (
                  <Collapsible
                    key={group.id}
                    open={isExpanded}
                    onOpenChange={() => toggleGroup(group.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 cursor-pointer">
                        <div className="flex items-center gap-2">
                          {group.icon}
                          <span className="text-sm font-medium">{group.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {visibleLayers.length}/{group.layers.length}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          {hasVisibleLayers && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGroupHideAll(group.id);
                              }}
                              className="h-6 w-6 p-0"
                              title="Hide All"
                            >
                              <EyeOff className="h-3 w-3" />
                            </Button>
                          )}
                          {visibleLayers.length < group.layers.length && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGroupShowAll(group.id);
                              }}
                              className="h-6 w-6 p-0"
                              title="Show All"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="space-y-2">
                      {/* Opacity Control */}
                      <div className="px-2 py-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground">Opacity</span>
                          <span className="text-xs font-medium">{group.opacity}%</span>
                        </div>
                        <Slider
                          value={[group.opacity]}
                          onValueChange={([value]) => onOpacityChange(group.id, value)}
                          max={100}
                          min={0}
                          step={10}
                          className="w-full"
                        />
                      </div>
                      
                      {/* Layer Items */}
                      <div className="space-y-1">
                        {group.layers.map(layer => (
                          <div
                            key={layer.id}
                            className="flex items-center justify-between p-2 rounded-md hover:bg-accent/30"
                          >
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`${group.id}-${layer.id}`}
                                checked={layer.visible}
                                onCheckedChange={(checked) => 
                                  onLayerToggle(group.id, layer.id, checked as boolean)
                                }
                              />
                              <label
                                htmlFor={`${group.id}-${layer.id}`}
                                className="text-sm cursor-pointer flex items-center gap-2"
                              >
                                {layer.icon}
                                <span>{layer.name}</span>
                                {layer.count !== undefined && (
                                  <Badge variant="secondary" className="text-xs">
                                    {layer.count}
                                  </Badge>
                                )}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </TabsContent>
            
            <TabsContent value="legend" className="mt-4 space-y-3">
              {Object.keys(groupedLegendItems).length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No legend items to display
                </div>
              ) : (
                Object.entries(groupedLegendItems).map(([category, items]) => {
                  const visibleItems = items.filter(item => item.visible);
                  if (visibleItems.length === 0) return null;
                  
                  return (
                    <div key={category} className="space-y-2">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {category}
                      </h4>
                      <div className="space-y-1">
                        {visibleItems.map(item => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/30 cursor-pointer"
                            onClick={() => onLegendItemClick?.(item.id)}
                          >
                            <div
                              className="w-3 h-3 rounded-full border border-white shadow-sm"
                              style={{ backgroundColor: item.color }}
                            />
                            {item.icon && <span className="text-sm">{item.icon}</span>}
                            <span className="text-sm">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
