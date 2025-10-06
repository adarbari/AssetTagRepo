import React from &apos;react&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import { Label } from &apos;../ui/label&apos;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &apos;../ui/select&apos;;
import { Popover, PopoverContent, PopoverTrigger } from &apos;../ui/popover&apos;;
import { Filter, X } from &apos;lucide-react&apos;;

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
  currentValue: string;
  onValueChange: (value: string) => void;
  defaultOptionValue?: string;
}

interface FilterPanelProps {
  filters: FilterConfig[];
  activeFiltersCount: number;
  onClearAllFilters: () => void;
  showFilters: boolean;
  onShowFiltersChange: (open: boolean) => void;
  searchTerm?: string;
  onClearSearch?: () => void;
}

export function FilterPanel({
  filters,
  activeFiltersCount,
  onClearAllFilters,
  showFilters,
  onShowFiltersChange,
  searchTerm,
  onClearSearch,
}: FilterPanelProps) {
  return (
    <>
      <Popover open={showFilters} onOpenChange={onShowFiltersChange}>
        <PopoverTrigger asChild>
          <Button variant=&apos;outline&apos; size=&apos;icon&apos; className=&apos;relative&apos;>
            <Filter className=&apos;h-4 w-4&apos; />
            {activeFiltersCount > 0 && (
              <span className=&apos;absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center&apos;>
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className=&apos;w-80&apos; align=&apos;end&apos;>
          <div className=&apos;space-y-4&apos;>
            <div className=&apos;flex items-center justify-between&apos;>
              <h4 className=&apos;font-medium&apos;>Advanced Filters</h4>
              {activeFiltersCount > 0 && (
                <Button
                  variant=&apos;ghost&apos;
                  size=&apos;sm&apos;
                  onClick={onClearAllFilters}
                  className=&apos;h-auto p-1 text-xs&apos;
                >
                  Clear All
                </Button>
              )}
            </div>

            {filters.map(filter => (
              <div className=&apos;space-y-2&apos; key={filter.key}>
                <Label htmlFor={filter.key}>{filter.label}</Label>
                <Select
                  value={filter.currentValue}
                  onValueChange={filter.onValueChange}
                >
                  <SelectTrigger id={filter.key}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filter.options.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {(activeFiltersCount > 0 || searchTerm) && (
        <div className=&apos;flex items-center gap-2 flex-wrap&apos;>
          <span className=&apos;text-sm text-muted-foreground&apos;>Active filters:</span>
          {searchTerm && (
            <Badge variant=&apos;secondary&apos; className=&apos;gap-1&apos;>
              Search: {searchTerm}
              <X className=&apos;h-3 w-3 cursor-pointer&apos; onClick={onClearSearch} />
            </Badge>
          )}
          {filters.map(
            filter =>
              filter.currentValue !== (filter.defaultOptionValue || &apos;all&apos;) && (
                <Badge variant=&apos;secondary&apos; className=&apos;gap-1&apos; key={filter.key}>
                  {filter.label}:{&apos; &apos;}
                  {filter.options.find(o => o.value === filter.currentValue)
                    ?.label || filter.currentValue}
                  <X
                    className=&apos;h-3 w-3 cursor-pointer&apos;
                    onClick={() =>
                      filter.onValueChange(filter.defaultOptionValue || &apos;all&apos;)
                    }
                  />
                </Badge>
              )
          )}
        </div>
      )}
    </>
  );
}
