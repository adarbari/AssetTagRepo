import React, { useState, useMemo } from &apos;react&apos;;
import { ViewType } from &apos;../App&apos;;
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
} from &apos;./ui/sidebar&apos;;
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
} from &apos;lucide-react&apos;;
import { Badge } from &apos;./ui/badge&apos;;
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from &apos;./ui/collapsible&apos;;
import { mockAlerts } from &apos;../data/mockData&apos;;

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
    { id: &apos;dashboard&apos; as ViewType, label: &apos;Dashboard&apos;, icon: LayoutDashboard },
    { id: &apos;map&apos; as ViewType, label: &apos;Live Map&apos;, icon: Map },
    { id: &apos;inventory&apos; as ViewType, label: &apos;Asset Inventory&apos;, icon: Package },
    { id: &apos;sites&apos; as ViewType, label: &apos;Sites&apos;, icon: Building2 },
  ];

  // Calculate alert statistics
  const alertStats = useMemo(() => {
    const activeAlerts = mockAlerts.filter(a => a.status === &apos;active&apos;);
    return {
      total: activeAlerts.length,
      theft: activeAlerts.filter(a => a.type === &apos;theft&apos;).length,
      battery: activeAlerts.filter(a => a.type === &apos;battery&apos;).length,
      compliance: activeAlerts.filter(a => a.type === &apos;compliance&apos;).length,
      offline: activeAlerts.filter(a => a.type === &apos;offline&apos;).length,
      unauthorized: activeAlerts.filter(a => a.type === &apos;unauthorized-zone&apos;)
        .length,
      underutilized: activeAlerts.filter(a => a.type === &apos;underutilized&apos;)
        .length,
      maintenance: activeAlerts.filter(a => a.type === &apos;predictive-maintenance&apos;)
        .length,
    };
  }, []);

  const alertTypeItems = [
    {
      type: &apos;theft&apos;,
      label: &apos;Theft Alerts&apos;,
      icon: Shield,
      count: alertStats.theft,
      color: &apos;text-red-600&apos;,
    },
    {
      type: &apos;battery&apos;,
      label: &apos;Battery Alerts&apos;,
      icon: Battery,
      count: alertStats.battery,
      color: &apos;text-orange-600&apos;,
    },
    {
      type: &apos;compliance&apos;,
      label: &apos;Compliance&apos;,
      icon: AlertTriangle,
      count: alertStats.compliance,
      color: &apos;text-yellow-600&apos;,
    },
    {
      type: &apos;offline&apos;,
      label: &apos;Offline&apos;,
      icon: WifiOff,
      count: alertStats.offline,
      color: &apos;text-gray-600&apos;,
    },
    {
      type: &apos;unauthorized-zone&apos;,
      label: &apos;Unauthorized&apos;,
      icon: MapPin,
      count: alertStats.unauthorized,
      color: &apos;text-red-600&apos;,
    },
    {
      type: &apos;underutilized&apos;,
      label: &apos;Underutilized&apos;,
      icon: TrendingDown,
      count: alertStats.underutilized,
      color: &apos;text-blue-600&apos;,
    },
    {
      type: &apos;predictive-maintenance&apos;,
      label: &apos;Maintenance&apos;,
      icon: Wrench,
      count: alertStats.maintenance,
      color: &apos;text-purple-600&apos;,
    },
  ];

  const operationsItems = [
    { id: &apos;jobs&apos; as ViewType, label: &apos;Jobs&apos;, icon: Package },
    { id: &apos;maintenance&apos; as ViewType, label: &apos;Maintenance&apos;, icon: Wrench },
    { id: &apos;issues&apos; as ViewType, label: &apos;Issues&apos;, icon: AlertTriangle },
    {
      id: &apos;vehicle-pairing&apos; as ViewType,
      label: &apos;Vehicle Pairing&apos;,
      icon: Truck,
    },
  ];

  const monitoringItems = [
    { id: &apos;compliance&apos; as ViewType, label: &apos;Compliance&apos;, icon: Shield },
    { id: &apos;geofences&apos; as ViewType, label: &apos;Geofences&apos;, icon: MapPin },
    {
      id: &apos;alerts&apos; as ViewType,
      label: &apos;Alerts&apos;,
      icon: Bell,
      badge: alertStats.total,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className=&apos;border-b border-sidebar-border px-6 py-4&apos;>
        <div className=&apos;flex items-center gap-2&apos;>
          <div className=&apos;flex h-8 w-8 items-center justify-center rounded-lg bg-primary&apos;>
            <Radio className=&apos;h-4 w-4 text-primary-foreground&apos; />
          </div>
          <div>
            <h2 className=&apos;text-sidebar-foreground&apos;>AssetTrack Pro</h2>
            <p className=&apos;text-xs text-sidebar-foreground/60&apos;>
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
                      <Icon className=&apos;h-4 w-4&apos; />
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
                      <Icon className=&apos;h-4 w-4&apos; />
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
                      <Icon className=&apos;h-4 w-4&apos; />
                      <span>{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <Badge
                          variant=&apos;destructive&apos;
                          className=&apos;ml-auto h-5 min-w-5 px-1&apos;
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
                    <SidebarMenuButton className=&apos;w-full&apos;>
                      {alertTypesExpanded ? (
                        <ChevronDown className=&apos;h-4 w-4&apos; />
                      ) : (
                        <ChevronRight className=&apos;h-4 w-4&apos; />
                      )}
                      <span className=&apos;text-xs text-muted-foreground&apos;>
                        Alert Types
                      </span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className=&apos;space-y-1 pl-4 mt-1&apos;>
                    {alertTypeItems.map(item => {
                      const Icon = item.icon;
                      return (
                        <SidebarMenuButton
                          key={item.type}
                          onClick={() => {
                            onViewChange(&apos;alerts&apos;);
                            onAlertTypeClick?.(item.type);
                          }}
                          className=&apos;h-8 text-xs&apos;
                        >
                          <Icon className={`h-3 w-3 ${item.color}`} />
                          <span className=&apos;flex-1&apos;>{item.label}</span>
                          {item.count > 0 && (
                            <Badge
                              variant=&apos;secondary&apos;
                              className=&apos;h-4 min-w-4 px-1 text-xs&apos;
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

      <SidebarFooter className=&apos;border-t border-sidebar-border p-4&apos;>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => onViewChange(&apos;notifications&apos;)}
              isActive={currentView === &apos;notifications&apos;}
            >
              <BellRing className=&apos;h-4 w-4&apos; />
              <span>Notification Configuration</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => onViewChange(&apos;alert-configuration&apos;)}
              isActive={currentView === &apos;alert-configuration&apos;}
            >
              <Settings className=&apos;h-4 w-4&apos; />
              <span>Alert Configuration</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => onViewChange(&apos;settings&apos;)}
              isActive={currentView === &apos;settings&apos;}
            >
              <Settings className=&apos;h-4 w-4&apos; />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
