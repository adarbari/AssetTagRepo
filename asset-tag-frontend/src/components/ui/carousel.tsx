import React from &apos;react&apos;;
&apos;use client&apos;;

import * as React from &apos;react&apos;;
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from &apos;embla-carousel-react&apos;;
import { ArrowLeft, ArrowRight } from &apos;lucide-react&apos;;

import { cn } from &apos;./utils&apos;;
import { Button } from &apos;./button&apos;;

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: &apos;horizontal&apos; | &apos;vertical&apos;;
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error(&apos;useCarousel must be used within a <Carousel />&apos;);
  }

  return context;
}

function Carousel({
  orientation = &apos;horizontal&apos;,
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<&apos;div&apos;> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === &apos;horizontal&apos; ? &apos;x&apos; : &apos;y&apos;,
    },
    plugins
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === &apos;ArrowLeft&apos;) {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === &apos;ArrowRight&apos;) {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );

  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on(&apos;reInit&apos;, onSelect);
    api.on(&apos;select&apos;, onSelect);

    return () => {
      api?.off(&apos;select&apos;, onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === &apos;y&apos; ? &apos;vertical&apos; : &apos;horizontal&apos;),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn(&apos;relative&apos;, className)}
        role=&apos;region&apos;
        aria-roledescription=&apos;carousel&apos;
        data-slot=&apos;carousel&apos;
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({ className, ...props }: React.ComponentProps<&apos;div&apos;>) {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div
      ref={carouselRef}
      className=&apos;overflow-hidden&apos;
      data-slot=&apos;carousel-content&apos;
    >
      <div
        className={cn(
          &apos;flex&apos;,
          orientation === &apos;horizontal&apos; ? &apos;-ml-4&apos; : &apos;-mt-4 flex-col&apos;,
          className
        )}
        {...props}
      />
    </div>
  );
}

function CarouselItem({ className, ...props }: React.ComponentProps<&apos;div&apos;>) {
  const { orientation } = useCarousel();

  return (
    <div
      role=&apos;group&apos;
      aria-roledescription=&apos;slide&apos;
      data-slot=&apos;carousel-item&apos;
      className={cn(
        &apos;min-w-0 shrink-0 grow-0 basis-full&apos;,
        orientation === &apos;horizontal&apos; ? &apos;pl-4&apos; : &apos;pt-4&apos;,
        className
      )}
      {...props}
    />
  );
}

function CarouselPrevious({
  className,
  variant = &apos;outline&apos;,
  size = &apos;icon&apos;,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      data-slot=&apos;carousel-previous&apos;
      variant={variant}
      size={size}
      className={cn(
        &apos;absolute size-8 rounded-full&apos;,
        orientation === &apos;horizontal&apos;
          ? &apos;top-1/2 -left-12 -translate-y-1/2&apos;
          : &apos;-top-12 left-1/2 -translate-x-1/2 rotate-90&apos;,
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft />
      <span className=&apos;sr-only&apos;>Previous slide</span>
    </Button>
  );
}

function CarouselNext({
  className,
  variant = &apos;outline&apos;,
  size = &apos;icon&apos;,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      data-slot=&apos;carousel-next&apos;
      variant={variant}
      size={size}
      className={cn(
        &apos;absolute size-8 rounded-full&apos;,
        orientation === &apos;horizontal&apos;
          ? &apos;top-1/2 -right-12 -translate-y-1/2&apos;
          : &apos;-bottom-12 left-1/2 -translate-x-1/2 rotate-90&apos;,
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight />
      <span className=&apos;sr-only&apos;>Next slide</span>
    </Button>
  );
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};
