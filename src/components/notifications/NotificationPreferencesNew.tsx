/**
 * Notification Preferences - Hierarchical Configuration
 * 
 * Supports three levels:
 * - User Level (default preferences)
 * - Site Level (overrides for specific sites)
 * - Asset Level (overrides for specific assets)
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Webhook,
  ChevronLeft,
  Clock,
  Save,
  TestTube,
  User,
  Building2,
  Package,
  Info,
  Plus,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { ConfigurationInspector } from "../common/ConfigurationInspector";
import type {
  NotificationPreferences,
  NotificationLevel,
  NotificationChannelType,
} from "../../types/notificationConfig";
import { getAllAlertTypes } from "../../data/alertConfigurations";

interface NotificationPreferencesNewProps {
  onBack?: () => void;
  // Optional: Pre-select a specific level (for site/asset detail pages)
  preselectedLevel?: NotificationLevel;
  preselectedEntityId?: string;
  preselectedEntityName?: string;
  // Centralized state from App.tsx
  notificationConfigs: Record<string, NotificationPreferences>;
  onSaveConfig: (config: NotificationPreferences) => Promise<{ success: boolean; error?: any }>;
  onDeleteConfig: (level: string, entityId: string) => Promise<{ success: boolean; error?: any }>;
  onGetConfig: (level: string, entityId: string) => NotificationPreferences | undefined;
}

export function NotificationPreferencesNew({
  onBack,
  preselectedLevel = "user",
  preselectedEntityId,
  preselectedEntityName,
  notificationConfigs,
  onSaveConfig,
  onDeleteConfig,
  onGetConfig,
}: NotificationPreferencesNewProps) {
  const [selectedLevel, setSelectedLevel] = useState<NotificationLevel>(preselectedLevel);
  const [selectedEntityId, setSelectedEntityId] = useState(preselectedEntityId || "current-user");
  const [selectedEntityName, setSelectedEntityName] = useState(preselectedEntityName || "Your Account");
  
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [emailVerified, setEmailVerified] = useState(true);
  const [smsVerified, setSmsVerified] = useState(true);

  // Load preferences when level/entity changes
  useEffect(() => {
    loadPreferences();
  }, [selectedLevel, selectedEntityId]);

  const loadPreferences = () => {
    const config = onGetConfig(selectedLevel, selectedEntityId);
    if (config) {
      setPreferences(config);
      setEmailVerified(config.channels.email.verified ?? true);
      setSmsVerified(config.channels.sms.verified ?? true);
    } else {
      // Create default preferences
      const defaultPrefs: NotificationPreferences = {
        id: `${selectedLevel}-${selectedEntityId}-${Date.now()}`,
        level: selectedLevel,
        entityId: selectedEntityId,
        channels: {
          email: {
            enabled: selectedLevel === "user" ? true : false,
            addresses: selectedLevel === "user" ? ["user@example.com"] : [],
            verified: selectedLevel === "user",
          },
          sms: {
            enabled: false,
            phoneNumbers: [],
            verified: false,
          },
          push: {
            enabled: selectedLevel === "user" ? true : false,
            devices: selectedLevel === "user" ? ["device-1"] : [],
          },
          webhook: {
            enabled: false,
            endpoints: [],
          },
        },
        filters: {
          types: [], // All types
          severities: ["medium", "high", "critical"],
        },
        quietHours: {
          enabled: selectedLevel === "user" ? true : false,
          start: "22:00",
          end: "08:00",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          excludeCritical: true,
        },
        frequency: {
          maxPerHour: 20,
          maxPerDay: 100,
          digestMode: false,
        },
        isOverride: selectedLevel !== "user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPreferences(defaultPrefs);
    }
    setHasChanges(false);
  };

  const handleSave = async () => {
    if (!preferences) return;

    try {
      const result = await onSaveConfig({
        ...preferences,
        updatedAt: new Date().toISOString(),
      });

      if (result.success) {
        toast.success("Preferences saved", {
          description: `${selectedLevel === "user" ? "Your" : selectedEntityName} notification preferences have been updated`,
        });
        setHasChanges(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error("Failed to save preferences", {
        description: "Please try again",
      });
    }
  };

  const handleDeleteOverride = async () => {
    if (selectedLevel === "user") {
      toast.error("Cannot delete user-level preferences");
      return;
    }

    try {
      const result = await onDeleteConfig(selectedLevel, selectedEntityId);

      if (result.success) {
        toast.success("Override removed", {
          description: `${selectedEntityName} will now inherit preferences from parent level`,
        });
        
        // Switch back to user level
        setSelectedLevel("user");
        setSelectedEntityId("current-user");
        setSelectedEntityName("Your Account");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error("Failed to remove override");
    }
  };

  const updatePreferences = (updates: Partial<NotificationPreferences>) => {
    if (!preferences) return;
    setPreferences({ ...preferences, ...updates });
    setHasChanges(true);
  };

  const toggleChannel = (channel: NotificationChannelType) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      channels: {
        ...preferences.channels,
        [channel]: {
          ...preferences.channels[channel],
          enabled: !preferences.channels[channel].enabled,
        },
      },
    });
    setHasChanges(true);
  };

  const updateChannelAddresses = (channel: "email" | "sms", value: string) => {
    if (!preferences) return;
    
    const addresses = value.split(",").map(a => a.trim()).filter(Boolean);
    
    setPreferences({
      ...preferences,
      channels: {
        ...preferences.channels,
        [channel]: {
          ...preferences.channels[channel],
          [channel === "email" ? "addresses" : "phoneNumbers"]: addresses,
          verified: false,
        },
      },
    });
    setHasChanges(true);
    
    if (channel === "email") setEmailVerified(false);
    if (channel === "sms") setSmsVerified(false);
  };

  const handleTestNotification = (channel: NotificationChannelType) => {
    toast.success("Test notification sent", {
      description: `A test notification has been sent via ${channel}`,
    });
  };

  const handleVerifyChannel = (channel: "email" | "sms") => {
    // In production, this would send a verification code
    if (channel === "email") setEmailVerified(true);
    if (channel === "sms") setSmsVerified(true);
    
    toast.success("Verification code sent", {
      description: `Check your ${channel === "email" ? "email" : "phone"} for the verification code`,
    });
  };

  const toggleSeverity = (severity: "low" | "medium" | "high" | "critical") => {
    if (!preferences) return;
    
    const severities = preferences.filters.severities;
    const newSeverities = severities.includes(severity)
      ? severities.filter(s => s !== severity)
      : [...severities, severity];
    
    setPreferences({
      ...preferences,
      filters: {
        ...preferences.filters,
        severities: newSeverities as any,
      },
    });
    setHasChanges(true);
  };

  if (!preferences) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="flex items-center gap-2">
              <Bell className="h-6 w-6" />
              Notification Preferences
            </h1>
            <p className="text-muted-foreground">
              Configure how you receive alert notifications
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="gap-1">
              <Info className="h-3 w-3" />
              Unsaved changes
            </Badge>
          )}
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Preferences
          </Button>
        </div>
      </div>

      {/* Level Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {selectedLevel === "user" && <User className="h-5 w-5" />}
            {selectedLevel === "site" && <Building2 className="h-5 w-5" />}
            {selectedLevel === "asset" && <Package className="h-5 w-5" />}
            Configuration Level
          </CardTitle>
          <CardDescription>
            Choose which level to configure - more specific levels override less specific ones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedLevel} onValueChange={(v) => {
            setSelectedLevel(v as NotificationLevel);
            if (v === "user") {
              setSelectedEntityId("current-user");
              setSelectedEntityName("Your Account");
            }
          }}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="user" className="gap-2">
                <User className="h-4 w-4" />
                User Level
              </TabsTrigger>
              <TabsTrigger value="site" className="gap-2">
                <Building2 className="h-4 w-4" />
                Site Level
              </TabsTrigger>
              <TabsTrigger value="asset" className="gap-2">
                <Package className="h-4 w-4" />
                Asset Level
              </TabsTrigger>
            </TabsList>

            <TabsContent value="user" className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  These are your default notification preferences. They apply to all sites and assets unless overridden.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="site" className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Create site-specific notification preferences that override your user-level settings for assets at this site.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label>Select Site</Label>
                <Select value={selectedEntityId} onValueChange={(id) => {
                  setSelectedEntityId(id);
                  setSelectedEntityName(`Site: ${id}`); // In production, fetch actual site name
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a site..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="site-001">Construction Site A</SelectItem>
                    <SelectItem value="site-002">Warehouse B</SelectItem>
                    <SelectItem value="site-003">Depot C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="asset" className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Create asset-specific notification preferences that override both user and site-level settings for this specific asset.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label>Select Asset</Label>
                <Select value={selectedEntityId} onValueChange={(id) => {
                  setSelectedEntityId(id);
                  setSelectedEntityName(`Asset: ${id}`); // In production, fetch actual asset name
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an asset..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asset-001">Excavator EX-100</SelectItem>
                    <SelectItem value="asset-002">Bulldozer BD-200</SelectItem>
                    <SelectItem value="asset-003">Crane CR-300</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          {selectedLevel !== "user" && preferences.isOverride && (
            <div className="mt-4 flex items-center justify-between p-3 border border-orange-200 bg-orange-50 rounded-md">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-orange-600" />
                <span className="text-sm">
                  This {selectedLevel} has custom notification preferences
                </span>
              </div>
              <Button variant="destructive" size="sm" onClick={handleDeleteOverride}>
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Override
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notification Channels */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>
                Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive alerts via email
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.channels.email.enabled}
                    onCheckedChange={() => toggleChannel("email")}
                  />
                </div>
                
                {preferences.channels.email.enabled && (
                  <div className="ml-8 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="email@example.com, another@example.com"
                        value={preferences.channels.email.addresses?.join(", ") || ""}
                        onChange={(e) => updateChannelAddresses("email", e.target.value)}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleVerifyChannel("email")}
                        disabled={emailVerified}
                      >
                        {emailVerified ? <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" /> : null}
                        {emailVerified ? "Verified" : "Verify"}
                      </Button>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleTestNotification("email")}
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      Send Test Email
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              {/* SMS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive alerts via text message
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.channels.sms.enabled}
                    onCheckedChange={() => toggleChannel("sms")}
                  />
                </div>
                
                {preferences.channels.sms.enabled && (
                  <div className="ml-8 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="tel"
                        placeholder="+1-555-123-4567"
                        value={preferences.channels.sms.phoneNumbers?.join(", ") || ""}
                        onChange={(e) => updateChannelAddresses("sms", e.target.value)}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleVerifyChannel("sms")}
                        disabled={smsVerified}
                      >
                        {smsVerified ? <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" /> : null}
                        {smsVerified ? "Verified" : "Verify"}
                      </Button>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleTestNotification("sms")}
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      Send Test SMS
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              {/* Push */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive alerts on your mobile device
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.channels.push.enabled}
                  onCheckedChange={() => toggleChannel("push")}
                />
              </div>

              <Separator />

              {/* Webhook */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Webhook className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label>Webhook Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Send alerts to external systems
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.channels.webhook.enabled}
                  onCheckedChange={() => toggleChannel("webhook")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Alert Filtering */}
          <Card>
            <CardHeader>
              <CardTitle>Alert Filtering</CardTitle>
              <CardDescription>
                Choose which alerts you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Minimum Severity</Label>
                <div className="grid grid-cols-4 gap-2">
                  {(["low", "medium", "high", "critical"] as const).map((severity) => (
                    <Button
                      key={severity}
                      variant={preferences.filters.severities.includes(severity) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSeverity(severity)}
                      className="capitalize"
                    >
                      {severity}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  You'll receive alerts with these severity levels
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quiet Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Quiet Hours
              </CardTitle>
              <CardDescription>
                Set times when you don't want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Quiet Hours</Label>
                <Switch
                  checked={preferences.quietHours.enabled}
                  onCheckedChange={(enabled) => 
                    updatePreferences({ 
                      quietHours: { ...preferences.quietHours, enabled } 
                    })
                  }
                />
              </div>

              {preferences.quietHours.enabled && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={preferences.quietHours.start}
                        onChange={(e) =>
                          updatePreferences({
                            quietHours: { ...preferences.quietHours, start: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={preferences.quietHours.end}
                        onChange={(e) =>
                          updatePreferences({
                            quietHours: { ...preferences.quietHours, end: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Send Critical Alerts Anyway</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive critical alerts even during quiet hours
                      </p>
                    </div>
                    <Switch
                      checked={preferences.quietHours.excludeCritical}
                      onCheckedChange={(excludeCritical) =>
                        updatePreferences({
                          quietHours: { ...preferences.quietHours, excludeCritical },
                        })
                      }
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Frequency Limits */}
          <Card>
            <CardHeader>
              <CardTitle>Frequency Limits</CardTitle>
              <CardDescription>
                Prevent notification overload
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max per Hour</Label>
                  <Input
                    type="number"
                    value={preferences.frequency.maxPerHour}
                    onChange={(e) =>
                      updatePreferences({
                        frequency: {
                          ...preferences.frequency,
                          maxPerHour: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    min={1}
                    max={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max per Day</Label>
                  <Input
                    type="number"
                    value={preferences.frequency.maxPerDay}
                    onChange={(e) =>
                      updatePreferences({
                        frequency: {
                          ...preferences.frequency,
                          maxPerDay: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    min={1}
                    max={1000}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Digest Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Bundle multiple alerts into periodic summaries
                  </p>
                </div>
                <Switch
                  checked={preferences.frequency.digestMode}
                  onCheckedChange={(digestMode) =>
                    updatePreferences({
                      frequency: { ...preferences.frequency, digestMode },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Configuration Inspector */}
        <div className="space-y-6">
          <ConfigurationInspector
            entityType={selectedLevel === "user" ? "user" : selectedLevel === "site" ? "site" : "asset"}
            entityId={selectedEntityId}
            entityName={selectedEntityName}
            userId="current-user"
            siteId={selectedLevel === "site" ? selectedEntityId : undefined}
            assetId={selectedLevel === "asset" ? selectedEntityId : undefined}
            variant="card"
            notificationConfigs={notificationConfigs}
          />

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-base">Configuration Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <strong>User Level:</strong> Your default preferences for all assets
              </p>
              <p>
                <strong>Site Level:</strong> Override for all assets at a specific site
              </p>
              <p>
                <strong>Asset Level:</strong> Override for a specific high-value asset
              </p>
              <Separator className="my-3" />
              <p className="text-muted-foreground">
                More specific levels override less specific ones. Asset {'>'} Site {'>'} User
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
