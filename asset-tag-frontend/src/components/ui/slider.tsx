&apos;use client&apos;;

import * as React from &apos;react&apos;;
import * as SliderPrimitive from &apos;@radix-ui/react-slider&apos;;

import { cn } from &apos;./utils&apos;;

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  );

  return (
    <SliderPrimitive.Root
      data-slot=&apos;slider&apos;
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        &apos;relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col&apos;,
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot=&apos;slider-track&apos;
        className={cn(
          &apos;bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-4 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5&apos;
        )}
      >
        <SliderPrimitive.Range
          data-slot=&apos;slider-range&apos;
          className={cn(
            &apos;bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full&apos;
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot=&apos;slider-thumb&apos;
          key={index}
          className=&apos;border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50&apos;
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
