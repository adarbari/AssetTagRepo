import React, { useState } from &apos;react&apos;;
import { Card } from &apos;../ui/card&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Input } from &apos;../ui/input&apos;;
import { StatusBadge, InfoRow, PageLayout } from &apos;../common&apos;;
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from &apos;../ui/dropdown-menu&apos;;
import {
  Search,
  Plus,
  MoreVertical,
  MapPin,
  Building2,
  Users,
  Package,
  Filter,
  X,
} from &apos;lucide-react&apos;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &apos;../ui/select&apos;;
import { Label } from &apos;../ui/label&apos;;
import type { Site } from &apos;../../types&apos;;
import { mockSites as sharedMockSites } from &apos;../../data/mockData&apos;;
import { useNavigation } from &apos;../../contexts/NavigationContext&apos;;

// Extended Site type with UI-specific fields for the table
type SiteWithActivity = Site & {
  personnel: number;
  lastActivity: string;
};

// Extend shared mock sites with UI-specific fields for the table
const mockSites: SiteWithActivity[] = sharedMockSites.map((site, index) => ({
  ...site,
  personnel: [45, 128, 89, 32, 56, 8][index] || 0,
  lastActivity:
    [
      &apos;2 min ago&apos;,
      &apos;5 min ago&apos;,
      &apos;1 min ago&apos;,
      &apos;12 min ago&apos;,
      &apos;45 min ago&apos;,
      &apos;3 hours ago&apos;,
    ][index] || &apos;Unknown&apos;,
}));

interface SitesProps {
  onSiteClick?: (site: Site) => void;
}

export function Sites({ onSiteClick }: SitesProps) {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState(&apos;&apos;);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>(&apos;all&apos;);
  const [stateFilter, setStateFilter] = useState<string>(&apos;all&apos;);
  const [assetRangeFilter, setAssetRangeFilter] = useState<string>(&apos;all&apos;);

  // Sites are already in the shared format, no conversion needed

  // Extract state from address
  const getState = (address: string) => {
    const match = address.match(/,\s*([A-Z]{2})\s+\d{5}/);
    return match ? match[1] : &apos;&apos;;
  };

  // Filter sites based on all criteria
  const filteredSites = mockSites.filter(site => {
    // Text search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        site.name.toLowerCase().includes(searchLower) ||
        site.id.toLowerCase().includes(searchLower) ||
        (site.address || site.location || &apos;&apos;)
          .toLowerCase()
          .includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter !== &apos;all&apos; && site.status !== statusFilter) {
      return false;
    }

    // State filter
    if (stateFilter !== &apos;all&apos;) {
      const siteState = getState(site.address || site.location || &apos;&apos;);
      if (siteState !== stateFilter) return false;
    }

    // Asset range filter
    if (assetRangeFilter !== &apos;all&apos;) {
      switch (assetRangeFilter) {
        case &apos;0-100&apos;:
          if (site.assets > 100) return false;
          break;
        case &apos;101-500&apos;:
          if (site.assets <= 100 || site.assets > 500) return false;
          break;
        case &apos;501-1000&apos;:
          if (site.assets <= 500 || site.assets > 1000) return false;
          break;
        case &apos;1000+&apos;:
          if (site.assets <= 1000) return false;
          break;
      }
    }

    return true;
  });

  const hasActiveFilters =
    statusFilter !== &apos;all&apos; ||
    stateFilter !== &apos;all&apos; ||
    assetRangeFilter !== &apos;all&apos;;

  const clearFilters = () => {
    setStatusFilter(&apos;all&apos;);
    setStateFilter(&apos;all&apos;);
    setAssetRangeFilter(&apos;all&apos;);
  };

  return (
    <PageLayout variant=&apos;wide&apos; padding=&apos;lg&apos;>
      {/* Header */}
      <div className=&apos;flex items-center justify-between&apos;>
        <div>
          <h1>Sites</h1>
          <p className=&apos;text-muted-foreground&apos;>
            Manage physical locations and boundaries
          </p>
        </div>
        <Button onClick={navigation.navigateToCreateSite}>
          <Plus className=&apos;h-4 w-4 mr-2&apos; />
          Add Site
        </Button>
      </div>

      {/* Stats Cards */}
      <div className=&apos;grid gap-4 md:grid-cols-4&apos;>
        <Card className=&apos;p-4&apos;>
          <div className=&apos;flex items-center gap-4&apos;>
            <div className=&apos;flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10&apos;>
              <Building2 className=&apos;h-6 w-6 text-primary&apos; />
            </div>
            <div>
              <p className=&apos;text-muted-foreground text-sm&apos;>Total Sites</p>
              <h3>6</h3>
            </div>
          </div>
        </Card>

        <Card className=&apos;p-4&apos;>
          <div className=&apos;flex items-center gap-4&apos;>
            <div className=&apos;flex h-12 w-12 items-center justify-center rounded-lg bg-green-100&apos;>
              <MapPin className=&apos;h-6 w-6 text-green-700&apos; />
            </div>
            <div>
              <p className=&apos;text-muted-foreground text-sm&apos;>Active Sites</p>
              <h3>4</h3>
            </div>
          </div>
        </Card>

        <Card className=&apos;p-4&apos;>
          <div className=&apos;flex items-center gap-4&apos;>
            <div className=&apos;flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100&apos;>
              <Package className=&apos;h-6 w-6 text-blue-700&apos; />
            </div>
            <div>
              <p className=&apos;text-muted-foreground text-sm&apos;>Total Assets</p>
              <h3>3,372</h3>
            </div>
          </div>
        </Card>

        <Card className=&apos;p-4&apos;>
          <div className=&apos;flex items-center gap-4&apos;>
            <div className=&apos;flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100&apos;>
              <Users className=&apos;h-6 w-6 text-purple-700&apos; />
            </div>
            <div>
              <p className=&apos;text-muted-foreground text-sm&apos;>Total Personnel</p>
              <h3>358</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className=&apos;p-4 space-y-4&apos;>
        <div className=&apos;flex gap-2&apos;>
          <div className=&apos;relative flex-1&apos;>
            <Search className=&apos;absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground&apos; />
            <Input
              placeholder=&apos;Search by site name, ID, or location...&apos;
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
                  [statusFilter, stateFilter, assetRangeFilter].filter(
                    f => f !== &apos;all&apos;
                  ).length
                }
              </Badge>
            )}
          </Button>
        </div>

        {showFilters && (
          <div className=&apos;pt-4 border-t space-y-4&apos;>
            <div className=&apos;flex items-center justify-between&apos;>
              <h4>Filter Sites</h4>
              {hasActiveFilters && (
                <Button variant=&apos;ghost&apos; size=&apos;sm&apos; onClick={clearFilters}>
                  <X className=&apos;h-4 w-4 mr-1&apos; />
                  Clear All
                </Button>
              )}
            </div>

            <div className=&apos;grid grid-cols-1 md:grid-cols-3 gap-4&apos;>
              <div className=&apos;space-y-2&apos;>
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=&apos;all&apos;>All Statuses</SelectItem>
                    <SelectItem value=&apos;active&apos;>Active</SelectItem>
                    <SelectItem value=&apos;maintenance&apos;>Maintenance</SelectItem>
                    <SelectItem value=&apos;inactive&apos;>Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className=&apos;space-y-2&apos;>
                <Label>State</Label>
                <Select value={stateFilter} onValueChange={setStateFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=&apos;all&apos;>All States</SelectItem>
                    <SelectItem value=&apos;TX&apos;>Texas (TX)</SelectItem>
                    <SelectItem value=&apos;CA&apos;>California (CA)</SelectItem>
                    <SelectItem value=&apos;NY&apos;>New York (NY)</SelectItem>
                    <SelectItem value=&apos;FL&apos;>Florida (FL)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className=&apos;space-y-2&apos;>
                <Label>Asset Count</Label>
                <Select
                  value={assetRangeFilter}
                  onValueChange={setAssetRangeFilter}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=&apos;all&apos;>All Ranges</SelectItem>
                    <SelectItem value=&apos;0-100&apos;>0 - 100</SelectItem>
                    <SelectItem value=&apos;101-500&apos;>101 - 500</SelectItem>
                    <SelectItem value=&apos;501-1000&apos;>501 - 1,000</SelectItem>
                    <SelectItem value=&apos;1000+&apos;>1,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className=&apos;flex items-center gap-2 text-sm text-muted-foreground&apos;>
              <span>
                Showing {filteredSites.length} of {mockSites.length} sites
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Sites Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Site Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Boundary</TableHead>
              <TableHead>Tolerance</TableHead>
              <TableHead>Assets</TableHead>
              <TableHead>Personnel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSites.map(site => (
              <TableRow
                key={site.id}
                className=&apos;cursor-pointer hover:bg-muted/50&apos;
                onClick={() => onSiteClick?.(site)}
              >
                <TableCell>
                  <div>
                    <div className=&apos;flex items-center gap-2&apos;>
                      <Building2 className=&apos;h-4 w-4 text-muted-foreground&apos; />
                      <span>{site.name}</span>
                    </div>
                    <p className=&apos;text-sm text-muted-foreground&apos;>{site.id}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className=&apos;max-w-xs&apos;>
                    <p className=&apos;text-sm truncate&apos;>
                      {site.address || site.location}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <InfoRow icon={MapPin} iconClassName=&apos;h-4 w-4&apos;>
                    <p className=&apos;text-sm&apos;>{site.area || &apos;Not defined&apos;}</p>
                  </InfoRow>
                </TableCell>
                <TableCell>
                  <Badge variant=&apos;outline&apos;>±{site.tolerance} ft</Badge>
                </TableCell>
                <TableCell>
                  <InfoRow icon={Package} iconClassName=&apos;h-4 w-4&apos;>
                    <span>{site.assets}</span>
                  </InfoRow>
                </TableCell>
                <TableCell>
                  <InfoRow icon={Users} iconClassName=&apos;h-4 w-4&apos;>
                    <span>{site.personnel}</span>
                  </InfoRow>
                </TableCell>
                <TableCell>
                  <StatusBadge status={site.status} type=&apos;site&apos; />
                </TableCell>
                <TableCell>
                  <p className=&apos;text-sm text-muted-foreground&apos;>
                    {site.lastActivity}
                  </p>
                </TableCell>
                <TableCell onClick={e => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant=&apos;ghost&apos; size=&apos;sm&apos;>
                        <MoreVertical className=&apos;h-4 w-4&apos; />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align=&apos;end&apos;>
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onSiteClick?.(site)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>Edit Site</DropdownMenuItem>
                      <DropdownMenuItem>View Assets</DropdownMenuItem>
                      <DropdownMenuItem>View on Map</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className=&apos;text-destructive&apos;>
                        Deactivate Site
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      <div className=&apos;flex items-center justify-between&apos;>
        <p className=&apos;text-sm text-muted-foreground&apos;>
          Showing {filteredSites.length} of {mockSites.length} sites
        </p>
        <div className=&apos;flex items-center gap-2&apos;>
          <Button variant=&apos;outline&apos; size=&apos;sm&apos;>
            Previous
          </Button>
          <Button variant=&apos;outline&apos; size=&apos;sm&apos;>
            1
          </Button>
          <Button variant=&apos;outline&apos; size=&apos;sm&apos;>
            Next
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
