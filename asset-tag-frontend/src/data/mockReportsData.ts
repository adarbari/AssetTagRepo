/**
 * Mock Reports Data
 *
 * Comprehensive data for reports and compliance tracking.
 * In production, this will be replaced with API calls.
 */

export interface UtilizationData {
  month: string;
  utilization: number;
  idle: number;
  maintenance: number;
}

export interface CostSavingsData {
  month: string;
  theftPrevention: number;
  laborSaved: number;
  insurance: number;
  maintenanceSavings: number;
}

export interface TopAsset {
  id: string;
  name: string;
  type: string;
  utilization: number;
  hours: number;
  revenue: number;
  location: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  lastGenerated?: string;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
}

export interface ComplianceRecord {
  id: string;
  assetId: string;
  assetName: string;
  certificationType: string;
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expiring_soon' | 'expired';
  daysUntilExpiry: number;
  inspector?: string;
  notes?: string;
}

// Utilization data (6 months)
export const utilizationData: UtilizationData[] = [
  { month: 'Jan', utilization: 72, idle: 24, maintenance: 4 },
  { month: 'Feb', utilization: 78, idle: 19, maintenance: 3 },
  { month: 'Mar', utilization: 81, idle: 16, maintenance: 3 },
  { month: 'Apr', utilization: 76, idle: 20, maintenance: 4 },
  { month: 'May', utilization: 84, idle: 13, maintenance: 3 },
  { month: 'Jun', utilization: 88, idle: 10, maintenance: 2 },
  { month: 'Jul', utilization: 86, idle: 11, maintenance: 3 },
  { month: 'Aug', utilization: 82, idle: 15, maintenance: 3 },
  { month: 'Sep', utilization: 79, idle: 17, maintenance: 4 },
  { month: 'Oct', utilization: 85, idle: 12, maintenance: 3 },
  { month: 'Nov', utilization: 89, idle: 9, maintenance: 2 },
  { month: 'Dec', utilization: 91, idle: 7, maintenance: 2 },
];

// Cost savings breakdown
export const costSavingsData: CostSavingsData[] = [
  {
    month: 'Jan',
    theftPrevention: 12000,
    laborSaved: 8500,
    insurance: 3200,
    maintenanceSavings: 4200,
  },
  {
    month: 'Feb',
    theftPrevention: 15000,
    laborSaved: 9200,
    insurance: 3200,
    maintenanceSavings: 3800,
  },
  {
    month: 'Mar',
    theftPrevention: 8000,
    laborSaved: 10100,
    insurance: 3200,
    maintenanceSavings: 5100,
  },
  {
    month: 'Apr',
    theftPrevention: 22000,
    laborSaved: 9800,
    insurance: 3200,
    maintenanceSavings: 4500,
  },
  {
    month: 'May',
    theftPrevention: 5000,
    laborSaved: 11200,
    insurance: 3200,
    maintenanceSavings: 4800,
  },
  {
    month: 'Jun',
    theftPrevention: 18000,
    laborSaved: 12400,
    insurance: 3200,
    maintenanceSavings: 5200,
  },
  {
    month: 'Jul',
    theftPrevention: 13000,
    laborSaved: 11800,
    insurance: 3200,
    maintenanceSavings: 4900,
  },
  {
    month: 'Aug',
    theftPrevention: 9000,
    laborSaved: 10500,
    insurance: 3200,
    maintenanceSavings: 4300,
  },
  {
    month: 'Sep',
    theftPrevention: 16000,
    laborSaved: 9900,
    insurance: 3200,
    maintenanceSavings: 4600,
  },
  {
    month: 'Oct',
    theftPrevention: 11000,
    laborSaved: 13100,
    insurance: 3200,
    maintenanceSavings: 5400,
  },
  {
    month: 'Nov',
    theftPrevention: 19000,
    laborSaved: 12700,
    insurance: 3200,
    maintenanceSavings: 5100,
  },
  {
    month: 'Dec',
    theftPrevention: 14000,
    laborSaved: 11500,
    insurance: 3200,
    maintenanceSavings: 4700,
  },
];

// Top performing assets
export const topAssets: TopAsset[] = [
  {
    id: 'AT-42891',
    name: 'Excavator CAT 320',
    type: 'Heavy Equipment',
    utilization: 94,
    hours: 1876,
    revenue: 187600,
    location: 'Construction Site A',
  },
  {
    id: 'AT-42893',
    name: 'Concrete Mixer M400',
    type: 'Equipment',
    utilization: 92,
    hours: 1798,
    revenue: 89900,
    location: 'Multiple Sites',
  },
  {
    id: 'AT-42894',
    name: 'Tool Kit Professional',
    type: 'Tools',
    utilization: 89,
    hours: 1712,
    revenue: 42800,
    location: 'Construction Site B',
  },
  {
    id: 'AT-42895',
    name: 'Air Compressor 185CFM',
    type: 'Equipment',
    utilization: 87,
    hours: 1654,
    revenue: 66160,
    location: 'Warehouse',
  },
  {
    id: 'AT-42892',
    name: 'Generator Diesel 50kW',
    type: 'Equipment',
    utilization: 86,
    hours: 1598,
    revenue: 79900,
    location: 'Site C',
  },
  {
    id: 'AT-42896',
    name: 'Forklift Toyota 5000lb',
    type: 'Vehicles',
    utilization: 84,
    hours: 1587,
    revenue: 63480,
    location: 'Warehouse',
  },
  {
    id: 'AT-42897',
    name: 'Welding Equipment Pro',
    type: 'Tools',
    utilization: 81,
    hours: 1512,
    revenue: 45360,
    location: 'Workshop',
  },
  {
    id: 'AT-42898',
    name: 'Scissor Lift 26ft',
    type: 'Equipment',
    utilization: 78,
    hours: 1456,
    revenue: 72800,
    location: 'Multiple Sites',
  },
];

// Report templates
export const reportTemplates: ReportTemplate[] = [
  {
    id: 'rep-001',
    name: 'Inventory Audit',
    type: 'inventory',
    description: 'Complete inventory listing with locations and status',
    lastGenerated: '2024-10-01',
    frequency: 'monthly',
  },
  {
    id: 'rep-002',
    name: 'Job Costing Analysis',
    type: 'costing',
    description: 'Time-on-site analysis with cost breakdown by project',
    lastGenerated: '2024-09-28',
    frequency: 'weekly',
  },
  {
    id: 'rep-003',
    name: 'Asset Utilization',
    type: 'utilization',
    description: 'Active vs idle time analysis with utilization rates',
    lastGenerated: '2024-10-02',
    frequency: 'monthly',
  },
  {
    id: 'rep-004',
    name: 'Compliance Summary',
    type: 'compliance',
    description: 'Inspections, certifications, and compliance status',
    lastGenerated: '2024-09-30',
    frequency: 'monthly',
  },
  {
    id: 'rep-005',
    name: 'Battery Health Report',
    type: 'battery',
    description: 'Battery lifecycle tracking and replacement forecasts',
    lastGenerated: '2024-10-03',
    frequency: 'weekly',
  },
  {
    id: 'rep-006',
    name: 'Theft & Loss Summary',
    type: 'theft',
    description: 'Incident documentation and recovery tracking',
    lastGenerated: '2024-10-01',
    frequency: 'monthly',
  },
  {
    id: 'rep-007',
    name: 'Maintenance Schedule',
    type: 'maintenance',
    description: 'Upcoming and overdue maintenance tasks',
    lastGenerated: '2024-10-04',
    frequency: 'weekly',
  },
  {
    id: 'rep-008',
    name: 'ROI Dashboard',
    type: 'roi',
    description: 'Return on investment analysis with cost savings breakdown',
    lastGenerated: '2024-09-30',
    frequency: 'quarterly',
  },
];

// Compliance records
export const complianceRecords: ComplianceRecord[] = [
  {
    id: 'comp-001',
    assetId: 'AT-42891',
    assetName: 'Excavator CAT 320',
    certificationType: 'Annual Safety Inspection',
    issueDate: '2024-03-15',
    expiryDate: '2025-03-15',
    status: 'valid',
    daysUntilExpiry: 162,
    inspector: 'John Smith (Certified Inspector #12345)',
    notes: 'All systems operational. Minor wear on hydraulic seals noted.',
  },
  {
    id: 'comp-002',
    assetId: 'AT-42892',
    assetName: 'Generator Diesel 50kW',
    certificationType: 'Emissions Compliance',
    issueDate: '2024-06-20',
    expiryDate: '2024-12-20',
    status: 'expiring_soon',
    daysUntilExpiry: 77,
    inspector: 'EPA Inspector',
    notes:
      'Meets all current emission standards. Schedule renewal in November.',
  },
  {
    id: 'comp-003',
    assetId: 'AT-42893',
    assetName: 'Concrete Mixer M400',
    certificationType: 'Operator Certification',
    issueDate: '2023-09-10',
    expiryDate: '2024-09-10',
    status: 'expired',
    daysUntilExpiry: -24,
    inspector: 'Training Department',
    notes: 'URGENT: Recertification required immediately.',
  },
  {
    id: 'comp-004',
    assetId: 'AT-42894',
    assetName: 'Tool Kit Professional',
    certificationType: 'Calibration Certificate',
    issueDate: '2024-08-01',
    expiryDate: '2025-08-01',
    status: 'valid',
    daysUntilExpiry: 303,
    inspector: 'Calibration Lab Services',
    notes: 'All measuring tools calibrated to ISO standards.',
  },
  {
    id: 'comp-005',
    assetId: 'AT-42895',
    assetName: 'Air Compressor 185CFM',
    certificationType: 'Pressure Vessel Inspection',
    issueDate: '2024-01-10',
    expiryDate: '2025-01-10',
    status: 'valid',
    daysUntilExpiry: 98,
    inspector: 'Pressure Systems Safety Reg',
    notes: 'Tank integrity verified. No corrosion detected.',
  },
  {
    id: 'comp-006',
    assetId: 'AT-42896',
    assetName: 'Forklift Toyota 5000lb',
    certificationType: 'Annual Safety Inspection',
    issueDate: '2024-05-22',
    expiryDate: '2025-05-22',
    status: 'valid',
    daysUntilExpiry: 231,
    inspector: 'OSHA Certified Inspector',
    notes: 'Passed all safety checks. Fork tines in good condition.',
  },
  {
    id: 'comp-007',
    assetId: 'AT-42897',
    assetName: 'Welding Equipment Pro',
    certificationType: 'Electrical Safety Test',
    issueDate: '2024-07-15',
    expiryDate: '2024-10-15',
    status: 'expiring_soon',
    daysUntilExpiry: 11,
    inspector: 'Electrical Safety Compliance',
    notes: 'Schedule renewal test within 2 weeks.',
  },
  {
    id: 'comp-008',
    assetId: 'AT-42898',
    assetName: 'Scissor Lift 26ft',
    certificationType: 'Load Test Certification',
    issueDate: '2024-02-28',
    expiryDate: '2025-02-28',
    status: 'valid',
    daysUntilExpiry: 147,
    inspector: 'Lift Equipment Testing Ltd',
    notes: 'Platform tested to 125% of rated capacity.',
  },
];

/**
 * Get utilization data for reports
 */
export async function getUtilizationData(
  months: number = 6
): Promise<UtilizationData[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return utilizationData.slice(-months);
}

/**
 * Get cost savings data
 */
export async function getCostSavingsData(
  months: number = 6
): Promise<CostSavingsData[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return costSavingsData.slice(-months);
}

/**
 * Get top performing assets
 */
export async function getTopAssets(limit: number = 5): Promise<TopAsset[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return topAssets.slice(0, limit);
}

/**
 * Get report templates
 */
export async function getReportTemplates(): Promise<ReportTemplate[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return reportTemplates;
}

/**
 * Get compliance records
 */
export async function getComplianceRecords(
  status?: 'all' | 'valid' | 'expiring_soon' | 'expired'
): Promise<ComplianceRecord[]> {
  await new Promise(resolve => setTimeout(resolve, 100));

  if (!status || status === 'all') {
    return complianceRecords;
  }

  return complianceRecords.filter(record => record.status === status);
}

/**
 * Calculate total ROI
 */
export function calculateTotalROI(data: CostSavingsData[]): number {
  return data.reduce((total, month) => {
    return (
      total +
      month.theftPrevention +
      month.laborSaved +
      month.insurance +
      month.maintenanceSavings
    );
  }, 0);
}

/**
 * Get compliance summary statistics
 */
export interface ComplianceSummary {
  total: number;
  valid: number;
  expiringSoon: number;
  expired: number;
}

export async function getComplianceSummary(): Promise<ComplianceSummary> {
  await new Promise(resolve => setTimeout(resolve, 100));

  const summary: ComplianceSummary = {
    total: complianceRecords.length,
    valid: complianceRecords.filter(r => r.status === 'valid').length,
    expiringSoon: complianceRecords.filter(r => r.status === 'expiring_soon')
      .length,
    expired: complianceRecords.filter(r => r.status === 'expired').length,
  };

  return summary;
}
