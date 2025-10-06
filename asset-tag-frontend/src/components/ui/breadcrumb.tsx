import React from &apos;react&apos;;
import * as React from &apos;react&apos;;
import { Slot } from &apos;@radix-ui/react-slot&apos;;
import { ChevronRight, MoreHorizontal } from &apos;lucide-react&apos;;

import { cn } from &apos;./utils&apos;;

function Breadcrumb({ ...props }: React.ComponentProps<&apos;nav&apos;>) {
  return <nav aria-label=&apos;breadcrumb&apos; data-slot=&apos;breadcrumb&apos; {...props} />;
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<&apos;ol&apos;>) {
  return (
    <ol
      data-slot=&apos;breadcrumb-list&apos;
      className={cn(
        &apos;text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5&apos;,
        className
      )}
      {...props}
    />
  );
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<&apos;li&apos;>) {
  return (
    <li
      data-slot=&apos;breadcrumb-item&apos;
      className={cn(&apos;inline-flex items-center gap-1.5&apos;, className)}
      {...props}
    />
  );
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<&apos;a&apos;> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : &apos;a&apos;;

  return (
    <Comp
      data-slot=&apos;breadcrumb-link&apos;
      className={cn(&apos;hover:text-foreground transition-colors&apos;, className)}
      {...props}
    />
  );
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<&apos;span&apos;>) {
  return (
    <span
      data-slot=&apos;breadcrumb-page&apos;
      role=&apos;link&apos;
      aria-disabled=&apos;true&apos;
      aria-current=&apos;page&apos;
      className={cn(&apos;text-foreground font-normal&apos;, className)}
      {...props}
    />
  );
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<&apos;li&apos;>) {
  return (
    <li
      data-slot=&apos;breadcrumb-separator&apos;
      role=&apos;presentation&apos;
      aria-hidden=&apos;true&apos;
      className={cn(&apos;[&>svg]:size-3.5&apos;, className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  );
}

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<&apos;span&apos;>) {
  return (
    <span
      data-slot=&apos;breadcrumb-ellipsis&apos;
      role=&apos;presentation&apos;
      aria-hidden=&apos;true&apos;
      className={cn(&apos;flex size-9 items-center justify-center&apos;, className)}
      {...props}
    >
      <MoreHorizontal className=&apos;size-4&apos; />
      <span className=&apos;sr-only&apos;>More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
