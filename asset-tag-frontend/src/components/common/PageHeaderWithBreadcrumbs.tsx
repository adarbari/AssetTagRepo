/**
 * PageHeader with Breadcrumbs Component
 *
 * Provides consistent page header UI with breadcrumb navigation for sub-actions
 * Used for forms and actions that are accessed from detail pages
 */

import React from &apos;react&apos;;
import { ArrowLeft, LucideIcon } from &apos;lucide-react&apos;;
import { Button } from &apos;../ui/button&apos;;
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from &apos;../ui/breadcrumb&apos;;
import { PageHeader } from &apos;./PageHeader&apos;;

interface PageHeaderWithBreadcrumbsProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  badge?: {
    label: string;
    variant?: &apos;default&apos; | &apos;secondary&apos; | &apos;outline&apos; | &apos;destructive&apos;;
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
    <div className=&apos;border-b bg-background px-8 py-4&apos;>
      <div className=&apos;flex items-center gap-4 mb-4&apos;>
        <Button variant=&apos;ghost&apos; size=&apos;icon&apos; onClick={onBack}>
          <ArrowLeft className=&apos;h-5 w-5&apos; />
        </Button>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={onBack} className=&apos;cursor-pointer&apos;>
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
