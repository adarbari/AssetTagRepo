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

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  StatusBadge,
  PriorityBadge,
  StatsCard,
  PageLayout,
  FilterBar,
  type FilterConfig,
} from '../common';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
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
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  Job,
  CreateJobInput,
  UpdateJobInput,
  JobAlert,
} from '../../types/job';
import { useNavigation } from '../../contexts/NavigationContext';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const jobsList = Object.values(jobs);

  // Filter configuration for FilterBar
  const filters: FilterConfig[] = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'planning', label: 'Planning' },
        { value: 'active', label: 'Active' },
        { value: 'completed', label: 'Completed' },
        { value: 'on-hold', label: 'On Hold' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
      currentValue: statusFilter,
      onValueChange: setStatusFilter,
    },
    {
      key: 'priority',
      label: 'Priority',
      options: [
        { value: 'all', label: 'All Priorities' },
        { value: 'critical', label: 'Critical' },
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' },
      ],
      currentValue: priorityFilter,
      onValueChange: setPriorityFilter,
    },
  ];

  // Calculate active filters count
  const activeFiltersCount =
    (statusFilter !== 'all' ? 1 : 0) + (priorityFilter !== 'all' ? 1 : 0);

  // Clear all filters
  const handleClearAllFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
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

    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesPriority =
      priorityFilter === 'all' || job.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Statistics
  const stats = {
    total: jobsList.length,
    active: jobsList.filter(j => j.status === 'active').length,
    planning: jobsList.filter(j => j.status === 'planning').length,
    completed: jobsList.filter(j => j.status === 'completed').length,
    totalBudget: jobsList.reduce((sum, j) => sum + j.budget.total, 0),
    totalActualCosts: jobsList.reduce((sum, j) => sum + j.actualCosts.total, 0),
    activeAlerts: jobAlerts.filter(a => a.active).length,
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) {
      return;
    }

    const result = await onDeleteJob(jobId);

    if (result.success) {
      toast.success('Job deleted successfully');
    } else {
      toast.error('Failed to delete job');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <PageLayout variant='wide' padding='md'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='flex items-center gap-2'>
            <Package className='h-6 w-6' />
            Job Management
          </h1>
          <p className='text-muted-foreground'>
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
          <Plus className='h-4 w-4 mr-2' />
          Create Job
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <StatsCard
          title='Total Jobs'
          value={stats.total}
          icon={FileText}
          description={`${stats.active} active, ${stats.planning} planning`}
        />

        <StatsCard
          title='Total Budget'
          value={formatCurrency(stats.totalBudget)}
          icon={DollarSign}
          description='Across all jobs'
        />

        <StatsCard
          title='Actual Costs'
          value={formatCurrency(stats.totalActualCosts)}
          icon={TrendingUp}
          description={
            stats.totalBudget > 0
              ? `${((stats.totalActualCosts / stats.totalBudget) * 100).toFixed(1)}% of budget`
              : 'No budget allocated'
          }
        />

        <StatsCard
          title='Active Alerts'
          value={stats.activeAlerts}
          icon={AlertTriangle}
          description='Requires attention'
          variant={stats.activeAlerts > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* Filters */}
      <FilterBar
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder='Search jobs, sites, or project managers...'
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
                    className='text-center text-muted-foreground py-8'
                  >
                    {searchQuery || statusFilter !== 'all'
                      ? 'No jobs match your filters'
                      : 'No jobs yet. Create your first job to get started.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredJobs.map(job => (
                  <TableRow
                    key={job.id}
                    className='cursor-pointer hover:bg-muted/50'
                    onClick={() => {
                      onNavigateToJobDetails
                        ? onNavigateToJobDetails(job)
                        : navigation.navigateToJobDetails({ job });
                    }}
                  >
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <span className='font-mono text-sm'>
                          {job.jobNumber}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{job.name}</div>
                        {job.siteName && (
                          <div className='text-xs text-muted-foreground'>
                            {job.siteName}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={job.status} type='job' />
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={job.priority} />
                    </TableCell>
                    <TableCell>
                      <div className='text-sm'>
                        <div>
                          {new Date(job.startDate).toLocaleDateString()}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          to {new Date(job.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(job.budget.total)}</TableCell>
                    <TableCell>
                      {formatCurrency(job.actualCosts.total)}
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        {job.variancePercentage >= 0 ? (
                          <TrendingUp className='h-4 w-4 text-green-600' />
                        ) : (
                          <TrendingDown className='h-4 w-4 text-red-600' />
                        )}
                        <span
                          className={
                            job.variancePercentage >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }
                        >
                          {formatCurrency(Math.abs(job.variance))}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <Package className='h-4 w-4 text-muted-foreground' />
                        <span>{job.assets.length}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {job.hasActiveAlerts && (
                        <Badge
                          variant='outline'
                          className='bg-red-100 text-red-700 border-red-200'
                        >
                          <AlertTriangle className='h-3 w-3 mr-1' />
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
                          <Button variant='ghost' size='sm'>
                            <MoreVertical className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem
                            onClick={e => {
                              e.stopPropagation();
                              onNavigateToJobDetails
                                ? onNavigateToJobDetails(job)
                                : navigation.navigateToJobDetails({ job });
                            }}
                          >
                            <Edit className='h-4 w-4 mr-2' />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteJob(job.id);
                            }}
                            className='text-red-600'
                          >
                            <Trash2 className='h-4 w-4 mr-2' />
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
