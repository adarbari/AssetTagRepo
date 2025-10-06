import React from &apos;react&apos;;

/**
 * Hierarchical Alert Configuration Component
 *
 * Supports 4-level hierarchy: User → Site → Asset → Job
 * Allows creating overrides at any level with visual inheritance indicators
 */

import { useState, useEffect, useMemo } from &apos;react&apos;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &apos;../ui/card&apos;;
import { Tabs, TabsList, TabsTrigger } from &apos;../ui/tabs&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Label } from &apos;../ui/label&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import { Separator } from &apos;../ui/separator&apos;;
import { Switch } from &apos;../ui/switch&apos;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &apos;../ui/select&apos;;
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from &apos;../ui/dialog&apos;;
import {
  ArrowLeft,
  Save,
  Info,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Battery,
  MapPin,
  Thermometer,
  TrendingDown,
  WifiOff,
  Wrench,
} from &apos;lucide-react&apos;;
import { toast } from &apos;sonner&apos;;
import { PageLayout } from &apos;../common&apos;;
import { AlertConfigFieldRenderer } from &apos;./AlertConfigFieldRenderer&apos;;
import {
  alertTypeConfigurations,
  getAllAlertTypes,
} from &apos;../../data/alertConfigurations&apos;;
import type {
  AlertConfigurationsStore,
  SavedAlertConfig,
  AlertConfigLevel,
  AlertRuleConfig,
} from &apos;../../types/alertConfig&apos;;
import type { AlertType } from &apos;../../types&apos;;
import { mockAssets, mockSites } from &apos;../../data/mockData&apos;;

interface HierarchicalAlertConfigurationProps {
  alertConfigs: AlertConfigurationsStore;
  jobs: Record<string, any>; // Job type
  onSaveConfig: (
    config: SavedAlertConfig
  ) => Promise<{ success: boolean; error?: any }>;
  onDeleteConfig: (
    level: string,
    entityId: string,
    alertType: string
  ) => Promise<{ success: boolean; error?: any }>;
  onBack?: () => void;
}

const alertTypeIcons: Record<AlertType, any> = {
  theft: Shield,
  battery: Battery,
  geofence: MapPin,
  temperature: Thermometer,
  offline: WifiOff,
  compliance: AlertTriangle,
  &apos;unauthorized-zone&apos;: MapPin,
  underutilized: TrendingDown,
  &apos;predictive-maintenance&apos;: Wrench,
};

export function HierarchicalAlertConfiguration({
  alertConfigs,
  jobs,
  onSaveConfig,
  onDeleteConfig,
  onBack,
}: HierarchicalAlertConfigurationProps) {
  const [selectedLevel, setSelectedLevel] = useState<AlertConfigLevel>(&apos;user&apos;);
  const [selectedEntityId, setSelectedEntityId] =
    useState<string>(&apos;current-user&apos;);
  const [selectedAlertType, setSelectedAlertType] = useState<AlertType | null>(
    null
  );
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AlertRuleConfig | null>(
    null
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Get entities based on selected level
  const availableEntities = useMemo(() => {
    switch (selectedLevel) {
      case &apos;user&apos;:
        return [{ id: &apos;current-user&apos;, name: &apos;Current User&apos; }];
      case &apos;site&apos;:
        return mockSites.map(s => ({ id: s.id, name: s.name }));
      case &apos;asset&apos;:
        return mockAssets.map(a => ({ id: a.id, name: a.name }));
      case &apos;job&apos;:
        return Object.values(jobs).map((j: any) => ({
          id: j.id,
          name: j.name,
        }));
      default:
        return [];
    }
  }, [selectedLevel, jobs]);

  // Update entity ID when level changes
  useEffect(() => {
    if (availableEntities.length > 0) {
      setSelectedEntityId(availableEntities[0].id);
    }
  }, [selectedLevel, availableEntities]);

  // Get config for current level/entity/alert type
  const getConfigForAlertType = (
    alertType: AlertType
  ): SavedAlertConfig | null => {
    const key = `${selectedLevel}:${selectedEntityId}:${alertType}`;
    return alertConfigs[key] || null;
  };

  // Check if config is inherited or overridden
  const getConfigStatus = (
    alertType: AlertType
  ): &apos;inherited&apos; | &apos;override&apos; | &apos;none&apos; => {
    const config = getConfigForAlertType(alertType);
    if (!config) return &apos;none&apos;;
    return config.config.isOverride ? &apos;override&apos; : &apos;inherited&apos;;
  };

  // Get effective config by walking up hierarchy
  const getEffectiveConfig = (
    alertType: AlertType
  ): {
    config: AlertRuleConfig | null;
    level: AlertConfigLevel | null;
    entityId: string | null;
  } => {
    // Try current level
    const currentKey = `${selectedLevel}:${selectedEntityId}:${alertType}`;
    if (alertConfigs[currentKey]) {
      return {
        config: alertConfigs[currentKey].config,
        level: selectedLevel,
        entityId: selectedEntityId,
      };
    }

    // Walk up hierarchy based on current level
    if (selectedLevel === &apos;job&apos;) {
      // Job → Asset → Site → User
      const job = Object.values(jobs).find(
        (j: any) => j.id === selectedEntityId
      );
      if (job && job.assets && job.assets.length > 0) {
        // Check first asset
        const assetKey = `asset:${job.assets[0].assetId}:${alertType}`;
        if (alertConfigs[assetKey]) {
          return {
            config: alertConfigs[assetKey].config,
            level: &apos;asset&apos;,
            entityId: job.assets[0].assetId,
          };
        }
      }
      if (job && job.siteId) {
        const siteKey = `site:${job.siteId}:${alertType}`;
        if (alertConfigs[siteKey]) {
          return {
            config: alertConfigs[siteKey].config,
            level: &apos;site&apos;,
            entityId: job.siteId,
          };
        }
      }
    }

    if (selectedLevel === &apos;asset&apos;) {
      // Asset → Site → User
      const asset = mockAssets.find(a => a.id === selectedEntityId);
      if (asset && asset.site) {
        const site = mockSites.find(s => s.name === asset.site);
        if (site) {
          const siteKey = `site:${site.id}:${alertType}`;
          if (alertConfigs[siteKey]) {
            return {
              config: alertConfigs[siteKey].config,
              level: &apos;site&apos;,
              entityId: site.id,
            };
          }
        }
      }
    }

    if (
      selectedLevel === &apos;site&apos; ||
      selectedLevel === &apos;asset&apos; ||
      selectedLevel === &apos;job&apos;
    ) {
      // Check user level
      const userKey = `user:current-user:${alertType}`;
      if (alertConfigs[userKey]) {
        return {
          config: alertConfigs[userKey].config,
          level: &apos;user&apos;,
          entityId: &apos;current-user&apos;,
        };
      }
    }

    // No config found, use defaults
    const typeConfig = alertTypeConfigurations[alertType];
    const fields: Record<string, any> = {};
    typeConfig.fields.forEach(field => {
      fields[field.key] = field.defaultValue;
    });

    return {
      config: {
        enabled: true,
        severity: typeConfig.defaultSeverity,
        autoEscalate: false,
        fields,
        suppressionRules: {
          enabled: true,
          duration: 30,
        },
      },
      level: null,
      entityId: null,
    };
  };

  const handleOpenConfig = (alertType: AlertType) => {
    setSelectedAlertType(alertType);
    const effective = getEffectiveConfig(alertType);
    setEditingConfig(effective.config);
    setIsConfigDialogOpen(true);
    setHasUnsavedChanges(false);
  };

  const handleSaveConfig = async () => {
    if (!selectedAlertType || !editingConfig) return;

    const newConfig: SavedAlertConfig = {
      id: `${selectedLevel}-${selectedEntityId}-${selectedAlertType}`,
      type: selectedAlertType,
      level: selectedLevel,
      entityId: selectedEntityId,
      version: &apos;1.0&apos;,
      config: {
        ...editingConfig,
        level: selectedLevel,
        entityId: selectedEntityId,
        isOverride: selectedLevel !== &apos;user&apos;,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await onSaveConfig(newConfig);

    if (result.success) {
      toast.success(`${selectedAlertType} configuration saved`);
      setIsConfigDialogOpen(false);
      setHasUnsavedChanges(false);
    } else {
      toast.error(&apos;Failed to save configuration&apos;);
    }
  };

  const handleDeleteOverride = async () => {
    if (!selectedAlertType || selectedLevel === &apos;user&apos;) return;

    const result = await onDeleteConfig(
      selectedLevel,
      selectedEntityId,
      selectedAlertType
    );

    if (result.success) {
      toast.success(&apos;Override removed, using inherited configuration&apos;);
      setIsConfigDialogOpen(false);
    } else {
      toast.error(&apos;Failed to remove override&apos;);
    }
  };

  const handleFieldChange = (key: string, value: any) => {
    if (!editingConfig) return;
    setEditingConfig({
      ...editingConfig,
      fields: {
        ...editingConfig.fields,
        [key]: value,
      },
    });
    setHasUnsavedChanges(true);
  };

  const alertTypes = getAllAlertTypes();

  return (
    <PageLayout variant=&apos;standard&apos; padding=&apos;md&apos;>
      {/* Header */}
      <div className=&apos;flex items-center justify-between&apos;>
        <div className=&apos;flex items-center gap-4&apos;>
          {onBack && (
            <Button variant=&apos;ghost&apos; size=&apos;sm&apos; onClick={onBack}>
              <ArrowLeft className=&apos;h-4 w-4 mr-2&apos; />
              Back
            </Button>
          )}
          <div>
            <h1>Hierarchical Alert Configuration</h1>
            <p className=&apos;text-muted-foreground&apos;>
              Configure alert rules at user, site, asset, or job level
            </p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <Card className=&apos;border-blue-200 bg-blue-50&apos;>
        <CardContent className=&apos;pt-6&apos;>
          <div className=&apos;flex items-start gap-3&apos;>
            <Info className=&apos;h-5 w-5 text-blue-600 mt-0.5&apos; />
            <div className=&apos;text-sm&apos;>
              <p className=&apos;text-blue-900&apos;>
                <span className=&apos;font-medium&apos;>Hierarchy:</span> User → Site →
                Asset → Job
              </p>
              <p className=&apos;text-blue-700 mt-1&apos;>
                Configs at lower levels override parent levels. If no override
                exists, the parent config applies.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Level Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Level</CardTitle>
          <CardDescription>
            Select the level at which you want to configure alerts
          </CardDescription>
        </CardHeader>
        <CardContent className=&apos;space-y-4&apos;>
          <Tabs
            value={selectedLevel}
            onValueChange={value => setSelectedLevel(value as AlertConfigLevel)}
          >
            <TabsList className=&apos;grid w-full grid-cols-4&apos;>
              <TabsTrigger value=&apos;user&apos;>User</TabsTrigger>
              <TabsTrigger value=&apos;site&apos;>Site</TabsTrigger>
              <TabsTrigger value=&apos;asset&apos;>Asset</TabsTrigger>
              <TabsTrigger value=&apos;job&apos;>Job</TabsTrigger>
            </TabsList>
          </Tabs>

          {selectedLevel !== &apos;user&apos; && (
            <div className=&apos;space-y-2&apos;>
              <Label>
                Select{&apos; &apos;}
                {selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)}
              </Label>
              <Select
                value={selectedEntityId}
                onValueChange={setSelectedEntityId}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableEntities.map(entity => (
                    <SelectItem key={entity.id} value={entity.id}>
                      {entity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className=&apos;text-sm text-muted-foreground&apos;>
            Configuring for:{&apos; &apos;}
            <span className=&apos;font-medium&apos;>
              {availableEntities.find(e => e.id === selectedEntityId)?.name}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Alert Types Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Types</CardTitle>
          <CardDescription>
            Click on an alert type to configure its settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className=&apos;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4&apos;>
            {alertTypes.map(alertType => {
              const typeConfig = alertTypeConfigurations[alertType];
              const status = getConfigStatus(alertType);
              const effective = getEffectiveConfig(alertType);
              const Icon = alertTypeIcons[alertType] || AlertTriangle;

              return (
                <Card
                  key={alertType}
                  className=&apos;cursor-pointer hover:shadow-md transition-all&apos;
                  onClick={() => handleOpenConfig(alertType)}
                >
                  <CardHeader className=&apos;pb-3&apos;>
                    <div className=&apos;flex items-start justify-between&apos;>
                      <div className=&apos;flex items-center gap-2&apos;>
                        <div
                          className={`p-2 rounded-md ${
                            typeConfig.category === &apos;security&apos;
                              ? &apos;bg-red-100&apos;
                              : typeConfig.category === &apos;operational&apos;
                                ? &apos;bg-blue-100&apos;
                                : typeConfig.category === &apos;maintenance&apos;
                                  ? &apos;bg-orange-100&apos;
                                  : &apos;bg-purple-100&apos;
                          }`}
                        >
                          <Icon className=&apos;h-4 w-4&apos; />
                        </div>
                        <div>
                          <CardTitle className=&apos;text-sm&apos;>
                            {typeConfig.label}
                          </CardTitle>
                        </div>
                      </div>
                      {status === &apos;override&apos; && (
                        <Badge
                          variant=&apos;outline&apos;
                          className=&apos;bg-blue-50 text-blue-700 border-blue-200&apos;
                        >
                          Override
                        </Badge>
                      )}
                      {status === &apos;inherited&apos; &&
                        effective.level !== selectedLevel && (
                          <Badge variant=&apos;outline&apos; className=&apos;bg-gray-50&apos;>
                            Inherited
                          </Badge>
                        )}
                    </div>
                  </CardHeader>
                  <CardContent className=&apos;pt-0&apos;>
                    <div className=&apos;text-xs text-muted-foreground&apos;>
                      {effective.config?.enabled ? (
                        <div className=&apos;flex items-center gap-1 text-green-600&apos;>
                          <CheckCircle2 className=&apos;h-3 w-3&apos; />
                          <span>Enabled</span>
                        </div>
                      ) : (
                        <div className=&apos;flex items-center gap-1&apos;>
                          <span>Disabled</span>
                        </div>
                      )}
                      {effective.level && effective.level !== selectedLevel && (
                        <div className=&apos;mt-1&apos;>From: {effective.level}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Dialog */}
      {selectedAlertType && (
        <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
          <DialogContent className=&apos;max-w-2xl max-h-[90vh] overflow-y-auto&apos;>
            <DialogHeader>
              <DialogTitle>
                Configure {alertTypeConfigurations[selectedAlertType].label}
              </DialogTitle>
              <DialogDescription>
                {selectedLevel !== &apos;user&apos; && (
                  <span>
                    Override for{&apos; &apos;}
                    {
                      availableEntities.find(e => e.id === selectedEntityId)
                        ?.name
                    }
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            {editingConfig && (
              <div className=&apos;space-y-4&apos;>
                {/* Inheritance Info */}
                {(() => {
                  const effective = getEffectiveConfig(selectedAlertType);
                  if (effective.level && effective.level !== selectedLevel) {
                    return (
                      <div className=&apos;p-3 border border-blue-200 bg-blue-50 rounded-md&apos;>
                        <div className=&apos;flex items-start gap-2 text-sm&apos;>
                          <Info className=&apos;h-4 w-4 text-blue-600 mt-0.5&apos; />
                          <div>
                            <div className=&apos;text-blue-900&apos;>
                              Currently inheriting from{&apos; &apos;}
                              <span className=&apos;font-medium&apos;>
                                {effective.level} level
                              </span>
                            </div>
                            <div className=&apos;text-blue-700 text-xs mt-1&apos;>
                              Any changes you make will create an override at
                              this level
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Enable/Disable */}
                <div className=&apos;flex items-center justify-between&apos;>
                  <Label>Enable Alert</Label>
                  <Switch
                    checked={editingConfig.enabled}
                    onCheckedChange={checked => {
                      setEditingConfig({ ...editingConfig, enabled: checked });
                      setHasUnsavedChanges(true);
                    }}
                  />
                </div>

                <Separator />

                {/* Severity */}
                <div className=&apos;space-y-2&apos;>
                  <Label>Severity</Label>
                  <Select
                    value={editingConfig.severity}
                    onValueChange={value => {
                      setEditingConfig({
                        ...editingConfig,
                        severity: value as any,
                      });
                      setHasUnsavedChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=&apos;low&apos;>Low</SelectItem>
                      <SelectItem value=&apos;medium&apos;>Medium</SelectItem>
                      <SelectItem value=&apos;high&apos;>High</SelectItem>
                      <SelectItem value=&apos;critical&apos;>Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Dynamic Fields */}
                {alertTypeConfigurations[selectedAlertType].fields.map(
                  field => (
                    <AlertConfigFieldRenderer
                      key={field.key}
                      field={field}
                      value={editingConfig.fields[field.key]}
                      onChange={value => handleFieldChange(field.key, value)}
                    />
                  )
                )}

                <Separator />

                {/* Auto Escalation */}
                <div className=&apos;space-y-3&apos;>
                  <div className=&apos;flex items-center justify-between&apos;>
                    <Label>Auto-Escalate</Label>
                    <Switch
                      checked={editingConfig.autoEscalate}
                      onCheckedChange={checked => {
                        setEditingConfig({
                          ...editingConfig,
                          autoEscalate: checked,
                        });
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>
                  {editingConfig.autoEscalate && (
                    <div className=&apos;space-y-2&apos;>
                      <Label>Escalation Time (minutes)</Label>
                      <input
                        type=&apos;number&apos;
                        className=&apos;w-full px-3 py-2 border rounded-md&apos;
                        value={editingConfig.escalationTime || 60}
                        onChange={e => {
                          setEditingConfig({
                            ...editingConfig,
                            escalationTime: parseInt(e.target.value),
                          });
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Suppression Rules */}
                {editingConfig.suppressionRules && (
                  <>
                    <Separator />
                    <div className=&apos;space-y-3&apos;>
                      <div className=&apos;flex items-center justify-between&apos;>
                        <Label>Enable Suppression</Label>
                        <Switch
                          checked={editingConfig.suppressionRules.enabled}
                          onCheckedChange={checked => {
                            setEditingConfig({
                              ...editingConfig,
                              suppressionRules: {
                                ...editingConfig.suppressionRules,
                                enabled: checked,
                              },
                            });
                            setHasUnsavedChanges(true);
                          }}
                        />
                      </div>
                      {editingConfig.suppressionRules.enabled && (
                        <div className=&apos;space-y-2&apos;>
                          <Label>Cooldown Duration (minutes)</Label>
                          <input
                            type=&apos;number&apos;
                            className=&apos;w-full px-3 py-2 border rounded-md&apos;
                            value={
                              editingConfig.suppressionRules.duration || 30
                            }
                            onChange={e => {
                              setEditingConfig({
                                ...editingConfig,
                                suppressionRules: {
                                  ...editingConfig.suppressionRules,
                                  duration: parseInt(e.target.value),
                                },
                              });
                              setHasUnsavedChanges(true);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            <DialogFooter className=&apos;flex items-center justify-between&apos;>
              <div>
                {selectedLevel !== &apos;user&apos; &&
                  getConfigStatus(selectedAlertType) === &apos;override&apos; && (
                    <Button
                      variant=&apos;outline&apos;
                      onClick={handleDeleteOverride}
                      className=&apos;text-red-600&apos;
                    >
                      Remove Override
                    </Button>
                  )}
              </div>
              <div className=&apos;flex gap-2&apos;>
                <Button
                  variant=&apos;outline&apos;
                  onClick={() => setIsConfigDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveConfig}
                  disabled={!hasUnsavedChanges && selectedLevel === &apos;user&apos;}
                >
                  <Save className=&apos;h-4 w-4 mr-2&apos; />
                  Save Configuration
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </PageLayout>
  );
}
