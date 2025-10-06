import React from &apos;react&apos;;

/**
 * Configuration Inspector
 *
 * Shows which notification configuration is being applied and why.
 * Displays the inheritance chain and overrides for debugging.
 */

import { useState, useEffect } from &apos;react&apos;;
import { Card } from &apos;../ui/card&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Separator } from &apos;../ui/separator&apos;;
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from &apos;../ui/dialog&apos;;
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Settings,
  User,
  Building2,
  Package,
  ChevronRight,
  Eye,
  Mail,
  MessageSquare,
  Smartphone,
  Webhook,
} from &apos;lucide-react&apos;;
import type { Asset, Site } from &apos;../types&apos;;
import { inspectConfiguration } from &apos;../../services/notificationConfigService&apos;;
import type {
  ConfigurationInspection,
  NotificationPreferences,
} from &apos;../../types/notificationConfig&apos;;

interface ConfigurationInspectorProps {
  entityType: &apos;user&apos; | &apos;site&apos; | &apos;asset&apos;;
  entityId: string;
  entityName: string;
  userId?: string;
  siteId?: string;
  assetId?: string;
  asset?: Asset;
  site?: Site;
  variant?: &apos;button&apos; | &apos;inline&apos; | &apos;card&apos;;
  // Optional: Pass centralized configs from App.tsx
  notificationConfigs?: Record<string, NotificationPreferences>;
}

export function ConfigurationInspector({
  entityType,
  entityId,
  entityName,
  userId = &apos;current-user&apos;,
  siteId,
  assetId,
  asset,
  site,
  variant = &apos;button&apos;,
  notificationConfigs,
}: ConfigurationInspectorProps) {
  const [inspection, setInspection] = useState<ConfigurationInspection | null>(
    null
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen || variant === &apos;inline&apos; || variant === &apos;card&apos;) {
      loadInspection();
    }
  }, [isOpen, variant, entityType, entityId]);

  const loadInspection = () => {
    const result = inspectConfiguration(
      entityType,
      entityId,
      entityName,
      userId,
      siteId,
      assetId,
      asset,
      site,
      notificationConfigs
    );
    setInspection(result);
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case &apos;user&apos;:
        return <User className=&apos;h-4 w-4&apos; />;
      case &apos;site&apos;:
        return <Building2 className=&apos;h-4 w-4&apos; />;
      case &apos;asset&apos;:
        return <Package className=&apos;h-4 w-4&apos; />;
      default:
        return <Settings className=&apos;h-4 w-4&apos; />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case &apos;email&apos;:
        return <Mail className=&apos;h-4 w-4&apos; />;
      case &apos;sms&apos;:
        return <MessageSquare className=&apos;h-4 w-4&apos; />;
      case &apos;push&apos;:
        return <Smartphone className=&apos;h-4 w-4&apos; />;
      case &apos;webhook&apos;:
        return <Webhook className=&apos;h-4 w-4&apos; />;
      default:
        return null;
    }
  };

  const renderInspectionContent = () => {
    if (!inspection) {
      return <div className=&apos;text-muted-foreground&apos;>Loading...</div>;
    }

    const { effectiveConfig, availableLevels } = inspection;

    return (
      <div className=&apos;space-y-6&apos;>
        {/* Active Configuration */}
        <div>
          <h3 className=&apos;flex items-center gap-2 mb-3&apos;>
            <CheckCircle2 className=&apos;h-5 w-5 text-green-600&apos; />
            Active Configuration
          </h3>
          <Card className=&apos;p-4&apos;>
            <div className=&apos;flex items-center justify-between mb-3&apos;>
              <div className=&apos;flex items-center gap-2&apos;>
                {getLevelIcon(effectiveConfig.source.level)}
                <div>
                  <div className=&apos;flex items-center gap-2&apos;>
                    <span>{effectiveConfig.source.entityName}</span>
                    <Badge variant=&apos;outline&apos; className=&apos;capitalize&apos;>
                      {effectiveConfig.source.level} Level
                    </Badge>
                  </div>
                  <p className=&apos;text-muted-foreground&apos;>
                    This configuration is currently being used
                  </p>
                </div>
              </div>
            </div>

            {/* Channel Summary */}
            <div className=&apos;grid grid-cols-2 gap-3 mt-4&apos;>
              {Object.entries(effectiveConfig.preferences.channels).map(
                ([channel, config]) => (
                  <div key={channel} className=&apos;flex items-center gap-2&apos;>
                    {getChannelIcon(channel)}
                    <span className=&apos;capitalize&apos;>{channel}</span>
                    <Badge
                      variant={config.enabled ? &apos;default&apos; : &apos;secondary&apos;}
                      className=&apos;ml-auto&apos;
                    >
                      {config.enabled ? &apos;Enabled&apos; : &apos;Disabled&apos;}
                    </Badge>
                  </div>
                )
              )}
            </div>

            {/* Quiet Hours */}
            {effectiveConfig.preferences.quietHours.enabled && (
              <div className=&apos;mt-4 p-3 bg-muted rounded-md&apos;>
                <div className=&apos;flex items-center gap-2&apos;>
                  <Info className=&apos;h-4 w-4&apos; />
                  <span>
                    Quiet Hours: {effectiveConfig.preferences.quietHours.start}{&apos; &apos;}
                    - {effectiveConfig.preferences.quietHours.end}
                  </span>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Inheritance Chain */}
        <div>
          <h3 className=&apos;flex items-center gap-2 mb-3&apos;>
            <Info className=&apos;h-5 w-5 text-blue-600&apos; />
            Configuration Inheritance
          </h3>
          <Card className=&apos;p-4&apos;>
            <div className=&apos;space-y-2&apos;>
              {effectiveConfig.inheritanceChain.map((item, index) => (
                <div key={`${item.level}-${item.entityId}`}>
                  <div className=&apos;flex items-center gap-3&apos;>
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        item.isActive
                          ? &apos;bg-green-100 text-green-700&apos;
                          : &apos;bg-gray-100 text-gray-500&apos;
                      }`}
                    >
                      {getLevelIcon(item.level)}
                    </div>
                    <div className=&apos;flex-1&apos;>
                      <div className=&apos;flex items-center gap-2&apos;>
                        <span
                          className={
                            item.isActive ? &apos;&apos; : &apos;text-muted-foreground&apos;
                          }
                        >
                          {item.entityName}
                        </span>
                        <Badge
                          variant={item.isActive ? &apos;default&apos; : &apos;outline&apos;}
                          className=&apos;capitalize&apos;
                        >
                          {item.level}
                        </Badge>
                        {item.isActive && (
                          <Badge variant=&apos;default&apos; className=&apos;bg-green-600&apos;>
                            Active
                          </Badge>
                        )}
                      </div>
                      {!item.isActive && (
                        <p className=&apos;text-muted-foreground&apos;>
                          Overridden by {effectiveConfig.source.level} level
                        </p>
                      )}
                    </div>
                  </div>
                  {index < effectiveConfig.inheritanceChain.length - 1 && (
                    <div className=&apos;ml-4 my-1&apos;>
                      <ChevronRight className=&apos;h-4 w-4 text-muted-foreground&apos; />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {effectiveConfig.inheritanceChain.length === 1 && (
              <p className=&apos;text-muted-foreground mt-2&apos;>
                No overrides configured. Using default{&apos; &apos;}
                {effectiveConfig.source.level}-level settings.
              </p>
            )}
          </Card>
        </div>

        {/* Available Configurations */}
        <div>
          <h3 className=&apos;flex items-center gap-2 mb-3&apos;>
            <Settings className=&apos;h-5 w-5 text-gray-600&apos; />
            Available Configurations
          </h3>
          <Card className=&apos;p-4&apos;>
            <div className=&apos;space-y-2&apos;>
              {availableLevels.map(level => (
                <div
                  key={level.level}
                  className=&apos;flex items-center justify-between p-2 rounded hover:bg-muted&apos;
                >
                  <div className=&apos;flex items-center gap-2&apos;>
                    {getLevelIcon(level.level)}
                    <span className=&apos;capitalize&apos;>{level.level} Level</span>
                  </div>
                  {level.exists ? (
                    <Badge variant=&apos;outline&apos; className=&apos;gap-1&apos;>
                      <CheckCircle2 className=&apos;h-3 w-3&apos; />
                      Configured
                    </Badge>
                  ) : (
                    <Badge variant=&apos;secondary&apos; className=&apos;gap-1&apos;>
                      <AlertCircle className=&apos;h-3 w-3&apos; />
                      Not Set
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Overrides */}
        {effectiveConfig.overrides.length > 0 && (
          <div>
            <h3 className=&apos;flex items-center gap-2 mb-3&apos;>
              <AlertCircle className=&apos;h-5 w-5 text-orange-600&apos; />
              Active Overrides
            </h3>
            <Card className=&apos;p-4&apos;>
              <div className=&apos;space-y-2&apos;>
                {effectiveConfig.overrides.map((override, index) => (
                  <div
                    key={index}
                    className=&apos;flex items-center justify-between&apos;
                  >
                    <code className=&apos;text-sm&apos;>{override.field}</code>
                    <div className=&apos;flex items-center gap-2&apos;>
                      <Badge variant=&apos;outline&apos;>{String(override.value)}</Badge>
                      <span className=&apos;text-muted-foreground&apos;>from</span>
                      <Badge className=&apos;capitalize&apos;>{override.source}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Help Text */}
        <Card className=&apos;p-4 bg-blue-50 border-blue-200&apos;>
          <div className=&apos;flex gap-3&apos;>
            <Info className=&apos;h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5&apos; />
            <div className=&apos;space-y-2&apos;>
              <p>
                <strong>How it works:</strong> Notification settings inherit
                from User → Site → Asset. More specific levels override less
                specific ones.
              </p>
              <ul className=&apos;space-y-1 text-muted-foreground&apos;>
                <li>• User Level: Your default notification preferences</li>
                <li>• Site Level: Override for specific sites</li>
                <li>• Asset Level: Override for specific assets</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // Button variant
  if (variant === &apos;button&apos;) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant=&apos;outline&apos; className=&apos;gap-2&apos;>
            <Eye className=&apos;h-4 w-4&apos; />
            View Configuration
          </Button>
        </DialogTrigger>
        <DialogContent className=&apos;max-w-3xl max-h-[80vh] overflow-y-auto&apos;>
          <DialogHeader>
            <DialogTitle>Notification Configuration Inspector</DialogTitle>
            <DialogDescription>
              View which notification settings are being applied for{&apos; &apos;}
              {entityName}
            </DialogDescription>
          </DialogHeader>
          {renderInspectionContent()}
        </DialogContent>
      </Dialog>
    );
  }

  // Card variant
  if (variant === &apos;card&apos;) {
    return (
      <Card className=&apos;p-6&apos;>
        <div className=&apos;flex items-center justify-between mb-4&apos;>
          <h2 className=&apos;flex items-center gap-2&apos;>
            <Eye className=&apos;h-5 w-5&apos; />
            Configuration Inspector
          </h2>
          <Button variant=&apos;outline&apos; size=&apos;sm&apos; onClick={loadInspection}>
            Refresh
          </Button>
        </div>
        <Separator className=&apos;mb-6&apos; />
        {renderInspectionContent()}
      </Card>
    );
  }

  // Inline variant
  return <div className=&apos;space-y-4&apos;>{renderInspectionContent()}</div>;
}
