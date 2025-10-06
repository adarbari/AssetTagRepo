&apos;use client&apos;;

import * as React from &apos;react&apos;;
import * as ToggleGroupPrimitive from &apos;@radix-ui/react-toggle-group&apos;;
import { type VariantProps } from &apos;class-variance-authority&apos;;

import { cn } from &apos;./utils&apos;;
import { toggleVariants } from &apos;./toggle&apos;;

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: &apos;default&apos;,
  variant: &apos;default&apos;,
});

function ToggleGroup({
  className,
  variant,
  size,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot=&apos;toggle-group&apos;
      data-variant={variant}
      data-size={size}
      className={cn(
        &apos;group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs&apos;,
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      data-slot=&apos;toggle-group-item&apos;
      data-variant={context.variant || variant}
      data-size={context.size || size}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        &apos;min-w-0 flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l&apos;,
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { ToggleGroup, ToggleGroupItem };
