&apos;use client&apos;;

import * as React from &apos;react&apos;;
import * as HoverCardPrimitive from &apos;@radix-ui/react-hover-card&apos;;

import { cn } from &apos;./utils&apos;;

function HoverCard({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot=&apos;hover-card&apos; {...props} />;
}

function HoverCardTrigger({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return (
    <HoverCardPrimitive.Trigger data-slot=&apos;hover-card-trigger&apos; {...props} />
  );
}

function HoverCardContent({
  className,
  align = &apos;center&apos;,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal data-slot=&apos;hover-card-portal&apos;>
      <HoverCardPrimitive.Content
        data-slot=&apos;hover-card-content&apos;
        align={align}
        sideOffset={sideOffset}
        className={cn(
          &apos;bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden&apos;,
          className
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };
