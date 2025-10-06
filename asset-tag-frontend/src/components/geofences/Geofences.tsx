import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { StatusBadge, PageLayout } from "../common";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MapPin, Plus, MoreVertical, Circle, Pentagon, Map, Edit, Trash2, Settings, History, Filter, X, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
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
import { mockGeofences } from "../../data/mockData";
import type { Geofence } from "../../types";

// Helper function to format geofence data for display
function formatGeofenceForDisplay(geofence: Geofence): DisplayGeofence {
  // Determine shape and radius string
  let shape: "circular" | "polygon" = "circular";
  let radiusStr = "N/A";
  
  if (geofence.type === "polygon" && geofence.coordinates && geofence.coordinates.length > 0) {
    shape = "polygon";
    // Calculate approximate area for polygon (simplified)
    radiusStr = "Area";
  } else if (geofence.type === "circular" && geofence.radius) {
    shape = "circular";
    radiusStr = `${geofence.radius}m`;
  }

  // Get compliance stats - provide default values if stats are not available
  const stats = {
    expected: geofence.expectedAssets || 0,
    outside: geofence.violatingAssets || 0,
    complianceRate: geofence.complianceRate || 0,
  };

  return {
    id: geofence.id,
    name: geofence.name,
    type: geofence.geofenceType || "authorized",
    shape,
    radius: radiusStr,
    assetsInside: geofence.assets || 0,
    alerts: 0, // This would come from alerts data in production
    status: geofence.status,
    expectedAssets: stats.expected,
    violatingAssets: stats.outside,
    complianceRate: stats.complianceRate,
  };
}

interface GeofencesProps {
  onCreateGeofence?: () => void;
  onEditGeofence?: (geofenceId: string) => void;
  onViewViolatingAssets?: (
    geofenceId: string, 
    violatingAssetIds: string[], 
    expectedAssetIds: string[],
    actualAssetIds: string[]
  ) => void;
}

interface DisplayGeofence {
  id: string;
  name: string;
  type: string;
  shape: "circular" | "polygon";
  radius: string;
  assetsInside: number;
  alerts: number;
  status: string;
  expectedAssets: number;
  violatingAssets: number;
  complianceRate: number;
}

export function Geofences({ onCreateGeofence, onEditGeofence, onViewViolatingAssets }: GeofencesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGeofence, setSelectedGeofence] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [geofences, setGeofences] = useState<DisplayGeofence[]>([]);
  
  // Filter states
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [shapeFilter, setShapeFilter] = useState<string>("all");
  const [assetRangeFilter, setAssetRangeFilter] = useState<string>("all");
  const [alertsFilter, setAlertsFilter] = useState<string>("all");

  // Load geofences from mockData on mount
  useEffect(() => {
    Promise.all(mockGeofences.map(formatGeofenceForDisplay)).then(displayGeofences => {
      setGeofences(displayGeofences);
    });
  }, []);

  const handleEdit = (geofence: DisplayGeofence) => {
    if (onEditGeofence) {
      onEditGeofence(geofence.id);
    }
  };

  const handleViewViolations = async (geofenceId: string) => {
    if (!onViewViolatingAssets) return;
    
    const { getGeofenceViolatingAssets, getGeofenceExpectedAssets, getGeofenceActualAssets } = await import("../../data/mockData");
    const violatingAssets = getGeofenceViolatingAssets(geofenceId);
    const expectedAssets = getGeofenceExpectedAssets(geofenceId);
    const actualAssets = getGeofenceActualAssets(geofenceId);
    
    const violatingAssetIds = violatingAssets.map(a => a.id);
    const expectedAssetIds = expectedAssets.map(a => a.id);
    const actualAssetIds = actualAssets.map(a => a.id);
    
    onViewViolatingAssets(geofenceId, violatingAssetIds, expectedAssetIds, actualAssetIds);
  };

  const handleDelete = (geofenceId: string) => {
    setSelectedGeofence(geofenceId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedGeofence) return;
    
    // Delete from mockData
    import("../../data/mockData").then(({ deleteGeofence }) => {
      const success = deleteGeofence(selectedGeofence);
      
      if (success) {
        // Remove from local state
        setGeofences(prev => prev.filter(g => g.id !== selectedGeofence));
        
        // Show success notification
        import("sonner").then(({ toast }) => {
          toast.success("Geofence deleted successfully");
        });
      } else {
        // Show error notification
        import("sonner").then(({ toast }) => {
          toast.error("Failed to delete geofence");
        });
      }
      
      setDeleteDialogOpen(false);
      setSelectedGeofence(null);
    });
  };

  // Filter geofences based on all criteria
  const filteredGeofences = geofences.filter((geofence) => {
    // Text search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        geofence.name.toLowerCase().includes(searchLower) ||
        geofence.id.toLowerCase().includes(searchLower) ||
        geofence.type.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Type filter
    if (typeFilter !== "all" && geofence.type !== typeFilter) {
      return false;
    }

    // Status filter
    if (statusFilter !== "all" && geofence.status !== statusFilter) {
      return false;
    }

    // Shape filter
    if (shapeFilter !== "all" && geofence.shape !== shapeFilter) {
      return false;
    }

    // Asset range filter
    if (assetRangeFilter !== "all") {
      switch (assetRangeFilter) {
        case "0":
          if (geofence.assetsInside !== 0) return false;
          break;
        case "1-50":
          if (geofence.assetsInside < 1 || geofence.assetsInside > 50) return false;
          break;
        case "51-100":
          if (geofence.assetsInside < 51 || geofence.assetsInside > 100) return false;
          break;
        case "100+":
          if (geofence.assetsInside <= 100) return false;
          break;
      }
    }

    // Alerts filter
    if (alertsFilter !== "all") {
      if (alertsFilter === "active" && geofence.alerts === 0) return false;
      if (alertsFilter === "none" && geofence.alerts > 0) return false;
    }

    return true;
  });

  const hasActiveFilters = 
    typeFilter !== "all" || 
    statusFilter !== "all" || 
    shapeFilter !== "all" || 
    assetRangeFilter !== "all" || 
    alertsFilter !== "all";

  const clearFilters = () => {
    setTypeFilter("all");
    setStatusFilter("all");
    setShapeFilter("all");
    setAssetRangeFilter("all");
    setAlertsFilter("all");
  };



  return (
    <PageLayout variant="wide" padding="lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Geofences</h1>
          <p className="text-muted-foreground">Manage zones and boundaries</p>
        </div>
        <Button onClick={onCreateGeofence}>
          <Plus className="h-4 w-4 mr-2" />
          Create Geofence
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Geofences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{geofences.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Authorized Zones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{geofences.filter(g => g.type === "authorized").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Restricted Zones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{geofences.filter(g => g.type === "restricted").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{geofences.reduce((sum, g) => sum + g.alerts, 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Configured Geofences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search geofences by name, ID, or type..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant={showFilters ? "secondary" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="destructive" className="ml-2 px-1 min-w-5 h-5">
                  {[typeFilter, statusFilter, shapeFilter, assetRangeFilter, alertsFilter].filter(f => f !== "all").length}
                </Badge>
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="pt-4 border-t space-y-4">
              <div className="flex items-center justify-between">
                <h4>Filter Geofences</h4>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="authorized">Authorized</SelectItem>
                      <SelectItem value="restricted">Restricted</SelectItem>
                      <SelectItem value="monitoring">Monitoring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Shape</Label>
                  <Select value={shapeFilter} onValueChange={setShapeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Shapes</SelectItem>
                      <SelectItem value="circular">Circular</SelectItem>
                      <SelectItem value="polygon">Polygon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Assets Inside</Label>
                  <Select value={assetRangeFilter} onValueChange={setAssetRangeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ranges</SelectItem>
                      <SelectItem value="0">Empty (0)</SelectItem>
                      <SelectItem value="1-50">1 - 50</SelectItem>
                      <SelectItem value="51-100">51 - 100</SelectItem>
                      <SelectItem value="100+">100+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Alerts</Label>
                  <Select value={alertsFilter} onValueChange={setAlertsFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Has Active Alerts</SelectItem>
                      <SelectItem value="none">No Alerts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Showing {filteredGeofences.length} of {mockGeofences.length} geofences</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Geofence List */}
      <Card>
        <CardHeader>
          <CardTitle>Geofence List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Shape</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Expected Assets</TableHead>
                <TableHead>Violations</TableHead>
                <TableHead>Compliance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGeofences.map((geofence) => (
                <TableRow 
                  key={geofence.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleEdit(geofence)}
                >
                  <TableCell className="font-mono text-sm">{geofence.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {geofence.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={geofence.type} type="geofence" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {geofence.shape === "circular" ? (
                        <Circle className="h-3 w-3 text-muted-foreground" />
                      ) : (
                        <Pentagon className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span className="text-sm capitalize">{geofence.shape}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{geofence.radius}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{geofence.expectedAssets}</Badge>
                  </TableCell>
                  <TableCell>
                    {geofence.violatingAssets > 0 ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewViolations(geofence.id);
                        }}
                      >
                        <Badge variant="destructive" className="mr-2">
                          {geofence.violatingAssets}
                        </Badge>
                        View on Map
                      </Button>
                    ) : (
                      <span className="text-sm text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          geofence.complianceRate >= 90
                            ? "bg-green-50 text-green-700 border-green-200"
                            : geofence.complianceRate >= 70
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }
                      >
                        {geofence.complianceRate}%
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        geofence.status === "active"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-gray-50 text-gray-700 border-gray-200"
                      }
                    >
                      {geofence.status}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigation.handleShowOnMap({ id: geofence.id, name: geofence.name } as any)}>
                          <Map className="h-4 w-4 mr-2" />
                          View on Map
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(geofence)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Geofence
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigation.navigateToAlertConfiguration()}>
                          <Settings className="h-4 w-4 mr-2" />
                          Configure Alerts
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info("View history functionality coming soon!")}>
                          <History className="h-4 w-4 mr-2" />
                          View History
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDelete(geofence.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Geofence
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Geofence</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this geofence? This action cannot be undone.
              All associated alerts and history will be preserved.
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
    </PageLayout>
  );
}
