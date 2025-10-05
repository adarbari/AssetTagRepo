/**
 * Configuration Level Widget
 * 
 * Shared component for selecting configuration level (User, Site, Asset, Job)
 * Used in both Notification and Alert Configuration pages for consistency.
 */

import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { User, Building2, Package, Briefcase, Info } from "lucide-react";
import type { ReactNode } from "react";

export type ConfigLevel = "user" | "site" | "asset" | "job";

interface ConfigurationLevelOption {
  value: string;
  label: string;
}

interface ConfigurationLevelWidgetProps {
  // Current level selection
  level: ConfigLevel;
  onLevelChange: (level: ConfigLevel) => void;
  
  // Entity selection within the level
  entityId?: string;
  onEntityChange?: (entityId: string) => void;
  
  // Options for each level
  siteOptions?: ConfigurationLevelOption[];
  assetOptions?: ConfigurationLevelOption[];
  jobOptions?: ConfigurationLevelOption[];
  
  // Optional label overrides
  labels?: {
    user?: string;
    site?: string;
    asset?: string;
    job?: string;
  };
  
  // Optional help text
  helpText?: string;
  
  // Whether to show in compact mode
  compact?: boolean;
  
  // Whether to disable certain levels
  disabledLevels?: ConfigLevel[];
  
  // Show which config is active
  showActiveIndicator?: boolean;
  activeLevel?: ConfigLevel;
  activeEntityId?: string;
}

export function ConfigurationLevelWidget({
  level,
  onLevelChange,
  entityId,
  onEntityChange,
  siteOptions = [],
  assetOptions = [],
  jobOptions = [],
  labels,
  helpText,
  compact = false,
  disabledLevels = [],
  showActiveIndicator = false,
  activeLevel,
  activeEntityId,
}: ConfigurationLevelWidgetProps) {
  const getLevelIcon = (levelType: ConfigLevel): ReactNode => {
    switch (levelType) {
      case "user":
        return <User className="h-4 w-4" />;
      case "site":
        return <Building2 className="h-4 w-4" />;
      case "asset":
        return <Package className="h-4 w-4" />;
      case "job":
        return <Briefcase className="h-4 w-4" />;
    }
  };

  const getLevelLabel = (levelType: ConfigLevel): string => {
    if (labels && labels[levelType]) {
      return labels[levelType]!;
    }
    return levelType.charAt(0).toUpperCase() + levelType.slice(1);
  };

  const getEntityOptions = (levelType: ConfigLevel): ConfigurationLevelOption[] => {
    switch (levelType) {
      case "site":
        return siteOptions;
      case "asset":
        return assetOptions;
      case "job":
        return jobOptions;
      default:
        return [];
    }
  };

  const needsEntitySelection = level !== "user";
  const entityOptions = getEntityOptions(level);

  const isActive = showActiveIndicator && activeLevel === level && 
    (level === "user" || activeEntityId === entityId);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Select value={level} onValueChange={(value) => onLevelChange(value as ConfigLevel)}>
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center gap-2">
              {getLevelIcon(level)}
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            {(["user", "site", "asset", "job"] as ConfigLevel[]).map((levelType) => (
              <SelectItem 
                key={levelType} 
                value={levelType}
                disabled={disabledLevels.includes(levelType)}
              >
                <div className="flex items-center gap-2">
                  {getLevelIcon(levelType)}
                  <span>{getLevelLabel(levelType)}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {needsEntitySelection && entityOptions.length > 0 && onEntityChange && (
          <Select value={entityId} onValueChange={onEntityChange}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder={`Select ${level}...`} />
            </SelectTrigger>
            <SelectContent>
              {entityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {isActive && (
          <Badge variant="default" className="bg-green-600">
            Active
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label>Configuration Level</Label>
            {isActive && (
              <Badge variant="default" className="bg-green-600">
                Active Configuration
              </Badge>
            )}
          </div>
        </div>

        {helpText && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-900">{helpText}</p>
          </div>
        )}

        <div className="grid gap-2">
          {(["user", "site", "asset", "job"] as ConfigLevel[]).map((levelType) => {
            const isSelected = level === levelType;
            const isDisabled = disabledLevels.includes(levelType);
            const needsEntity = levelType !== "user";
            const options = getEntityOptions(levelType);

            return (
              <div key={levelType}>
                <button
                  type="button"
                  onClick={() => !isDisabled && onLevelChange(levelType)}
                  disabled={isDisabled}
                  className={`w-full p-3 rounded-lg border-2 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  } ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      {getLevelIcon(levelType)}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{getLevelLabel(levelType)}</span>
                        {needsEntity && options.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {options.length} available
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {levelType === "user" && "Default settings for all your notifications"}
                        {levelType === "site" && "Override settings for specific sites"}
                        {levelType === "asset" && "Override settings for specific assets"}
                        {levelType === "job" && "Override settings for specific jobs"}
                      </p>
                    </div>
                  </div>
                </button>

                {/* Entity Selection Dropdown */}
                {isSelected && needsEntity && options.length > 0 && onEntityChange && (
                  <div className="mt-2 ml-13 space-y-2">
                    <Label htmlFor={`${levelType}-select`}>
                      Select {getLevelLabel(levelType)}
                    </Label>
                    <Select value={entityId} onValueChange={onEntityChange}>
                      <SelectTrigger id={`${levelType}-select`}>
                        <SelectValue placeholder={`Choose a ${levelType}...`} />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Warning for empty options */}
                {isSelected && needsEntity && options.length === 0 && (
                  <div className="mt-2 ml-13 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-900">
                    No {levelType}s available. Please create a {levelType} first.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
