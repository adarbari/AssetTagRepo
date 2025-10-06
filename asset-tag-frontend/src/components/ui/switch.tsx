&apos;use client&apos;;

import * as React from &apos;react&apos;;
import * as SwitchPrimitive from &apos;@radix-ui/react-switch&apos;;

import { cn } from &apos;./utils&apos;;

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot=&apos;switch&apos;
      className={cn(
        &apos;peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-switch-background focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50&apos;,
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot=&apos;switch-thumb&apos;
        className={cn(
          &apos;bg-card dark:data-[state=unchecked]:bg-card-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0&apos;
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
