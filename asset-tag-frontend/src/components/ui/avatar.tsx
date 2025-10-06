&apos;use client&apos;;

import * as React from &apos;react&apos;;
import * as AvatarPrimitive from &apos;@radix-ui/react-avatar&apos;;

import { cn } from &apos;./utils&apos;;

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot=&apos;avatar&apos;
      className={cn(
        &apos;relative flex size-10 shrink-0 overflow-hidden rounded-full&apos;,
        className
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot=&apos;avatar-image&apos;
      className={cn(&apos;aspect-square size-full&apos;, className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot=&apos;avatar-fallback&apos;
      className={cn(
        &apos;bg-muted flex size-full items-center justify-center rounded-full&apos;,
        className
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
