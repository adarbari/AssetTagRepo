import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  LoadingState,
  EmptyState,
  StatsCard,
  PageHeader,
  StatusBadge,
  PageLayout,
} from '../common';
import { useAsyncDataAll } from '../../hooks/useAsyncData';
import {
  getComplianceRecords,
  getComplianceSummary,
  type ComplianceRecord,
} from '../../data/mockReportsData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Download,
  Upload,
  Plus,
  MoreVertical,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigation } from '../../contexts/NavigationContext';

export function ComplianceTracking() {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Fetch compliance data
  const { data, loading, error, refetch } = useAsyncDataAll(
    {
      summary: () => getComplianceSummary(),
      records: () => getComplianceRecords(activeTab as any),
    },
    { deps: [activeTab] }
  );

  const handleUploadDocument = () => {
    toast.success('Upload feature coming soon');
  };

  const handleDownloadDocument = (record: ComplianceRecord) => {
    toast.success(`Downloading certificate for ${record.assetName}`);
  };

  const handleRenewCertificate = (record: ComplianceRecord) => {
    toast.success(`Renewal process initiated for ${record.certificationType}`);
  };

  const handleAddCompliance = () => {
    navigation.navigateToCreateCompliance();
  };

  if (loading) {
    return <LoadingState message='Loading compliance data...' fullScreen />;
  }

  if (error) {
    return (
      <div className='p-8'>
        <EmptyState
          icon={AlertTriangle}
          title='Failed to load compliance data'
          description={error.message}
          action={{
            label: 'Try Again',
            onClick: () => refetch(),
          }}
        />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { summary, records } = data;

  // Filter records by search term
  const filteredRecords = records.filter(
    record =>
      record.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.certificationType
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      record.assetId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageLayout variant='wide' padding='lg'>
      <PageHeader
        title='Compliance Tracking'
        description='Manage certifications, inspections, and regulatory compliance'
        actions={
          <div className='flex items-center gap-2'>
            <Button variant='outline' onClick={handleUploadDocument}>
              <Upload className='h-4 w-4 mr-2' />
              Upload
            </Button>
            <Button onClick={handleAddCompliance}>
              <Plus className='h-4 w-4 mr-2' />
              Add Compliance
            </Button>
          </div>
        }
      />

      {/* Summary Stats */}
      <div className='grid gap-4 md:grid-cols-4'>
        <StatsCard
          title='Total Certifications'
          value={summary.total.toString()}
          icon={FileText}
          description='All compliance records'
        />
        <StatsCard
          title='Valid'
          value={summary.valid.toString()}
          icon={CheckCircle}
          description='Up to date'
          variant='success'
        />
        <StatsCard
          title='Expiring Soon'
          value={summary.expiringSoon.toString()}
          icon={Clock}
          description='Within 30 days'
          variant='warning'
        />
        <StatsCard
          title='Expired'
          value={summary.expired.toString()}
          icon={AlertTriangle}
          description='Action required'
          variant='destructive'
        />
      </div>

      {/* Compliance Records Table */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>Compliance Records</CardTitle>
            <div className='flex items-center gap-2'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder='Search assets or certificates...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-9 w-[300px]'
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value='all'>All ({summary.total})</TabsTrigger>
              <TabsTrigger value='valid'>
                <CheckCircle className='h-4 w-4 mr-1' />
                Valid ({summary.valid})
              </TabsTrigger>
              <TabsTrigger value='expiring_soon'>
                <Clock className='h-4 w-4 mr-1' />
                Expiring Soon ({summary.expiringSoon})
              </TabsTrigger>
              <TabsTrigger value='expired'>
                <AlertTriangle className='h-4 w-4 mr-1' />
                Expired ({summary.expired})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className='mt-4'>
              {filteredRecords.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title='No compliance records found'
                  description={
                    searchTerm
                      ? 'Try adjusting your search terms'
                      : 'No compliance records in this category'
                  }
                  action={
                    !searchTerm
                      ? {
                          label: 'Add Compliance Record',
                          onClick: handleAddCompliance,
                        }
                      : undefined
                  }
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Certification Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Days Until Expiry</TableHead>
                      <TableHead>Inspector</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map(record => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div>
                            <div>{record.assetName}</div>
                            <div className='text-sm text-muted-foreground'>
                              {record.assetId}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{record.certificationType}</TableCell>
                        <TableCell>
                          <StatusBadge status={record.status} />
                        </TableCell>
                        <TableCell>
                          {new Date(record.issueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(record.expiryDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              record.daysUntilExpiry < 0
                                ? 'text-red-600'
                                : record.daysUntilExpiry < 30
                                  ? 'text-amber-600'
                                  : 'text-green-600'
                            }
                          >
                            {record.daysUntilExpiry < 0
                              ? `${Math.abs(record.daysUntilExpiry)} days ago`
                              : `${record.daysUntilExpiry} days`}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className='text-sm'>{record.inspector}</div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' size='sm'>
                                <MoreVertical className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleDownloadDocument(record)}
                              >
                                <Download className='h-4 w-4 mr-2' />
                                Download Certificate
                              </DropdownMenuItem>
                              {(record.status === 'expiring_soon' ||
                                record.status === 'expired') && (
                                <DropdownMenuItem
                                  onClick={() => handleRenewCertificate(record)}
                                >
                                  <Calendar className='h-4 w-4 mr-2' />
                                  Renew Certificate
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <FileText className='h-4 w-4 mr-2' />
                                View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
