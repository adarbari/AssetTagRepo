import React from &apos;react&apos;;
&apos;use client&apos;;

import * as React from &apos;react&apos;;
import * as LabelPrimitive from &apos;@radix-ui/react-label&apos;;

import { cn } from &apos;./utils&apos;;

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot=&apos;label&apos;
      className={cn(
        &apos;flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50&apos;,
        className
      )}
      {...props}
    />
  );
}

export { Label };
