import React from &apos;react&apos;;
&apos;use client&apos;;

import * as React from &apos;react&apos;;
import * as RadioGroupPrimitive from &apos;@radix-ui/react-radio-group&apos;;
import { CircleIcon } from &apos;lucide-react&apos;;

import { cn } from &apos;./utils&apos;;

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot=&apos;radio-group&apos;
      className={cn(&apos;grid gap-3&apos;, className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot=&apos;radio-group-item&apos;
      className={cn(
        &apos;border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50&apos;,
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot=&apos;radio-group-indicator&apos;
        className=&apos;relative flex items-center justify-center&apos;
      >
        <CircleIcon className=&apos;fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2&apos; />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
