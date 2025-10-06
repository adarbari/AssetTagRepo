&apos;use client&apos;;

import * as React from &apos;react&apos;;
import * as ProgressPrimitive from &apos;@radix-ui/react-progress&apos;;

import { cn } from &apos;./utils&apos;;

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot=&apos;progress&apos;
      className={cn(
        &apos;bg-primary/20 relative h-2 w-full overflow-hidden rounded-full&apos;,
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot=&apos;progress-indicator&apos;
        className=&apos;bg-primary h-full w-full flex-1 transition-all&apos;
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
