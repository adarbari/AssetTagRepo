&apos;use client&apos;;

import * as React from &apos;react&apos;;
import { ChevronLeft, ChevronRight } from &apos;lucide-react&apos;;
import { DayPicker } from &apos;react-day-picker&apos;;
import &apos;react-day-picker/dist/style.css&apos;;

import { cn } from &apos;./utils&apos;;
import { buttonVariants } from &apos;./button&apos;;

const Calendar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof DayPicker>
>(({ className, classNames, showOutsideDays = true, ...props }, ref) => {
  return (
    <div ref={ref}>
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn(&apos;p-3&apos;, className)}
        classNames={{
          months: &apos;flex flex-col sm:flex-row gap-2&apos;,
          month: &apos;flex flex-col gap-4&apos;,
          caption: &apos;flex justify-center pt-1 relative items-center w-full&apos;,
          caption_label: &apos;text-sm font-medium&apos;,
          nav: &apos;flex items-center gap-1&apos;,
          nav_button: cn(
            buttonVariants({ variant: &apos;outline&apos; }),
            &apos;size-7 bg-transparent p-0 opacity-50 hover:opacity-100&apos;
          ),
          nav_button_previous: &apos;absolute left-1&apos;,
          nav_button_next: &apos;absolute right-1&apos;,
          table: &apos;w-full border-collapse space-x-1&apos;,
          head_row: &apos;flex&apos;,
          head_cell:
            &apos;text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]&apos;,
          row: &apos;flex w-full mt-2&apos;,
          cell: cn(
            &apos;relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md&apos;,
            props.mode === &apos;range&apos;
              ? &apos;[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md&apos;
              : &apos;[&:has([aria-selected])]:rounded-md&apos;
          ),
          day: cn(
            buttonVariants({ variant: &apos;ghost&apos; }),
            &apos;size-8 p-0 font-normal aria-selected:opacity-100&apos;
          ),
          day_range_start:
            &apos;day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground&apos;,
          day_range_end:
            &apos;day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground&apos;,
          day_selected:
            &apos;bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground&apos;,
          day_today: &apos;bg-accent text-accent-foreground&apos;,
          day_outside:
            &apos;day-outside text-muted-foreground aria-selected:text-muted-foreground&apos;,
          day_disabled: &apos;text-muted-foreground opacity-50&apos;,
          day_range_middle:
            &apos;aria-selected:bg-accent aria-selected:text-accent-foreground&apos;,
          day_hidden: &apos;invisible&apos;,
          ...classNames,
        }}
        components={{
          IconLeft: ({ className, ...props }) => (
            <ChevronLeft className={cn(&apos;size-4&apos;, className)} {...props} />
          ),
          IconRight: ({ className, ...props }) => (
            <ChevronRight className={cn(&apos;size-4&apos;, className)} {...props} />
          ),
        }}
        {...props}
      />
    </div>
  );
});

Calendar.displayName = &apos;Calendar&apos;;

export { Calendar };
