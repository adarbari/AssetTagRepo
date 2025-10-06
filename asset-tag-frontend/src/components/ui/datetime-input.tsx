/**
 * DateTime Input Component
 *
 * Combines date and time selection in a unified input
 * Used for job asset assignments and other datetime needs
 */

import { useState } from 'react';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from './utils';

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
  placeholder = 'Select date and time',
  disabled = false,
  minDate,
  maxDate,
  className,
}: DateTimeInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [time, setTime] = useState(() => {
    if (value) {
      const hours = value.getHours().toString().padStart(2, '0');
      const minutes = value.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    return '09:00';
  });

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      onChange(undefined);
      return;
    }

    // Parse the time input
    const [hours, minutes] = time.split(':').map(Number);

    // Create new date with selected date and time
    const newDate = new Date(selectedDate);
    newDate.setHours(hours, minutes, 0, 0);

    onChange(newDate);
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);

    if (value) {
      const [hours, minutes] = newTime.split(':').map(Number);
      const newDate = new Date(value);
      newDate.setHours(hours, minutes, 0, 0);
      onChange(newDate);
    }
  };

  const handleApply = () => {
    setIsOpen(false);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label>{label}</Label>}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            className={cn(
              'w-full justify-start text-left',
              !value && 'text-muted-foreground'
            )}
            disabled={disabled}
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {value ? (
              format(value, &quot;PPP 'at' h:mm a&quot;)
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <div className='p-3 space-y-3'>
            <Calendar
              mode='single'
              selected={value}
              onSelect={handleDateSelect}
              disabled={date => {
                if (minDate && date < minDate) return true;
                if (maxDate && date > maxDate) return true;
                return false;
              }}
              initialFocus
            />
            <div className='space-y-2 border-t pt-3'>
              <Label htmlFor='time-input'>Time</Label>
              <Input
                id='time-input'
                type='time'
                value={time}
                onChange={e => handleTimeChange(e.target.value)}
                className='w-full'
              />
            </div>
            <Button onClick={handleApply} className='w-full'>
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
