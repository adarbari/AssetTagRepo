/**
 * Issue Tracking Component
 *
 * View and manage all reported asset issues
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { SeverityBadge, StatusBadge } from '../common';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
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
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { PageHeader, EmptyState, StatsCard, PageLayout } from '../common';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigation } from '../../contexts/NavigationContext';
import type { Issue, IssueStatus, UpdateIssueInput } from '../../types/issue';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');

  // Filter issues
  const filteredIssues = issues.filter(issue => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === 'all' || issue.status === selectedStatus;
    const matchesSeverity =
      selectedSeverity === 'all' || issue.severity === selectedSeverity;

    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'open' &&
        (issue.status === 'open' ||
          issue.status === 'acknowledged' ||
          issue.status === 'in-progress')) ||
      (activeTab === 'resolved' &&
        (issue.status === 'resolved' || issue.status === 'closed'));

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
      toast.success('Issue status updated');
    } else {
      toast.error('Failed to update issue status');
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
      i.status === 'open' ||
      i.status === 'acknowledged' ||
      i.status === 'in-progress'
  ).length;

  const criticalIssuesCount = issues.filter(
    i =>
      i.severity === 'critical' &&
      (i.status === 'open' ||
        i.status === 'acknowledged' ||
        i.status === 'in-progress')
  ).length;

  const inProgressCount = issues.filter(i => i.status === 'in-progress').length;

  const resolvedThisWeek = issues.filter(
    i =>
      i.status === 'resolved' &&
      new Date(i.resolvedDate || '').getTime() >
        Date.now() - 7 * 24 * 60 * 60 * 1000
  ).length;

  return (
    <PageLayout
      variant='wide'
      padding='lg'
      header={
        <div className='border-b bg-background px-8 py-6'>
          <PageHeader
            title='Issue Tracking'
            description='View and manage all reported asset issues'
            icon={AlertTriangle}
          />
        </div>
      }
    >
      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <StatsCard
          title='Open Issues'
          value={openIssuesCount.toString()}
          icon={AlertCircle}
          trend={{
            value: Math.abs(openIssuesCount - 5),
            direction: openIssuesCount > 5 ? 'up' : 'down',
            label: `${openIssuesCount > 5 ? '↑' : '↓'} ${Math.abs(openIssuesCount - 5)}`,
          }}
        />
        <StatsCard
          title='Critical'
          value={criticalIssuesCount.toString()}
          icon={AlertTriangle}
          variant='danger'
        />
        <StatsCard
          title='In Progress'
          value={inProgressCount.toString()}
          icon={Wrench}
          variant='info'
        />
        <StatsCard
          title='Resolved (7d)'
          value={resolvedThisWeek.toString()}
          icon={CheckCircle2}
          variant='success'
        />
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
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
            className='space-y-4'
          >
            <div className='flex items-center justify-between'>
              <TabsList>
                <TabsTrigger value='all'>All Issues</TabsTrigger>
                <TabsTrigger value='open'>Active</TabsTrigger>
                <TabsTrigger value='resolved'>Resolved</TabsTrigger>
              </TabsList>

              <div className='flex items-center gap-2'>
                <div className='relative flex-1 max-w-sm'>
                  <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Search issues...'
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className='pl-8'
                  />
                </div>

                <Select
                  value={selectedSeverity}
                  onValueChange={setSelectedSeverity}
                >
                  <SelectTrigger className='w-[150px]'>
                    <SelectValue placeholder='Severity' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Severities</SelectItem>
                    <SelectItem value='critical'>Critical</SelectItem>
                    <SelectItem value='high'>High</SelectItem>
                    <SelectItem value='medium'>Medium</SelectItem>
                    <SelectItem value='low'>Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className='w-[150px]'>
                    <SelectValue placeholder='Status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Statuses</SelectItem>
                    <SelectItem value='open'>Open</SelectItem>
                    <SelectItem value='acknowledged'>Acknowledged</SelectItem>
                    <SelectItem value='in-progress'>In Progress</SelectItem>
                    <SelectItem value='resolved'>Resolved</SelectItem>
                    <SelectItem value='closed'>Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value={activeTab} className='space-y-6'>
              {filteredIssues.length === 0 ? (
                <EmptyState
                  icon={AlertTriangle}
                  title='No issues found'
                  description='No issues match your current filters'
                />
              ) : (
                <div className='border rounded-lg'>
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
                        <TableHead className='w-[50px]'></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredIssues.map(issue => (
                        <TableRow
                          key={issue.id}
                          className='cursor-pointer hover:bg-muted/50'
                          onClick={() => handleRowClick(issue)}
                        >
                          <TableCell className='font-mono text-sm'>
                            {issue.id}
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <Package className='h-4 w-4 text-muted-foreground' />
                              <div>
                                <div>{issue.assetName}</div>
                                <div className='text-xs text-muted-foreground'>
                                  {issue.assetId}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='max-w-xs'>
                              <div className='truncate'>{issue.title}</div>
                              <div className='text-xs text-muted-foreground truncate'>
                                {issue.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant='outline' className='capitalize'>
                              {issue.type.replace('-', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <SeverityBadge severity={issue.severity} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={issue.status} />
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-1 text-sm'>
                              <Clock className='h-3 w-3 text-muted-foreground' />
                              {new Date(
                                issue.reportedDate
                              ).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            {issue.assignedTo ? (
                              <div className='flex items-center gap-1 text-sm'>
                                <User className='h-3 w-3 text-muted-foreground' />
                                {issue.assignedTo}
                              </div>
                            ) : (
                              <span className='text-xs text-muted-foreground'>
                                Unassigned
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant='ghost' size='sm'>
                                  <MoreVertical className='h-4 w-4' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                <DropdownMenuItem
                                  onClick={() => handleViewDetails(issue)}
                                >
                                  <Eye className='h-4 w-4 mr-2' />
                                  View Details
                                </DropdownMenuItem>
                                {issue.status === 'open' && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateStatus(
                                        issue.id,
                                        'acknowledged'
                                      )
                                    }
                                  >
                                    <CheckCircle2 className='h-4 w-4 mr-2' />
                                    Acknowledge
                                  </DropdownMenuItem>
                                )}
                                {(issue.status === 'open' ||
                                  issue.status === 'acknowledged') && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateStatus(
                                        issue.id,
                                        'in-progress'
                                      )
                                    }
                                  >
                                    <Wrench className='h-4 w-4 mr-2' />
                                    Start Work
                                  </DropdownMenuItem>
                                )}
                                {issue.status === 'in-progress' && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateStatus(issue.id, 'resolved')
                                    }
                                  >
                                    <CheckCircle2 className='h-4 w-4 mr-2' />
                                    Mark Resolved
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleEditIssue(issue)}
                                >
                                  <Edit className='h-4 w-4 mr-2' />
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
