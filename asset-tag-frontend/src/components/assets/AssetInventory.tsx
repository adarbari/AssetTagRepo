import React, { useState, useMemo } from &apos;react&apos;;
import { Card } from &apos;../ui/card&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Input } from &apos;../ui/input&apos;;
import {
  EmptyState,
  StatsCard,
  StatusBadge,
  InfoRow,
  FilterPanel,
  TableActionMenu,
  PageLayout,
  type FilterConfig,
  type TableAction,
} from &apos;../common&apos;;
import { ExportDialog } from &apos;../reports/ExportDialog&apos;;
import { EditAssetDialog } from &apos;./EditAssetDialog&apos;;
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from &apos;../ui/alert-dialog&apos;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &apos;../ui/select&apos;;
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from &apos;../ui/table&apos;;
import {
  Search,
  Download,
  MapPin,
  Battery,
  Clock,
  Plus,
  Eye,
  Edit,
  Trash2,
} from &apos;lucide-react&apos;;
import { mockAssets } from &apos;../../data/mockData&apos;;
import type { Asset } from &apos;../../types&apos;;
import { useNavigation } from &apos;../../contexts/NavigationContext&apos;;
import { toast } from &apos;sonner&apos;;

interface AssetInventoryProps {
  onAssetClick?: (asset: Asset) => void;
  onNavigateToCreateAsset?: () => void;
}

export function AssetInventory({
  onAssetClick,
  onNavigateToCreateAsset,
}: AssetInventoryProps) {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState(&apos;&apos;);
  const [typeFilter, setTypeFilter] = useState(&apos;all-types&apos;);
  const [statusFilter, setStatusFilter] = useState(&apos;all-status&apos;);
  const [siteFilter, setSiteFilter] = useState(&apos;all-sites&apos;);
  const [assignmentFilter, setAssignmentFilter] = useState(&apos;all-assignment&apos;);
  const [batteryFilter, setBatteryFilter] = useState(&apos;all-battery&apos;);
  const [showFilters, setShowFilters] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const getBatteryColor = (battery: number) => {
    if (battery > 60) return &apos;text-green-600&apos;;
    if (battery > 20) return &apos;text-yellow-600&apos;;
    return &apos;text-red-600&apos;;
  };

  // Add utilization to assets for display
  const assetsWithUtilization = useMemo(() => {
    return mockAssets.map(asset => ({
      ...asset,
      utilization: Math.floor(Math.random() * 100), // Mock utilization data
    }));
  }, [refreshKey]);

  // Filter and search logic
  const filteredInventory = useMemo(() => {
    return assetsWithUtilization.filter(asset => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        asset.name.toLowerCase().includes(searchLower) ||
        asset.id.toLowerCase().includes(searchLower) ||
        asset.location.toLowerCase().includes(searchLower) ||
        (asset.assignedTo &&
          asset.assignedTo.toLowerCase().includes(searchLower));

      // Type filter
      const matchesType =
        typeFilter === &apos;all-types&apos; ||
        asset.type.toLowerCase().includes(typeFilter.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === &apos;all-status&apos; || asset.status === statusFilter;

      // Site filter
      const matchesSite =
        siteFilter === &apos;all-sites&apos; || asset.site === siteFilter;

      // Assignment filter
      const matchesAssignment =
        assignmentFilter === &apos;all-assignment&apos; ||
        (assignmentFilter === &apos;assigned&apos; &&
          asset.assignedTo !== &apos;Unassigned&apos;) ||
        (assignmentFilter === &apos;unassigned&apos; &&
          asset.assignedTo === &apos;Unassigned&apos;);

      // Battery filter
      const matchesBattery =
        batteryFilter === &apos;all-battery&apos; ||
        (batteryFilter === &apos;critical&apos; && asset.battery < 20) ||
        (batteryFilter === &apos;low&apos; &&
          asset.battery >= 20 &&
          asset.battery <= 60) ||
        (batteryFilter === &apos;good&apos; && asset.battery > 60);

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesSite &&
        matchesAssignment &&
        matchesBattery
      );
    });
  }, [
    assetsWithUtilization,
    searchTerm,
    typeFilter,
    statusFilter,
    siteFilter,
    assignmentFilter,
    batteryFilter,
  ]);

  // Get unique sites for filter
  const sites = Array.from(new Set(assetsWithUtilization.map(a => a.site)));

  // Filter configuration for FilterPanel
  const filterConfigs: FilterConfig[] = [
    {
      key: &apos;site&apos;,
      label: &apos;Site&apos;,
      options: [
        { value: &apos;all-sites&apos;, label: &apos;All Sites&apos; },
        ...sites.map(site => ({ value: site, label: site })),
      ],
      currentValue: siteFilter,
      onValueChange: setSiteFilter,
      defaultOptionValue: &apos;all-sites&apos;,
    },
    {
      key: &apos;assignment&apos;,
      label: &apos;Assignment&apos;,
      options: [
        { value: &apos;all-assignment&apos;, label: &apos;All Assignment&apos; },
        { value: &apos;assigned&apos;, label: &apos;Assigned&apos; },
        { value: &apos;unassigned&apos;, label: &apos;Unassigned&apos; },
      ],
      currentValue: assignmentFilter,
      onValueChange: setAssignmentFilter,
      defaultOptionValue: &apos;all-assignment&apos;,
    },
    {
      key: &apos;battery&apos;,
      label: &apos;Battery Level&apos;,
      options: [
        { value: &apos;all-battery&apos;, label: &apos;All Battery Levels&apos; },
        { value: &apos;critical&apos;, label: &apos;Critical (<20%)&apos; },
        { value: &apos;low&apos;, label: &apos;Low (20-60%)&apos; },
        { value: &apos;good&apos;, label: &apos;Good (>60%)&apos; },
      ],
      currentValue: batteryFilter,
      onValueChange: setBatteryFilter,
      defaultOptionValue: &apos;all-battery&apos;,
    },
  ];

  // Table actions configuration
  const createAssetActions = (asset: any): TableAction[] => [
    {
      label: &apos;View Details&apos;,
      onClick: () => onAssetClick?.(asset),
      icon: Eye,
    },
    {
      label: &apos;Show on Map&apos;,
      onClick: () => navigation.handleShowOnMap(asset),
      icon: MapPin,
    },
    {
      label: &apos;View History&apos;,
      onClick: () => navigation.handleViewHistoricalPlayback(asset),
      icon: Clock,
    },
    {
      label: &apos;Check Out&apos;,
      onClick: () =>
        navigation.navigateToCheckInOut({
          assetId: asset.id,
          assetName: asset.name,
          currentStatus: asset.status,
          mode: &apos;check-out&apos;,
          assetContext: asset,
        }),
      icon: Download,
      separatorBefore: true,
    },
    {
      label: &apos;Edit Asset&apos;,
      onClick: () => handleEditAsset({ id: asset.id, name: asset.name }),
      icon: Edit,
    },
    {
      label: &apos;Delete Asset&apos;,
      onClick: () => handleDeleteAsset({ id: asset.id, name: asset.name }),
      icon: Trash2,
      isDestructive: true,
    },
  ];

  // Count active filters
  const activeFiltersCount = [
    typeFilter !== &apos;all-types&apos;,
    statusFilter !== &apos;all-status&apos;,
    siteFilter !== &apos;all-sites&apos;,
    assignmentFilter !== &apos;all-assignment&apos;,
    batteryFilter !== &apos;all-battery&apos;,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setTypeFilter(&apos;all-types&apos;);
    setStatusFilter(&apos;all-status&apos;);
    setSiteFilter(&apos;all-sites&apos;);
    setAssignmentFilter(&apos;all-assignment&apos;);
    setBatteryFilter(&apos;all-battery&apos;);
    setSearchTerm(&apos;&apos;);
  };

  // Calculate stats based on filtered inventory
  const stats = useMemo(() => {
    const total = filteredInventory.length;
    const active = filteredInventory.filter(a => a.status === &apos;active&apos;).length;
    const lowBattery = filteredInventory.filter(a => a.battery < 20).length;
    const unassigned = filteredInventory.filter(
      a => a.assignedTo === &apos;Unassigned&apos;
    ).length;
    const avgUtilization =
      total > 0
        ? Math.round(
            filteredInventory.reduce((sum, a) => sum + a.utilization, 0) / total
          )
        : 0;

    return { total, active, lowBattery, unassigned, avgUtilization };
  }, [filteredInventory]);

  const handleEditAsset = (asset: { id: string; name: string }) => {
    setSelectedAsset(asset);
    setIsEditOpen(true);
  };

  const handleDeleteAsset = (asset: { id: string; name: string }) => {
    setSelectedAsset(asset);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedAsset) {
      try {
        // In a real app, this would call an API to delete the asset
        toast.success(`Asset &quot;${selectedAsset.name}&quot; deleted successfully`);
        setDeleteDialogOpen(false);
        setSelectedAsset(null);
        // Refresh the inventory list
        window.location.reload();
      } catch (error) {
        toast.error(&apos;Failed to delete asset&apos;);
      }
    }
  };

  const handleAssetAdded = (_Asset) => {
    // Force re-render by updating refresh key
    setRefreshKey(prev => prev + 1);
  };

  const handleAddAsset = () => {
    if (onNavigateToCreateAsset) {
      onNavigateToCreateAsset();
    } else {
      navigation.navigateToCreateAsset({
        onAssetCreated: handleAssetAdded,
      });
    }
  };

  return (
    <PageLayout variant=&apos;wide&apos; padding=&apos;lg&apos;>
      {/* Header */}
      <div className=&apos;flex items-center justify-between&apos;>
        <div>
          <h1>Asset Inventory</h1>
          <p className=&apos;text-muted-foreground&apos;>Manage and track all assets</p>
        </div>
        <div className=&apos;flex items-center gap-2&apos;>
          <Button variant=&apos;outline&apos; onClick={() => setIsExportOpen(true)}>
            <Download className=&apos;h-4 w-4 mr-2&apos; />
            Export
          </Button>
          <Button onClick={handleAddAsset}>
            <Plus className=&apos;h-4 w-4 mr-2&apos; />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className=&apos;grid grid-cols-5 gap-4&apos;>
        <StatsCard title=&apos;Total Assets&apos; value={stats.total} />
        <StatsCard title=&apos;Active&apos; value={stats.active} variant=&apos;success&apos; />
        <StatsCard
          title=&apos;Low Battery&apos;
          value={stats.lowBattery}
          variant=&apos;danger&apos;
        />
        <StatsCard
          title=&apos;Unassigned&apos;
          value={stats.unassigned}
          variant=&apos;warning&apos;
        />
        <StatsCard title=&apos;Avg Utilization&apos; value={`${stats.avgUtilization}%`} />
      </div>

      {/* Filters and Search */}
      <Card className=&apos;p-4&apos;>
        <div className=&apos;space-y-4&apos;>
          <div className=&apos;flex items-center gap-4&apos;>
            <div className=&apos;flex-1 relative&apos;>
              <Search className=&apos;absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground&apos; />
              <Input
                placeholder=&apos;Search by name, ID, or location...&apos;
                className=&apos;pl-9&apos;
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className=&apos;w-[180px]&apos;>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=&apos;all-types&apos;>All Types</SelectItem>
                <SelectItem value=&apos;equipment&apos;>Equipment</SelectItem>
                <SelectItem value=&apos;tools&apos;>Tools</SelectItem>
                <SelectItem value=&apos;vehicle&apos;>Vehicles</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className=&apos;w-[180px]&apos;>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=&apos;all-status&apos;>All Statuses</SelectItem>
                <SelectItem value=&apos;active&apos;>Active</SelectItem>
                <SelectItem value=&apos;idle&apos;>Idle</SelectItem>
                <SelectItem value=&apos;in-transit&apos;>In Transit</SelectItem>
                <SelectItem value=&apos;offline&apos;>Offline</SelectItem>
              </SelectContent>
            </Select>
            <FilterPanel
              filters={filterConfigs}
              activeFiltersCount={activeFiltersCount}
              onClearAllFilters={clearAllFilters}
              showFilters={showFilters}
              onShowFiltersChange={setShowFilters}
              searchTerm={searchTerm}
              onClearSearch={() => setSearchTerm(&apos;&apos;)}
            />
          </div>
        </div>
      </Card>

      {/* Inventory Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Site</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Last Seen</TableHead>
              <TableHead>Battery</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Utilization</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className=&apos;p-0&apos;>
                  <EmptyState
                    icon={Plus}
                    title=&apos;No assets found&apos;
                    description={
                      searchTerm || activeFiltersCount > 0
                        ? &apos;Try adjusting your filters or search terms&apos;
                        : &apos;Get started by adding your first asset&apos;
                    }
                    action={
                      !(searchTerm || activeFiltersCount > 0)
                        ? {
                            label: &apos;Add Asset&apos;,
                            onClick: handleAddAsset,
                            icon: Plus,
                          }
                        : undefined
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              filteredInventory.map(asset => (
                <TableRow
                  key={asset.id}
                  className=&apos;cursor-pointer hover:bg-muted/50 transition-colors&apos;
                  onClick={() => onAssetClick?.(asset)}
                >
                  <TableCell className=&apos;font-mono text-sm&apos;>
                    {asset.id}
                  </TableCell>
                  <TableCell>
                    <div className=&apos;flex items-center gap-2&apos;>
                      <span>{asset.name}</span>
                      <Eye className=&apos;h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity&apos; />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant=&apos;outline&apos;>{asset.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={asset.status} type=&apos;asset&apos; />
                  </TableCell>
                  <TableCell className=&apos;text-sm&apos;>{asset.site}</TableCell>
                  <TableCell>
                    <InfoRow icon={MapPin} iconClassName=&apos;h-3 w-3&apos;>
                      <span className=&apos;text-sm&apos;>{asset.location}</span>
                    </InfoRow>
                  </TableCell>
                  <TableCell>
                    <InfoRow icon={Clock} iconClassName=&apos;h-3 w-3&apos;>
                      <span className=&apos;text-sm&apos;>{asset.lastSeen}</span>
                    </InfoRow>
                  </TableCell>
                  <TableCell>
                    <div className=&apos;flex items-center gap-1&apos;>
                      <Battery
                        className={`h-3 w-3 ${getBatteryColor(asset.battery)}`}
                      />
                      <span
                        className={`text-sm ${getBatteryColor(asset.battery)}`}
                      >
                        {asset.battery}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className=&apos;text-sm&apos;>{asset.assigned}</TableCell>
                  <TableCell>
                    <div className=&apos;flex items-center gap-2&apos;>
                      <div className=&apos;flex-1 h-2 bg-muted rounded-full overflow-hidden&apos;>
                        <div
                          className=&apos;h-full bg-primary&apos;
                          style={{ width: `${asset.utilization}%` }}
                        />
                      </div>
                      <span className=&apos;text-sm text-muted-foreground w-8&apos;>
                        {asset.utilization}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell onClick={e => e.stopPropagation()}>
                    <TableActionMenu
                      actions={createAssetActions(asset)}
                      label=&apos;Asset Actions&apos;
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      <div className=&apos;flex items-center justify-between&apos;>
        <p className=&apos;text-sm text-muted-foreground&apos;>
          Showing {filteredInventory.length} of {assetsWithUtilization.length}{&apos; &apos;}
          assets
          {activeFiltersCount > 0 && &apos; (filtered)&apos;}
        </p>
        <div className=&apos;flex items-center gap-2&apos;>
          <Button variant=&apos;outline&apos; size=&apos;sm&apos;>
            Previous
          </Button>
          <Button variant=&apos;outline&apos; size=&apos;sm&apos;>
            1
          </Button>
          <Button variant=&apos;outline&apos; size=&apos;sm&apos;>
            2
          </Button>
          <Button variant=&apos;outline&apos; size=&apos;sm&apos;>
            3
          </Button>
          <Button variant=&apos;outline&apos; size=&apos;sm&apos;>
            Next
          </Button>
        </div>
      </div>

      {/* Export Dialog */}
      <ExportDialog
        open={isExportOpen}
        onOpenChange={setIsExportOpen}
        title=&apos;Export Asset Inventory&apos;
        description=&apos;Choose format and options for exporting asset data&apos;
      />

      {/* Edit Asset Dialog */}
      {selectedAsset && (
        <EditAssetDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          assetId={selectedAsset.id}
          assetName={selectedAsset.name}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the asset &quot;{selectedAsset?.name}
              &quot; (ID: {selectedAsset?.id}). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className=&apos;bg-destructive text-destructive-foreground hover:bg-destructive/90&apos;
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
