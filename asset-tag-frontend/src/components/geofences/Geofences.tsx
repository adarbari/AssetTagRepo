import { useState, useEffect } from &apos;react&apos;;
import { useNavigation } from &apos;../../contexts/NavigationContext&apos;;
import { toast } from &apos;sonner&apos;;
import { Card, CardContent, CardHeader, CardTitle } from &apos;../ui/card&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Input } from &apos;../ui/input&apos;;
import { StatusBadge, PageLayout } from &apos;../common&apos;;
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from &apos;../ui/table&apos;;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from &apos;../ui/dropdown-menu&apos;;
import {
  MapPin,
  Plus,
  MoreVertical,
  Circle,
  Pentagon,
  Map,
  Edit,
  Trash2,
  Settings,
  History,
  Filter,
  X,
  Search,
} from &apos;lucide-react&apos;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &apos;../ui/select&apos;;
import { Label } from &apos;../ui/label&apos;;
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
import { mockGeofences } from &apos;../../data/mockData&apos;;
import type { Geofence } from &apos;../../types&apos;;

// Helper function to format geofence data for display
function formatGeofenceForDisplay(geofence: Geofence): DisplayGeofence {
  // Determine shape and radius string
  let shape: &apos;circular&apos; | &apos;polygon&apos; = &apos;circular&apos;;
  let radiusStr = &apos;N/A&apos;;

  if (
    geofence.type === &apos;polygon&apos; &&
    geofence.coordinates &&
    geofence.coordinates.length > 0
  ) {
    shape = &apos;polygon&apos;;
    // Calculate approximate area for polygon (simplified)
    radiusStr = &apos;Area&apos;;
  } else if (geofence.type === &apos;circular&apos; && geofence.radius) {
    shape = &apos;circular&apos;;
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
    type: geofence.geofenceType || &apos;authorized&apos;,
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
  shape: &apos;circular&apos; | &apos;polygon&apos;;
  radius: string;
  assetsInside: number;
  alerts: number;
  status: string;
  expectedAssets: number;
  violatingAssets: number;
  complianceRate: number;
}

export function Geofences({
  onCreateGeofence,
  onEditGeofence,
  onViewViolatingAssets,
}: GeofencesProps) {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState(&apos;&apos;);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGeofence, setSelectedGeofence] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [geofences, setGeofences] = useState<DisplayGeofence[]>([]);

  // Filter states
  const [typeFilter, setTypeFilter] = useState<string>(&apos;all&apos;);
  const [statusFilter, setStatusFilter] = useState<string>(&apos;all&apos;);
  const [shapeFilter, setShapeFilter] = useState<string>(&apos;all&apos;);
  const [assetRangeFilter, setAssetRangeFilter] = useState<string>(&apos;all&apos;);
  const [alertsFilter, setAlertsFilter] = useState<string>(&apos;all&apos;);

  // Load geofences from mockData on mount
  useEffect(() => {
    Promise.all(mockGeofences.map(formatGeofenceForDisplay)).then(
      displayGeofences => {
        setGeofences(displayGeofences);
      }
    );
  }, []);

  const handleEdit = (geofence: DisplayGeofence) => {
    if (onEditGeofence) {
      onEditGeofence(geofence.id);
    }
  };

  const handleViewViolations = async (geofenceId: string) => {
    if (!onViewViolatingAssets) return;

    const {
      getGeofenceViolatingAssets,
      getGeofenceExpectedAssets,
      getGeofenceActualAssets,
    } = await import(&apos;../../data/mockData&apos;);
    const violatingAssets = getGeofenceViolatingAssets(geofenceId);
    const expectedAssets = getGeofenceExpectedAssets(geofenceId);
    const actualAssets = getGeofenceActualAssets(geofenceId);

    const violatingAssetIds = violatingAssets.map(a => a.id);
    const expectedAssetIds = expectedAssets.map(a => a.id);
    const actualAssetIds = actualAssets.map(a => a.id);

    onViewViolatingAssets(
      geofenceId,
      violatingAssetIds,
      expectedAssetIds,
      actualAssetIds
    );
  };

  const handleDelete = (geofenceId: string) => {
    setSelectedGeofence(geofenceId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedGeofence) return;

    // Delete from mockData
    import(&apos;../../data/mockData&apos;).then(({ deleteGeofence }) => {
      const success = deleteGeofence(selectedGeofence);

      if (success) {
        // Remove from local state
        setGeofences(prev => prev.filter(g => g.id !== selectedGeofence));

        // Show success notification
        toast.success(&apos;Geofence deleted successfully&apos;);
      } else {
        // Show error notification
        toast.error(&apos;Failed to delete geofence&apos;);
      }

      setDeleteDialogOpen(false);
      setSelectedGeofence(null);
    });
  };

  // Filter geofences based on all criteria
  const filteredGeofences = geofences.filter(geofence => {
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
    if (typeFilter !== &apos;all&apos; && geofence.type !== typeFilter) {
      return false;
    }

    // Status filter
    if (statusFilter !== &apos;all&apos; && geofence.status !== statusFilter) {
      return false;
    }

    // Shape filter
    if (shapeFilter !== &apos;all&apos; && geofence.shape !== shapeFilter) {
      return false;
    }

    // Asset range filter
    if (assetRangeFilter !== &apos;all&apos;) {
      switch (assetRangeFilter) {
        case &apos;0&apos;:
          if (geofence.assetsInside !== 0) return false;
          break;
        case &apos;1-50&apos;:
          if (geofence.assetsInside < 1 || geofence.assetsInside > 50)
            return false;
          break;
        case &apos;51-100&apos;:
          if (geofence.assetsInside < 51 || geofence.assetsInside > 100)
            return false;
          break;
        case &apos;100+&apos;:
          if (geofence.assetsInside <= 100) return false;
          break;
      }
    }

    // Alerts filter
    if (alertsFilter !== &apos;all&apos;) {
      if (alertsFilter === &apos;active&apos; && geofence.alerts === 0) return false;
      if (alertsFilter === &apos;none&apos; && geofence.alerts > 0) return false;
    }

    return true;
  });

  const hasActiveFilters =
    typeFilter !== &apos;all&apos; ||
    statusFilter !== &apos;all&apos; ||
    shapeFilter !== &apos;all&apos; ||
    assetRangeFilter !== &apos;all&apos; ||
    alertsFilter !== &apos;all&apos;;

  const clearFilters = () => {
    setTypeFilter(&apos;all&apos;);
    setStatusFilter(&apos;all&apos;);
    setShapeFilter(&apos;all&apos;);
    setAssetRangeFilter(&apos;all&apos;);
    setAlertsFilter(&apos;all&apos;);
  };

  return (
    <PageLayout variant=&apos;wide&apos; padding=&apos;lg&apos;>
      {/* Header */}
      <div className=&apos;flex items-center justify-between&apos;>
        <div>
          <h1>Geofences</h1>
          <p className=&apos;text-muted-foreground&apos;>Manage zones and boundaries</p>
        </div>
        <Button onClick={onCreateGeofence}>
          <Plus className=&apos;h-4 w-4 mr-2&apos; />
          Create Geofence
        </Button>
      </div>

      {/* Stats */}
      <div className=&apos;grid gap-4 md:grid-cols-4&apos;>
        <Card>
          <CardHeader className=&apos;pb-2&apos;>
            <CardTitle className=&apos;text-sm&apos;>Total Geofences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className=&apos;text-2xl&apos;>{geofences.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className=&apos;pb-2&apos;>
            <CardTitle className=&apos;text-sm&apos;>Authorized Zones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className=&apos;text-2xl&apos;>
              {geofences.filter(g => g.type === &apos;authorized&apos;).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className=&apos;pb-2&apos;>
            <CardTitle className=&apos;text-sm&apos;>Restricted Zones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className=&apos;text-2xl&apos;>
              {geofences.filter(g => g.type === &apos;restricted&apos;).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className=&apos;pb-2&apos;>
            <CardTitle className=&apos;text-sm&apos;>Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className=&apos;text-2xl&apos;>
              {geofences.reduce((sum, g) => sum + g.alerts, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Configured Geofences</CardTitle>
        </CardHeader>
        <CardContent className=&apos;space-y-4&apos;>
          <div className=&apos;flex gap-2&apos;>
            <div className=&apos;relative flex-1&apos;>
              <Search className=&apos;absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground&apos; />
              <Input
                placeholder=&apos;Search geofences by name, ID, or type...&apos;
                className=&apos;pl-9&apos;
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant={showFilters ? &apos;secondary&apos; : &apos;outline&apos;}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className=&apos;h-4 w-4 mr-2&apos; />
              Filters
              {hasActiveFilters && (
                <Badge variant=&apos;destructive&apos; className=&apos;ml-2 px-1 min-w-5 h-5&apos;>
                  {
                    [
                      typeFilter,
                      statusFilter,
                      shapeFilter,
                      assetRangeFilter,
                      alertsFilter,
                    ].filter(f => f !== &apos;all&apos;).length
                  }
                </Badge>
              )}
            </Button>
          </div>

          {showFilters && (
            <div className=&apos;pt-4 border-t space-y-4&apos;>
              <div className=&apos;flex items-center justify-between&apos;>
                <h4>Filter Geofences</h4>
                {hasActiveFilters && (
                  <Button variant=&apos;ghost&apos; size=&apos;sm&apos; onClick={clearFilters}>
                    <X className=&apos;h-4 w-4 mr-1&apos; />
                    Clear All
                  </Button>
                )}
              </div>

              <div className=&apos;grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4&apos;>
                <div className=&apos;space-y-2&apos;>
                  <Label>Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=&apos;all&apos;>All Types</SelectItem>
                      <SelectItem value=&apos;authorized&apos;>Authorized</SelectItem>
                      <SelectItem value=&apos;restricted&apos;>Restricted</SelectItem>
                      <SelectItem value=&apos;monitoring&apos;>Monitoring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className=&apos;space-y-2&apos;>
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=&apos;all&apos;>All Statuses</SelectItem>
                      <SelectItem value=&apos;active&apos;>Active</SelectItem>
                      <SelectItem value=&apos;inactive&apos;>Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className=&apos;space-y-2&apos;>
                  <Label>Shape</Label>
                  <Select value={shapeFilter} onValueChange={setShapeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=&apos;all&apos;>All Shapes</SelectItem>
                      <SelectItem value=&apos;circular&apos;>Circular</SelectItem>
                      <SelectItem value=&apos;polygon&apos;>Polygon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className=&apos;space-y-2&apos;>
                  <Label>Assets Inside</Label>
                  <Select
                    value={assetRangeFilter}
                    onValueChange={setAssetRangeFilter}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=&apos;all&apos;>All Ranges</SelectItem>
                      <SelectItem value=&apos;0&apos;>Empty (0)</SelectItem>
                      <SelectItem value=&apos;1-50&apos;>1 - 50</SelectItem>
                      <SelectItem value=&apos;51-100&apos;>51 - 100</SelectItem>
                      <SelectItem value=&apos;100+&apos;>100+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className=&apos;space-y-2&apos;>
                  <Label>Alerts</Label>
                  <Select value={alertsFilter} onValueChange={setAlertsFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=&apos;all&apos;>All</SelectItem>
                      <SelectItem value=&apos;active&apos;>Has Active Alerts</SelectItem>
                      <SelectItem value=&apos;none&apos;>No Alerts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className=&apos;flex items-center gap-2 text-sm text-muted-foreground&apos;>
                <span>
                  Showing {filteredGeofences.length} of {mockGeofences.length}{&apos; &apos;}
                  geofences
                </span>
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
              {filteredGeofences.map(geofence => (
                <TableRow
                  key={geofence.id}
                  className=&apos;cursor-pointer hover:bg-muted/50&apos;
                  onClick={() => handleEdit(geofence)}
                >
                  <TableCell className=&apos;font-mono text-sm&apos;>
                    {geofence.id}
                  </TableCell>
                  <TableCell>
                    <div className=&apos;flex items-center gap-2&apos;>
                      <MapPin className=&apos;h-4 w-4 text-muted-foreground&apos; />
                      {geofence.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={geofence.type} type=&apos;geofence&apos; />
                  </TableCell>
                  <TableCell>
                    <div className=&apos;flex items-center gap-1&apos;>
                      {geofence.shape === &apos;circular&apos; ? (
                        <Circle className=&apos;h-3 w-3 text-muted-foreground&apos; />
                      ) : (
                        <Pentagon className=&apos;h-3 w-3 text-muted-foreground&apos; />
                      )}
                      <span className=&apos;text-sm capitalize&apos;>
                        {geofence.shape}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className=&apos;text-sm&apos;>{geofence.radius}</TableCell>
                  <TableCell>
                    <Badge variant=&apos;secondary&apos;>{geofence.expectedAssets}</Badge>
                  </TableCell>
                  <TableCell>
                    {geofence.violatingAssets > 0 ? (
                      <Button
                        variant=&apos;ghost&apos;
                        size=&apos;sm&apos;
                        className=&apos;h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10&apos;
                        onClick={e => {
                          e.stopPropagation();
                          handleViewViolations(geofence.id);
                        }}
                      >
                        <Badge variant=&apos;destructive&apos; className=&apos;mr-2&apos;>
                          {geofence.violatingAssets}
                        </Badge>
                        View on Map
                      </Button>
                    ) : (
                      <span className=&apos;text-sm text-muted-foreground&apos;>0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className=&apos;flex items-center gap-2&apos;>
                      <Badge
                        variant=&apos;outline&apos;
                        className={
                          geofence.complianceRate >= 90
                            ? &apos;bg-green-50 text-green-700 border-green-200&apos;
                            : geofence.complianceRate >= 70
                              ? &apos;bg-yellow-50 text-yellow-700 border-yellow-200&apos;
                              : &apos;bg-red-50 text-red-700 border-red-200&apos;
                        }
                      >
                        {geofence.complianceRate}%
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant=&apos;outline&apos;
                      className={
                        geofence.status === &apos;active&apos;
                          ? &apos;bg-green-50 text-green-700 border-green-200&apos;
                          : &apos;bg-gray-50 text-gray-700 border-gray-200&apos;
                      }
                    >
                      {geofence.status}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant=&apos;ghost&apos; size=&apos;icon&apos;>
                          <MoreVertical className=&apos;h-4 w-4&apos; />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align=&apos;end&apos;>
                        <DropdownMenuItem
                          onClick={() =>
                            navigation.handleShowOnMap({
                              id: geofence.id,
                              name: geofence.name,
                            } as any)
                          }
                        >
                          <Map className=&apos;h-4 w-4 mr-2&apos; />
                          View on Map
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(geofence)}>
                          <Edit className=&apos;h-4 w-4 mr-2&apos; />
                          Edit Geofence
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            navigation.navigateToAlertConfiguration()
                          }
                        >
                          <Settings className=&apos;h-4 w-4 mr-2&apos; />
                          Configure Alerts
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            toast.info(
                              &apos;View history functionality coming soon!&apos;
                            )
                          }
                        >
                          <History className=&apos;h-4 w-4 mr-2&apos; />
                          View History
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className=&apos;text-destructive&apos;
                          onClick={() => handleDelete(geofence.id)}
                        >
                          <Trash2 className=&apos;h-4 w-4 mr-2&apos; />
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
              Are you sure you want to delete this geofence? This action cannot
              be undone. All associated alerts and history will be preserved.
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
