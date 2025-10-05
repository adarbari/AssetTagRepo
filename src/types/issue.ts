/**
 * Issue Type Definitions
 * 
 * Defines the structure for asset issues/problems reported by users
 */

export type IssueType = 
  | "mechanical"
  | "electrical"
  | "battery"
  | "connectivity"
  | "damage"
  | "tracking"
  | "software"
  | "other";

export type IssueSeverity = "low" | "medium" | "high" | "critical";

export type IssueStatus = 
  | "open"
  | "acknowledged"
  | "in-progress"
  | "resolved"
  | "closed"
  | "cancelled";

export interface Issue {
  id: string;
  assetId: string;
  assetName: string;
  type: IssueType;
  severity: IssueSeverity;
  status: IssueStatus;
  title: string;
  description: string;
  reportedBy: string;
  reportedDate: string;
  assignedTo?: string;
  resolvedBy?: string;
  resolvedDate?: string;
  notes?: string;
  attachments?: string[];
  tags?: string[];
}

export interface CreateIssueInput {
  assetId: string;
  assetName: string;
  type: IssueType;
  severity: IssueSeverity;
  title: string;
  description: string;
  reportedBy: string;
  notes?: string;
  attachments?: string[];
  tags?: string[];
}

export interface UpdateIssueInput {
  type?: IssueType;
  severity?: IssueSeverity;
  status?: IssueStatus;
  title?: string;
  description?: string;
  assignedTo?: string;
  notes?: string;
  tags?: string[];
}
