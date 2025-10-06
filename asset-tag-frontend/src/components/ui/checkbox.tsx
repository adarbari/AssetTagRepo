import React from &apos;react&apos;;
&apos;use client&apos;;

import * as React from &apos;react&apos;;
import * as CheckboxPrimitive from &apos;@radix-ui/react-checkbox&apos;;
import { CheckIcon } from &apos;lucide-react&apos;;

import { cn } from &apos;./utils&apos;;

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot=&apos;checkbox&apos;
      className={cn(
        &apos;peer border bg-input-background dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50&apos;,
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot=&apos;checkbox-indicator&apos;
        className=&apos;flex items-center justify-center text-current transition-none&apos;
      >
        <CheckIcon className=&apos;size-3.5&apos; />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
