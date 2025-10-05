/**
 * FilterBar Component
 * 
 * Standardized filter UI for list pages
 */

import React from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
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
import { Label } from "../ui/label";
import { Search, Filter, X } from "lucide-react";

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
  searchPlaceholder = "Search...",
  filters,
  showAdvancedFilters = false,
  onToggleAdvancedFilters,
  activeFiltersCount = 0,
  onClearAllFilters,
  className = "",
}: FilterBarProps) {
  const hasActiveFilters = activeFiltersCount > 0 || searchTerm.trim() !== "";

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Filter Row */}
      <div className="flex items-center gap-2">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Basic Filters */}
        {filters.slice(0, 2).map((filter) => (
          <Select
            key={filter.key}
            value={filter.currentValue}
            onValueChange={filter.onValueChange}
          >
            <SelectTrigger className={filter.width || "w-[150px]"}>
              <SelectValue placeholder={filter.placeholder || filter.label} />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map((option) => (
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
            variant={showAdvancedFilters ? "secondary" : "outline"}
            onClick={onToggleAdvancedFilters}
          >
            <Filter className="h-4 w-4 mr-2" />
            More Filters
            {activeFiltersCount > 0 && (
              <Badge variant="destructive" className="ml-2 px-1 min-w-5 h-5">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        )}

        {/* Clear All Filters */}
        {hasActiveFilters && onClearAllFilters && (
          <Button variant="ghost" size="sm" onClick={onClearAllFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && filters.length > 2 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filters.slice(2).map((filter) => (
            <div className="space-y-2" key={filter.key}>
              <Label htmlFor={filter.key}>{filter.label}</Label>
              <Select
                value={filter.currentValue}
                onValueChange={filter.onValueChange}
              >
                <SelectTrigger id={filter.key}>
                  <SelectValue placeholder={filter.placeholder || filter.label} />
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
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchTerm && (
            <Badge variant="secondary" className="gap-1">
              Search: {searchTerm}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onSearchChange("")}
              />
            </Badge>
          )}
          {filters.map((filter) => {
            const isActive = filter.currentValue !== "all" && filter.currentValue !== "";
            if (!isActive) return null;
            
            const optionLabel = filter.options.find(o => o.value === filter.currentValue)?.label || filter.currentValue;
            return (
              <Badge variant="secondary" className="gap-1" key={filter.key}>
                {filter.label}: {optionLabel}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => filter.onValueChange("all")}
                />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}


