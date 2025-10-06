import * as React from &apos;react&apos;;
import { Slot } from &apos;@radix-ui/react-slot&apos;;
import { cva, type VariantProps } from &apos;class-variance-authority&apos;;

import { cn } from &apos;./utils&apos;;

const badgeVariants = cva(
  &apos;inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden&apos;,
  {
    variants: {
      variant: {
        default:
          &apos;border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90&apos;,
        secondary:
          &apos;border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90&apos;,
        destructive:
          &apos;border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60&apos;,
        outline:
          &apos;text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground&apos;,
      },
    },
    defaultVariants: {
      variant: &apos;default&apos;,
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<&apos;span&apos;> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : &apos;span&apos;;

  return (
    <Comp
      data-slot=&apos;badge&apos;
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
