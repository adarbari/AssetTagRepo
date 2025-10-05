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

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Progress } from "../ui/progress";
import { PageHeader, PageLayout, StatusBadge, PriorityBadge } from "../common";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  ArrowLeft,
  Edit,
  DollarSign,
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
} from "lucide-react";
import type { Job } from "../../types/job";

interface JobDetailsProps {
  job: Job;
  onBack: () => void;
  onEdit: (job: Job) => void;
}

export function JobDetails({ job, onBack, onEdit }: JobDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  return (
    <PageLayout 
      variant="standard" 
      padding="md"
      header={
      <PageHeader
        title={job.name}
        subtitle={job.jobNumber}
        onBack={onBack}
        actions={
          <Button onClick={() => onEdit(job)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Job
          </Button>
        }
      />
      }
    >
          {/* Status and Priority Badges */}
          <div className="flex items-center gap-3">
            <StatusBadge status={job.status} />
            <PriorityBadge priority={job.priority} />
            {job.hasActiveAlerts && (
              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Active Alerts
              </Badge>
            )}
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="assets">
                Assets ({job.assets.length})
              </TabsTrigger>
              <TabsTrigger value="costs">Costs & Budget</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              {job.hasActiveAlerts && (
                <TabsTrigger value="alerts">
                  Alerts
                  <Badge variant="outline" className="ml-2 bg-red-100 text-red-700 border-red-200">
                    {job.missingAssets?.length || 0}
                  </Badge>
                </TabsTrigger>
              )}
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Job Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Description:</span>
                    <p>{job.description || "No description provided"}</p>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Start Date:</span>
                      <p>{formatDate(job.startDate)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">End Date:</span>
                      <p>{formatDate(job.endDate)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Priority:</span>
                      <p className="capitalize">{job.priority}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Project Manager:</span>
                      <p>{job.projectManager || "Not assigned"}</p>
                    </div>
                    {job.siteName && (
                      <div>
                        <span className="text-sm text-muted-foreground">Site:</span>
                        <p>{job.siteName}</p>
                      </div>
                    )}
                    {job.clientName && (
                      <div>
                        <span className="text-sm text-muted-foreground">Client:</span>
                        <p>{job.clientName}</p>
                      </div>
                    )}
                  </div>
                  {job.notes && (
                    <>
                      <Separator />
                      <div>
                        <span className="text-sm text-muted-foreground">Notes:</span>
                        <p className="mt-1">{job.notes}</p>
                      </div>
                    </>
                  )}
                  {job.tags && job.tags.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <span className="text-sm text-muted-foreground">Tags:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {job.tags.map((tag) => (
                            <Badge key={tag} variant="outline">
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
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Assigned Vehicle
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Vehicle:</span>
                        <span>{job.vehicle.vehicleName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Driver:</span>
                        <span>{job.vehicle.driverName || "Not assigned"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge
                          variant="outline"
                          className={
                            job.vehicle.isAtGroundStation
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "bg-blue-100 text-blue-700 border-blue-200"
                          }
                        >
                          {job.vehicle.isAtGroundStation ? "At Ground Station" : "On Route"}
                        </Badge>
                      </div>
                      {job.vehicle.departureTime && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Departed:</span>
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
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Ground Station
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-muted-foreground">Name:</span>
                        <p>{job.groundStationName}</p>
                      </div>
                      {job.groundStationLocation?.address && (
                        <div>
                          <span className="text-sm text-muted-foreground">Address:</span>
                          <p>{job.groundStationLocation.address}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Assets Tab */}
            <TabsContent value="assets" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Assigned Assets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {job.assets.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
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
                          <TableHead className="text-right">Cost</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {job.assets.map((asset) => (
                          <TableRow key={asset.assetId}>
                            <TableCell>{asset.assetName}</TableCell>
                            <TableCell className="capitalize">
                              {asset.assetType.replace(/-/g, " ")}
                            </TableCell>
                            <TableCell>
                              {asset.loadedOnVehicle ? (
                                <Badge
                                  variant="outline"
                                  className="bg-green-100 text-green-700 border-green-200"
                                >
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Loaded
                                </Badge>
                              ) : (
                                <Badge variant="outline">Not Loaded</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {asset.required ? (
                                <Badge
                                  variant="outline"
                                  className="bg-red-100 text-red-700 border-red-200"
                                >
                                  Required
                                </Badge>
                              ) : (
                                <Badge variant="outline">Optional</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {asset.assignmentStartDate && asset.assignmentEndDate ? (
                                <div className="flex items-center gap-1 text-sm">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span>
                                    {formatDate(asset.assignmentStartDate)} -{" "}
                                    {formatDate(asset.assignmentEndDate)}
                                  </span>
                                  {asset.useFullJobDuration && (
                                    <Badge variant="outline" className="ml-2">
                                      Full job duration
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">Not set</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {asset.cost ? formatCurrency(asset.cost) : "-"}
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
            <TabsContent value="costs" className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Budget</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Labor:</span>
                      <span>{formatCurrency(job.budget.labor)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Equipment:</span>
                      <span>{formatCurrency(job.budget.equipment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Materials:</span>
                      <span>{formatCurrency(job.budget.materials)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Other:</span>
                      <span>{formatCurrency(job.budget.other)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span>Total Budget:</span>
                      <span>{formatCurrency(job.budget.total)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Actual Costs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Labor:</span>
                      <span>{formatCurrency(job.actualCosts.labor)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Equipment:</span>
                      <span>{formatCurrency(job.actualCosts.equipment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Materials:</span>
                      <span>{formatCurrency(job.actualCosts.materials)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Other:</span>
                      <span>{formatCurrency(job.actualCosts.other)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
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
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Budget Utilization</span>
                      <span className="text-sm">
                        {((job.actualCosts.total / job.budget.total) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={(job.actualCosts.total / job.budget.total) * 100}
                      className="h-2"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                    <div>
                      <div className="text-sm text-muted-foreground">Variance</div>
                      <div className="flex items-center gap-2 mt-1">
                        {job.variancePercentage >= 0 ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        )}
                        <span
                          className={
                            job.variancePercentage >= 0 ? "text-green-600" : "text-red-600"
                          }
                        >
                          {formatCurrency(Math.abs(job.variance))}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Percentage</div>
                      <div
                        className={
                          job.variancePercentage >= 0 ? "text-green-600" : "text-red-600"
                        }
                      >
                        {job.variancePercentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {job.variancePercentage < -10 && (
                    <div className="flex items-start gap-3 p-3 border border-red-200 bg-red-50 rounded-md">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <div className="text-sm text-red-900">Budget Exceeded</div>
                        <div className="text-sm text-red-700 mt-1">
                          This job is over budget by {Math.abs(job.variancePercentage).toFixed(1)}
                          %. Review costs and take corrective action.
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Project Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Start Date:</span>
                      <p>{formatDate(job.startDate)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">End Date:</span>
                      <p>{formatDate(job.endDate)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Estimated Duration:</span>
                      <p>{job.estimatedDuration} hours</p>
                    </div>
                    {job.actualDuration && (
                      <div>
                        <span className="text-sm text-muted-foreground">Actual Duration:</span>
                        <p>{job.actualDuration} hours</p>
                      </div>
                    )}
                  </div>

                  {job.completedAt && (
                    <>
                      <Separator />
                      <div>
                        <span className="text-sm text-muted-foreground">Completed At:</span>
                        <p>{formatDateTime(job.completedAt)}</p>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Created:</span>
                      <span className="text-sm">{formatDateTime(job.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Last Updated:</span>
                      <span className="text-sm">{formatDateTime(job.updatedAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Created By:</span>
                      <span className="text-sm">{job.createdBy}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Team Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Project Manager:</span>
                      <p className="mt-1">{job.projectManager || "Not assigned"}</p>
                    </div>

                    {job.assignedTeam && job.assignedTeam.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <span className="text-sm text-muted-foreground">Assigned Team:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {job.assignedTeam.map((member) => (
                              <Badge key={member} variant="outline">
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
              <TabsContent value="alerts" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      Active Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {job.missingAssets && job.missingAssets.length > 0 && (
                      <div className="flex items-start gap-3 p-4 border border-red-200 bg-red-50 rounded-md">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-sm text-red-900">Missing Required Assets</div>
                          <div className="text-sm text-red-700 mt-2">
                            The following required assets are not loaded on the vehicle:
                          </div>
                          <ul className="list-disc list-inside text-sm text-red-700 mt-2">
                            {job.missingAssets.map((assetId) => {
                              const asset = job.assets.find((a) => a.assetId === assetId);
                              return <li key={assetId}>{asset?.assetName || assetId}</li>;
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
