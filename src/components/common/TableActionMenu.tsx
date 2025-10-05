import React from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MoreVertical, LucideIcon } from "lucide-react";

export interface TableAction {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: "default" | "destructive";
  disabled?: boolean;
  separator?: boolean;
}

interface TableActionMenuProps {
  actions: TableAction[];
  trigger?: React.ReactNode;
  align?: "start" | "center" | "end";
  className?: string;
}

export function TableActionMenu({
  actions,
  trigger,
  align = "end",
  className,
}: TableActionMenuProps) {
  const defaultTrigger = (
    <Button variant="ghost" size="icon">
      <MoreVertical className="h-4 w-4" />
    </Button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={className}>
        {trigger || defaultTrigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {actions.map((action, index) => {
          const Icon = action.icon;
          
          return (
            <React.Fragment key={index}>
              {action.separator && index > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={action.onClick}
                disabled={action.disabled}
                className={action.variant === "destructive" ? "text-destructive" : ""}
              >
                {Icon && <Icon className="h-4 w-4 mr-2" />}
                {action.label}
              </DropdownMenuItem>
            </React.Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Common action presets for different entity types
export const createAssetActions = (
  asset: any,
  onViewDetails: (asset: any) => void,
  onShowOnMap: (asset: any) => void,
  onViewHistory: (asset: any) => void,
  onCheckOut: (asset: any) => void,
  onEdit: (asset: any) => void,
  onDelete: (asset: any) => void
): TableAction[] => [
  {
    label: "View Details",
    icon: require("lucide-react").Eye,
    onClick: () => onViewDetails(asset),
  },
  {
    label: "Show on Map",
    icon: require("lucide-react").MapPin,
    onClick: () => onShowOnMap(asset),
  },
  {
    label: "View History",
    icon: require("lucide-react").Clock,
    onClick: () => onViewHistory(asset),
  },
  {
    label: "Check Out",
    icon: require("lucide-react").Download,
    onClick: () => onCheckOut(asset),
  },
  {
    label: "Edit Asset",
    icon: require("lucide-react").Edit,
    onClick: () => onEdit(asset),
    separator: true,
  },
  {
    label: "Delete Asset",
    icon: require("lucide-react").Trash2,
    onClick: () => onDelete(asset),
    variant: "destructive",
  },
];

export const createJobActions = (
  job: any,
  onViewDetails: (job: any) => void,
  onEdit: (job: any) => void,
  onDelete: (job: any) => void
): TableAction[] => [
  {
    label: "View Details",
    icon: require("lucide-react").Eye,
    onClick: () => onViewDetails(job),
  },
  {
    label: "Edit Job",
    icon: require("lucide-react").Edit,
    onClick: () => onEdit(job),
    separator: true,
  },
  {
    label: "Delete Job",
    icon: require("lucide-react").Trash2,
    onClick: () => onDelete(job),
    variant: "destructive",
  },
];

export const createIssueActions = (
  issue: any,
  onViewDetails: (issue: any) => void,
  onEdit: (issue: any) => void,
  onDelete: (issue: any) => void
): TableAction[] => [
  {
    label: "View Details",
    icon: require("lucide-react").Eye,
    onClick: () => onViewDetails(issue),
  },
  {
    label: "Edit Issue",
    icon: require("lucide-react").Edit,
    onClick: () => onEdit(issue),
    separator: true,
  },
  {
    label: "Delete Issue",
    icon: require("lucide-react").Trash2,
    onClick: () => onDelete(issue),
    variant: "destructive",
  },
];
