&apos;use client&apos;;

import * as React from &apos;react&apos;;
import * as SelectPrimitive from &apos;@radix-ui/react-select&apos;;
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from &apos;lucide-react&apos;;

import { cn } from &apos;./utils&apos;;

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot=&apos;select&apos; {...props} />;
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot=&apos;select-group&apos; {...props} />;
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot=&apos;select-value&apos; {...props} />;
}

function SelectTrigger({
  className,
  size = &apos;default&apos;,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: &apos;sm&apos; | &apos;default&apos;;
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot=&apos;select-trigger&apos;
      data-size={size}
      className={cn(
        &quot;border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*=&apos;text-&apos;])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-input-background px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=&apos;size-&apos;])]:size-4&quot;,
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className=&apos;size-4 opacity-50&apos; />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = &apos;popper&apos;,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot=&apos;select-content&apos;
        className={cn(
          &apos;bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-[10000] max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md&apos;,
          position === &apos;popper&apos; &&
            &apos;data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1&apos;,
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            &apos;p-1&apos;,
            position === &apos;popper&apos; &&
              &apos;h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1&apos;
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot=&apos;select-label&apos;
      className={cn(&apos;text-muted-foreground px-2 py-1.5 text-xs&apos;, className)}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot=&apos;select-item&apos;
      className={cn(
        &quot;focus:bg-accent focus:text-accent-foreground [&_svg:not([class*=&apos;text-&apos;])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=&apos;size-&apos;])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2&quot;,
        className
      )}
      {...props}
    >
      <span className=&apos;absolute right-2 flex size-3.5 items-center justify-center&apos;>
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className=&apos;size-4&apos; />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot=&apos;select-separator&apos;
      className={cn(&apos;bg-border pointer-events-none -mx-1 my-1 h-px&apos;, className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot=&apos;select-scroll-up-button&apos;
      className={cn(
        &apos;flex cursor-default items-center justify-center py-1&apos;,
        className
      )}
      {...props}
    >
      <ChevronUpIcon className=&apos;size-4&apos; />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot=&apos;select-scroll-down-button&apos;
      className={cn(
        &apos;flex cursor-default items-center justify-center py-1&apos;,
        className
      )}
      {...props}
    >
      <ChevronDownIcon className=&apos;size-4&apos; />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
