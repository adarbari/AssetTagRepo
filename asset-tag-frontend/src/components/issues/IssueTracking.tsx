/**
 * Issue Tracking Component
 *
 * View and manage all reported asset issues
 */

import React, { useState } from &apos;react&apos;;
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from &apos;../ui/card&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Input } from &apos;../ui/input&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import { SeverityBadge, StatusBadge } from &apos;../common&apos;;
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from &apos;../ui/dropdown-menu&apos;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &apos;../ui/tabs&apos;;
import { PageHeader, EmptyState, StatsCard, PageLayout } from &apos;../common&apos;;
import {
  AlertTriangle,
  Search,
  MoreVertical,
  Eye,
  Edit,
  CheckCircle2,
  Clock,
  Package,
  AlertCircle,
  Wrench,
  User,
} from &apos;lucide-react&apos;;
import { toast } from &apos;sonner&apos;;
import { useNavigation } from &apos;../../contexts/NavigationContext&apos;;
import type { Issue, IssueStatus, UpdateIssueInput } from &apos;../../types/issue&apos;;

interface IssueTrackingProps {
  issues: Issue[];
  onUpdateIssue: (
    issueId: string,
    input: UpdateIssueInput
  ) => Promise<{ success: boolean; issue?: Issue; error?: any }>;
  onUpdateStatus: (
    issueId: string,
    status: IssueStatus
  ) => Promise<{ success: boolean; error?: any }>;
  onDeleteIssue: (
    issueId: string
  ) => Promise<{ success: boolean; error?: any }>;
}

export function IssueTracking({
  issues,
  onUpdateIssue: _onUpdateIssue,
  onUpdateStatus,
  onDeleteIssue: _onDeleteIssue,
}: IssueTrackingProps) {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState(&apos;&apos;);
  const [selectedStatus, setSelectedStatus] = useState<string>(&apos;all&apos;);
  const [selectedSeverity, setSelectedSeverity] = useState<string>(&apos;all&apos;);
  const [activeTab, setActiveTab] = useState(&apos;all&apos;);

  // Filter issues
  const filteredIssues = issues.filter(issue => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === &apos;all&apos; || issue.status === selectedStatus;
    const matchesSeverity =
      selectedSeverity === &apos;all&apos; || issue.severity === selectedSeverity;

    const matchesTab =
      activeTab === &apos;all&apos; ||
      (activeTab === &apos;open&apos; &&
        (issue.status === &apos;open&apos; ||
          issue.status === &apos;acknowledged&apos; ||
          issue.status === &apos;in-progress&apos;)) ||
      (activeTab === &apos;resolved&apos; &&
        (issue.status === &apos;resolved&apos; || issue.status === &apos;closed&apos;));

    return matchesSearch && matchesStatus && matchesSeverity && matchesTab;
  });

  const handleViewDetails = (issue: Issue) => {
    navigation.navigateToEditIssue(issue.id);
  };

  const handleUpdateStatus = async (
    issueId: string,
    newStatus: IssueStatus
  ) => {
    const result = await onUpdateStatus(issueId, newStatus);
    if (result.success) {
      toast.success(&apos;Issue status updated&apos;);
    } else {
      toast.error(&apos;Failed to update issue status&apos;);
    }
  };

  const handleEditIssue = (issue: Issue) => {
    navigation.navigateToEditIssue(issue.id);
  };

  const handleRowClick = (issue: Issue) => {
    navigation.navigateToEditIssue(issue.id);
  };

  const openIssuesCount = issues.filter(
    i =>
      i.status === &apos;open&apos; ||
      i.status === &apos;acknowledged&apos; ||
      i.status === &apos;in-progress&apos;
  ).length;

  const criticalIssuesCount = issues.filter(
    i =>
      i.severity === &apos;critical&apos; &&
      (i.status === &apos;open&apos; ||
        i.status === &apos;acknowledged&apos; ||
        i.status === &apos;in-progress&apos;)
  ).length;

  const inProgressCount = issues.filter(i => i.status === &apos;in-progress&apos;).length;

  const resolvedThisWeek = issues.filter(
    i =>
      i.status === &apos;resolved&apos; &&
      new Date(i.resolvedDate || &apos;&apos;).getTime() >
        Date.now() - 7 * 24 * 60 * 60 * 1000
  ).length;

  return (
    <PageLayout
      variant=&apos;wide&apos;
      padding=&apos;lg&apos;
      header={
        <div className=&apos;border-b bg-background px-8 py-6&apos;>
          <PageHeader
            title=&apos;Issue Tracking&apos;
            description=&apos;View and manage all reported asset issues&apos;
            icon={AlertTriangle}
          />
        </div>
      }
    >
      {/* Stats Cards */}
      <div className=&apos;grid gap-4 md:grid-cols-4&apos;>
        <StatsCard
          title=&apos;Open Issues&apos;
          value={openIssuesCount.toString()}
          icon={AlertCircle}
          trend={{
            value: Math.abs(openIssuesCount - 5),
            direction: openIssuesCount > 5 ? &apos;up&apos; : &apos;down&apos;,
            label: `${openIssuesCount > 5 ? &apos;↑&apos; : &apos;↓&apos;} ${Math.abs(openIssuesCount - 5)}`,
          }}
        />
        <StatsCard
          title=&apos;Critical&apos;
          value={criticalIssuesCount.toString()}
          icon={AlertTriangle}
          variant=&apos;danger&apos;
        />
        <StatsCard
          title=&apos;In Progress&apos;
          value={inProgressCount.toString()}
          icon={Wrench}
          variant=&apos;info&apos;
        />
        <StatsCard
          title=&apos;Resolved (7d)&apos;
          value={resolvedThisWeek.toString()}
          icon={CheckCircle2}
          variant=&apos;success&apos;
        />
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className=&apos;flex items-center justify-between&apos;>
            <div>
              <CardTitle>Issues</CardTitle>
              <CardDescription>
                All reported asset issues and their current status
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className=&apos;space-y-4&apos;
          >
            <div className=&apos;flex items-center justify-between&apos;>
              <TabsList>
                <TabsTrigger value=&apos;all&apos;>All Issues</TabsTrigger>
                <TabsTrigger value=&apos;open&apos;>Active</TabsTrigger>
                <TabsTrigger value=&apos;resolved&apos;>Resolved</TabsTrigger>
              </TabsList>

              <div className=&apos;flex items-center gap-2&apos;>
                <div className=&apos;relative flex-1 max-w-sm&apos;>
                  <Search className=&apos;absolute left-2 top-2.5 h-4 w-4 text-muted-foreground&apos; />
                  <Input
                    placeholder=&apos;Search issues...&apos;
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className=&apos;pl-8&apos;
                  />
                </div>

                <Select
                  value={selectedSeverity}
                  onValueChange={setSelectedSeverity}
                >
                  <SelectTrigger className=&apos;w-[150px]&apos;>
                    <SelectValue placeholder=&apos;Severity&apos; />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=&apos;all&apos;>All Severities</SelectItem>
                    <SelectItem value=&apos;critical&apos;>Critical</SelectItem>
                    <SelectItem value=&apos;high&apos;>High</SelectItem>
                    <SelectItem value=&apos;medium&apos;>Medium</SelectItem>
                    <SelectItem value=&apos;low&apos;>Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className=&apos;w-[150px]&apos;>
                    <SelectValue placeholder=&apos;Status&apos; />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=&apos;all&apos;>All Statuses</SelectItem>
                    <SelectItem value=&apos;open&apos;>Open</SelectItem>
                    <SelectItem value=&apos;acknowledged&apos;>Acknowledged</SelectItem>
                    <SelectItem value=&apos;in-progress&apos;>In Progress</SelectItem>
                    <SelectItem value=&apos;resolved&apos;>Resolved</SelectItem>
                    <SelectItem value=&apos;closed&apos;>Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value={activeTab} className=&apos;space-y-6&apos;>
              {filteredIssues.length === 0 ? (
                <EmptyState
                  icon={AlertTriangle}
                  title=&apos;No issues found&apos;
                  description=&apos;No issues match your current filters&apos;
                />
              ) : (
                <div className=&apos;border rounded-lg&apos;>
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
                        <TableHead className=&apos;w-[50px]&apos;></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredIssues.map(issue => (
                        <TableRow
                          key={issue.id}
                          className=&apos;cursor-pointer hover:bg-muted/50&apos;
                          onClick={() => handleRowClick(issue)}
                        >
                          <TableCell className=&apos;font-mono text-sm&apos;>
                            {issue.id}
                          </TableCell>
                          <TableCell>
                            <div className=&apos;flex items-center gap-2&apos;>
                              <Package className=&apos;h-4 w-4 text-muted-foreground&apos; />
                              <div>
                                <div>{issue.assetName}</div>
                                <div className=&apos;text-xs text-muted-foreground&apos;>
                                  {issue.assetId}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className=&apos;max-w-xs&apos;>
                              <div className=&apos;truncate&apos;>{issue.title}</div>
                              <div className=&apos;text-xs text-muted-foreground truncate&apos;>
                                {issue.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant=&apos;outline&apos; className=&apos;capitalize&apos;>
                              {issue.type.replace(&apos;-&apos;, &apos; &apos;)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <SeverityBadge severity={issue.severity} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={issue.status} />
                          </TableCell>
                          <TableCell>
                            <div className=&apos;flex items-center gap-1 text-sm&apos;>
                              <Clock className=&apos;h-3 w-3 text-muted-foreground&apos; />
                              {new Date(
                                issue.reportedDate
                              ).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            {issue.assignedTo ? (
                              <div className=&apos;flex items-center gap-1 text-sm&apos;>
                                <User className=&apos;h-3 w-3 text-muted-foreground&apos; />
                                {issue.assignedTo}
                              </div>
                            ) : (
                              <span className=&apos;text-xs text-muted-foreground&apos;>
                                Unassigned
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant=&apos;ghost&apos; size=&apos;sm&apos;>
                                  <MoreVertical className=&apos;h-4 w-4&apos; />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align=&apos;end&apos;>
                                <DropdownMenuItem
                                  onClick={() => handleViewDetails(issue)}
                                >
                                  <Eye className=&apos;h-4 w-4 mr-2&apos; />
                                  View Details
                                </DropdownMenuItem>
                                {issue.status === &apos;open&apos; && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateStatus(
                                        issue.id,
                                        &apos;acknowledged&apos;
                                      )
                                    }
                                  >
                                    <CheckCircle2 className=&apos;h-4 w-4 mr-2&apos; />
                                    Acknowledge
                                  </DropdownMenuItem>
                                )}
                                {(issue.status === &apos;open&apos; ||
                                  issue.status === &apos;acknowledged&apos;) && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateStatus(
                                        issue.id,
                                        &apos;in-progress&apos;
                                      )
                                    }
                                  >
                                    <Wrench className=&apos;h-4 w-4 mr-2&apos; />
                                    Start Work
                                  </DropdownMenuItem>
                                )}
                                {issue.status === &apos;in-progress&apos; && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateStatus(issue.id, &apos;resolved&apos;)
                                    }
                                  >
                                    <CheckCircle2 className=&apos;h-4 w-4 mr-2&apos; />
                                    Mark Resolved
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleEditIssue(issue)}
                                >
                                  <Edit className=&apos;h-4 w-4 mr-2&apos; />
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
    </PageLayout>
  );
}
