import * as React from &apos;react&apos;;
import { Slot } from &apos;@radix-ui/react-slot&apos;;
import { cva, type VariantProps } from &apos;class-variance-authority&apos;;

import { cn } from &apos;./utils&apos;;

const buttonVariants = cva(
  &quot;inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=&apos;size-&apos;])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive&quot;,
  {
    variants: {
      variant: {
        default: &apos;bg-primary text-primary-foreground hover:bg-primary/90&apos;,
        destructive:
          &apos;bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60&apos;,
        outline:
          &apos;border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50&apos;,
        secondary:
          &apos;bg-secondary text-secondary-foreground hover:bg-secondary/80&apos;,
        ghost:
          &apos;hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50&apos;,
        link: &apos;text-primary underline-offset-4 hover:underline&apos;,
      },
      size: {
        default: &apos;h-9 px-4 py-2 has-[>svg]:px-3&apos;,
        sm: &apos;h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5&apos;,
        lg: &apos;h-10 rounded-md px-6 has-[>svg]:px-4&apos;,
        icon: &apos;size-9 rounded-md&apos;,
      },
    },
    defaultVariants: {
      variant: &apos;default&apos;,
      size: &apos;default&apos;,
    },
  }
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<&apos;button&apos;> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : &apos;button&apos;;

  return (
    <Comp
      ref={ref}
      data-slot=&apos;button&apos;
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
});

Button.displayName = &apos;Button&apos;;

export { Button, buttonVariants };
