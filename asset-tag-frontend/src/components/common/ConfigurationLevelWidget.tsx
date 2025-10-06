import React from &apos;react&apos;;
/**
 * Configuration Level Widget
 *
 * Shared component for selecting configuration level (User, Site, Asset, Job)
 * Used in both Notification and Alert Configuration pages for consistency.
 */

import { Label } from &apos;../ui/label&apos;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &apos;../ui/select&apos;;
import { Card } from &apos;../ui/card&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import { User, Building2, Package, Briefcase, Info } from &apos;lucide-react&apos;;
import type { ReactNode } from &apos;react&apos;;

export type ConfigLevel = &apos;user&apos; | &apos;site&apos; | &apos;asset&apos; | &apos;job&apos;;

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
      case &apos;user&apos;:
        return <User className=&apos;h-4 w-4&apos; />;
      case &apos;site&apos;:
        return <Building2 className=&apos;h-4 w-4&apos; />;
      case &apos;asset&apos;:
        return <Package className=&apos;h-4 w-4&apos; />;
      case &apos;job&apos;:
        return <Briefcase className=&apos;h-4 w-4&apos; />;
    }
  };

  const getLevelLabel = (levelType: ConfigLevel): string => {
    if (labels && labels[levelType]) {
      return (
        labels[levelType] ||
        levelType.charAt(0).toUpperCase() + levelType.slice(1)
      );
    }
    return levelType.charAt(0).toUpperCase() + levelType.slice(1);
  };

  const getEntityOptions = (
    levelType: ConfigLevel
  ): ConfigurationLevelOption[] => {
    switch (levelType) {
      case &apos;site&apos;:
        return siteOptions;
      case &apos;asset&apos;:
        return assetOptions;
      case &apos;job&apos;:
        return jobOptions;
      default:
        return [];
    }
  };

  const needsEntitySelection = level !== &apos;user&apos;;
  const entityOptions = getEntityOptions(level);

  const isActive =
    showActiveIndicator &&
    activeLevel === level &&
    (level === &apos;user&apos; || activeEntityId === entityId);

  if (compact) {
    return (
      <div className=&apos;flex items-center gap-2&apos;>
        <Select
          value={level}
          onValueChange={value => onLevelChange(value as ConfigLevel)}
        >
          <SelectTrigger className=&apos;w-[180px]&apos;>
            <div className=&apos;flex items-center gap-2&apos;>
              {getLevelIcon(level)}
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            {([&apos;user&apos;, &apos;site&apos;, &apos;asset&apos;, &apos;job&apos;] as ConfigLevel[]).map(
              levelType => (
                <SelectItem
                  key={levelType}
                  value={levelType}
                  disabled={disabledLevels.includes(levelType)}
                >
                  <div className=&apos;flex items-center gap-2&apos;>
                    {getLevelIcon(levelType)}
                    <span>{getLevelLabel(levelType)}</span>
                  </div>
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>

        {needsEntitySelection && entityOptions.length > 0 && onEntityChange && (
          <Select value={entityId} onValueChange={onEntityChange}>
            <SelectTrigger className=&apos;w-[220px]&apos;>
              <SelectValue placeholder={`Select ${level}...`} />
            </SelectTrigger>
            <SelectContent>
              {entityOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {isActive && (
          <Badge variant=&apos;default&apos; className=&apos;bg-green-600&apos;>
            Active
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className=&apos;p-4&apos;>
      <div className=&apos;space-y-4&apos;>
        <div className=&apos;flex items-center justify-between&apos;>
          <div className=&apos;flex items-center gap-2&apos;>
            <Label>Configuration Level</Label>
            {isActive && (
              <Badge variant=&apos;default&apos; className=&apos;bg-green-600&apos;>
                Active Configuration
              </Badge>
            )}
          </div>
        </div>

        {helpText && (
          <div className=&apos;flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md&apos;>
            <Info className=&apos;h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5&apos; />
            <p className=&apos;text-sm text-blue-900&apos;>{helpText}</p>
          </div>
        )}

        <div className=&apos;grid gap-2&apos;>
          {([&apos;user&apos;, &apos;site&apos;, &apos;asset&apos;, &apos;job&apos;] as ConfigLevel[]).map(
            levelType => {
              const isSelected = level === levelType;
              const isDisabled = disabledLevels.includes(levelType);
              const needsEntity = levelType !== &apos;user&apos;;
              const options = getEntityOptions(levelType);

              return (
                <div key={levelType}>
                  <button
                    type=&apos;button&apos;
                    onClick={() => !isDisabled && onLevelChange(levelType)}
                    disabled={isDisabled}
                    className={`w-full p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? &apos;border-primary bg-primary/5&apos;
                        : &apos;border-border hover:border-primary/50 hover:bg-muted/50&apos;
                    } ${isDisabled ? &apos;opacity-50 cursor-not-allowed&apos; : &apos;cursor-pointer&apos;}`}
                  >
                    <div className=&apos;flex items-center gap-3&apos;>
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full ${
                          isSelected
                            ? &apos;bg-primary text-primary-foreground&apos;
                            : &apos;bg-muted&apos;
                        }`}
                      >
                        {getLevelIcon(levelType)}
                      </div>
                      <div className=&apos;flex-1 text-left&apos;>
                        <div className=&apos;flex items-center gap-2&apos;>
                          <span className=&apos;font-medium&apos;>
                            {getLevelLabel(levelType)}
                          </span>
                          {needsEntity && options.length > 0 && (
                            <Badge variant=&apos;outline&apos; className=&apos;text-xs&apos;>
                              {options.length} available
                            </Badge>
                          )}
                        </div>
                        <p className=&apos;text-sm text-muted-foreground&apos;>
                          {levelType === &apos;user&apos; &&
                            &apos;Default settings for all your notifications&apos;}
                          {levelType === &apos;site&apos; &&
                            &apos;Override settings for specific sites&apos;}
                          {levelType === &apos;asset&apos; &&
                            &apos;Override settings for specific assets&apos;}
                          {levelType === &apos;job&apos; &&
                            &apos;Override settings for specific jobs&apos;}
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Entity Selection Dropdown */}
                  {isSelected &&
                    needsEntity &&
                    options.length > 0 &&
                    onEntityChange && (
                      <div className=&apos;mt-2 ml-13 space-y-2&apos;>
                        <Label htmlFor={`${levelType}-select`}>
                          Select {getLevelLabel(levelType)}
                        </Label>
                        <Select value={entityId} onValueChange={onEntityChange}>
                          <SelectTrigger id={`${levelType}-select`}>
                            <SelectValue
                              placeholder={`Choose a ${levelType}...`}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {options.map(option => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                  {/* Warning for empty options */}
                  {isSelected && needsEntity && options.length === 0 && (
                    <div className=&apos;mt-2 ml-13 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-900&apos;>
                      No {levelType}s available. Please create a {levelType}{&apos; &apos;}
                      first.
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      </div>
    </Card>
  );
}
