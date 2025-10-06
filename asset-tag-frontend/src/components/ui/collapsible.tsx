&apos;use client&apos;;

import React from &apos;react&apos;;
import * as CollapsiblePrimitive from &apos;@radix-ui/react-collapsible&apos;;

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot=&apos;collapsible&apos; {...props} />;
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot=&apos;collapsible-trigger&apos;
      {...props}
    />
  );
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot=&apos;collapsible-content&apos;
      {...props}
    />
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
