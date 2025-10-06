import React from &apos;react&apos;;
/**
 * DateTime Input Component
 *
 * Combines date and time selection in a unified input
 * Used for job asset assignments and other datetime needs
 */

import { useState } from &apos;react&apos;;
import { Calendar } from &apos;./calendar&apos;;
import { Popover, PopoverContent, PopoverTrigger } from &apos;./popover&apos;;
import { Button } from &apos;./button&apos;;
import { Input } from &apos;./input&apos;;
import { Label } from &apos;./label&apos;;
import { Calendar as CalendarIcon } from &apos;lucide-react&apos;;
import { format } from &apos;date-fns&apos;;
import { cn } from &apos;./utils&apos;;

interface DateTimeInputProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export function DateTimeInput({
  value,
  onChange,
  label,
  placeholder = &apos;Select date and time&apos;,
  disabled = false,
  minDate,
  maxDate,
  className,
}: DateTimeInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [time, setTime] = useState(() => {
    if (value) {
      const hours = value.getHours().toString().padStart(2, &apos;0&apos;);
      const minutes = value.getMinutes().toString().padStart(2, &apos;0&apos;);
      return `${hours}:${minutes}`;
    }
    return &apos;09:00&apos;;
  });

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      onChange(undefined);
      return;
    }

    // Parse the time input
    const [hours, minutes] = time.split(&apos;:&apos;).map(Number);

    // Create new date with selected date and time
    const newDate = new Date(selectedDate);
    newDate.setHours(hours, minutes, 0, 0);

    onChange(newDate);
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);

    if (value) {
      const [hours, minutes] = newTime.split(&apos;:&apos;).map(Number);
      const newDate = new Date(value);
      newDate.setHours(hours, minutes, 0, 0);
      onChange(newDate);
    }
  };

  const handleApply = () => {
    setIsOpen(false);
  };

  return (
    <div className={cn(&apos;space-y-2&apos;, className)}>
      {label && <Label>{label}</Label>}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant=&apos;outline&apos;
            className={cn(
              &apos;w-full justify-start text-left&apos;,
              !value && &apos;text-muted-foreground&apos;
            )}
            disabled={disabled}
          >
            <CalendarIcon className=&apos;mr-2 h-4 w-4&apos; />
            {value ? (
              format(value, &quot;PPP &apos;at&apos; h:mm a&quot;)
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className=&apos;w-auto p-0&apos; align=&apos;start&apos;>
          <div className=&apos;p-3 space-y-3&apos;>
            <Calendar
              mode=&apos;single&apos;
              selected={value}
              onSelect={handleDateSelect}
              disabled={date => {
                if (minDate && date < minDate) return true;
                if (maxDate && date > maxDate) return true;
                return false;
              }}
              initialFocus
            />
            <div className=&apos;space-y-2 border-t pt-3&apos;>
              <Label htmlFor=&apos;time-input&apos;>Time</Label>
              <Input
                id=&apos;time-input&apos;
                type=&apos;time&apos;
                value={time}
                onChange={e => handleTimeChange(e.target.value)}
                className=&apos;w-full&apos;
              />
            </div>
            <Button onClick={handleApply} className=&apos;w-full&apos;>
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
