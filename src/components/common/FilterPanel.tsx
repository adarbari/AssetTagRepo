import React, { useState, useMemo } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Filter, X } from "lucide-react";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
  defaultValue?: string;
}

interface FilterPanelProps {
  filters: FilterConfig[];
  values: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClearAll: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  variant?: "popover" | "inline";
  className?: string;
}

export function FilterPanel({
  filters,
  values,
  onFilterChange,
  onClearAll,
  searchValue,
  onSearchChange,
  variant = "popover",
  className,
}: FilterPanelProps) {
  const [showFilters, setShowFilters] = useState(false);

  // Calculate active filters count (excluding search)
  const activeFiltersCount = useMemo(() => {
    return filters.reduce((count, filter) => {
      const value = values[filter.key];
      const isActive = value && value !== filter.defaultValue && value !== "all";
      return count + (isActive ? 1 : 0);
    }, 0);
  }, [filters, values]);

  const hasActiveFilters = activeFiltersCount > 0 || (searchValue && searchValue.trim() !== "");

  const renderFilterContent = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Advanced Filters</h4>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onClearAll();
              onSearchChange?.("");
            }}
            className="h-auto p-1 text-xs"
          >
            Clear All
          </Button>
        )}
      </div>
      
      {filters.map((filter) => (
        <div key={filter.key} className="space-y-2">
          <Label className="text-sm">{filter.label}</Label>
          <Select 
            value={values[filter.key] || filter.defaultValue || "all"} 
            onValueChange={(value) => onFilterChange(filter.key, value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );

  const renderActiveFilters = () => {
    if (!hasActiveFilters) return null;

    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground">Active filters:</span>
        
        {searchValue && searchValue.trim() && (
          <Badge variant="secondary" className="gap-1">
            Search: {searchValue}
            <X
              className="h-3 w-3 cursor-pointer"
              onClick={() => onSearchChange?.("")}
            />
          </Badge>
        )}
        
        {filters.map((filter) => {
          const value = values[filter.key];
          const isActive = value && value !== filter.defaultValue && value !== "all";
          
          if (!isActive) return null;
          
          const option = filter.options.find(opt => opt.value === value);
          const displayValue = option?.label || value;
          
          return (
            <Badge key={filter.key} variant="secondary" className="gap-1">
              {filter.label}: {displayValue}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFilterChange(filter.key, filter.defaultValue || "all")}
              />
            </Badge>
          );
        })}
      </div>
    );
  };

  if (variant === "inline") {
    return (
      <div className={className}>
        <div className="space-y-4">
          {renderFilterContent()}
          {renderActiveFilters()}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Popover open={showFilters} onOpenChange={setShowFilters}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <Filter className="h-4 w-4" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          {renderFilterContent()}
        </PopoverContent>
      </Popover>
      
      {renderActiveFilters()}
    </div>
  );
}

// Hook for managing filter state
export function useFilters(filters: FilterConfig[]) {
  const [filterValues, setFilterValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    filters.forEach(filter => {
      initial[filter.key] = filter.defaultValue || "all";
    });
    return initial;
  });

  const updateFilter = (key: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    const cleared: Record<string, string> = {};
    filters.forEach(filter => {
      cleared[filter.key] = filter.defaultValue || "all";
    });
    setFilterValues(cleared);
  };

  const getActiveFiltersCount = () => {
    return filters.reduce((count, filter) => {
      const value = filterValues[filter.key];
      const isActive = value && value !== filter.defaultValue && value !== "all";
      return count + (isActive ? 1 : 0);
    }, 0);
  };

  return {
    filterValues,
    updateFilter,
    clearAllFilters,
    getActiveFiltersCount,
  };
}
