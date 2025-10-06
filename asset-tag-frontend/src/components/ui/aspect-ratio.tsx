&apos;use client&apos;;

import React from &apos;react&apos;;
import * as AspectRatioPrimitive from &apos;@radix-ui/react-aspect-ratio&apos;;

function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot=&apos;aspect-ratio&apos; {...props} />;
}

export { AspectRatio };
