import React, { useState, useMemo } from 'react';
import { ViewType } from '../App';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from './ui/sidebar';
import {
  LayoutDashboard,
  Map,
  Package,
  Building2,
  MapPin,
  Bell,
  Settings,
  Radio,
  Wrench,
  Shield,
  Truck,
  BellRing,
  ChevronDown,
  ChevronRight,
  Battery,
  AlertTriangle,
  TrendingDown,
  WifiOff,
} from 'lucide-react';
import { Badge } from './ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import { mockAlerts } from '../data/mockData';

interface AppSidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onAlertTypeClick?: (alertType: string) => void;
}

export function AppSidebar({
  currentView,
  onViewChange,
  onAlertTypeClick,
}: AppSidebarProps) {
  const [alertTypesExpanded, setAlertTypesExpanded] = useState(false);

  const mainItems = [
    { id: 'dashboard' as ViewType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map' as ViewType, label: 'Live Map', icon: Map },
    { id: 'inventory' as ViewType, label: 'Asset Inventory', icon: Package },
    { id: 'sites' as ViewType, label: 'Sites', icon: Building2 },
  ];

  // Calculate alert statistics
  const alertStats = useMemo(() => {
    const activeAlerts = mockAlerts.filter(a => a.status === 'active');
    return {
      total: activeAlerts.length,
      theft: activeAlerts.filter(a => a.type === 'theft').length,
      battery: activeAlerts.filter(a => a.type === 'battery').length,
      compliance: activeAlerts.filter(a => a.type === 'compliance').length,
      offline: activeAlerts.filter(a => a.type === 'offline').length,
      unauthorized: activeAlerts.filter(a => a.type === 'unauthorized-zone')
        .length,
      underutilized: activeAlerts.filter(a => a.type === 'underutilized')
        .length,
      maintenance: activeAlerts.filter(a => a.type === 'predictive-maintenance')
        .length,
    };
  }, []);

  const alertTypeItems = [
    {
      type: 'theft',
      label: 'Theft Alerts',
      icon: Shield,
      count: alertStats.theft,
      color: 'text-red-600',
    },
    {
      type: 'battery',
      label: 'Battery Alerts',
      icon: Battery,
      count: alertStats.battery,
      color: 'text-orange-600',
    },
    {
      type: 'compliance',
      label: 'Compliance',
      icon: AlertTriangle,
      count: alertStats.compliance,
      color: 'text-yellow-600',
    },
    {
      type: 'offline',
      label: 'Offline',
      icon: WifiOff,
      count: alertStats.offline,
      color: 'text-gray-600',
    },
    {
      type: 'unauthorized-zone',
      label: 'Unauthorized',
      icon: MapPin,
      count: alertStats.unauthorized,
      color: 'text-red-600',
    },
    {
      type: 'underutilized',
      label: 'Underutilized',
      icon: TrendingDown,
      count: alertStats.underutilized,
      color: 'text-blue-600',
    },
    {
      type: 'predictive-maintenance',
      label: 'Maintenance',
      icon: Wrench,
      count: alertStats.maintenance,
      color: 'text-purple-600',
    },
  ];

  const operationsItems = [
    { id: 'jobs' as ViewType, label: 'Jobs', icon: Package },
    { id: 'maintenance' as ViewType, label: 'Maintenance', icon: Wrench },
    { id: 'issues' as ViewType, label: 'Issues', icon: AlertTriangle },
    {
      id: 'vehicle-pairing' as ViewType,
      label: 'Vehicle Pairing',
      icon: Truck,
    },
  ];

  const monitoringItems = [
    { id: 'compliance' as ViewType, label: 'Compliance', icon: Shield },
    { id: 'geofences' as ViewType, label: 'Geofences', icon: MapPin },
    {
      id: 'alerts' as ViewType,
      label: 'Alerts',
      icon: Bell,
      badge: alertStats.total,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className='border-b border-sidebar-border px-6 py-4'>
        <div className='flex items-center gap-2'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary'>
            <Radio className='h-4 w-4 text-primary-foreground' />
          </div>
          <div>
            <h2 className='text-sidebar-foreground'>AssetTrack Pro</h2>
            <p className='text-xs text-sidebar-foreground/60'>
              Location Intelligence
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map(item => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onViewChange(item.id)}
                      isActive={currentView === item.id}
                    >
                      <Icon className='h-4 w-4' />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operationsItems.map(item => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onViewChange(item.id)}
                      isActive={currentView === item.id}
                    >
                      <Icon className='h-4 w-4' />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Monitoring</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {monitoringItems.map(item => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onViewChange(item.id)}
                      isActive={currentView === item.id}
                    >
                      <Icon className='h-4 w-4' />
                      <span>{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <Badge
                          variant='destructive'
                          className='ml-auto h-5 min-w-5 px-1'
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* Alert Types Collapsible */}
              <SidebarMenuItem>
                <Collapsible
                  open={alertTypesExpanded}
                  onOpenChange={setAlertTypesExpanded}
                >
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className='w-full'>
                      {alertTypesExpanded ? (
                        <ChevronDown className='h-4 w-4' />
                      ) : (
                        <ChevronRight className='h-4 w-4' />
                      )}
                      <span className='text-xs text-muted-foreground'>
                        Alert Types
                      </span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className='space-y-1 pl-4 mt-1'>
                    {alertTypeItems.map(item => {
                      const Icon = item.icon;
                      return (
                        <SidebarMenuButton
                          key={item.type}
                          onClick={() => {
                            onViewChange('alerts');
                            onAlertTypeClick?.(item.type);
                          }}
                          className='h-8 text-xs'
                        >
                          <Icon className={`h-3 w-3 ${item.color}`} />
                          <span className='flex-1'>{item.label}</span>
                          {item.count > 0 && (
                            <Badge
                              variant='secondary'
                              className='h-4 min-w-4 px-1 text-xs'
                            >
                              {item.count}
                            </Badge>
                          )}
                        </SidebarMenuButton>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className='border-t border-sidebar-border p-4'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => onViewChange('notifications')}
              isActive={currentView === 'notifications'}
            >
              <BellRing className='h-4 w-4' />
              <span>Notification Configuration</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => onViewChange('alert-configuration')}
              isActive={currentView === 'alert-configuration'}
            >
              <Settings className='h-4 w-4' />
              <span>Alert Configuration</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => onViewChange('settings')}
              isActive={currentView === 'settings'}
            >
              <Settings className='h-4 w-4' />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
