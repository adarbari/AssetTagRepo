import { useState } from &apos;react&apos;;
import { Card, CardContent, CardHeader, CardTitle } from &apos;../ui/card&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Input } from &apos;../ui/input&apos;;
import {
  LoadingState,
  EmptyState,
  StatsCard,
  PageHeader,
  StatusBadge,
  PageLayout,
} from &apos;../common&apos;;
import { useAsyncDataAll } from &apos;../../hooks/useAsyncData&apos;;
import {
  getComplianceRecords,
  getComplianceSummary,
  type ComplianceRecord,
} from &apos;../../data/mockReportsData&apos;;
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from &apos;../ui/table&apos;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &apos;../ui/tabs&apos;;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from &apos;../ui/dropdown-menu&apos;;
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
} from &apos;lucide-react&apos;;
import { toast } from &apos;sonner&apos;;
import { useNavigation } from &apos;../../contexts/NavigationContext&apos;;

export function ComplianceTracking() {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState(&apos;&apos;);
  const [activeTab, setActiveTab] = useState(&apos;all&apos;);

  // Fetch compliance data
  const { data, loading, error, refetch } = useAsyncDataAll(
    {
      summary: () => getComplianceSummary(),
      records: () => getComplianceRecords(activeTab as any),
    },
    { deps: [activeTab] }
  );

  const handleUploadDocument = () => {
    toast.success(&apos;Upload feature coming soon&apos;);
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
    return <LoadingState message=&apos;Loading compliance data...&apos; fullScreen />;
  }

  if (error) {
    return (
      <div className=&apos;p-8&apos;>
        <EmptyState
          icon={AlertTriangle}
          title=&apos;Failed to load compliance data&apos;
          description={error.message}
          action={{
            label: &apos;Try Again&apos;,
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
    <PageLayout variant=&apos;wide&apos; padding=&apos;lg&apos;>
      <PageHeader
        title=&apos;Compliance Tracking&apos;
        description=&apos;Manage certifications, inspections, and regulatory compliance&apos;
        actions={
          <div className=&apos;flex items-center gap-2&apos;>
            <Button variant=&apos;outline&apos; onClick={handleUploadDocument}>
              <Upload className=&apos;h-4 w-4 mr-2&apos; />
              Upload
            </Button>
            <Button onClick={handleAddCompliance}>
              <Plus className=&apos;h-4 w-4 mr-2&apos; />
              Add Compliance
            </Button>
          </div>
        }
      />

      {/* Summary Stats */}
      <div className=&apos;grid gap-4 md:grid-cols-4&apos;>
        <StatsCard
          title=&apos;Total Certifications&apos;
          value={summary.total.toString()}
          icon={FileText}
          description=&apos;All compliance records&apos;
        />
        <StatsCard
          title=&apos;Valid&apos;
          value={summary.valid.toString()}
          icon={CheckCircle}
          description=&apos;Up to date&apos;
          variant=&apos;success&apos;
        />
        <StatsCard
          title=&apos;Expiring Soon&apos;
          value={summary.expiringSoon.toString()}
          icon={Clock}
          description=&apos;Within 30 days&apos;
          variant=&apos;warning&apos;
        />
        <StatsCard
          title=&apos;Expired&apos;
          value={summary.expired.toString()}
          icon={AlertTriangle}
          description=&apos;Action required&apos;
          variant=&apos;destructive&apos;
        />
      </div>

      {/* Compliance Records Table */}
      <Card>
        <CardHeader>
          <div className=&apos;flex items-center justify-between&apos;>
            <CardTitle>Compliance Records</CardTitle>
            <div className=&apos;flex items-center gap-2&apos;>
              <div className=&apos;relative&apos;>
                <Search className=&apos;absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground&apos; />
                <Input
                  placeholder=&apos;Search assets or certificates...&apos;
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className=&apos;pl-9 w-[300px]&apos;
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value=&apos;all&apos;>All ({summary.total})</TabsTrigger>
              <TabsTrigger value=&apos;valid&apos;>
                <CheckCircle className=&apos;h-4 w-4 mr-1&apos; />
                Valid ({summary.valid})
              </TabsTrigger>
              <TabsTrigger value=&apos;expiring_soon&apos;>
                <Clock className=&apos;h-4 w-4 mr-1&apos; />
                Expiring Soon ({summary.expiringSoon})
              </TabsTrigger>
              <TabsTrigger value=&apos;expired&apos;>
                <AlertTriangle className=&apos;h-4 w-4 mr-1&apos; />
                Expired ({summary.expired})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className=&apos;mt-4&apos;>
              {filteredRecords.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title=&apos;No compliance records found&apos;
                  description={
                    searchTerm
                      ? &apos;Try adjusting your search terms&apos;
                      : &apos;No compliance records in this category&apos;
                  }
                  action={
                    !searchTerm
                      ? {
                          label: &apos;Add Compliance Record&apos;,
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
                            <div className=&apos;text-sm text-muted-foreground&apos;>
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
                                ? &apos;text-red-600&apos;
                                : record.daysUntilExpiry < 30
                                  ? &apos;text-amber-600&apos;
                                  : &apos;text-green-600&apos;
                            }
                          >
                            {record.daysUntilExpiry < 0
                              ? `${Math.abs(record.daysUntilExpiry)} days ago`
                              : `${record.daysUntilExpiry} days`}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className=&apos;text-sm&apos;>{record.inspector}</div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant=&apos;ghost&apos; size=&apos;sm&apos;>
                                <MoreVertical className=&apos;h-4 w-4&apos; />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align=&apos;end&apos;>
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleDownloadDocument(record)}
                              >
                                <Download className=&apos;h-4 w-4 mr-2&apos; />
                                Download Certificate
                              </DropdownMenuItem>
                              {(record.status === &apos;expiring_soon&apos; ||
                                record.status === &apos;expired&apos;) && (
                                <DropdownMenuItem
                                  onClick={() => handleRenewCertificate(record)}
                                >
                                  <Calendar className=&apos;h-4 w-4 mr-2&apos; />
                                  Renew Certificate
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <FileText className=&apos;h-4 w-4 mr-2&apos; />
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
