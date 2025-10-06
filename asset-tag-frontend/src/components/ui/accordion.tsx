&apos;use client&apos;;

import * as React from &apos;react&apos;;
import * as AccordionPrimitive from &apos;@radix-ui/react-accordion&apos;;
import { ChevronDownIcon } from &apos;lucide-react&apos;;

import { cn } from &apos;./utils&apos;;

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot=&apos;accordion&apos; {...props} />;
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot=&apos;accordion-item&apos;
      className={cn(&apos;border-b last:border-b-0&apos;, className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className=&apos;flex&apos;>
      <AccordionPrimitive.Trigger
        data-slot=&apos;accordion-trigger&apos;
        className={cn(
          &apos;focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180&apos;,
          className
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className=&apos;text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200&apos; />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot=&apos;accordion-content&apos;
      className=&apos;data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm&apos;
      {...props}
    >
      <div className={cn(&apos;pt-0 pb-4&apos;, className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
