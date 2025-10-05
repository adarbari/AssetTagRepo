/**
 * Issue Tracking Component
 * 
 * View and manage all reported asset issues
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { PageHeader, EmptyState, StatsCard } from "./common";
import {
  AlertTriangle,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  TrendingUp,
  AlertCircle,
  Wrench,
  User,
} from "lucide-react";
import { toast } from "sonner";
import type { Issue, IssueStatus, UpdateIssueInput } from "../types/issue";

interface IssueTrackingProps {
  issues: Issue[];
  onUpdateIssue: (issueId: string, input: UpdateIssueInput) => Promise<{ success: boolean; issue?: Issue; error?: any }>;
  onUpdateStatus: (issueId: string, status: IssueStatus) => Promise<{ success: boolean; error?: any }>;
  onDeleteIssue: (issueId: string) => Promise<{ success: boolean; error?: any }>;
}

const getStatusBadge = (status: IssueStatus) => {
  const variants: Record<IssueStatus, { variant: string; className: string }> = {
    open: { variant: "default", className: "bg-red-100 text-red-700 border-red-300" },
    acknowledged: { variant: "default", className: "bg-yellow-100 text-yellow-700 border-yellow-300" },
    "in-progress": { variant: "default", className: "bg-blue-100 text-blue-700 border-blue-300" },
    resolved: { variant: "default", className: "bg-green-100 text-green-700 border-green-300" },
    closed: { variant: "outline", className: "" },
    cancelled: { variant: "outline", className: "" },
  };

  const config = variants[status];
  return (
    <Badge className={config.className}>
      {status === "in-progress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case "critical":
      return <Badge variant="destructive">Critical</Badge>;
    case "high":
      return <Badge className="bg-orange-100 text-orange-700 border-orange-300">High</Badge>;
    case "medium":
      return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">Medium</Badge>;
    case "low":
      return <Badge variant="outline">Low</Badge>;
    default:
      return <Badge variant="outline">{severity}</Badge>;
  }
};

export function IssueTracking({
  issues,
  onUpdateIssue,
  onUpdateStatus,
  onDeleteIssue,
}: IssueTrackingProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Filter issues
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch = 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || issue.status === selectedStatus;
    const matchesSeverity = selectedSeverity === "all" || issue.severity === selectedSeverity;
    
    const matchesTab = 
      activeTab === "all" ||
      (activeTab === "open" && (issue.status === "open" || issue.status === "acknowledged" || issue.status === "in-progress")) ||
      (activeTab === "resolved" && (issue.status === "resolved" || issue.status === "closed"));
    
    return matchesSearch && matchesStatus && matchesSeverity && matchesTab;
  });

  const handleViewDetails = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsDetailsOpen(true);
  };

  const handleUpdateStatus = async (issueId: string, newStatus: IssueStatus) => {
    const result = await onUpdateStatus(issueId, newStatus);
    if (result.success) {
      toast.success("Issue status updated");
    } else {
      toast.error("Failed to update issue status");
    }
  };

  const handleEditIssue = (issue: Issue) => {
    navigation.navigateToEditIssue(issue.id);
  };

  const openIssuesCount = issues.filter(i => 
    i.status === "open" || i.status === "acknowledged" || i.status === "in-progress"
  ).length;

  const criticalIssuesCount = issues.filter(i => 
    i.severity === "critical" && (i.status === "open" || i.status === "acknowledged" || i.status === "in-progress")
  ).length;

  const inProgressCount = issues.filter(i => i.status === "in-progress").length;

  const resolvedThisWeek = issues.filter(i => 
    i.status === "resolved" && 
    new Date(i.resolvedDate || "").getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
  ).length;

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background px-8 py-6">
        <PageHeader
          title="Issue Tracking"
          description="View and manage all reported asset issues"
          icon={AlertTriangle}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatsCard
              title="Open Issues"
              value={openIssuesCount.toString()}
              icon={AlertCircle}
              trend={openIssuesCount > 5 ? "up" : "down"}
              trendValue={`${openIssuesCount > 5 ? "↑" : "↓"} ${Math.abs(openIssuesCount - 5)}`}
            />
            <StatsCard
              title="Critical"
              value={criticalIssuesCount.toString()}
              icon={AlertTriangle}
              iconClassName="text-red-600"
            />
            <StatsCard
              title="In Progress"
              value={inProgressCount.toString()}
              icon={Wrench}
              iconClassName="text-blue-600"
            />
            <StatsCard
              title="Resolved (7d)"
              value={resolvedThisWeek.toString()}
              icon={CheckCircle2}
              iconClassName="text-green-600"
            />
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Issues</CardTitle>
                  <CardDescription>
                    All reported asset issues and their current status
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <div className="flex items-center justify-between">
                  <TabsList>
                    <TabsTrigger value="all">All Issues</TabsTrigger>
                    <TabsTrigger value="open">Active</TabsTrigger>
                    <TabsTrigger value="resolved">Resolved</TabsTrigger>
                  </TabsList>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search issues..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                      />
                    </div>

                    <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Severities</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="acknowledged">Acknowledged</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <TabsContent value={activeTab} className="space-y-4">
                  {filteredIssues.length === 0 ? (
                    <EmptyState
                      icon={AlertTriangle}
                      title="No issues found"
                      description="No issues match your current filters"
                    />
                  ) : (
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Issue ID</TableHead>
                            <TableHead>Asset</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Severity</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Reported</TableHead>
                            <TableHead>Assigned To</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredIssues.map((issue) => (
                            <TableRow 
                              key={issue.id} 
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => handleEditIssue(issue)}
                            >
                              <TableCell className="font-mono text-sm">{issue.id}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <div>{issue.assetName}</div>
                                    <div className="text-xs text-muted-foreground">{issue.assetId}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="max-w-xs">
                                  <div className="truncate">{issue.title}</div>
                                  <div className="text-xs text-muted-foreground truncate">{issue.description}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {issue.type.replace("-", " ")}
                                </Badge>
                              </TableCell>
                              <TableCell>{getSeverityBadge(issue.severity)}</TableCell>
                              <TableCell>{getStatusBadge(issue.status)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 text-sm">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  {new Date(issue.reportedDate).toLocaleDateString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                {issue.assignedTo ? (
                                  <div className="flex items-center gap-1 text-sm">
                                    <User className="h-3 w-3 text-muted-foreground" />
                                    {issue.assignedTo}
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">Unassigned</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleViewDetails(issue)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    {issue.status === "open" && (
                                      <DropdownMenuItem onClick={() => handleUpdateStatus(issue.id, "acknowledged")}>
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Acknowledge
                                      </DropdownMenuItem>
                                    )}
                                    {(issue.status === "open" || issue.status === "acknowledged") && (
                                      <DropdownMenuItem onClick={() => handleUpdateStatus(issue.id, "in-progress")}>
                                        <Wrench className="h-4 w-4 mr-2" />
                                        Start Work
                                      </DropdownMenuItem>
                                    )}
                                    {issue.status === "in-progress" && (
                                      <DropdownMenuItem onClick={() => handleUpdateStatus(issue.id, "resolved")}>
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Mark Resolved
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleEditIssue(issue)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Issue
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Issue Details Dialog */}
      {selectedIssue && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Issue Details</DialogTitle>
                <div className="flex items-center gap-2">
                  {getSeverityBadge(selectedIssue.severity)}
                  {getStatusBadge(selectedIssue.status)}
                </div>
              </div>
              <DialogDescription>{selectedIssue.id}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <h4 className="mb-2">Title</h4>
                <p className="text-muted-foreground">{selectedIssue.title}</p>
              </div>

              <div>
                <h4 className="mb-2">Asset</h4>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Package className="h-4 w-4" />
                  <div>
                    <p>{selectedIssue.assetName}</p>
                    <p className="text-xs text-muted-foreground">{selectedIssue.assetId}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedIssue.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-2">Type</h4>
                  <Badge variant="outline" className="capitalize">
                    {selectedIssue.type.replace("-", " ")}
                  </Badge>
                </div>
                <div>
                  <h4 className="mb-2">Reported By</h4>
                  <p className="text-sm text-muted-foreground">{selectedIssue.reportedBy}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-2">Reported Date</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedIssue.reportedDate).toLocaleString()}
                  </p>
                </div>
                {selectedIssue.assignedTo && (
                  <div>
                    <h4 className="mb-2">Assigned To</h4>
                    <p className="text-sm text-muted-foreground">{selectedIssue.assignedTo}</p>
                  </div>
                )}
              </div>

              {selectedIssue.resolvedBy && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="mb-2">Resolved By</h4>
                    <p className="text-sm text-muted-foreground">{selectedIssue.resolvedBy}</p>
                  </div>
                  <div>
                    <h4 className="mb-2">Resolved Date</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedIssue.resolvedDate && new Date(selectedIssue.resolvedDate).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {selectedIssue.notes && (
                <div>
                  <h4 className="mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground">{selectedIssue.notes}</p>
                </div>
              )}

              {selectedIssue.tags && selectedIssue.tags.length > 0 && (
                <div>
                  <h4 className="mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedIssue.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                Close
              </Button>
              {selectedIssue.status !== "resolved" && selectedIssue.status !== "closed" && (
                <Button onClick={() => {
                  handleUpdateStatus(selectedIssue.id, "resolved");
                  setIsDetailsOpen(false);
                }}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark as Resolved
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
