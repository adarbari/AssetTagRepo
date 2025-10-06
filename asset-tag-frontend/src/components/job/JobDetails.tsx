/**
 * Job Details Component
 *
 * Full-page view for viewing and managing job details including:
 * - Job overview and timeline
 * - Assigned assets and vehicles
 * - Budget tracking and cost analysis
 * - Team members
 * - Active alerts
 */

import { useState } from &apos;react&apos;;
import { Card, CardContent, CardHeader, CardTitle } from &apos;../ui/card&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import { Separator } from &apos;../ui/separator&apos;;
import { Progress } from &apos;../ui/progress&apos;;
import { PageHeader, PageLayout, StatusBadge, PriorityBadge } from &apos;../common&apos;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &apos;../ui/tabs&apos;;
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from &apos;../ui/table&apos;;
import {
  Edit,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Package,
  Truck,
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
} from &apos;lucide-react&apos;;
import type { Job } from &apos;../../types/job&apos;;

interface JobDetailsProps {
  job: Job;
  onBack: () => void;
  onEdit: (job: Job) => void;
}

export function JobDetails({ job, onBack, onEdit }: JobDetailsProps) {
  const [activeTab, setActiveTab] = useState(&apos;overview&apos;);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(&apos;en-US&apos;, {
      style: &apos;currency&apos;,
      currency: &apos;USD&apos;,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(&apos;en-US&apos;, {
      month: &apos;short&apos;,
      day: &apos;numeric&apos;,
      year: &apos;numeric&apos;,
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString(&apos;en-US&apos;, {
      month: &apos;short&apos;,
      day: &apos;numeric&apos;,
      year: &apos;numeric&apos;,
      hour: &apos;2-digit&apos;,
      minute: &apos;2-digit&apos;,
    });
  };

  return (
    <PageLayout
      variant=&apos;standard&apos;
      padding=&apos;md&apos;
      header={
        <PageHeader
          title={job.name}
          subtitle={job.jobNumber}
          onBack={onBack}
          actions={
            <Button onClick={() => onEdit(job)}>
              <Edit className=&apos;h-4 w-4 mr-2&apos; />
              Edit Job
            </Button>
          }
        />
      }
    >
      {/* Status and Priority Badges */}
      <div className=&apos;flex items-center gap-3&apos;>
        <StatusBadge status={job.status} />
        <PriorityBadge priority={job.priority} />
        {job.hasActiveAlerts && (
          <Badge
            variant=&apos;outline&apos;
            className=&apos;bg-red-100 text-red-700 border-red-200&apos;
          >
            <AlertTriangle className=&apos;h-3 w-3 mr-1&apos; />
            Active Alerts
          </Badge>
        )}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value=&apos;overview&apos;>Overview</TabsTrigger>
          <TabsTrigger value=&apos;assets&apos;>Assets ({job.assets.length})</TabsTrigger>
          <TabsTrigger value=&apos;costs&apos;>Costs & Budget</TabsTrigger>
          <TabsTrigger value=&apos;timeline&apos;>Timeline</TabsTrigger>
          <TabsTrigger value=&apos;team&apos;>Team</TabsTrigger>
          {job.hasActiveAlerts && (
            <TabsTrigger value=&apos;alerts&apos;>
              Alerts
              <Badge
                variant=&apos;outline&apos;
                className=&apos;ml-2 bg-red-100 text-red-700 border-red-200&apos;
              >
                {job.missingAssets?.length || 0}
              </Badge>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value=&apos;overview&apos; className=&apos;space-y-6&apos;>
          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
            </CardHeader>
            <CardContent className=&apos;space-y-3&apos;>
              <div>
                <span className=&apos;text-sm text-muted-foreground&apos;>
                  Description:
                </span>
                <p>{job.description || &apos;No description provided&apos;}</p>
              </div>
              <Separator />
              <div className=&apos;grid grid-cols-2 gap-4&apos;>
                <div>
                  <span className=&apos;text-sm text-muted-foreground&apos;>
                    Start Date:
                  </span>
                  <p>{formatDate(job.startDate)}</p>
                </div>
                <div>
                  <span className=&apos;text-sm text-muted-foreground&apos;>
                    End Date:
                  </span>
                  <p>{formatDate(job.endDate)}</p>
                </div>
                <div>
                  <span className=&apos;text-sm text-muted-foreground&apos;>
                    Priority:
                  </span>
                  <p className=&apos;capitalize&apos;>{job.priority}</p>
                </div>
                <div>
                  <span className=&apos;text-sm text-muted-foreground&apos;>
                    Project Manager:
                  </span>
                  <p>{job.projectManager || &apos;Not assigned&apos;}</p>
                </div>
                {job.siteName && (
                  <div>
                    <span className=&apos;text-sm text-muted-foreground&apos;>Site:</span>
                    <p>{job.siteName}</p>
                  </div>
                )}
                {job.clientName && (
                  <div>
                    <span className=&apos;text-sm text-muted-foreground&apos;>
                      Client:
                    </span>
                    <p>{job.clientName}</p>
                  </div>
                )}
              </div>
              {job.notes && (
                <>
                  <Separator />
                  <div>
                    <span className=&apos;text-sm text-muted-foreground&apos;>
                      Notes:
                    </span>
                    <p className=&apos;mt-1&apos;>{job.notes}</p>
                  </div>
                </>
              )}
              {job.tags && job.tags.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <span className=&apos;text-sm text-muted-foreground&apos;>Tags:</span>
                    <div className=&apos;flex flex-wrap gap-2 mt-2&apos;>
                      {job.tags.map(tag => (
                        <Badge key={tag} variant=&apos;outline&apos;>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {job.vehicle && (
            <Card>
              <CardHeader>
                <CardTitle className=&apos;flex items-center gap-2&apos;>
                  <Truck className=&apos;h-5 w-5&apos; />
                  Assigned Vehicle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className=&apos;space-y-2&apos;>
                  <div className=&apos;flex items-center justify-between&apos;>
                    <span className=&apos;text-sm text-muted-foreground&apos;>
                      Vehicle:
                    </span>
                    <span>{job.vehicle.vehicleName}</span>
                  </div>
                  <div className=&apos;flex items-center justify-between&apos;>
                    <span className=&apos;text-sm text-muted-foreground&apos;>
                      Driver:
                    </span>
                    <span>{job.vehicle.driverName || &apos;Not assigned&apos;}</span>
                  </div>
                  <div className=&apos;flex items-center justify-between&apos;>
                    <span className=&apos;text-sm text-muted-foreground&apos;>
                      Status:
                    </span>
                    <Badge
                      variant=&apos;outline&apos;
                      className={
                        job.vehicle.isAtGroundStation
                          ? &apos;bg-green-100 text-green-700 border-green-200&apos;
                          : &apos;bg-blue-100 text-blue-700 border-blue-200&apos;
                      }
                    >
                      {job.vehicle.isAtGroundStation
                        ? &apos;At Ground Station&apos;
                        : &apos;On Route&apos;}
                    </Badge>
                  </div>
                  {job.vehicle.departureTime && (
                    <div className=&apos;flex items-center justify-between&apos;>
                      <span className=&apos;text-sm text-muted-foreground&apos;>
                        Departed:
                      </span>
                      <span>{formatDateTime(job.vehicle.departureTime)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {job.groundStationName && (
            <Card>
              <CardHeader>
                <CardTitle className=&apos;flex items-center gap-2&apos;>
                  <MapPin className=&apos;h-5 w-5&apos; />
                  Ground Station
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className=&apos;space-y-2&apos;>
                  <div>
                    <span className=&apos;text-sm text-muted-foreground&apos;>Name:</span>
                    <p>{job.groundStationName}</p>
                  </div>
                  {job.groundStationLocation?.address && (
                    <div>
                      <span className=&apos;text-sm text-muted-foreground&apos;>
                        Address:
                      </span>
                      <p>{job.groundStationLocation.address}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Assets Tab */}
        <TabsContent value=&apos;assets&apos; className=&apos;space-y-6&apos;>
          <Card>
            <CardHeader>
              <CardTitle className=&apos;flex items-center gap-2&apos;>
                <Package className=&apos;h-5 w-5&apos; />
                Assigned Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              {job.assets.length === 0 ? (
                <p className=&apos;text-center text-muted-foreground py-8&apos;>
                  No assets assigned to this job
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Required</TableHead>
                      <TableHead>Assignment Period</TableHead>
                      <TableHead className=&apos;text-right&apos;>Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {job.assets.map(asset => (
                      <TableRow key={asset.assetId}>
                        <TableCell>{asset.assetName}</TableCell>
                        <TableCell className=&apos;capitalize&apos;>
                          {asset.assetType.replace(/-/g, &apos; &apos;)}
                        </TableCell>
                        <TableCell>
                          {asset.loadedOnVehicle ? (
                            <Badge
                              variant=&apos;outline&apos;
                              className=&apos;bg-green-100 text-green-700 border-green-200&apos;
                            >
                              <CheckCircle2 className=&apos;h-3 w-3 mr-1&apos; />
                              Loaded
                            </Badge>
                          ) : (
                            <Badge variant=&apos;outline&apos;>Not Loaded</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {asset.required ? (
                            <Badge
                              variant=&apos;outline&apos;
                              className=&apos;bg-red-100 text-red-700 border-red-200&apos;
                            >
                              Required
                            </Badge>
                          ) : (
                            <Badge variant=&apos;outline&apos;>Optional</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {asset.assignmentStartDate &&
                          asset.assignmentEndDate ? (
                            <div className=&apos;flex items-center gap-1 text-sm&apos;>
                              <Clock className=&apos;h-3 w-3 text-muted-foreground&apos; />
                              <span>
                                {formatDate(asset.assignmentStartDate)} -{&apos; &apos;}
                                {formatDate(asset.assignmentEndDate)}
                              </span>
                              {asset.useFullJobDuration && (
                                <Badge variant=&apos;outline&apos; className=&apos;ml-2&apos;>
                                  Full job duration
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className=&apos;text-sm text-muted-foreground&apos;>
                              Not set
                            </span>
                          )}
                        </TableCell>
                        <TableCell className=&apos;text-right&apos;>
                          {asset.cost ? formatCurrency(asset.cost) : &apos;-&apos;}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Costs & Budget Tab */}
        <TabsContent value=&apos;costs&apos; className=&apos;space-y-6&apos;>
          <div className=&apos;grid grid-cols-2 gap-4&apos;>
            <Card>
              <CardHeader>
                <CardTitle>Budget</CardTitle>
              </CardHeader>
              <CardContent className=&apos;space-y-2&apos;>
                <div className=&apos;flex justify-between&apos;>
                  <span className=&apos;text-sm text-muted-foreground&apos;>Labor:</span>
                  <span>{formatCurrency(job.budget.labor)}</span>
                </div>
                <div className=&apos;flex justify-between&apos;>
                  <span className=&apos;text-sm text-muted-foreground&apos;>
                    Equipment:
                  </span>
                  <span>{formatCurrency(job.budget.equipment)}</span>
                </div>
                <div className=&apos;flex justify-between&apos;>
                  <span className=&apos;text-sm text-muted-foreground&apos;>
                    Materials:
                  </span>
                  <span>{formatCurrency(job.budget.materials)}</span>
                </div>
                <div className=&apos;flex justify-between&apos;>
                  <span className=&apos;text-sm text-muted-foreground&apos;>Other:</span>
                  <span>{formatCurrency(job.budget.other)}</span>
                </div>
                <Separator />
                <div className=&apos;flex justify-between&apos;>
                  <span>Total Budget:</span>
                  <span>{formatCurrency(job.budget.total)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actual Costs</CardTitle>
              </CardHeader>
              <CardContent className=&apos;space-y-2&apos;>
                <div className=&apos;flex justify-between&apos;>
                  <span className=&apos;text-sm text-muted-foreground&apos;>Labor:</span>
                  <span>{formatCurrency(job.actualCosts.labor)}</span>
                </div>
                <div className=&apos;flex justify-between&apos;>
                  <span className=&apos;text-sm text-muted-foreground&apos;>
                    Equipment:
                  </span>
                  <span>{formatCurrency(job.actualCosts.equipment)}</span>
                </div>
                <div className=&apos;flex justify-between&apos;>
                  <span className=&apos;text-sm text-muted-foreground&apos;>
                    Materials:
                  </span>
                  <span>{formatCurrency(job.actualCosts.materials)}</span>
                </div>
                <div className=&apos;flex justify-between&apos;>
                  <span className=&apos;text-sm text-muted-foreground&apos;>Other:</span>
                  <span>{formatCurrency(job.actualCosts.other)}</span>
                </div>
                <Separator />
                <div className=&apos;flex justify-between&apos;>
                  <span>Total Actual:</span>
                  <span>{formatCurrency(job.actualCosts.total)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Budget vs Actual</CardTitle>
            </CardHeader>
            <CardContent className=&apos;space-y-4&apos;>
              <div>
                <div className=&apos;flex items-center justify-between mb-2&apos;>
                  <span className=&apos;text-sm&apos;>Budget Utilization</span>
                  <span className=&apos;text-sm&apos;>
                    {((job.actualCosts.total / job.budget.total) * 100).toFixed(
                      1
                    )}
                    %
                  </span>
                </div>
                <Progress
                  value={(job.actualCosts.total / job.budget.total) * 100}
                  className=&apos;h-2&apos;
                />
              </div>

              <Separator />

              <div className=&apos;flex items-center justify-between p-4 rounded-lg bg-muted&apos;>
                <div>
                  <div className=&apos;text-sm text-muted-foreground&apos;>Variance</div>
                  <div className=&apos;flex items-center gap-2 mt-1&apos;>
                    {job.variancePercentage >= 0 ? (
                      <TrendingUp className=&apos;h-5 w-5 text-green-600&apos; />
                    ) : (
                      <TrendingDown className=&apos;h-5 w-5 text-red-600&apos; />
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
                </div>
                <div className=&apos;text-right&apos;>
                  <div className=&apos;text-sm text-muted-foreground&apos;>
                    Percentage
                  </div>
                  <div
                    className={
                      job.variancePercentage >= 0
                        ? &apos;text-green-600&apos;
                        : &apos;text-red-600&apos;
                    }
                  >
                    {job.variancePercentage.toFixed(1)}%
                  </div>
                </div>
              </div>

              {job.variancePercentage < -10 && (
                <div className=&apos;flex items-start gap-3 p-3 border border-red-200 bg-red-50 rounded-md&apos;>
                  <AlertTriangle className=&apos;h-5 w-5 text-red-600 mt-0.5&apos; />
                  <div>
                    <div className=&apos;text-sm text-red-900&apos;>Budget Exceeded</div>
                    <div className=&apos;text-sm text-red-700 mt-1&apos;>
                      This job is over budget by{&apos; &apos;}
                      {Math.abs(job.variancePercentage).toFixed(1)}
                      %. Review costs and take corrective action.
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value=&apos;timeline&apos; className=&apos;space-y-6&apos;>
          <Card>
            <CardHeader>
              <CardTitle className=&apos;flex items-center gap-2&apos;>
                <CalendarIcon className=&apos;h-5 w-5&apos; />
                Project Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className=&apos;space-y-4&apos;>
              <div className=&apos;grid grid-cols-2 gap-4&apos;>
                <div>
                  <span className=&apos;text-sm text-muted-foreground&apos;>
                    Start Date:
                  </span>
                  <p>{formatDate(job.startDate)}</p>
                </div>
                <div>
                  <span className=&apos;text-sm text-muted-foreground&apos;>
                    End Date:
                  </span>
                  <p>{formatDate(job.endDate)}</p>
                </div>
                <div>
                  <span className=&apos;text-sm text-muted-foreground&apos;>
                    Estimated Duration:
                  </span>
                  <p>{job.estimatedDuration} hours</p>
                </div>
                {job.actualDuration && (
                  <div>
                    <span className=&apos;text-sm text-muted-foreground&apos;>
                      Actual Duration:
                    </span>
                    <p>{job.actualDuration} hours</p>
                  </div>
                )}
              </div>

              {job.completedAt && (
                <>
                  <Separator />
                  <div>
                    <span className=&apos;text-sm text-muted-foreground&apos;>
                      Completed At:
                    </span>
                    <p>{formatDateTime(job.completedAt)}</p>
                  </div>
                </>
              )}

              <Separator />

              <div className=&apos;space-y-2&apos;>
                <div className=&apos;flex items-center justify-between&apos;>
                  <span className=&apos;text-sm text-muted-foreground&apos;>
                    Created:
                  </span>
                  <span className=&apos;text-sm&apos;>
                    {formatDateTime(job.createdAt)}
                  </span>
                </div>
                <div className=&apos;flex items-center justify-between&apos;>
                  <span className=&apos;text-sm text-muted-foreground&apos;>
                    Last Updated:
                  </span>
                  <span className=&apos;text-sm&apos;>
                    {formatDateTime(job.updatedAt)}
                  </span>
                </div>
                <div className=&apos;flex items-center justify-between&apos;>
                  <span className=&apos;text-sm text-muted-foreground&apos;>
                    Created By:
                  </span>
                  <span className=&apos;text-sm&apos;>{job.createdBy}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value=&apos;team&apos; className=&apos;space-y-6&apos;>
          <Card>
            <CardHeader>
              <CardTitle className=&apos;flex items-center gap-2&apos;>
                <Users className=&apos;h-5 w-5&apos; />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className=&apos;space-y-3&apos;>
                <div>
                  <span className=&apos;text-sm text-muted-foreground&apos;>
                    Project Manager:
                  </span>
                  <p className=&apos;mt-1&apos;>{job.projectManager || &apos;Not assigned&apos;}</p>
                </div>

                {job.assignedTeam && job.assignedTeam.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <span className=&apos;text-sm text-muted-foreground&apos;>
                        Assigned Team:
                      </span>
                      <div className=&apos;flex flex-wrap gap-2 mt-2&apos;>
                        {job.assignedTeam.map(member => (
                          <Badge key={member} variant=&apos;outline&apos;>
                            {member}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        {job.hasActiveAlerts && (
          <TabsContent value=&apos;alerts&apos; className=&apos;space-y-6&apos;>
            <Card>
              <CardHeader>
                <CardTitle className=&apos;flex items-center gap-2&apos;>
                  <AlertTriangle className=&apos;h-5 w-5 text-red-600&apos; />
                  Active Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {job.missingAssets && job.missingAssets.length > 0 && (
                  <div className=&apos;flex items-start gap-3 p-4 border border-red-200 bg-red-50 rounded-md&apos;>
                    <AlertTriangle className=&apos;h-5 w-5 text-red-600 mt-0.5&apos; />
                    <div className=&apos;flex-1&apos;>
                      <div className=&apos;text-sm text-red-900&apos;>
                        Missing Required Assets
                      </div>
                      <div className=&apos;text-sm text-red-700 mt-2&apos;>
                        The following required assets are not loaded on the
                        vehicle:
                      </div>
                      <ul className=&apos;list-disc list-inside text-sm text-red-700 mt-2&apos;>
                        {job.missingAssets.map(assetId => {
                          const asset = job.assets.find(
                            a => a.assetId === assetId
                          );
                          return (
                            <li key={assetId}>{asset?.assetName || assetId}</li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </PageLayout>
  );
}
