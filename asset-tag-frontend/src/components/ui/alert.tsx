import React from &apos;react&apos;;
import * as React from &apos;react&apos;;
import { cva, type VariantProps } from &apos;class-variance-authority&apos;;

import { cn } from &apos;./utils&apos;;

const alertVariants = cva(
  &apos;relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current&apos;,
  {
    variants: {
      variant: {
        default: &apos;bg-card text-card-foreground&apos;,
        destructive:
          &apos;text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90&apos;,
      },
    },
    defaultVariants: {
      variant: &apos;default&apos;,
    },
  }
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<&apos;div&apos;> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot=&apos;alert&apos;
      role=&apos;alert&apos;
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<&apos;div&apos;>) {
  return (
    <div
      data-slot=&apos;alert-title&apos;
      className={cn(
        &apos;col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight&apos;,
        className
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<&apos;div&apos;>) {
  return (
    <div
      data-slot=&apos;alert-description&apos;
      className={cn(
        &apos;text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed&apos;,
        className
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
