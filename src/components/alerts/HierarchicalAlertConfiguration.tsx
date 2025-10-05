/**
 * Hierarchical Alert Configuration Component
 * 
 * Supports 4-level hierarchy: User → Site → Asset → Job
 * Allows creating overrides at any level with visual inheritance indicators
 */

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { ScrollArea } from "../ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  ArrowLeft,
  Save,
  RotateCcw,
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
} from "lucide-react";
import { toast } from "sonner";
import { AlertConfigFieldRenderer } from "./AlertConfigFieldRenderer";
import { alertTypeConfigurations, getAllAlertTypes } from "../../data/alertConfigurations";
import type { AlertConfigurationsStore, SavedAlertConfig, AlertConfigLevel, AlertRuleConfig } from "../../types/alertConfig";
import type { AlertType } from "../../types";
import { mockAssets, mockSites } from "../../data/mockData";

interface HierarchicalAlertConfigurationProps {
  alertConfigs: AlertConfigurationsStore;
  jobs: Record<string, any>; // Job type
  onSaveConfig: (config: SavedAlertConfig) => Promise<{ success: boolean; error?: any }>;
  onDeleteConfig: (level: string, entityId: string, alertType: string) => Promise<{ success: boolean; error?: any }>;
  onBack?: () => void;
}

const alertTypeIcons: Record<AlertType, any> = {
  "theft": Shield,
  "battery": Battery,
  "geofence": MapPin,
  "temperature": Thermometer,
  "offline": WifiOff,
  "compliance": AlertTriangle,
  "unauthorized-zone": MapPin,
  "underutilized": TrendingDown,
  "predictive-maintenance": Wrench,
};

export function HierarchicalAlertConfiguration({
  alertConfigs,
  jobs,
  onSaveConfig,
  onDeleteConfig,
  onBack,
}: HierarchicalAlertConfigurationProps) {
  const [selectedLevel, setSelectedLevel] = useState<AlertConfigLevel>("user");
  const [selectedEntityId, setSelectedEntityId] = useState<string>("current-user");
  const [selectedAlertType, setSelectedAlertType] = useState<AlertType | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AlertRuleConfig | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Get entities based on selected level
  const availableEntities = useMemo(() => {
    switch (selectedLevel) {
      case "user":
        return [{ id: "current-user", name: "Current User" }];
      case "site":
        return mockSites.map(s => ({ id: s.id, name: s.name }));
      case "asset":
        return mockAssets.map(a => ({ id: a.id, name: a.name }));
      case "job":
        return Object.values(jobs).map((j: any) => ({ id: j.id, name: j.name }));
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
  const getConfigForAlertType = (alertType: AlertType): SavedAlertConfig | null => {
    const key = `${selectedLevel}:${selectedEntityId}:${alertType}`;
    return alertConfigs[key] || null;
  };

  // Check if config is inherited or overridden
  const getConfigStatus = (alertType: AlertType): "inherited" | "override" | "none" => {
    const config = getConfigForAlertType(alertType);
    if (!config) return "none";
    return config.config.isOverride ? "override" : "inherited";
  };

  // Get effective config by walking up hierarchy
  const getEffectiveConfig = (alertType: AlertType): {
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
    if (selectedLevel === "job") {
      // Job → Asset → Site → User
      const job = Object.values(jobs).find((j: any) => j.id === selectedEntityId);
      if (job && job.assets && job.assets.length > 0) {
        // Check first asset
        const assetKey = `asset:${job.assets[0].assetId}:${alertType}`;
        if (alertConfigs[assetKey]) {
          return {
            config: alertConfigs[assetKey].config,
            level: "asset",
            entityId: job.assets[0].assetId,
          };
        }
      }
      if (job && job.siteId) {
        const siteKey = `site:${job.siteId}:${alertType}`;
        if (alertConfigs[siteKey]) {
          return {
            config: alertConfigs[siteKey].config,
            level: "site",
            entityId: job.siteId,
          };
        }
      }
    }

    if (selectedLevel === "asset") {
      // Asset → Site → User
      const asset = mockAssets.find(a => a.id === selectedEntityId);
      if (asset && asset.site) {
        const site = mockSites.find(s => s.name === asset.site);
        if (site) {
          const siteKey = `site:${site.id}:${alertType}`;
          if (alertConfigs[siteKey]) {
            return {
              config: alertConfigs[siteKey].config,
              level: "site",
              entityId: site.id,
            };
          }
        }
      }
    }

    if (selectedLevel === "site" || selectedLevel === "asset" || selectedLevel === "job") {
      // Check user level
      const userKey = `user:current-user:${alertType}`;
      if (alertConfigs[userKey]) {
        return {
          config: alertConfigs[userKey].config,
          level: "user",
          entityId: "current-user",
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
      version: "1.0",
      config: {
        ...editingConfig,
        level: selectedLevel,
        entityId: selectedEntityId,
        isOverride: selectedLevel !== "user",
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
      toast.error("Failed to save configuration");
    }
  };

  const handleDeleteOverride = async () => {
    if (!selectedAlertType || selectedLevel === "user") return;

    const result = await onDeleteConfig(selectedLevel, selectedEntityId, selectedAlertType);

    if (result.success) {
      toast.success("Override removed, using inherited configuration");
      setIsConfigDialogOpen(false);
    } else {
      toast.error("Failed to remove override");
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1>Hierarchical Alert Configuration</h1>
            <p className="text-muted-foreground">
              Configure alert rules at user, site, asset, or job level
            </p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="text-blue-900">
                <span className="font-medium">Hierarchy:</span> User → Site → Asset → Job
              </p>
              <p className="text-blue-700 mt-1">
                Configs at lower levels override parent levels. If no override exists, the parent config applies.
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
        <CardContent className="space-y-4">
          <Tabs value={selectedLevel} onValueChange={(value) => setSelectedLevel(value as AlertConfigLevel)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="user">User</TabsTrigger>
              <TabsTrigger value="site">Site</TabsTrigger>
              <TabsTrigger value="asset">Asset</TabsTrigger>
              <TabsTrigger value="job">Job</TabsTrigger>
            </TabsList>
          </Tabs>

          {selectedLevel !== "user" && (
            <div className="space-y-2">
              <Label>Select {selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)}</Label>
              <Select value={selectedEntityId} onValueChange={setSelectedEntityId}>
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

          <div className="text-sm text-muted-foreground">
            Configuring for: <span className="font-medium">{availableEntities.find(e => e.id === selectedEntityId)?.name}</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alertTypes.map(alertType => {
              const typeConfig = alertTypeConfigurations[alertType];
              const status = getConfigStatus(alertType);
              const effective = getEffectiveConfig(alertType);
              const Icon = alertTypeIcons[alertType] || AlertTriangle;

              return (
                <Card
                  key={alertType}
                  className="cursor-pointer hover:shadow-md transition-all"
                  onClick={() => handleOpenConfig(alertType)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-md ${
                          typeConfig.category === "security" ? "bg-red-100" :
                          typeConfig.category === "operational" ? "bg-blue-100" :
                          typeConfig.category === "maintenance" ? "bg-orange-100" :
                          "bg-purple-100"
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <CardTitle className="text-sm">{typeConfig.label}</CardTitle>
                        </div>
                      </div>
                      {status === "override" && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Override
                        </Badge>
                      )}
                      {status === "inherited" && effective.level !== selectedLevel && (
                        <Badge variant="outline" className="bg-gray-50">
                          Inherited
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-xs text-muted-foreground">
                      {effective.config?.enabled ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Enabled</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span>Disabled</span>
                        </div>
                      )}
                      {effective.level && effective.level !== selectedLevel && (
                        <div className="mt-1">
                          From: {effective.level}
                        </div>
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Configure {alertTypeConfigurations[selectedAlertType].label}
              </DialogTitle>
              <DialogDescription>
                {selectedLevel !== "user" && (
                  <span>Override for {availableEntities.find(e => e.id === selectedEntityId)?.name}</span>
                )}
              </DialogDescription>
            </DialogHeader>

            {editingConfig && (
              <div className="space-y-4">
                {/* Inheritance Info */}
                {(() => {
                  const effective = getEffectiveConfig(selectedAlertType);
                  if (effective.level && effective.level !== selectedLevel) {
                    return (
                      <div className="p-3 border border-blue-200 bg-blue-50 rounded-md">
                        <div className="flex items-start gap-2 text-sm">
                          <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                          <div>
                            <div className="text-blue-900">
                              Currently inheriting from <span className="font-medium">{effective.level} level</span>
                            </div>
                            <div className="text-blue-700 text-xs mt-1">
                              Any changes you make will create an override at this level
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Enable/Disable */}
                <div className="flex items-center justify-between">
                  <Label>Enable Alert</Label>
                  <Switch
                    checked={editingConfig.enabled}
                    onCheckedChange={(checked) => {
                      setEditingConfig({ ...editingConfig, enabled: checked });
                      setHasUnsavedChanges(true);
                    }}
                  />
                </div>

                <Separator />

                {/* Severity */}
                <div className="space-y-2">
                  <Label>Severity</Label>
                  <Select
                    value={editingConfig.severity}
                    onValueChange={(value) => {
                      setEditingConfig({ ...editingConfig, severity: value as any });
                      setHasUnsavedChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Dynamic Fields */}
                {alertTypeConfigurations[selectedAlertType].fields.map(field => (
                  <AlertConfigFieldRenderer
                    key={field.key}
                    field={field}
                    value={editingConfig.fields[field.key]}
                    onChange={(value) => handleFieldChange(field.key, value)}
                  />
                ))}

                <Separator />

                {/* Auto Escalation */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Auto-Escalate</Label>
                    <Switch
                      checked={editingConfig.autoEscalate}
                      onCheckedChange={(checked) => {
                        setEditingConfig({ ...editingConfig, autoEscalate: checked });
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>
                  {editingConfig.autoEscalate && (
                    <div className="space-y-2">
                      <Label>Escalation Time (minutes)</Label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border rounded-md"
                        value={editingConfig.escalationTime || 60}
                        onChange={(e) => {
                          setEditingConfig({ ...editingConfig, escalationTime: parseInt(e.target.value) });
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
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Enable Suppression</Label>
                        <Switch
                          checked={editingConfig.suppressionRules.enabled}
                          onCheckedChange={(checked) => {
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
                        <div className="space-y-2">
                          <Label>Cooldown Duration (minutes)</Label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 border rounded-md"
                            value={editingConfig.suppressionRules.duration || 30}
                            onChange={(e) => {
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

            <DialogFooter className="flex items-center justify-between">
              <div>
                {selectedLevel !== "user" && getConfigStatus(selectedAlertType) === "override" && (
                  <Button variant="outline" onClick={handleDeleteOverride} className="text-red-600">
                    Remove Override
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveConfig} disabled={!hasUnsavedChanges && selectedLevel === "user"}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
