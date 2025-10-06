import React from &apos;react&apos;;
import { cn } from &apos;./utils&apos;;

function Skeleton({ className, ...props }: React.ComponentProps<&apos;div&apos;>) {
  return (
    <div
      data-slot=&apos;skeleton&apos;
      className={cn(&apos;bg-accent animate-pulse rounded-md&apos;, className)}
      {...props}
    />
  );
}

export { Skeleton };
