import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { GenerateReportDialog } from './GenerateReportDialog';
import {
  LoadingState,
  EmptyState,
  StatsCard,
  PageHeader,
  PageLayout,
} from '../common';
import { useAsyncDataAll } from '../../hooks/useAsyncData';
import {
  getUtilizationData,
  getCostSavingsData,
  getTopAssets,
  getReportTemplates,
  calculateTotalROI,
} from '../../data/mockReportsData';
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
} from 'recharts';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Clock,
  Activity,
} from 'lucide-react';

export function Reports() {
  const [timeRange, setTimeRange] = useState('6');
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('');

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
// console.log('Exporting comprehensive report for:', timeRange);
  };

  if (loading) {
    return <LoadingState message='Loading reports...' fullScreen />;
  }

  if (error) {
    return (
      <div className='p-8'>
        <EmptyState
          icon={FileText}
          title='Failed to load reports'
          description={error.message}
          action={{
            label: 'Try Again',
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
    <PageLayout variant='standard' padding='lg'>
      <PageHeader
        title='Reports & Analytics'
        description='Insights and performance metrics'
        actions={
          <div className='flex items-center gap-2'>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className='w-[180px]'>
                <Calendar className='h-4 w-4 mr-2' />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='3'>Last 3 months</SelectItem>
                <SelectItem value='6'>Last 6 months</SelectItem>
                <SelectItem value='9'>Last 9 months</SelectItem>
                <SelectItem value='12'>Last 12 months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant='outline' onClick={handleExportAll}>
              <Download className='h-4 w-4 mr-2' />
              Export Report
            </Button>
          </div>
        }
      />

      {/* ROI Summary */}
      <div className='grid gap-4 md:grid-cols-4'>
        <StatsCard
          title='Total ROI'
          value={`${(totalROI / 1000).toFixed(0)}K`}
          icon={TrendingUp}
          description={`${months} month period`}
          trend={{ value: 23, direction: 'up' }}
        />
        <StatsCard
          title='Theft Prevention'
          value={`${(totalTheftPrevention / 1000).toFixed(0)}K`}
          icon={DollarSign}
          description='Assets recovered'
        />
        <StatsCard
          title='Labor Savings'
          value={`${(totalLaborSavings / 1000).toFixed(1)}K`}
          icon={Clock}
          description='Reduced search time'
        />
        <StatsCard
          title='Insurance Reduction'
          value={`${(totalInsuranceSavings / 1000).toFixed(1)}K`}
          icon={Activity}
          description='Premium savings'
        />
      </div>

      {/* Charts */}
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Asset Utilization Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={utilization}>
                <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
                <XAxis dataKey='month' className='text-xs' />
                <YAxis className='text-xs' />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey='utilization'
                  fill='hsl(var(--chart-1))'
                  name='Utilized %'
                />
                <Bar dataKey='idle' fill='hsl(var(--chart-2))' name='Idle %' />
                <Bar
                  dataKey='maintenance'
                  fill='hsl(var(--chart-3))'
                  name='Maintenance %'
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
            <ResponsiveContainer width='100%' height={300}>
              <LineChart data={costSavings}>
                <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
                <XAxis dataKey='month' className='text-xs' />
                <YAxis className='text-xs' />
                <Tooltip />
                <Legend />
                <Line
                  type='monotone'
                  dataKey='theftPrevention'
                  stroke='hsl(var(--chart-1))'
                  name='Theft Prevention'
                />
                <Line
                  type='monotone'
                  dataKey='laborSaved'
                  stroke='hsl(var(--chart-2))'
                  name='Labor Saved'
                />
                <Line
                  type='monotone'
                  dataKey='insurance'
                  stroke='hsl(var(--chart-3))'
                  name='Insurance'
                />
                <Line
                  type='monotone'
                  dataKey='maintenanceSavings'
                  stroke='hsl(var(--chart-4))'
                  name='Maintenance'
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
              title='No asset data available'
              description='Asset utilization data will appear here'
            />
          ) : (
            <div className='space-y-4'>
              {topAssets.map((asset, index) => (
                <div
                  key={asset.id}
                  className='flex items-center justify-between'
                >
                  <div className='flex items-center gap-3 flex-1'>
                    <Badge
                      variant='outline'
                      className='w-8 h-8 rounded-full flex items-center justify-center'
                    >
                      {index + 1}
                    </Badge>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm'>{asset.name}</span>
                        <Badge variant='outline' className='text-xs'>
                          {asset.type}
                        </Badge>
                      </div>
                      <div className='flex items-center gap-4 mt-1'>
                        <div className='flex-1 max-w-xs'>
                          <div className='flex items-center gap-2'>
                            <div className='flex-1 h-2 bg-muted rounded-full overflow-hidden'>
                              <div
                                className='h-full bg-primary'
                                style={{ width: `${asset.utilization}%` }}
                              />
                            </div>
                            <span className='text-xs text-muted-foreground w-8'>
                              {asset.utilization}%
                            </span>
                          </div>
                        </div>
                        <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                          <Clock className='h-3 w-3' />
                          {asset.hours}h
                        </div>
                        <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                          <DollarSign className='h-3 w-3' />$
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
              title='No report templates'
              description='Report templates will appear here'
            />
          ) : (
            <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-3'>
              {templates.map(template => (
                <Button
                  key={template.id}
                  variant='outline'
                  className='justify-start h-auto py-4'
                  onClick={() => handleGenerateReport(template.type)}
                >
                  <div className='flex items-center gap-3 w-full'>
                    <FileText className='h-5 w-5 flex-shrink-0' />
                    <div className='text-left flex-1'>
                      <div className='text-sm'>{template.name}</div>
                      <div className='text-xs text-muted-foreground'>
                        {template.description}
                      </div>
                      {template.lastGenerated && (
                        <div className='text-xs text-muted-foreground mt-1'>
                          Last:{' '}
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
