import React from &apos;react&apos;;
import { useState } from &apos;react&apos;;
import { Card, CardContent, CardHeader, CardTitle } from &apos;../ui/card&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &apos;../ui/select&apos;;
import { GenerateReportDialog } from &apos;./GenerateReportDialog&apos;;
import {
  LoadingState,
  EmptyState,
  StatsCard,
  PageHeader,
  PageLayout,
} from &apos;../common&apos;;
import { useAsyncDataAll } from &apos;../../hooks/useAsyncData&apos;;
import {
  getUtilizationData,
  getCostSavingsData,
  getTopAssets,
  getReportTemplates,
  calculateTotalROI,
} from &apos;../../data/mockReportsData&apos;;
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from &apos;recharts&apos;;
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Clock,
  Activity,
} from &apos;lucide-react&apos;;

export function Reports() {
  const [timeRange, setTimeRange] = useState(&apos;6&apos;);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState(&apos;&apos;);

  const months = parseInt(timeRange);

  // Fetch all report data
  const { data, loading, error } = useAsyncDataAll(
    {
      utilization: () => getUtilizationData(months),
      costSavings: () => getCostSavingsData(months),
      topAssets: () => getTopAssets(8),
      templates: () => getReportTemplates(),
    },
    { deps: [months] }
  );

  const handleGenerateReport = (reportType: string) => {
    setSelectedReportType(reportType);
    setIsReportDialogOpen(true);
  };

  const handleExportAll = () => {
// // // // // // console.log(&apos;Exporting comprehensive report for:&apos;, timeRange);
  };

  if (loading) {
    return <LoadingState message=&apos;Loading reports...&apos; fullScreen />;
  }

  if (error) {
    return (
      <div className=&apos;p-8&apos;>
        <EmptyState
          icon={FileText}
          title=&apos;Failed to load reports&apos;
          description={error.message}
          action={{
            label: &apos;Try Again&apos;,
            onClick: () => window.location.reload(),
          }}
        />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { utilization, costSavings, topAssets, templates } = data;
  const totalROI = calculateTotalROI(costSavings);
  const totalTheftPrevention = costSavings.reduce(
    (sum, m) => sum + m.theftPrevention,
    0
  );
  const totalLaborSavings = costSavings.reduce(
    (sum, m) => sum + m.laborSaved,
    0
  );
  const totalInsuranceSavings = costSavings.reduce(
    (sum, m) => sum + m.insurance,
    0
  );

  return (
    <PageLayout variant=&apos;standard&apos; padding=&apos;lg&apos;>
      <PageHeader
        title=&apos;Reports & Analytics&apos;
        description=&apos;Insights and performance metrics&apos;
        actions={
          <div className=&apos;flex items-center gap-2&apos;>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className=&apos;w-[180px]&apos;>
                <Calendar className=&apos;h-4 w-4 mr-2&apos; />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=&apos;3&apos;>Last 3 months</SelectItem>
                <SelectItem value=&apos;6&apos;>Last 6 months</SelectItem>
                <SelectItem value=&apos;9&apos;>Last 9 months</SelectItem>
                <SelectItem value=&apos;12&apos;>Last 12 months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant=&apos;outline&apos; onClick={handleExportAll}>
              <Download className=&apos;h-4 w-4 mr-2&apos; />
              Export Report
            </Button>
          </div>
        }
      />

      {/* ROI Summary */}
      <div className=&apos;grid gap-4 md:grid-cols-4&apos;>
        <StatsCard
          title=&apos;Total ROI&apos;
          value={`${(totalROI / 1000).toFixed(0)}K`}
          icon={TrendingUp}
          description={`${months} month period`}
          trend={{ value: 23, direction: &apos;up&apos; }}
        />
        <StatsCard
          title=&apos;Theft Prevention&apos;
          value={`${(totalTheftPrevention / 1000).toFixed(0)}K`}
          icon={DollarSign}
          description=&apos;Assets recovered&apos;
        />
        <StatsCard
          title=&apos;Labor Savings&apos;
          value={`${(totalLaborSavings / 1000).toFixed(1)}K`}
          icon={Clock}
          description=&apos;Reduced search time&apos;
        />
        <StatsCard
          title=&apos;Insurance Reduction&apos;
          value={`${(totalInsuranceSavings / 1000).toFixed(1)}K`}
          icon={Activity}
          description=&apos;Premium savings&apos;
        />
      </div>

      {/* Charts */}
      <div className=&apos;grid gap-4 md:grid-cols-2&apos;>
        <Card>
          <CardHeader>
            <CardTitle>Asset Utilization Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width=&apos;100%&apos; height={300}>
              <BarChart data={utilization}>
                <CartesianGrid strokeDasharray=&apos;3 3&apos; className=&apos;stroke-muted&apos; />
                <XAxis dataKey=&apos;month&apos; className=&apos;text-xs&apos; />
                <YAxis className=&apos;text-xs&apos; />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey=&apos;utilization&apos;
                  fill=&apos;hsl(var(--chart-1))&apos;
                  name=&apos;Utilized %&apos;
                />
                <Bar dataKey=&apos;idle&apos; fill=&apos;hsl(var(--chart-2))&apos; name=&apos;Idle %&apos; />
                <Bar
                  dataKey=&apos;maintenance&apos;
                  fill=&apos;hsl(var(--chart-3))&apos;
                  name=&apos;Maintenance %&apos;
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Savings Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width=&apos;100%&apos; height={300}>
              <LineChart data={costSavings}>
                <CartesianGrid strokeDasharray=&apos;3 3&apos; className=&apos;stroke-muted&apos; />
                <XAxis dataKey=&apos;month&apos; className=&apos;text-xs&apos; />
                <YAxis className=&apos;text-xs&apos; />
                <Tooltip />
                <Legend />
                <Line
                  type=&apos;monotone&apos;
                  dataKey=&apos;theftPrevention&apos;
                  stroke=&apos;hsl(var(--chart-1))&apos;
                  name=&apos;Theft Prevention&apos;
                />
                <Line
                  type=&apos;monotone&apos;
                  dataKey=&apos;laborSaved&apos;
                  stroke=&apos;hsl(var(--chart-2))&apos;
                  name=&apos;Labor Saved&apos;
                />
                <Line
                  type=&apos;monotone&apos;
                  dataKey=&apos;insurance&apos;
                  stroke=&apos;hsl(var(--chart-3))&apos;
                  name=&apos;Insurance&apos;
                />
                <Line
                  type=&apos;monotone&apos;
                  dataKey=&apos;maintenanceSavings&apos;
                  stroke=&apos;hsl(var(--chart-4))&apos;
                  name=&apos;Maintenance&apos;
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Assets */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Assets (by Utilization)</CardTitle>
        </CardHeader>
        <CardContent>
          {topAssets.length === 0 ? (
            <EmptyState
              icon={Activity}
              title=&apos;No asset data available&apos;
              description=&apos;Asset utilization data will appear here&apos;
            />
          ) : (
            <div className=&apos;space-y-4&apos;>
              {topAssets.map((asset, index) => (
                <div
                  key={asset.id}
                  className=&apos;flex items-center justify-between&apos;
                >
                  <div className=&apos;flex items-center gap-3 flex-1&apos;>
                    <Badge
                      variant=&apos;outline&apos;
                      className=&apos;w-8 h-8 rounded-full flex items-center justify-center&apos;
                    >
                      {index + 1}
                    </Badge>
                    <div className=&apos;flex-1&apos;>
                      <div className=&apos;flex items-center gap-2&apos;>
                        <span className=&apos;text-sm&apos;>{asset.name}</span>
                        <Badge variant=&apos;outline&apos; className=&apos;text-xs&apos;>
                          {asset.type}
                        </Badge>
                      </div>
                      <div className=&apos;flex items-center gap-4 mt-1&apos;>
                        <div className=&apos;flex-1 max-w-xs&apos;>
                          <div className=&apos;flex items-center gap-2&apos;>
                            <div className=&apos;flex-1 h-2 bg-muted rounded-full overflow-hidden&apos;>
                              <div
                                className=&apos;h-full bg-primary&apos;
                                style={{ width: `${asset.utilization}%` }}
                              />
                            </div>
                            <span className=&apos;text-xs text-muted-foreground w-8&apos;>
                              {asset.utilization}%
                            </span>
                          </div>
                        </div>
                        <div className=&apos;flex items-center gap-1 text-xs text-muted-foreground&apos;>
                          <Clock className=&apos;h-3 w-3&apos; />
                          {asset.hours}h
                        </div>
                        <div className=&apos;flex items-center gap-1 text-xs text-muted-foreground&apos;>
                          <DollarSign className=&apos;h-3 w-3&apos; />$
                          {(asset.revenue / 1000).toFixed(0)}K
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <EmptyState
              icon={FileText}
              title=&apos;No report templates&apos;
              description=&apos;Report templates will appear here&apos;
            />
          ) : (
            <div className=&apos;grid gap-3 md:grid-cols-2 lg:grid-cols-3&apos;>
              {templates.map(template => (
                <Button
                  key={template.id}
                  variant=&apos;outline&apos;
                  className=&apos;justify-start h-auto py-4&apos;
                  onClick={() => handleGenerateReport(template.type)}
                >
                  <div className=&apos;flex items-center gap-3 w-full&apos;>
                    <FileText className=&apos;h-5 w-5 flex-shrink-0&apos; />
                    <div className=&apos;text-left flex-1&apos;>
                      <div className=&apos;text-sm&apos;>{template.name}</div>
                      <div className=&apos;text-xs text-muted-foreground&apos;>
                        {template.description}
                      </div>
                      {template.lastGenerated && (
                        <div className=&apos;text-xs text-muted-foreground mt-1&apos;>
                          Last:{&apos; &apos;}
                          {new Date(
                            template.lastGenerated
                          ).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate Report Dialog */}
      <GenerateReportDialog
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        reportType={selectedReportType}
      />
    </PageLayout>
  );
}
