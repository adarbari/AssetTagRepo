&apos;use client&apos;;

import * as React from &apos;react&apos;;
import * as SeparatorPrimitive from &apos;@radix-ui/react-separator&apos;;

import { cn } from &apos;./utils&apos;;

function Separator({
  className,
  orientation = &apos;horizontal&apos;,
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot=&apos;separator-root&apos;
      decorative={decorative}
      orientation={orientation}
      className={cn(
        &apos;bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px&apos;,
        className
      )}
      {...props}
    />
  );
}

export { Separator };
