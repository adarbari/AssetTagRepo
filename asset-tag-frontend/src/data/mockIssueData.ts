/**
 * Mock Issue Data
 *
 * Sample issue data for development and testing
 */

import type { Issue } from '../types/issue';

export const mockIssues: Issue[] = [
  {
    id: 'ISS-001',
    assetId: 'AST-001',
    assetName: 'Excavator CAT 320',
    type: 'mechanical',
    severity: 'high',
    status: 'in-progress',
    title: 'Hydraulic leak detected',
    description:
      'Hydraulic fluid leaking from the boom cylinder. Noticed during routine inspection. Asset currently idle to prevent further damage.',
    reportedBy: 'John Smith',
    reportedDate: '2025-10-02T14:30:00Z',
    assignedTo: 'Mike Wilson',
    notes: 'Ordered replacement seals. ETA 2 days.',
    tags: ['hydraulic', 'urgent'],
  },
  {
    id: 'ISS-002',
    assetId: 'AST-003',
    assetName: 'Generator GenSet 150',
    type: 'electrical',
    severity: 'critical',
    status: 'acknowledged',
    title: 'Power output fluctuating',
    description:
      'Generator output voltage is unstable, fluctuating between 110-130V. Multiple equipment shutdowns reported at job site.',
    reportedBy: 'Sarah Connor',
    reportedDate: '2025-10-03T08:15:00Z',
    assignedTo: 'Sarah Johnson',
    tags: ['power', 'critical', 'job-site-alpha'],
  },
  {
    id: 'ISS-003',
    assetId: 'AST-007',
    assetName: 'Trailer PJ 20ft',
    type: 'damage',
    severity: 'medium',
    status: 'open',
    title: 'Damaged rear gate latch',
    description:
      'Rear gate latch is bent and not securing properly. Gate opens during transport.',
    reportedBy: 'Mike Johnson',
    reportedDate: '2025-10-03T16:45:00Z',
    tags: ['transport', 'safety'],
  },
  {
    id: 'ISS-004',
    assetId: 'AST-002',
    assetName: 'Forklift Toyota 5000',
    type: 'battery',
    severity: 'low',
    status: 'resolved',
    title: 'Battery not holding charge',
    description:
      'Forklift battery depletes faster than normal. Requires charging every 3 hours instead of full shift.',
    reportedBy: 'David Brown',
    reportedDate: '2025-09-28T11:20:00Z',
    assignedTo: 'Mike Wilson',
    resolvedBy: 'Mike Wilson',
    resolvedDate: '2025-10-01T14:30:00Z',
    notes: 'Replaced battery. Tested for 8 hours, holding charge normally.',
    tags: ['battery', 'resolved'],
  },
  {
    id: 'ISS-005',
    assetId: 'AST-005',
    assetName: 'Compressor Atlas 185',
    type: 'connectivity',
    severity: 'low',
    status: 'open',
    title: 'GPS tracker intermittent',
    description:
      'Asset location updates are inconsistent. Sometimes shows offline for hours then reconnects.',
    reportedBy: 'Maria Garcia',
    reportedDate: '2025-10-04T09:00:00Z',
    tags: ['gps', 'tracking'],
  },
  {
    id: 'ISS-006',
    assetId: 'AST-001',
    assetName: 'Excavator CAT 320',
    type: 'software',
    severity: 'medium',
    status: 'in-progress',
    title: 'Display console showing error codes',
    description:
      'Onboard computer displays recurring error code E-47. Manual suggests firmware update needed.',
    reportedBy: 'John Smith',
    reportedDate: '2025-10-01T13:15:00Z',
    assignedTo: 'Sarah Johnson',
    notes: 'Contacted manufacturer for firmware update package.',
    tags: ['firmware', 'software'],
  },
  {
    id: 'ISS-007',
    assetId: 'AST-008',
    assetName: 'Scissor Lift JLG 2646',
    type: 'mechanical',
    severity: 'high',
    status: 'acknowledged',
    title: "Platform won't extend fully",
    description:
      'Scissor lift platform stops at 18ft instead of rated 26ft height. Safety concern for crew.',
    reportedBy: 'Robert Jones',
    reportedDate: '2025-10-03T10:30:00Z',
    assignedTo: 'Mike Wilson',
    tags: ['safety', 'height', 'urgent'],
  },
  {
    id: 'ISS-008',
    assetId: 'AST-004',
    assetName: 'Power Tools DeWalt Set',
    type: 'tracking',
    severity: 'high',
    status: 'open',
    title: 'Missing from job site',
    description:
      'Complete DeWalt power tool set not found at job site during equipment check. Last seen 2 days ago at site Beta.',
    reportedBy: 'Emily Davis',
    reportedDate: '2025-10-04T07:45:00Z',
    tags: ['missing', 'theft-possible', 'investigation'],
  },
];

export function getIssueById(id: string): Issue | undefined {
  return mockIssues.find(issue => issue.id === id);
}

export function getIssuesByAsset(assetId: string): Issue[] {
  return mockIssues.filter(issue => issue.assetId === assetId);
}

export function getIssuesByStatus(status: string): Issue[] {
  return mockIssues.filter(issue => issue.status === status);
}

export function getOpenIssuesCount(): number {
  return mockIssues.filter(
    issue =>
      issue.status === 'open' ||
      issue.status === 'acknowledged' ||
      issue.status === 'in-progress'
  ).length;
}

export function updateIssue(
  issueId: string,
  updates: Partial<Issue>
): Issue | null {
  const issueIndex = mockIssues.findIndex(issue => issue.id === issueId);
  if (issueIndex === -1) {
    return null;
  }

  mockIssues[issueIndex] = { ...mockIssues[issueIndex], ...updates };
  return mockIssues[issueIndex];
}

export function updateIssueStatus(
  issueId: string,
  status: string
): Issue | null {
  const issueIndex = mockIssues.findIndex(issue => issue.id === issueId);
  if (issueIndex === -1) {
    return null;
  }

  mockIssues[issueIndex] = { ...mockIssues[issueIndex], status: status as any };
  return mockIssues[issueIndex];
}

export function deleteIssue(issueId: string): boolean {
  const issueIndex = mockIssues.findIndex(issue => issue.id === issueId);
  if (issueIndex === -1) {
    return false;
  }

  mockIssues.splice(issueIndex, 1);
  return true;
}

export function createIssue(issue: Omit<Issue, 'id'>): Issue {
  const newId = `ISS-${String(mockIssues.length + 1).padStart(3, '0')}`;
  const newIssue: Issue = {
    ...issue,
    id: newId,
  };

  mockIssues.push(newIssue);
  return newIssue;
}
