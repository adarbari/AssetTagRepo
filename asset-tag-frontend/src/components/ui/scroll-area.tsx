import React from &apos;react&apos;;
&apos;use client&apos;;

import * as React from &apos;react&apos;;
import * as ScrollAreaPrimitive from &apos;@radix-ui/react-scroll-area&apos;;

import { cn } from &apos;./utils&apos;;

function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot=&apos;scroll-area&apos;
      className={cn(&apos;relative&apos;, className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot=&apos;scroll-area-viewport&apos;
        className=&apos;focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1&apos;
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = &apos;vertical&apos;,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot=&apos;scroll-area-scrollbar&apos;
      orientation={orientation}
      className={cn(
        &apos;flex touch-none p-px transition-colors select-none&apos;,
        orientation === &apos;vertical&apos; &&
          &apos;h-full w-2.5 border-l border-l-transparent&apos;,
        orientation === &apos;horizontal&apos; &&
          &apos;h-2.5 flex-col border-t border-t-transparent&apos;,
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot=&apos;scroll-area-thumb&apos;
        className=&apos;bg-border relative flex-1 rounded-full&apos;
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };
