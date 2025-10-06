import React from &apos;react&apos;;
&apos;use client&apos;;

import * as React from &apos;react&apos;;
import * as TogglePrimitive from &apos;@radix-ui/react-toggle&apos;;
import { cva, type VariantProps } from &apos;class-variance-authority&apos;;

import { cn } from &apos;./utils&apos;;

const toggleVariants = cva(
  &quot;inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*=&apos;size-&apos;])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap&quot;,
  {
    variants: {
      variant: {
        default: &apos;bg-transparent&apos;,
        outline:
          &apos;border border-input bg-transparent hover:bg-accent hover:text-accent-foreground&apos;,
      },
      size: {
        default: &apos;h-9 px-2 min-w-9&apos;,
        sm: &apos;h-8 px-1.5 min-w-8&apos;,
        lg: &apos;h-10 px-2.5 min-w-10&apos;,
      },
    },
    defaultVariants: {
      variant: &apos;default&apos;,
      size: &apos;default&apos;,
    },
  }
);

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot=&apos;toggle&apos;
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
