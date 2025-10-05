/**
 * PageHeader with Breadcrumbs Component
 * 
 * Provides consistent page header UI with breadcrumb navigation for sub-actions
 * Used for forms and actions that are accessed from detail pages
 */

import React from "react";
import { ArrowLeft, LucideIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { PageHeader } from "./PageHeader";

interface PageHeaderWithBreadcrumbsProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  badge?: {
    label: string;
    variant?: "default" | "secondary" | "outline" | "destructive";
  };
  actions?: React.ReactNode;
  onBack: () => void;
  breadcrumbParent: string;
  breadcrumbCurrent: string;
}

export function PageHeaderWithBreadcrumbs({
  title,
  description,
  icon,
  badge,
  actions,
  onBack,
  breadcrumbParent,
  breadcrumbCurrent,
}: PageHeaderWithBreadcrumbsProps) {
  return (
    <div className="border-b bg-background px-8 py-4">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={onBack} className="cursor-pointer">
                {breadcrumbParent}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{breadcrumbCurrent}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <PageHeader
        title={title}
        description={description}
        icon={icon}
        badge={badge}
        actions={actions}
      />
    </div>
  );
}
