&apos;use client&apos;;

import * as React from &apos;react&apos;;

import { cn } from &apos;./utils&apos;;

function Table({ className, ...props }: React.ComponentProps<&apos;table&apos;>) {
  return (
    <div
      data-slot=&apos;table-container&apos;
      className=&apos;relative w-full overflow-x-auto&apos;
    >
      <table
        data-slot=&apos;table&apos;
        className={cn(&apos;w-full caption-bottom text-sm&apos;, className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<&apos;thead&apos;>) {
  return (
    <thead
      data-slot=&apos;table-header&apos;
      className={cn(&apos;[&_tr]:border-b&apos;, className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<&apos;tbody&apos;>) {
  return (
    <tbody
      data-slot=&apos;table-body&apos;
      className={cn(&apos;[&_tr:last-child]:border-0&apos;, className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<&apos;tfoot&apos;>) {
  return (
    <tfoot
      data-slot=&apos;table-footer&apos;
      className={cn(
        &apos;bg-muted/50 border-t font-medium [&>tr]:last:border-b-0&apos;,
        className
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<&apos;tr&apos;>) {
  return (
    <tr
      data-slot=&apos;table-row&apos;
      className={cn(
        &apos;hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors&apos;,
        className
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<&apos;th&apos;>) {
  return (
    <th
      data-slot=&apos;table-head&apos;
      className={cn(
        &apos;text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]&apos;,
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<&apos;td&apos;>) {
  return (
    <td
      data-slot=&apos;table-cell&apos;
      className={cn(
        &apos;p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]&apos;,
        className
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<&apos;caption&apos;>) {
  return (
    <caption
      data-slot=&apos;table-caption&apos;
      className={cn(&apos;text-muted-foreground mt-4 text-sm&apos;, className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
