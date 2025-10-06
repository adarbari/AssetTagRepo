import React from &apos;react&apos;;
&apos;use client&apos;;

import * as React from &apos;react&apos;;
import { Command as CommandPrimitive } from &apos;cmdk&apos;;
import { SearchIcon } from &apos;lucide-react&apos;;

import { cn } from &apos;./utils&apos;;
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from &apos;./dialog&apos;;

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot=&apos;command&apos;
      className={cn(
        &apos;bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md&apos;,
        className
      )}
      {...props}
    />
  );
}

function CommandDialog({
  title = &apos;Command Palette&apos;,
  description = &apos;Search for a command to run...&apos;,
  children,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string;
  description?: string;
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className=&apos;sr-only&apos;>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent className=&apos;overflow-hidden p-0&apos;>
        <Command className=&apos;[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5&apos;>
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot=&apos;command-input-wrapper&apos;
      className=&apos;flex h-9 items-center gap-2 border-b px-3&apos;
    >
      <SearchIcon className=&apos;size-4 shrink-0 opacity-50&apos; />
      <CommandPrimitive.Input
        data-slot=&apos;command-input&apos;
        className={cn(
          &apos;placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50&apos;,
          className
        )}
        {...props}
      />
    </div>
  );
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot=&apos;command-list&apos;
      className={cn(
        &apos;max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto&apos;,
        className
      )}
      {...props}
    />
  );
}

function CommandEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot=&apos;command-empty&apos;
      className=&apos;py-6 text-center text-sm&apos;
      {...props}
    />
  );
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot=&apos;command-group&apos;
      className={cn(
        &apos;text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium&apos;,
        className
      )}
      {...props}
    />
  );
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot=&apos;command-separator&apos;
      className={cn(&apos;bg-border -mx-1 h-px&apos;, className)}
      {...props}
    />
  );
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot=&apos;command-item&apos;
      className={cn(
        &quot;data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*=&apos;text-&apos;])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=&apos;size-&apos;])]:size-4&quot;,
        className
      )}
      {...props}
    />
  );
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<&apos;span&apos;>) {
  return (
    <span
      data-slot=&apos;command-shortcut&apos;
      className={cn(
        &apos;text-muted-foreground ml-auto text-xs tracking-widest&apos;,
        className
      )}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
