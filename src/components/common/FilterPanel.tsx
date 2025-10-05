import React from "react";
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Advanced Filters</h4>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearAllFilters}
                  className="h-auto p-1 text-xs"
                >
                  Clear All
                </Button>
              )}
            </div>

            {filters.map((filter) => (
              <div className="space-y-2" key={filter.key}>
                <Label htmlFor={filter.key}>{filter.label}</Label>
                <Select value={filter.currentValue} onValueChange={filter.onValueChange}>
                  <SelectTrigger id={filter.key}>
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
        </PopoverContent>
      </Popover>

      {(activeFiltersCount > 0 || searchTerm) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchTerm && (
            <Badge variant="secondary" className="gap-1">
              Search: {searchTerm}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={onClearSearch}
              />
            </Badge>
          )}
          {filters.map(filter =>
            filter.currentValue !== (filter.defaultOptionValue || "all") && (
              <Badge variant="secondary" className="gap-1" key={filter.key}>
                {filter.label}: {filter.options.find(o => o.value === filter.currentValue)?.label || filter.currentValue}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => filter.onValueChange(filter.defaultOptionValue || "all")}
                />
              </Badge>
            )
          )}
        </div>
      )}
    </>
  );
}

