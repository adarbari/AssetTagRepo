&apos;use client&apos;;

import * as React from &apos;react&apos;;
import { Slot } from &apos;@radix-ui/react-slot&apos;;
import { VariantProps, cva } from &apos;class-variance-authority&apos;;
import { PanelLeftIcon } from &apos;lucide-react&apos;;

import { useIsMobile } from &apos;./use-mobile&apos;;
import { cn } from &apos;./utils&apos;;
import { Button } from &apos;./button&apos;;
import { Input } from &apos;./input&apos;;
import { Separator } from &apos;./separator&apos;;
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from &apos;./sheet&apos;;
import { Skeleton } from &apos;./skeleton&apos;;
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from &apos;./tooltip&apos;;

const SIDEBAR_COOKIE_NAME = &apos;sidebar_state&apos;;
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = &apos;16rem&apos;;
const SIDEBAR_WIDTH_MOBILE = &apos;18rem&apos;;
const SIDEBAR_WIDTH_ICON = &apos;3rem&apos;;
const SIDEBAR_KEYBOARD_SHORTCUT = &apos;b&apos;;

type SidebarContextProps = {
  state: &apos;expanded&apos; | &apos;collapsed&apos;;
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error(&apos;useSidebar must be used within a SidebarProvider.&apos;);
  }

  return context;
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<&apos;div&apos;> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === &apos;function&apos; ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open]
  );

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile(open => !open) : setOpen(open => !open);
  }, [isMobile, setOpen, setOpenMobile]);

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener(&apos;keydown&apos;, handleKeyDown);
    return () => window.removeEventListener(&apos;keydown&apos;, handleKeyDown);
  }, [toggleSidebar]);

  // We add a state so that we can do data-state=&quot;expanded&quot; or &quot;collapsed&quot;.
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? &apos;expanded&apos; : &apos;collapsed&apos;;

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot=&apos;sidebar-wrapper&apos;
          style={
            {
              &apos;--sidebar-width&apos;: SIDEBAR_WIDTH,
              &apos;--sidebar-width-icon&apos;: SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            &apos;group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full&apos;,
            className
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

function Sidebar({
  side = &apos;left&apos;,
  variant = &apos;sidebar&apos;,
  collapsible = &apos;offcanvas&apos;,
  className,
  children,
  ...props
}: React.ComponentProps<&apos;div&apos;> & {
  side?: &apos;left&apos; | &apos;right&apos;;
  variant?: &apos;sidebar&apos; | &apos;floating&apos; | &apos;inset&apos;;
  collapsible?: &apos;offcanvas&apos; | &apos;icon&apos; | &apos;none&apos;;
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === &apos;none&apos;) {
    return (
      <div
        data-slot=&apos;sidebar&apos;
        className={cn(
          &apos;bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col&apos;,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar=&apos;sidebar&apos;
          data-slot=&apos;sidebar&apos;
          data-mobile=&apos;true&apos;
          className=&apos;bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden&apos;
          style={
            {
              &apos;--sidebar-width&apos;: SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className=&apos;sr-only&apos;>
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className=&apos;flex h-full w-full flex-col&apos;>{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className=&apos;group peer text-sidebar-foreground hidden md:block&apos;
      data-state={state}
      data-collapsible={state === &apos;collapsed&apos; ? collapsible : &apos;&apos;}
      data-variant={variant}
      data-side={side}
      data-slot=&apos;sidebar&apos;
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot=&apos;sidebar-gap&apos;
        className={cn(
          &apos;relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear&apos;,
          &apos;group-data-[collapsible=offcanvas]:w-0&apos;,
          &apos;group-data-[side=right]:rotate-180&apos;,
          variant === &apos;floating&apos; || variant === &apos;inset&apos;
            ? &apos;group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]&apos;
            : &apos;group-data-[collapsible=icon]:w-(--sidebar-width-icon)&apos;
        )}
      />
      <div
        data-slot=&apos;sidebar-container&apos;
        className={cn(
          &apos;fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex&apos;,
          side === &apos;left&apos;
            ? &apos;left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]&apos;
            : &apos;right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]&apos;,
          // Adjust the padding for floating and inset variants.
          variant === &apos;floating&apos; || variant === &apos;inset&apos;
            ? &apos;p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]&apos;
            : &apos;group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l&apos;,
          className
        )}
        {...props}
      >
        <div
          data-sidebar=&apos;sidebar&apos;
          data-slot=&apos;sidebar-inner&apos;
          className=&apos;bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm&apos;
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      data-sidebar=&apos;trigger&apos;
      data-slot=&apos;sidebar-trigger&apos;
      variant=&apos;ghost&apos;
      size=&apos;icon&apos;
      className={cn(&apos;size-7&apos;, className)}
      onClick={event => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className=&apos;sr-only&apos;>Toggle Sidebar</span>
    </Button>
  );
}

function SidebarRail({ className, ...props }: React.ComponentProps<&apos;button&apos;>) {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      data-sidebar=&apos;rail&apos;
      data-slot=&apos;sidebar-rail&apos;
      aria-label=&apos;Toggle Sidebar&apos;
      tabIndex={-1}
      onClick={toggleSidebar}
      title=&apos;Toggle Sidebar&apos;
      className={cn(
        &apos;hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex&apos;,
        &apos;in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize&apos;,
        &apos;[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize&apos;,
        &apos;hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full&apos;,
        &apos;[[data-side=left][data-collapsible=offcanvas]_&]:-right-2&apos;,
        &apos;[[data-side=right][data-collapsible=offcanvas]_&]:-left-2&apos;,
        className
      )}
      {...props}
    />
  );
}

function SidebarInset({ className, ...props }: React.ComponentProps<&apos;main&apos;>) {
  return (
    <main
      data-slot=&apos;sidebar-inset&apos;
      className={cn(
        &apos;bg-background relative flex w-full flex-1 flex-col&apos;,
        &apos;md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2&apos;,
        className
      )}
      {...props}
    />
  );
}

function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot=&apos;sidebar-input&apos;
      data-sidebar=&apos;input&apos;
      className={cn(&apos;bg-background h-8 w-full shadow-none&apos;, className)}
      {...props}
    />
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<&apos;div&apos;>) {
  return (
    <div
      data-slot=&apos;sidebar-header&apos;
      data-sidebar=&apos;header&apos;
      className={cn(&apos;flex flex-col gap-2 p-2&apos;, className)}
      {...props}
    />
  );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<&apos;div&apos;>) {
  return (
    <div
      data-slot=&apos;sidebar-footer&apos;
      data-sidebar=&apos;footer&apos;
      className={cn(&apos;flex flex-col gap-2 p-2&apos;, className)}
      {...props}
    />
  );
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot=&apos;sidebar-separator&apos;
      data-sidebar=&apos;separator&apos;
      className={cn(&apos;bg-sidebar-border mx-2 w-auto&apos;, className)}
      {...props}
    />
  );
}

function SidebarContent({ className, ...props }: React.ComponentProps<&apos;div&apos;>) {
  return (
    <div
      data-slot=&apos;sidebar-content&apos;
      data-sidebar=&apos;content&apos;
      className={cn(
        &apos;flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden&apos;,
        className
      )}
      {...props}
    />
  );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<&apos;div&apos;>) {
  return (
    <div
      data-slot=&apos;sidebar-group&apos;
      data-sidebar=&apos;group&apos;
      className={cn(&apos;relative flex w-full min-w-0 flex-col p-2&apos;, className)}
      {...props}
    />
  );
}

function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<&apos;div&apos;> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : &apos;div&apos;;

  return (
    <Comp
      data-slot=&apos;sidebar-group-label&apos;
      data-sidebar=&apos;group-label&apos;
      className={cn(
        &apos;text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0&apos;,
        &apos;group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0&apos;,
        className
      )}
      {...props}
    />
  );
}

function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<&apos;button&apos;> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : &apos;button&apos;;

  return (
    <Comp
      data-slot=&apos;sidebar-group-action&apos;
      data-sidebar=&apos;group-action&apos;
      className={cn(
        &apos;text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0&apos;,
        // Increases the hit area of the button on mobile.
        &apos;after:absolute after:-inset-2 md:after:hidden&apos;,
        &apos;group-data-[collapsible=icon]:hidden&apos;,
        className
      )}
      {...props}
    />
  );
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<&apos;div&apos;>) {
  return (
    <div
      data-slot=&apos;sidebar-group-content&apos;
      data-sidebar=&apos;group-content&apos;
      className={cn(&apos;w-full text-sm&apos;, className)}
      {...props}
    />
  );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<&apos;ul&apos;>) {
  return (
    <ul
      data-slot=&apos;sidebar-menu&apos;
      data-sidebar=&apos;menu&apos;
      className={cn(&apos;flex w-full min-w-0 flex-col gap-1&apos;, className)}
      {...props}
    />
  );
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<&apos;li&apos;>) {
  return (
    <li
      data-slot=&apos;sidebar-menu-item&apos;
      data-sidebar=&apos;menu-item&apos;
      className={cn(&apos;group/menu-item relative&apos;, className)}
      {...props}
    />
  );
}

const sidebarMenuButtonVariants = cva(
  &apos;peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0&apos;,
  {
    variants: {
      variant: {
        default: &apos;hover:bg-sidebar-accent hover:text-sidebar-accent-foreground&apos;,
        outline:
          &apos;bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]&apos;,
      },
      size: {
        default: &apos;h-8 text-sm&apos;,
        sm: &apos;h-7 text-xs&apos;,
        lg: &apos;h-12 text-sm group-data-[collapsible=icon]:p-0!&apos;,
      },
    },
    defaultVariants: {
      variant: &apos;default&apos;,
      size: &apos;default&apos;,
    },
  }
);

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = &apos;default&apos;,
  size = &apos;default&apos;,
  tooltip,
  className,
  ...props
}: React.ComponentProps<&apos;button&apos;> & {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string | React.ComponentProps<typeof TooltipContent>;
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const Comp = asChild ? Slot : &apos;button&apos;;
  const { isMobile, state } = useSidebar();

  const button = (
    <Comp
      data-slot=&apos;sidebar-menu-button&apos;
      data-sidebar=&apos;menu-button&apos;
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  );

  if (!tooltip) {
    return button;
  }

  if (typeof tooltip === &apos;string&apos;) {
    tooltip = {
      children: tooltip,
    };
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side=&apos;right&apos;
        align=&apos;center&apos;
        hidden={state !== &apos;collapsed&apos; || isMobile}
        {...tooltip}
      />
    </Tooltip>
  );
}

function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: React.ComponentProps<&apos;button&apos;> & {
  asChild?: boolean;
  showOnHover?: boolean;
}) {
  const Comp = asChild ? Slot : &apos;button&apos;;

  return (
    <Comp
      data-slot=&apos;sidebar-menu-action&apos;
      data-sidebar=&apos;menu-action&apos;
      className={cn(
        &apos;text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0&apos;,
        // Increases the hit area of the button on mobile.
        &apos;after:absolute after:-inset-2 md:after:hidden&apos;,
        &apos;peer-data-[size=sm]/menu-button:top-1&apos;,
        &apos;peer-data-[size=default]/menu-button:top-1.5&apos;,
        &apos;peer-data-[size=lg]/menu-button:top-2.5&apos;,
        &apos;group-data-[collapsible=icon]:hidden&apos;,
        showOnHover &&
          &apos;peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0&apos;,
        className
      )}
      {...props}
    />
  );
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<&apos;div&apos;>) {
  return (
    <div
      data-slot=&apos;sidebar-menu-badge&apos;
      data-sidebar=&apos;menu-badge&apos;
      className={cn(
        &apos;text-sidebar-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none&apos;,
        &apos;peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground&apos;,
        &apos;peer-data-[size=sm]/menu-button:top-1&apos;,
        &apos;peer-data-[size=default]/menu-button:top-1.5&apos;,
        &apos;peer-data-[size=lg]/menu-button:top-2.5&apos;,
        &apos;group-data-[collapsible=icon]:hidden&apos;,
        className
      )}
      {...props}
    />
  );
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<&apos;div&apos;> & {
  showIcon?: boolean;
}) {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);

  return (
    <div
      data-slot=&apos;sidebar-menu-skeleton&apos;
      data-sidebar=&apos;menu-skeleton&apos;
      className={cn(&apos;flex h-8 items-center gap-2 rounded-md px-2&apos;, className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className=&apos;size-4 rounded-md&apos;
          data-sidebar=&apos;menu-skeleton-icon&apos;
        />
      )}
      <Skeleton
        className=&apos;h-4 max-w-(--skeleton-width) flex-1&apos;
        data-sidebar=&apos;menu-skeleton-text&apos;
        style={
          {
            &apos;--skeleton-width&apos;: width,
          } as React.CSSProperties
        }
      />
    </div>
  );
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<&apos;ul&apos;>) {
  return (
    <ul
      data-slot=&apos;sidebar-menu-sub&apos;
      data-sidebar=&apos;menu-sub&apos;
      className={cn(
        &apos;border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5&apos;,
        &apos;group-data-[collapsible=icon]:hidden&apos;,
        className
      )}
      {...props}
    />
  );
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<&apos;li&apos;>) {
  return (
    <li
      data-slot=&apos;sidebar-menu-sub-item&apos;
      data-sidebar=&apos;menu-sub-item&apos;
      className={cn(&apos;group/menu-sub-item relative&apos;, className)}
      {...props}
    />
  );
}

function SidebarMenuSubButton({
  asChild = false,
  size = &apos;md&apos;,
  isActive = false,
  className,
  ...props
}: React.ComponentProps<&apos;a&apos;> & {
  asChild?: boolean;
  size?: &apos;sm&apos; | &apos;md&apos;;
  isActive?: boolean;
}) {
  const Comp = asChild ? Slot : &apos;a&apos;;

  return (
    <Comp
      data-slot=&apos;sidebar-menu-sub-button&apos;
      data-sidebar=&apos;menu-sub-button&apos;
      data-size={size}
      data-active={isActive}
      className={cn(
        &apos;text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0&apos;,
        &apos;data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground&apos;,
        size === &apos;sm&apos; && &apos;text-xs&apos;,
        size === &apos;md&apos; && &apos;text-sm&apos;,
        &apos;group-data-[collapsible=icon]:hidden&apos;,
        className
      )}
      {...props}
    />
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};
