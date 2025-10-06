import React from &apos;react&apos;;
import { Label } from &apos;../ui/label&apos;;
import { Input } from &apos;../ui/input&apos;;
import { Switch } from &apos;../ui/switch&apos;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &apos;../ui/select&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import { InfoIcon } from &apos;lucide-react&apos;;

interface anyRendererProps {
  field: any;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  allValues?: Record<string, unknown>; // For dependency checking
}

export function anyRenderer({
  field,
  value,
  onChange,
  error,
  allValues = {},
}: anyRendererProps) {
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
      case &apos;toggle&apos;:
        return (
          <div className=&apos;flex items-center justify-between&apos;>
            <div className=&apos;flex-1&apos;>
              <Label htmlFor={field.key}>{field.label}</Label>
              {field.description && (
                <p className=&apos;text-sm text-muted-foreground mt-1&apos;>
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

      case &apos;number&apos;:
      case &apos;duration&apos;:
      case &apos;percentage&apos;:
      case &apos;threshold&apos;:
        return (
          <div className=&apos;space-y-2&apos;>
            <Label htmlFor={field.key}>
              {field.label}
              {field.required && (
                <span className=&apos;text-destructive ml-1&apos;>*</span>
              )}
            </Label>
            {field.description && (
              <p className=&apos;text-sm text-muted-foreground&apos;>
                {field.description}
              </p>
            )}
            <div className=&apos;flex items-center gap-2&apos;>
              <Input
                id={field.key}
                type=&apos;number&apos;
                value={currentValue}
                onChange={e => onChange(parseFloat(e.target.value))}
                min={field.min}
                max={field.max}
                step={field.step || 1}
                placeholder={field.placeholder}
                className={error ? &apos;border-destructive&apos; : &apos;&apos;}
              />
              {field.unit && (
                <Badge variant=&apos;outline&apos; className=&apos;shrink-0&apos;>
                  {field.unit}
                </Badge>
              )}
            </div>
            {field.min !== undefined && field.max !== undefined && (
              <p className=&apos;text-xs text-muted-foreground&apos;>
                Range: {field.min} - {field.max} {field.unit}
              </p>
            )}
          </div>
        );

      case &apos;text&apos;:
        return (
          <div className=&apos;space-y-2&apos;>
            <Label htmlFor={field.key}>
              {field.label}
              {field.required && (
                <span className=&apos;text-destructive ml-1&apos;>*</span>
              )}
            </Label>
            {field.description && (
              <p className=&apos;text-sm text-muted-foreground&apos;>
                {field.description}
              </p>
            )}
            <Input
              id={field.key}
              type=&apos;text&apos;
              value={currentValue}
              onChange={e => onChange(e.target.value)}
              placeholder={field.placeholder}
              className={error ? &apos;border-destructive&apos; : &apos;&apos;}
            />
          </div>
        );

      case &apos;select&apos;:
        return (
          <div className=&apos;space-y-2&apos;>
            <Label htmlFor={field.key}>
              {field.label}
              {field.required && (
                <span className=&apos;text-destructive ml-1&apos;>*</span>
              )}
            </Label>
            {field.description && (
              <p className=&apos;text-sm text-muted-foreground&apos;>
                {field.description}
              </p>
            )}
            <Select value={currentValue} onValueChange={onChange}>
              <SelectTrigger
                id={field.key}
                className={error ? &apos;border-destructive&apos; : &apos;&apos;}
              >
                <SelectValue
                  placeholder={field.placeholder || &apos;Select an option&apos;}
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

      case &apos;multiselect&apos;: {
        const selectedValues = Array.isArray(currentValue)
          ? currentValue
          : [currentValue];
        const hasAll = selectedValues.includes(&apos;all&apos;);

        return (
          <div className=&apos;space-y-2&apos;>
            <Label>
              {field.label}
              {field.required && (
                <span className=&apos;text-destructive ml-1&apos;>*</span>
              )}
            </Label>
            {field.description && (
              <p className=&apos;text-sm text-muted-foreground&apos;>
                {field.description}
              </p>
            )}
            <div className=&apos;flex flex-wrap gap-2&apos;>
              {field.options?.map(option => {
                const isSelected = hasAll
                  ? option.value === &apos;all&apos;
                  : selectedValues.includes(option.value);

                return (
                  <Badge
                    key={option.value}
                    variant={isSelected ? &apos;default&apos; : &apos;outline&apos;}
                    className=&apos;cursor-pointer&apos;
                    onClick={() => {
                      if (option.value === &apos;all&apos;) {
                        onChange([&apos;all&apos;]);
                      } else {
                        let newValues = [
                          ...selectedValues.filter(v => v !== &apos;all&apos;),
                        ];
                        if (isSelected) {
                          newValues = newValues.filter(v => v !== option.value);
                        } else {
                          newValues.push(option.value);
                        }
                        onChange(newValues.length === 0 ? [&apos;all&apos;] : newValues);
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
          <div className=&apos;space-y-2&apos;>
            <Label htmlFor={field.key}>{field.label}</Label>
            <p className=&apos;text-sm text-muted-foreground&apos;>
              Field type &apos;{field.type}&apos; not yet implemented
            </p>
          </div>
        );
    }
  };

  return (
    <div className=&apos;space-y-2&apos;>
      <div className=&apos;flex items-start gap-2&apos;>
        <div className=&apos;flex-1&apos;>
          {renderField()}
          {field.helpText && (
            <div className=&apos;flex items-center gap-1 mt-2&apos;>
              <InfoIcon className=&apos;h-3 w-3 text-muted-foreground&apos; />
              <p className=&apos;text-xs text-muted-foreground&apos;>{field.helpText}</p>
            </div>
          )}
          {error && <p className=&apos;text-sm text-destructive mt-1&apos;>{error}</p>}
        </div>
      </div>
    </div>
  );
}
