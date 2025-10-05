import React, { useState } from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { StatusBadge, InfoRow } from "../common";
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
  Search,
  Plus,
  MoreVertical,
  MapPin,
  Building2,
  Users,
  Package,
  Filter,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import type { Site } from "../../types";
import { mockSites as sharedMockSites } from "../../data/mockData";
import { useNavigation } from "../../contexts/NavigationContext";

// Extended Site type with UI-specific fields for the table
type SiteWithActivity = Site & {
  personnel: number;
  lastActivity: string;
};

// Extend shared mock sites with UI-specific fields for the table
const mockSites: SiteWithActivity[] = sharedMockSites.map((site, index) => ({
  ...site,
  personnel: [45, 128, 89, 32, 56, 8][index] || 0,
  lastActivity: ["2 min ago", "5 min ago", "1 min ago", "12 min ago", "45 min ago", "3 hours ago"][index] || "Unknown",
}));

interface SitesProps {
  onSiteClick?: (site: Site) => void;
}

export function Sites({ onSiteClick }: SitesProps) {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [assetRangeFilter, setAssetRangeFilter] = useState<string>("all");

  // Sites are already in the shared format, no conversion needed



  // Extract state from address
  const getState = (address: string) => {
    const match = address.match(/,\s*([A-Z]{2})\s+\d{5}/);
    return match ? match[1] : "";
  };

  // Filter sites based on all criteria
  const filteredSites = mockSites.filter((site) => {
    // Text search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        site.name.toLowerCase().includes(searchLower) ||
        site.id.toLowerCase().includes(searchLower) ||
        (site.address || site.location || "").toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter !== "all" && site.status !== statusFilter) {
      return false;
    }

    // State filter
    if (stateFilter !== "all") {
      const siteState = getState(site.address || site.location || "");
      if (siteState !== stateFilter) return false;
    }

    // Asset range filter
    if (assetRangeFilter !== "all") {
      switch (assetRangeFilter) {
        case "0-100":
          if (site.assets > 100) return false;
          break;
        case "101-500":
          if (site.assets <= 100 || site.assets > 500) return false;
          break;
        case "501-1000":
          if (site.assets <= 500 || site.assets > 1000) return false;
          break;
        case "1000+":
          if (site.assets <= 1000) return false;
          break;
      }
    }

    return true;
  });

  const hasActiveFilters = statusFilter !== "all" || stateFilter !== "all" || assetRangeFilter !== "all";

  const clearFilters = () => {
    setStatusFilter("all");
    setStateFilter("all");
    setAssetRangeFilter("all");
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Sites</h1>
          <p className="text-muted-foreground">
            Manage physical locations and boundaries
          </p>
        </div>
        <Button onClick={navigation.navigateToCreateSite}>
          <Plus className="h-4 w-4 mr-2" />
          Add Site
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Total Sites</p>
              <h3>6</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <MapPin className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Active Sites</p>
              <h3>4</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Package className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Total Assets</p>
              <h3>3,372</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <Users className="h-6 w-6 text-purple-700" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Total Personnel</p>
              <h3>358</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by site name, ID, or location..."
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
                {[statusFilter, stateFilter, assetRangeFilter].filter(f => f !== "all").length}
              </Badge>
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="pt-4 border-t space-y-4">
            <div className="flex items-center justify-between">
              <h4>Filter Sites</h4>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>State</Label>
                <Select value={stateFilter} onValueChange={setStateFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    <SelectItem value="TX">Texas (TX)</SelectItem>
                    <SelectItem value="CA">California (CA)</SelectItem>
                    <SelectItem value="NY">New York (NY)</SelectItem>
                    <SelectItem value="FL">Florida (FL)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Asset Count</Label>
                <Select value={assetRangeFilter} onValueChange={setAssetRangeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ranges</SelectItem>
                    <SelectItem value="0-100">0 - 100</SelectItem>
                    <SelectItem value="101-500">101 - 500</SelectItem>
                    <SelectItem value="501-1000">501 - 1,000</SelectItem>
                    <SelectItem value="1000+">1,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Showing {filteredSites.length} of {mockSites.length} sites</span>
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
            {filteredSites.map((site) => (
              <TableRow 
                key={site.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSiteClick?.(site)}
              >
                <TableCell>
                  <div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{site.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{site.id}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs">
                    <p className="text-sm truncate">{site.address || site.location}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <InfoRow icon={MapPin} iconClassName="h-4 w-4">
                    <p className="text-sm">{site.area || "Not defined"}</p>
                  </InfoRow>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">±{site.tolerance} ft</Badge>
                </TableCell>
                <TableCell>
                  <InfoRow icon={Package} iconClassName="h-4 w-4">
                    <span>{site.assets}</span>
                  </InfoRow>
                </TableCell>
                <TableCell>
                  <InfoRow icon={Users} iconClassName="h-4 w-4">
                    <span>{site.personnel}</span>
                  </InfoRow>
                </TableCell>
                <TableCell>
                  <StatusBadge status={site.status} type="site" />
                </TableCell>
                <TableCell>
                  <p className="text-sm text-muted-foreground">
                    {site.lastActivity}
                  </p>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onSiteClick?.(site)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>Edit Site</DropdownMenuItem>
                      <DropdownMenuItem>View Assets</DropdownMenuItem>
                      <DropdownMenuItem>View on Map</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
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
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Showing {filteredSites.length} of {mockSites.length} sites</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Previous
          </Button>
          <Button variant="outline" size="sm">
            1
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
