import React from &apos;react&apos;;
&apos;use client&apos;;

import * as React from &apos;react&apos;;
import * as SheetPrimitive from &apos;@radix-ui/react-dialog&apos;;
import { XIcon } from &apos;lucide-react&apos;;

import { cn } from &apos;./utils&apos;;

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot=&apos;sheet&apos; {...props} />;
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot=&apos;sheet-trigger&apos; {...props} />;
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot=&apos;sheet-close&apos; {...props} />;
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot=&apos;sheet-portal&apos; {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot=&apos;sheet-overlay&apos;
      className={cn(
        &apos;data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50&apos;,
        className
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = &apos;right&apos;,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: &apos;top&apos; | &apos;right&apos; | &apos;bottom&apos; | &apos;left&apos;;
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot=&apos;sheet-content&apos;
        className={cn(
          &apos;bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500&apos;,
          side === &apos;right&apos; &&
            &apos;data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm&apos;,
          side === &apos;left&apos; &&
            &apos;data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm&apos;,
          side === &apos;top&apos; &&
            &apos;data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b&apos;,
          side === &apos;bottom&apos; &&
            &apos;data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t&apos;,
          className
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className=&apos;ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none&apos;>
          <XIcon className=&apos;size-4&apos; />
          <span className=&apos;sr-only&apos;>Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<&apos;div&apos;>) {
  return (
    <div
      data-slot=&apos;sheet-header&apos;
      className={cn(&apos;flex flex-col gap-1.5 p-4&apos;, className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<&apos;div&apos;>) {
  return (
    <div
      data-slot=&apos;sheet-footer&apos;
      className={cn(&apos;mt-auto flex flex-col gap-2 p-4&apos;, className)}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot=&apos;sheet-title&apos;
      className={cn(&apos;text-foreground font-semibold&apos;, className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot=&apos;sheet-description&apos;
      className={cn(&apos;text-muted-foreground text-sm&apos;, className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
