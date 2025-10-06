import React from &apos;react&apos;;
import * as React from &apos;react&apos;;

import { cn } from &apos;./utils&apos;;

function Card({ className, ...props }: React.ComponentProps<&apos;div&apos;>) {
  return (
    <div
      data-slot=&apos;card&apos;
      className={cn(
        &apos;bg-card text-card-foreground flex flex-col gap-6 rounded-xl border&apos;,
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<&apos;div&apos;>) {
  return (
    <div
      data-slot=&apos;card-header&apos;
      className={cn(
        &apos;@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6&apos;,
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<&apos;div&apos;>) {
  return (
    <h4
      data-slot=&apos;card-title&apos;
      className={cn(&apos;leading-none&apos;, className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<&apos;div&apos;>) {
  return (
    <p
      data-slot=&apos;card-description&apos;
      className={cn(&apos;text-muted-foreground&apos;, className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<&apos;div&apos;>) {
  return (
    <div
      data-slot=&apos;card-action&apos;
      className={cn(
        &apos;col-start-2 row-span-2 row-start-1 self-start justify-self-end&apos;,
        className
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<&apos;div&apos;>) {
  return (
    <div
      data-slot=&apos;card-content&apos;
      className={cn(&apos;px-6 [&:last-child]:pb-6&apos;, className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<&apos;div&apos;>) {
  return (
    <div
      data-slot=&apos;card-footer&apos;
      className={cn(&apos;flex items-center px-6 pb-6 [.border-t]:pt-6&apos;, className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
