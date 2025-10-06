import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import { InfoIcon } from 'lucide-react';

interface AlertConfigFieldRendererProps {
  field: AlertConfigField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  allValues?: Record<string, any>; // For dependency checking
}

export function AlertConfigFieldRenderer({
  field,
  value,
  onChange,
  error,
  allValues = {},
}: AlertConfigFieldRendererProps) {
  // Check if field should be shown based on dependencies
  if (field.dependsOn) {
    const dependentValue = allValues[field.dependsOn.field];
    if (dependentValue !== field.dependsOn.value) {
      return null; // Hide field if dependency not met
    }
  }

  const currentValue = value !== undefined ? value : field.defaultValue;

  const renderField = () => {
    switch (field.type) {
      case 'toggle':
        return (
          <div className='flex items-center justify-between'>
            <div className='flex-1'>
              <Label htmlFor={field.key}>{field.label}</Label>
              {field.description && (
                <p className='text-sm text-muted-foreground mt-1'>
                  {field.description}
                </p>
              )}
            </div>
            <Switch
              id={field.key}
              checked={currentValue}
              onCheckedChange={onChange}
            />
          </div>
        );

      case 'number':
      case 'duration':
      case 'percentage':
      case 'threshold':
        return (
          <div className='space-y-2'>
            <Label htmlFor={field.key}>
              {field.label}
              {field.required && (
                <span className='text-destructive ml-1'>*</span>
              )}
            </Label>
            {field.description && (
              <p className='text-sm text-muted-foreground'>
                {field.description}
              </p>
            )}
            <div className='flex items-center gap-2'>
              <Input
                id={field.key}
                type='number'
                value={currentValue}
                onChange={e => onChange(parseFloat(e.target.value))}
                min={field.min}
                max={field.max}
                step={field.step || 1}
                placeholder={field.placeholder}
                className={error ? 'border-destructive' : ''}
              />
              {field.unit && (
                <Badge variant='outline' className='shrink-0'>
                  {field.unit}
                </Badge>
              )}
            </div>
            {field.min !== undefined && field.max !== undefined && (
              <p className='text-xs text-muted-foreground'>
                Range: {field.min} - {field.max} {field.unit}
              </p>
            )}
          </div>
        );

      case 'text':
        return (
          <div className='space-y-2'>
            <Label htmlFor={field.key}>
              {field.label}
              {field.required && (
                <span className='text-destructive ml-1'>*</span>
              )}
            </Label>
            {field.description && (
              <p className='text-sm text-muted-foreground'>
                {field.description}
              </p>
            )}
            <Input
              id={field.key}
              type='text'
              value={currentValue}
              onChange={e => onChange(e.target.value)}
              placeholder={field.placeholder}
              className={error ? 'border-destructive' : ''}
            />
          </div>
        );

      case 'select':
        return (
          <div className='space-y-2'>
            <Label htmlFor={field.key}>
              {field.label}
              {field.required && (
                <span className='text-destructive ml-1'>*</span>
              )}
            </Label>
            {field.description && (
              <p className='text-sm text-muted-foreground'>
                {field.description}
              </p>
            )}
            <Select value={currentValue} onValueChange={onChange}>
              <SelectTrigger
                id={field.key}
                className={error ? 'border-destructive' : ''}
              >
                <SelectValue
                  placeholder={field.placeholder || 'Select an option'}
                />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map(option => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'multiselect': {
        const selectedValues = Array.isArray(currentValue)
          ? currentValue
          : [currentValue];
        const hasAll = selectedValues.includes('all');

        return (
          <div className='space-y-2'>
            <Label>
              {field.label}
              {field.required && (
                <span className='text-destructive ml-1'>*</span>
              )}
            </Label>
            {field.description && (
              <p className='text-sm text-muted-foreground'>
                {field.description}
              </p>
            )}
            <div className='flex flex-wrap gap-2'>
              {field.options?.map(option => {
                const isSelected = hasAll
                  ? option.value === 'all'
                  : selectedValues.includes(option.value);

                return (
                  <Badge
                    key={option.value}
                    variant={isSelected ? 'default' : 'outline'}
                    className='cursor-pointer'
                    onClick={() => {
                      if (option.value === 'all') {
                        onChange(['all']);
                      } else {
                        let newValues = [
                          ...selectedValues.filter(v => v !== 'all'),
                        ];
                        if (isSelected) {
                          newValues = newValues.filter(v => v !== option.value);
                        } else {
                          newValues.push(option.value);
                        }
                        onChange(newValues.length === 0 ? ['all'] : newValues);
                      }
                    }}
                  >
                    {option.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        );
      }

      default:
        return (
          <div className='space-y-2'>
            <Label htmlFor={field.key}>{field.label}</Label>
            <p className='text-sm text-muted-foreground'>
              Field type '{field.type}' not yet implemented
            </p>
          </div>
        );
    }
  };

  return (
    <div className='space-y-2'>
      <div className='flex items-start gap-2'>
        <div className='flex-1'>
          {renderField()}
          {field.helpText && (
            <div className='flex items-center gap-1 mt-2'>
              <InfoIcon className='h-3 w-3 text-muted-foreground' />
              <p className='text-xs text-muted-foreground'>{field.helpText}</p>
            </div>
          )}
          {error && <p className='text-sm text-destructive mt-1'>{error}</p>}
        </div>
      </div>
    </div>
  );
}
