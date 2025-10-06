&apos;use client&apos;;

import * as React from &apos;react&apos;;
import * as DialogPrimitive from &apos;@radix-ui/react-dialog&apos;;
import { XIcon } from &apos;lucide-react&apos;;

import { cn } from &apos;./utils&apos;;

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot=&apos;dialog&apos; {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot=&apos;dialog-trigger&apos; {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot=&apos;dialog-portal&apos; {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot=&apos;dialog-close&apos; {...props} />;
}

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentProps<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      data-slot=&apos;dialog-overlay&apos;
      className={cn(
        &apos;data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-[9999] bg-black/50&apos;,
        className
      )}
      {...props}
    />
  );
});
DialogOverlay.displayName = &apos;DialogOverlay&apos;;

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal data-slot=&apos;dialog-portal&apos;>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot=&apos;dialog-content&apos;
        aria-modal=&apos;true&apos;
        className={cn(
          &apos;bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-[9999] grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg&apos;,
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          aria-label=&apos;Close dialog&apos;
          className=&quot;ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=&apos;size-&apos;])]:size-4&quot;
        >
          <XIcon />
          <span className=&apos;sr-only&apos;>Close dialog</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<&apos;div&apos;>) {
  return (
    <div
      data-slot=&apos;dialog-header&apos;
      className={cn(&apos;flex flex-col gap-2 text-center sm:text-left&apos;, className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<&apos;div&apos;>) {
  return (
    <div
      data-slot=&apos;dialog-footer&apos;
      className={cn(
        &apos;flex flex-col-reverse gap-2 sm:flex-row sm:justify-end&apos;,
        className
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot=&apos;dialog-title&apos;
      className={cn(&apos;text-lg leading-none font-semibold&apos;, className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot=&apos;dialog-description&apos;
      className={cn(&apos;text-muted-foreground text-sm&apos;, className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
