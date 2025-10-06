import React from &apos;react&apos;;
import * as React from &apos;react&apos;;
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from &apos;lucide-react&apos;;

import { cn } from &apos;./utils&apos;;
import { Button, buttonVariants } from &apos;./button&apos;;

function Pagination({ className, ...props }: React.ComponentProps<&apos;nav&apos;>) {
  return (
    <nav
      role=&apos;navigation&apos;
      aria-label=&apos;pagination&apos;
      data-slot=&apos;pagination&apos;
      className={cn(&apos;mx-auto flex w-full justify-center&apos;, className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<&apos;ul&apos;>) {
  return (
    <ul
      data-slot=&apos;pagination-content&apos;
      className={cn(&apos;flex flex-row items-center gap-1&apos;, className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<&apos;li&apos;>) {
  return <li data-slot=&apos;pagination-item&apos; {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, &apos;size&apos;> &
  React.ComponentProps<&apos;a&apos;>;

function PaginationLink({
  className,
  isActive,
  size = &apos;icon&apos;,
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? &apos;page&apos; : undefined}
      data-slot=&apos;pagination-link&apos;
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? &apos;outline&apos; : &apos;ghost&apos;,
          size,
        }),
        className
      )}
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label=&apos;Go to previous page&apos;
      size=&apos;default&apos;
      className={cn(&apos;gap-1 px-2.5 sm:pl-2.5&apos;, className)}
      {...props}
    >
      <ChevronLeftIcon />
      <span className=&apos;hidden sm:block&apos;>Previous</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label=&apos;Go to next page&apos;
      size=&apos;default&apos;
      className={cn(&apos;gap-1 px-2.5 sm:pr-2.5&apos;, className)}
      {...props}
    >
      <span className=&apos;hidden sm:block&apos;>Next</span>
      <ChevronRightIcon />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<&apos;span&apos;>) {
  return (
    <span
      aria-hidden
      data-slot=&apos;pagination-ellipsis&apos;
      className={cn(&apos;flex size-9 items-center justify-center&apos;, className)}
      {...props}
    >
      <MoreHorizontalIcon className=&apos;size-4&apos; />
      <span className=&apos;sr-only&apos;>More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
