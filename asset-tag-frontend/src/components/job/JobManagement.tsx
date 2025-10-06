/**
 * Job Management Component
 *
 * Comprehensive job management system for:
 * - Creating and managing jobs
 * - Associating assets and vehicles to jobs
 * - Tracking budgets and costs
 * - Generating cost reports
 * - Monitoring job alerts
 */

import React, { useState } from &apos;react&apos;;
import { Card, CardContent, CardHeader, CardTitle } from &apos;../ui/card&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import {
  StatusBadge,
  PriorityBadge,
  StatsCard,
  PageLayout,
  FilterBar,
  type FilterConfig,
} from &apos;../common&apos;;
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
} from &apos;../ui/dropdown-menu&apos;;
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Package,
  FileText,
} from &apos;lucide-react&apos;;
import { toast } from &apos;sonner&apos;;
import type {
  Job,
  CreateJobInput,
  UpdateJobInput,
  JobAlert,
} from &apos;../../types/job&apos;;
import { useNavigation } from &apos;../../contexts/NavigationContext&apos;;

interface JobManagementProps {
  jobs: Record<string, Job>;
  onCreateJob: (
    input: CreateJobInput
  ) => Promise<{ success: boolean; job?: Job; error?: any }>;
  onUpdateJob: (
    jobId: string,
    input: UpdateJobInput
  ) => Promise<{ success: boolean; job?: Job; error?: any }>;
  onDeleteJob: (jobId: string) => Promise<{ success: boolean; error?: any }>;
  onAddAssetToJob: (
    jobId: string,
    assetId: string,
    assetName: string,
    assetType: string,
    required: boolean,
    useFullJobDuration?: boolean,
    customStartDate?: string,
    customEndDate?: string
  ) => Promise<any>;
  onRemoveAssetFromJob: (jobId: string, assetId: string) => Promise<any>;
  jobAlerts: JobAlert[];
  onNavigateToCreateJob?: () => void;
  onNavigateToJobDetails?: (job: Job) => void;
}

export function JobManagement({
  jobs,
  onCreateJob,
  onDeleteJob,
  jobAlerts,
  onNavigateToCreateJob,
  onNavigateToJobDetails,
}: JobManagementProps) {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState(&apos;&apos;);
  const [statusFilter, setStatusFilter] = useState<string>(&apos;all&apos;);
  const [priorityFilter, setPriorityFilter] = useState<string>(&apos;all&apos;);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const jobsList = Object.values(jobs);

  // Filter configuration for FilterBar
  const filters: FilterConfig[] = [
    {
      key: &apos;status&apos;,
      label: &apos;Status&apos;,
      options: [
        { value: &apos;all&apos;, label: &apos;All Status&apos; },
        { value: &apos;planning&apos;, label: &apos;Planning&apos; },
        { value: &apos;active&apos;, label: &apos;Active&apos; },
        { value: &apos;completed&apos;, label: &apos;Completed&apos; },
        { value: &apos;on-hold&apos;, label: &apos;On Hold&apos; },
        { value: &apos;cancelled&apos;, label: &apos;Cancelled&apos; },
      ],
      currentValue: statusFilter,
      onValueChange: setStatusFilter,
    },
    {
      key: &apos;priority&apos;,
      label: &apos;Priority&apos;,
      options: [
        { value: &apos;all&apos;, label: &apos;All Priorities&apos; },
        { value: &apos;critical&apos;, label: &apos;Critical&apos; },
        { value: &apos;high&apos;, label: &apos;High&apos; },
        { value: &apos;medium&apos;, label: &apos;Medium&apos; },
        { value: &apos;low&apos;, label: &apos;Low&apos; },
      ],
      currentValue: priorityFilter,
      onValueChange: setPriorityFilter,
    },
  ];

  // Calculate active filters count
  const activeFiltersCount =
    (statusFilter !== &apos;all&apos; ? 1 : 0) + (priorityFilter !== &apos;all&apos; ? 1 : 0);

  // Clear all filters
  const handleClearAllFilters = () => {
    setStatusFilter(&apos;all&apos;);
    setPriorityFilter(&apos;all&apos;);
  };

  // Filter jobs
  const filteredJobs = jobsList.filter(job => {
    const matchesSearch =
      job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.jobNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.projectManager &&
        job.projectManager.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.siteName &&
        job.siteName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === &apos;all&apos; || job.status === statusFilter;
    const matchesPriority =
      priorityFilter === &apos;all&apos; || job.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Statistics
  const stats = {
    total: jobsList.length,
    active: jobsList.filter(j => j.status === &apos;active&apos;).length,
    planning: jobsList.filter(j => j.status === &apos;planning&apos;).length,
    completed: jobsList.filter(j => j.status === &apos;completed&apos;).length,
    totalBudget: jobsList.reduce((sum, j) => sum + j.budget.total, 0),
    totalActualCosts: jobsList.reduce((sum, j) => sum + j.actualCosts.total, 0),
    activeAlerts: jobAlerts.filter(a => a.active).length,
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm(&apos;Are you sure you want to delete this job?&apos;)) {
      return;
    }

    const result = await onDeleteJob(jobId);

    if (result.success) {
      toast.success(&apos;Job deleted successfully&apos;);
    } else {
      toast.error(&apos;Failed to delete job&apos;);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(&apos;en-US&apos;, {
      style: &apos;currency&apos;,
      currency: &apos;USD&apos;,
    }).format(amount);
  };

  return (
    <PageLayout variant=&apos;wide&apos; padding=&apos;md&apos;>
      {/* Header */}
      <div className=&apos;flex items-center justify-between&apos;>
        <div>
          <h1 className=&apos;flex items-center gap-2&apos;>
            <Package className=&apos;h-6 w-6&apos; />
            Job Management
          </h1>
          <p className=&apos;text-muted-foreground&apos;>
            Plan projects, allocate resources, track costs, and manage job
            lifecycles
          </p>
        </div>
        <Button
          onClick={() =>
            onNavigateToCreateJob
              ? onNavigateToCreateJob()
              : navigation.navigateToCreateJob({ onCreateJob })
          }
        >
          <Plus className=&apos;h-4 w-4 mr-2&apos; />
          Create Job
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className=&apos;grid grid-cols-1 md:grid-cols-4 gap-4&apos;>
        <StatsCard
          title=&apos;Total Jobs&apos;
          value={stats.total}
          icon={FileText}
          description={`${stats.active} active, ${stats.planning} planning`}
        />

        <StatsCard
          title=&apos;Total Budget&apos;
          value={formatCurrency(stats.totalBudget)}
          icon={DollarSign}
          description=&apos;Across all jobs&apos;
        />

        <StatsCard
          title=&apos;Actual Costs&apos;
          value={formatCurrency(stats.totalActualCosts)}
          icon={TrendingUp}
          description={
            stats.totalBudget > 0
              ? `${((stats.totalActualCosts / stats.totalBudget) * 100).toFixed(1)}% of budget`
              : &apos;No budget allocated&apos;
          }
        />

        <StatsCard
          title=&apos;Active Alerts&apos;
          value={stats.activeAlerts}
          icon={AlertTriangle}
          description=&apos;Requires attention&apos;
          variant={stats.activeAlerts > 0 ? &apos;warning&apos; : &apos;default&apos;}
        />
      </div>

      {/* Filters */}
      <FilterBar
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder=&apos;Search jobs, sites, or project managers...&apos;
        filters={filters}
        showAdvancedFilters={showAdvancedFilters}
        onToggleAdvancedFilters={() =>
          setShowAdvancedFilters(!showAdvancedFilters)
        }
        activeFiltersCount={activeFiltersCount}
        onClearAllFilters={handleClearAllFilters}
      />

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Jobs ({filteredJobs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Actual</TableHead>
                <TableHead>Variance</TableHead>
                <TableHead>Assets</TableHead>
                <TableHead>Alerts</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className=&apos;text-center text-muted-foreground py-8&apos;
                  >
                    {searchQuery || statusFilter !== &apos;all&apos;
                      ? &apos;No jobs match your filters&apos;
                      : &apos;No jobs yet. Create your first job to get started.&apos;}
                  </TableCell>
                </TableRow>
              ) : (
                filteredJobs.map(job => (
                  <TableRow
                    key={job.id}
                    className=&apos;cursor-pointer hover:bg-muted/50&apos;
                    onClick={() => {
                      onNavigateToJobDetails
                        ? onNavigateToJobDetails(job)
                        : navigation.navigateToJobDetails({ job });
                    }}
                  >
                    <TableCell>
                      <div className=&apos;flex items-center gap-2&apos;>
                        <span className=&apos;font-mono text-sm&apos;>
                          {job.jobNumber}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{job.name}</div>
                        {job.siteName && (
                          <div className=&apos;text-xs text-muted-foreground&apos;>
                            {job.siteName}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={job.status} type=&apos;job&apos; />
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={job.priority} />
                    </TableCell>
                    <TableCell>
                      <div className=&apos;text-sm&apos;>
                        <div>
                          {new Date(job.startDate).toLocaleDateString()}
                        </div>
                        <div className=&apos;text-xs text-muted-foreground&apos;>
                          to {new Date(job.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(job.budget.total)}</TableCell>
                    <TableCell>
                      {formatCurrency(job.actualCosts.total)}
                    </TableCell>
                    <TableCell>
                      <div className=&apos;flex items-center gap-2&apos;>
                        {job.variancePercentage >= 0 ? (
                          <TrendingUp className=&apos;h-4 w-4 text-green-600&apos; />
                        ) : (
                          <TrendingDown className=&apos;h-4 w-4 text-red-600&apos; />
                        )}
                        <span
                          className={
                            job.variancePercentage >= 0
                              ? &apos;text-green-600&apos;
                              : &apos;text-red-600&apos;
                          }
                        >
                          {formatCurrency(Math.abs(job.variance))}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className=&apos;flex items-center gap-2&apos;>
                        <Package className=&apos;h-4 w-4 text-muted-foreground&apos; />
                        <span>{job.assets.length}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {job.hasActiveAlerts && (
                        <Badge
                          variant=&apos;outline&apos;
                          className=&apos;bg-red-100 text-red-700 border-red-200&apos;
                        >
                          <AlertTriangle className=&apos;h-3 w-3 mr-1&apos; />
                          {job.missingAssets?.length || 0}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={e => e.stopPropagation()}
                        >
                          <Button variant=&apos;ghost&apos; size=&apos;sm&apos;>
                            <MoreVertical className=&apos;h-4 w-4&apos; />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align=&apos;end&apos;>
                          <DropdownMenuItem
                            onClick={e => {
                              e.stopPropagation();
                              onNavigateToJobDetails
                                ? onNavigateToJobDetails(job)
                                : navigation.navigateToJobDetails({ job });
                            }}
                          >
                            <Edit className=&apos;h-4 w-4 mr-2&apos; />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteJob(job.id);
                            }}
                            className=&apos;text-red-600&apos;
                          >
                            <Trash2 className=&apos;h-4 w-4 mr-2&apos; />
                            Delete Job
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
