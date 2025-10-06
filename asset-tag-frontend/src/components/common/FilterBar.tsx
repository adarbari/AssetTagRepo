/**
 * FilterBar Component
 *
 * Standardized filter UI for list pages
 */

import React from &apos;react&apos;;
import { Input } from &apos;../ui/input&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &apos;../ui/select&apos;;
import { Label } from &apos;../ui/label&apos;;
import { Search, Filter, X } from &apos;lucide-react&apos;;

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  placeholder?: string;
  options: FilterOption[];
  currentValue: string;
  onValueChange: (value: string) => void;
  width?: string;
}

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters: FilterConfig[];
  showAdvancedFilters?: boolean;
  onToggleAdvancedFilters?: () => void;
  activeFiltersCount?: number;
  onClearAllFilters?: () => void;
  className?: string;
}

export function FilterBar({
  searchTerm,
  onSearchChange,
  searchPlaceholder = &apos;Search...&apos;,
  filters,
  showAdvancedFilters = false,
  onToggleAdvancedFilters,
  activeFiltersCount = 0,
  onClearAllFilters,
  className = &apos;&apos;,
}: FilterBarProps) {
  const hasActiveFilters = activeFiltersCount > 0 || searchTerm.trim() !== &apos;&apos;;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Filter Row */}
      <div className=&apos;flex items-center gap-2&apos;>
        {/* Search Input */}
        <div className=&apos;relative flex-1 max-w-sm&apos;>
          <Search className=&apos;absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground&apos; />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            className=&apos;pl-9&apos;
          />
        </div>

        {/* Basic Filters */}
        {filters.slice(0, 2).map(filter => (
          <Select
            key={filter.key}
            value={filter.currentValue}
            onValueChange={filter.onValueChange}
          >
            <SelectTrigger className={filter.width || &apos;w-[150px]&apos;}>
              <SelectValue placeholder={filter.placeholder || filter.label} />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {/* Advanced Filters Button */}
        {filters.length > 2 && onToggleAdvancedFilters && (
          <Button
            variant={showAdvancedFilters ? &apos;secondary&apos; : &apos;outline&apos;}
            onClick={onToggleAdvancedFilters}
          >
            <Filter className=&apos;h-4 w-4 mr-2&apos; />
            More Filters
            {activeFiltersCount > 0 && (
              <Badge variant=&apos;destructive&apos; className=&apos;ml-2 px-1 min-w-5 h-5&apos;>
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        )}

        {/* Clear All Filters */}
        {hasActiveFilters && onClearAllFilters && (
          <Button variant=&apos;ghost&apos; size=&apos;sm&apos; onClick={onClearAllFilters}>
            <X className=&apos;h-4 w-4 mr-2&apos; />
            Clear All
          </Button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && filters.length > 2 && (
        <div className=&apos;grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4&apos;>
          {filters.slice(2).map(filter => (
            <div className=&apos;space-y-2&apos; key={filter.key}>
              <Label htmlFor={filter.key}>{filter.label}</Label>
              <Select
                value={filter.currentValue}
                onValueChange={filter.onValueChange}
              >
                <SelectTrigger id={filter.key}>
                  <SelectValue
                    placeholder={filter.placeholder || filter.label}
                  />
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
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className=&apos;flex items-center gap-2 flex-wrap&apos;>
          <span className=&apos;text-sm text-muted-foreground&apos;>Active filters:</span>
          {searchTerm && (
            <Badge variant=&apos;secondary&apos; className=&apos;gap-1&apos;>
              Search: {searchTerm}
              <X
                className=&apos;h-3 w-3 cursor-pointer&apos;
                onClick={() => onSearchChange(&apos;&apos;)}
              />
            </Badge>
          )}
          {filters.map(filter => {
            const isActive =
              filter.currentValue !== &apos;all&apos; && filter.currentValue !== &apos;&apos;;
            if (!isActive) return null;

            const optionLabel =
              filter.options.find(o => o.value === filter.currentValue)
                ?.label || filter.currentValue;
            return (
              <Badge variant=&apos;secondary&apos; className=&apos;gap-1&apos; key={filter.key}>
                {filter.label}: {optionLabel}
                <X
                  className=&apos;h-3 w-3 cursor-pointer&apos;
                  onClick={() => filter.onValueChange(&apos;all&apos;)}
                />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
