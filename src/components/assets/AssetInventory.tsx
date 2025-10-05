import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { EmptyState, StatsCard, Section, StatusBadge, InfoRow } from "../common";
import { ExportDialog } from "../ExportDialog";
import { EditAssetDialog } from "./EditAssetDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  MapPin,
  Battery,
  Clock,
  Plus,
  X,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { mockAssets } from "../../data/mockData";
import type { Asset } from "../../types";
import { useNavigation } from "../../contexts/NavigationContext";

interface AssetInventoryProps {
  onAssetClick?: (asset: Asset) => void;
}

export function AssetInventory({ onAssetClick }: AssetInventoryProps) {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all-types");
  const [statusFilter, setStatusFilter] = useState("all-status");
  const [siteFilter, setSiteFilter] = useState("all-sites");
  const [assignmentFilter, setAssignmentFilter] = useState("all-assignment");
  const [batteryFilter, setBatteryFilter] = useState("all-battery");
  const [showFilters, setShowFilters] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<{ id: string; name: string } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);



  const getBatteryColor = (battery: number) => {
    if (battery > 60) return "text-green-600";
    if (battery > 20) return "text-yellow-600";
    return "text-red-600";
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
    return assetsWithUtilization.filter((asset) => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        asset.name.toLowerCase().includes(searchLower) ||
        asset.id.toLowerCase().includes(searchLower) ||
        asset.location.toLowerCase().includes(searchLower) ||
        (asset.assignedTo && asset.assignedTo.toLowerCase().includes(searchLower));

      // Type filter
      const matchesType =
        typeFilter === "all-types" ||
        asset.type.toLowerCase().includes(typeFilter.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === "all-status" || asset.status === statusFilter;

      // Site filter
      const matchesSite =
        siteFilter === "all-sites" || asset.site === siteFilter;

      // Assignment filter
      const matchesAssignment =
        assignmentFilter === "all-assignment" ||
        (assignmentFilter === "assigned" && asset.assignedTo !== "Unassigned") ||
        (assignmentFilter === "unassigned" && asset.assignedTo === "Unassigned");

      // Battery filter
      const matchesBattery =
        batteryFilter === "all-battery" ||
        (batteryFilter === "critical" && asset.battery < 20) ||
        (batteryFilter === "low" && asset.battery >= 20 && asset.battery <= 60) ||
        (batteryFilter === "good" && asset.battery > 60);

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesSite &&
        matchesAssignment &&
        matchesBattery
      );
    });
  }, [assetsWithUtilization, searchTerm, typeFilter, statusFilter, siteFilter, assignmentFilter, batteryFilter]);

  // Get unique sites for filter
  const sites = Array.from(new Set(assetsWithUtilization.map((a) => a.site)));

  // Count active filters
  const activeFiltersCount = [
    typeFilter !== "all-types",
    statusFilter !== "all-status",
    siteFilter !== "all-sites",
    assignmentFilter !== "all-assignment",
    batteryFilter !== "all-battery",
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setTypeFilter("all-types");
    setStatusFilter("all-status");
    setSiteFilter("all-sites");
    setAssignmentFilter("all-assignment");
    setBatteryFilter("all-battery");
    setSearchTerm("");
  };

  // Calculate stats based on filtered inventory
  const stats = useMemo(() => {
    const total = filteredInventory.length;
    const active = filteredInventory.filter((a) => a.status === "active").length;
    const lowBattery = filteredInventory.filter((a) => a.battery < 20).length;
    const unassigned = filteredInventory.filter((a) => a.assignedTo === "Unassigned").length;
    const avgUtilization = total > 0
      ? Math.round(filteredInventory.reduce((sum, a) => sum + a.utilization, 0) / total)
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
        toast.success(`Asset "${selectedAsset.name}" deleted successfully`);
        setDeleteDialogOpen(false);
        setSelectedAsset(null);
        // Refresh the inventory list
        window.location.reload();
      } catch (error) {
        toast.error("Failed to delete asset");
      }
    }
  };

  const handleAssetAdded = (asset: Asset) => {
    // Force re-render by updating refresh key
    setRefreshKey(prev => prev + 1);
  };

  const handleAddAsset = () => {
    navigation.navigateToCreateAsset({
      onAssetCreated: handleAssetAdded,
    });
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Asset Inventory</h1>
          <p className="text-muted-foreground">Manage and track all assets</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsExportOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAddAsset}>
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-5 gap-4">
        <StatsCard
          title="Total Assets"
          value={stats.total}
        />
        <StatsCard
          title="Active"
          value={stats.active}
          variant="success"
        />
        <StatsCard
          title="Low Battery"
          value={stats.lowBattery}
          variant="danger"
        />
        <StatsCard
          title="Unassigned"
          value={stats.unassigned}
          variant="warning"
        />
        <StatsCard
          title="Avg Utilization"
          value={`${stats.avgUtilization}%`}
        />
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, or location..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-types">All Types</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="tools">Tools</SelectItem>
                <SelectItem value="vehicle">Vehicles</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-status">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="idle">Idle</SelectItem>
                <SelectItem value="in-transit">In Transit</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Filter className="h-4 w-4" />
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Advanced Filters</h4>
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="h-auto p-1 text-xs"
                      >
                        Clear All
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm">Site</label>
                    <Select value={siteFilter} onValueChange={setSiteFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-sites">All Sites</SelectItem>
                        {sites.map((site) => (
                          <SelectItem key={site} value={site}>
                            {site}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm">Assignment</label>
                    <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-assignment">All</SelectItem>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm">Battery Level</label>
                    <Select value={batteryFilter} onValueChange={setBatteryFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-battery">All Levels</SelectItem>
                        <SelectItem value="critical">Critical (&lt;20%)</SelectItem>
                        <SelectItem value="low">Low (20-60%)</SelectItem>
                        <SelectItem value="good">Good (&gt;60%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Active Filter Tags */}
          {(activeFiltersCount > 0 || searchTerm) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchTerm}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSearchTerm("")}
                  />
                </Badge>
              )}
              {typeFilter !== "all-types" && (
                <Badge variant="secondary" className="gap-1">
                  Type: {typeFilter}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setTypeFilter("all-types")}
                  />
                </Badge>
              )}
              {statusFilter !== "all-status" && (
                <Badge variant="secondary" className="gap-1">
                  Status: {statusFilter}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setStatusFilter("all-status")}
                  />
                </Badge>
              )}
              {siteFilter !== "all-sites" && (
                <Badge variant="secondary" className="gap-1">
                  Site: {siteFilter}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSiteFilter("all-sites")}
                  />
                </Badge>
              )}
              {assignmentFilter !== "all-assignment" && (
                <Badge variant="secondary" className="gap-1">
                  Assignment: {assignmentFilter}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setAssignmentFilter("all-assignment")}
                  />
                </Badge>
              )}
              {batteryFilter !== "all-battery" && (
                <Badge variant="secondary" className="gap-1">
                  Battery: {batteryFilter}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setBatteryFilter("all-battery")}
                  />
                </Badge>
              )}
            </div>
          )}
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
                <TableCell colSpan={11} className="p-0">
                  <EmptyState
                    icon={Plus}
                    title="No assets found"
                    description={searchTerm || activeFiltersCount > 0 
                      ? "Try adjusting your filters or search terms" 
                      : "Get started by adding your first asset"}
                    action={!(searchTerm || activeFiltersCount > 0) ? {
                      label: "Add Asset",
                      onClick: handleAddAsset,
                      icon: Plus
                    } : undefined}
                  />
                </TableCell>
              </TableRow>
            ) : (
              filteredInventory.map((asset) => (
                <TableRow
                  key={asset.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onAssetClick?.(asset)}
                >
                  <TableCell className="font-mono text-sm">{asset.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{asset.name}</span>
                      <Eye className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{asset.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={asset.status} type="asset" />
                  </TableCell>
                  <TableCell className="text-sm">{asset.site}</TableCell>
                  <TableCell>
                    <InfoRow icon={MapPin} iconClassName="h-3 w-3">
                      <span className="text-sm">{asset.location}</span>
                    </InfoRow>
                  </TableCell>
                  <TableCell>
                    <InfoRow icon={Clock} iconClassName="h-3 w-3">
                      <span className="text-sm">{asset.lastSeen}</span>
                    </InfoRow>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Battery className={`h-3 w-3 ${getBatteryColor(asset.battery)}`} />
                      <span className={`text-sm ${getBatteryColor(asset.battery)}`}>
                        {asset.battery}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{asset.assigned}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${asset.utilization}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8">
                        {asset.utilization}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onAssetClick?.(asset)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigation.handleShowOnMap(asset)}>
                          <MapPin className="h-4 w-4 mr-2" />
                          Show on Map
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigation.handleViewHistoricalPlayback(asset)}>
                          <Clock className="h-4 w-4 mr-2" />
                          View History
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigation.navigateToCheckInOut({
                          assetId: asset.id,
                          assetName: asset.name,
                          currentStatus: asset.status,
                          mode: "check-out",
                          assetContext: asset,
                        })}>
                          <Download className="h-4 w-4 mr-2" />
                          Check Out
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEditAsset({ id: asset.id, name: asset.name })}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Asset
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteAsset({ id: asset.id, name: asset.name })}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Asset
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredInventory.length} of {assetsWithUtilization.length} assets
          {activeFiltersCount > 0 && " (filtered)"}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Previous</Button>
          <Button variant="outline" size="sm">1</Button>
          <Button variant="outline" size="sm">2</Button>
          <Button variant="outline" size="sm">3</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>

      {/* Export Dialog */}
      <ExportDialog
        open={isExportOpen}
        onOpenChange={setIsExportOpen}
        title="Export Asset Inventory"
        description="Choose format and options for exporting asset data"
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
              This will permanently delete the asset "{selectedAsset?.name}" (ID: {selectedAsset?.id}).
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
