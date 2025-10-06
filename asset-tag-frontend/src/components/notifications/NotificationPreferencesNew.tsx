import React from &apos;react&apos;;

/**
 * Notification Preferences - Hierarchical Configuration
 *
 * Supports three levels:
 * - User Level (default preferences)
 * - Site Level (overrides for specific sites)
 * - Asset Level (overrides for specific assets)
 */

import { useState, useEffect } from &apos;react&apos;;
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from &apos;../ui/card&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Switch } from &apos;../ui/switch&apos;;
import { Label } from &apos;../ui/label&apos;;
import { Input } from &apos;../ui/input&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import { Separator } from &apos;../ui/separator&apos;;
import { Alert, AlertDescription } from &apos;../ui/alert&apos;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &apos;../ui/select&apos;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &apos;../ui/tabs&apos;;
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
  Trash2,
  CheckCircle2,
} from &apos;lucide-react&apos;;
import { toast } from &apos;sonner&apos;;
import { ConfigurationInspector, PageLayout } from &apos;../common&apos;;
import type {
  NotificationPreferences,
  NotificationLevel,
  NotificationChannelType,
} from &apos;../../types/notificationConfig&apos;;

interface NotificationPreferencesNewProps {
  onBack?: () => void;
  // Optional: Pre-select a specific level (for site/asset detail pages)
  preselectedLevel?: NotificationLevel;
  preselectedEntityId?: string;
  preselectedEntityName?: string;
  // Centralized state from App.tsx
  notificationConfigs: Record<string, NotificationPreferences>;
  onSaveConfig: (
    config: NotificationPreferences
  ) => Promise<{ success: boolean; error?: any }>;
  onDeleteConfig: (
    level: string,
    entityId: string
  ) => Promise<{ success: boolean; error?: any }>;
  onGetConfig: (
    level: string,
    entityId: string
  ) => NotificationPreferences | undefined;
}

export function NotificationPreferencesNew({
  onBack,
  preselectedLevel = &apos;user&apos;,
  preselectedEntityId,
  preselectedEntityName,
  notificationConfigs,
  onSaveConfig,
  onDeleteConfig,
  onGetConfig,
}: NotificationPreferencesNewProps) {
  const [selectedLevel, setSelectedLevel] =
    useState<NotificationLevel>(preselectedLevel);
  const [selectedEntityId, setSelectedEntityId] = useState(
    preselectedEntityId || &apos;current-user&apos;
  );
  const [selectedEntityName, setSelectedEntityName] = useState(
    preselectedEntityName || &apos;Your Account&apos;
  );

  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(null);
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
            enabled: selectedLevel === &apos;user&apos; ? true : false,
            addresses: selectedLevel === &apos;user&apos; ? [&apos;user@example.com&apos;] : [],
            verified: selectedLevel === &apos;user&apos;,
          },
          sms: {
            enabled: false,
            phoneNumbers: [],
            verified: false,
          },
          push: {
            enabled: selectedLevel === &apos;user&apos; ? true : false,
            devices: selectedLevel === &apos;user&apos; ? [&apos;device-1&apos;] : [],
          },
          webhook: {
            enabled: false,
            endpoints: [],
          },
        },
        filters: {
          types: [], // All types
          severities: [&apos;medium&apos;, &apos;high&apos;, &apos;critical&apos;],
        },
        quietHours: {
          enabled: selectedLevel === &apos;user&apos; ? true : false,
          start: &apos;22:00&apos;,
          end: &apos;08:00&apos;,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          excludeCritical: true,
        },
        frequency: {
          maxPerHour: 20,
          maxPerDay: 100,
          digestMode: false,
        },
        isOverride: selectedLevel !== &apos;user&apos;,
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
        toast.success(&apos;Preferences saved&apos;, {
          description: `${selectedLevel === &apos;user&apos; ? &apos;Your&apos; : selectedEntityName} notification preferences have been updated`,
        });
        setHasChanges(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(&apos;Failed to save preferences&apos;, {
        description: &apos;Please try again&apos;,
      });
    }
  };

  const handleDeleteOverride = async () => {
    if (selectedLevel === &apos;user&apos;) {
      toast.error(&apos;Cannot delete user-level preferences&apos;);
      return;
    }

    try {
      const result = await onDeleteConfig(selectedLevel, selectedEntityId);

      if (result.success) {
        toast.success(&apos;Override removed&apos;, {
          description: `${selectedEntityName} will now inherit preferences from parent level`,
        });

        // Switch back to user level
        setSelectedLevel(&apos;user&apos;);
        setSelectedEntityId(&apos;current-user&apos;);
        setSelectedEntityName(&apos;Your Account&apos;);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(&apos;Failed to remove override&apos;);
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

  const updateChannelAddresses = (channel: &apos;email&apos; | &apos;sms&apos;, value: string) => {
    if (!preferences) return;

    const addresses = value
      .split(&apos;,&apos;)
      .map(a => a.trim())
      .filter(Boolean);

    setPreferences({
      ...preferences,
      channels: {
        ...preferences.channels,
        [channel]: {
          ...preferences.channels[channel],
          [channel === &apos;email&apos; ? &apos;addresses&apos; : &apos;phoneNumbers&apos;]: addresses,
          verified: false,
        },
      },
    });
    setHasChanges(true);

    if (channel === &apos;email&apos;) setEmailVerified(false);
    if (channel === &apos;sms&apos;) setSmsVerified(false);
  };

  const handleTestNotification = (channel: NotificationChannelType) => {
    toast.success(&apos;Test notification sent&apos;, {
      description: `A test notification has been sent via ${channel}`,
    });
  };

  const handleVerifyChannel = (channel: &apos;email&apos; | &apos;sms&apos;) => {
    // In production, this would send a verification code
    if (channel === &apos;email&apos;) setEmailVerified(true);
    if (channel === &apos;sms&apos;) setSmsVerified(true);

    toast.success(&apos;Verification code sent&apos;, {
      description: `Check your ${channel === &apos;email&apos; ? &apos;email&apos; : &apos;phone&apos;} for the verification code`,
    });
  };

  const toggleSeverity = (severity: &apos;low&apos; | &apos;medium&apos; | &apos;high&apos; | &apos;critical&apos;) => {
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
    return <div className=&apos;p-6&apos;>Loading...</div>;
  }

  return (
    <PageLayout variant=&apos;standard&apos; padding=&apos;md&apos;>
      {/* Header */}
      <div className=&apos;flex items-center justify-between&apos;>
        <div className=&apos;flex items-center gap-4&apos;>
          {onBack && (
            <Button variant=&apos;ghost&apos; size=&apos;sm&apos; onClick={onBack}>
              <ChevronLeft className=&apos;h-4 w-4 mr-2&apos; />
              Back
            </Button>
          )}
          <div>
            <h1 className=&apos;flex items-center gap-2&apos;>
              <Bell className=&apos;h-6 w-6&apos; />
              Notification Preferences
            </h1>
            <p className=&apos;text-muted-foreground&apos;>
              Configure how you receive alert notifications
            </p>
          </div>
        </div>
        <div className=&apos;flex items-center gap-2&apos;>
          {hasChanges && (
            <Badge variant=&apos;outline&apos; className=&apos;gap-1&apos;>
              <Info className=&apos;h-3 w-3&apos; />
              Unsaved changes
            </Badge>
          )}
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className=&apos;h-4 w-4 mr-2&apos; />
            Save Preferences
          </Button>
        </div>
      </div>

      {/* Level Selector */}
      <Card>
        <CardHeader>
          <CardTitle className=&apos;flex items-center gap-2&apos;>
            {selectedLevel === &apos;user&apos; && <User className=&apos;h-5 w-5&apos; />}
            {selectedLevel === &apos;site&apos; && <Building2 className=&apos;h-5 w-5&apos; />}
            {selectedLevel === &apos;asset&apos; && <Package className=&apos;h-5 w-5&apos; />}
            Configuration Level
          </CardTitle>
          <CardDescription>
            Choose which level to configure - more specific levels override less
            specific ones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={selectedLevel}
            onValueChange={v => {
              setSelectedLevel(v as NotificationLevel);
              if (v === &apos;user&apos;) {
                setSelectedEntityId(&apos;current-user&apos;);
                setSelectedEntityName(&apos;Your Account&apos;);
              }
            }}
          >
            <TabsList className=&apos;grid grid-cols-3&apos;>
              <TabsTrigger value=&apos;user&apos; className=&apos;gap-2&apos;>
                <User className=&apos;h-4 w-4&apos; />
                User Level
              </TabsTrigger>
              <TabsTrigger value=&apos;site&apos; className=&apos;gap-2&apos;>
                <Building2 className=&apos;h-4 w-4&apos; />
                Site Level
              </TabsTrigger>
              <TabsTrigger value=&apos;asset&apos; className=&apos;gap-2&apos;>
                <Package className=&apos;h-4 w-4&apos; />
                Asset Level
              </TabsTrigger>
            </TabsList>

            <TabsContent value=&apos;user&apos; className=&apos;space-y-6&apos;>
              <Alert>
                <Info className=&apos;h-4 w-4&apos; />
                <AlertDescription>
                  These are your default notification preferences. They apply to
                  all sites and assets unless overridden.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value=&apos;site&apos; className=&apos;space-y-6&apos;>
              <Alert>
                <Info className=&apos;h-4 w-4&apos; />
                <AlertDescription>
                  Create site-specific notification preferences that override
                  your user-level settings for assets at this site.
                </AlertDescription>
              </Alert>

              <div className=&apos;space-y-2&apos;>
                <Label>Select Site</Label>
                <Select
                  value={selectedEntityId}
                  onValueChange={id => {
                    setSelectedEntityId(id);
                    setSelectedEntityName(`Site: ${id}`); // In production, fetch actual site name
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder=&apos;Choose a site...&apos; />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=&apos;site-001&apos;>
                      Construction Site A
                    </SelectItem>
                    <SelectItem value=&apos;site-002&apos;>Warehouse B</SelectItem>
                    <SelectItem value=&apos;site-003&apos;>Depot C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value=&apos;asset&apos; className=&apos;space-y-6&apos;>
              <Alert>
                <Info className=&apos;h-4 w-4&apos; />
                <AlertDescription>
                  Create asset-specific notification preferences that override
                  both user and site-level settings for this specific asset.
                </AlertDescription>
              </Alert>

              <div className=&apos;space-y-2&apos;>
                <Label>Select Asset</Label>
                <Select
                  value={selectedEntityId}
                  onValueChange={id => {
                    setSelectedEntityId(id);
                    setSelectedEntityName(`Asset: ${id}`); // In production, fetch actual asset name
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder=&apos;Choose an asset...&apos; />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=&apos;asset-001&apos;>Excavator EX-100</SelectItem>
                    <SelectItem value=&apos;asset-002&apos;>Bulldozer BD-200</SelectItem>
                    <SelectItem value=&apos;asset-003&apos;>Crane CR-300</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          {selectedLevel !== &apos;user&apos; && preferences.isOverride && (
            <div className=&apos;mt-4 flex items-center justify-between p-3 border border-orange-200 bg-orange-50 rounded-md&apos;>
              <div className=&apos;flex items-center gap-2&apos;>
                <Info className=&apos;h-4 w-4 text-orange-600&apos; />
                <span className=&apos;text-sm&apos;>
                  This {selectedLevel} has custom notification preferences
                </span>
              </div>
              <Button
                variant=&apos;destructive&apos;
                size=&apos;sm&apos;
                onClick={handleDeleteOverride}
              >
                <Trash2 className=&apos;h-4 w-4 mr-2&apos; />
                Remove Override
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className=&apos;grid grid-cols-1 lg:grid-cols-3 gap-6&apos;>
        {/* Main Configuration */}
        <div className=&apos;lg:col-span-2 space-y-6&apos;>
          {/* Notification Channels */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>
                Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className=&apos;space-y-6&apos;>
              {/* Email */}
              <div className=&apos;space-y-3&apos;>
                <div className=&apos;flex items-center justify-between&apos;>
                  <div className=&apos;flex items-center gap-3&apos;>
                    <Mail className=&apos;h-5 w-5 text-muted-foreground&apos; />
                    <div>
                      <Label>Email Notifications</Label>
                      <p className=&apos;text-xs text-muted-foreground&apos;>
                        Receive alerts via email
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.channels.email.enabled}
                    onCheckedChange={() => toggleChannel(&apos;email&apos;)}
                  />
                </div>

                {preferences.channels.email.enabled && (
                  <div className=&apos;ml-8 space-y-2&apos;>
                    <div className=&apos;flex gap-2&apos;>
                      <Input
                        type=&apos;email&apos;
                        placeholder=&apos;email@example.com, another@example.com&apos;
                        value={
                          preferences.channels.email.addresses?.join(&apos;, &apos;) || &apos;&apos;
                        }
                        onChange={e =>
                          updateChannelAddresses(&apos;email&apos;, e.target.value)
                        }
                      />
                      <Button
                        variant=&apos;outline&apos;
                        size=&apos;sm&apos;
                        onClick={() => handleVerifyChannel(&apos;email&apos;)}
                        disabled={emailVerified}
                      >
                        {emailVerified ? (
                          <CheckCircle2 className=&apos;h-4 w-4 mr-2 text-green-600&apos; />
                        ) : null}
                        {emailVerified ? &apos;Verified&apos; : &apos;Verify&apos;}
                      </Button>
                    </div>
                    <Button
                      variant=&apos;ghost&apos;
                      size=&apos;sm&apos;
                      onClick={() => handleTestNotification(&apos;email&apos;)}
                    >
                      <TestTube className=&apos;h-4 w-4 mr-2&apos; />
                      Send Test Email
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              {/* SMS */}
              <div className=&apos;space-y-3&apos;>
                <div className=&apos;flex items-center justify-between&apos;>
                  <div className=&apos;flex items-center gap-3&apos;>
                    <MessageSquare className=&apos;h-5 w-5 text-muted-foreground&apos; />
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className=&apos;text-xs text-muted-foreground&apos;>
                        Receive alerts via text message
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.channels.sms.enabled}
                    onCheckedChange={() => toggleChannel(&apos;sms&apos;)}
                  />
                </div>

                {preferences.channels.sms.enabled && (
                  <div className=&apos;ml-8 space-y-2&apos;>
                    <div className=&apos;flex gap-2&apos;>
                      <Input
                        type=&apos;tel&apos;
                        placeholder=&apos;+1-555-123-4567&apos;
                        value={
                          preferences.channels.sms.phoneNumbers?.join(&apos;, &apos;) ||
                          &apos;&apos;
                        }
                        onChange={e =>
                          updateChannelAddresses(&apos;sms&apos;, e.target.value)
                        }
                      />
                      <Button
                        variant=&apos;outline&apos;
                        size=&apos;sm&apos;
                        onClick={() => handleVerifyChannel(&apos;sms&apos;)}
                        disabled={smsVerified}
                      >
                        {smsVerified ? (
                          <CheckCircle2 className=&apos;h-4 w-4 mr-2 text-green-600&apos; />
                        ) : null}
                        {smsVerified ? &apos;Verified&apos; : &apos;Verify&apos;}
                      </Button>
                    </div>
                    <Button
                      variant=&apos;ghost&apos;
                      size=&apos;sm&apos;
                      onClick={() => handleTestNotification(&apos;sms&apos;)}
                    >
                      <TestTube className=&apos;h-4 w-4 mr-2&apos; />
                      Send Test SMS
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              {/* Push */}
              <div className=&apos;flex items-center justify-between&apos;>
                <div className=&apos;flex items-center gap-3&apos;>
                  <Smartphone className=&apos;h-5 w-5 text-muted-foreground&apos; />
                  <div>
                    <Label>Push Notifications</Label>
                    <p className=&apos;text-xs text-muted-foreground&apos;>
                      Receive alerts on your mobile device
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.channels.push.enabled}
                  onCheckedChange={() => toggleChannel(&apos;push&apos;)}
                />
              </div>

              <Separator />

              {/* Webhook */}
              <div className=&apos;flex items-center justify-between&apos;>
                <div className=&apos;flex items-center gap-3&apos;>
                  <Webhook className=&apos;h-5 w-5 text-muted-foreground&apos; />
                  <div>
                    <Label>Webhook Notifications</Label>
                    <p className=&apos;text-xs text-muted-foreground&apos;>
                      Send alerts to external systems
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.channels.webhook.enabled}
                  onCheckedChange={() => toggleChannel(&apos;webhook&apos;)}
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
            <CardContent className=&apos;space-y-4&apos;>
              <div className=&apos;space-y-2&apos;>
                <Label>Minimum Severity</Label>
                <div className=&apos;grid grid-cols-4 gap-2&apos;>
                  {([&apos;low&apos;, &apos;medium&apos;, &apos;high&apos;, &apos;critical&apos;] as const).map(
                    severity => (
                      <Button
                        key={severity}
                        variant={
                          preferences.filters.severities.includes(severity)
                            ? &apos;default&apos;
                            : &apos;outline&apos;
                        }
                        size=&apos;sm&apos;
                        onClick={() => toggleSeverity(severity)}
                        className=&apos;capitalize&apos;
                      >
                        {severity}
                      </Button>
                    )
                  )}
                </div>
                <p className=&apos;text-xs text-muted-foreground&apos;>
                  You&apos;ll receive alerts with these severity levels
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quiet Hours */}
          <Card>
            <CardHeader>
              <CardTitle className=&apos;flex items-center gap-2&apos;>
                <Clock className=&apos;h-5 w-5&apos; />
                Quiet Hours
              </CardTitle>
              <CardDescription>
                Set times when you don&apos;t want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className=&apos;space-y-4&apos;>
              <div className=&apos;flex items-center justify-between&apos;>
                <Label>Enable Quiet Hours</Label>
                <Switch
                  checked={preferences.quietHours.enabled}
                  onCheckedChange={enabled =>
                    updatePreferences({
                      quietHours: { ...preferences.quietHours, enabled },
                    })
                  }
                />
              </div>

              {preferences.quietHours.enabled && (
                <>
                  <div className=&apos;grid grid-cols-2 gap-4&apos;>
                    <div className=&apos;space-y-2&apos;>
                      <Label>Start Time</Label>
                      <Input
                        type=&apos;time&apos;
                        value={preferences.quietHours.start}
                        onChange={e =>
                          updatePreferences({
                            quietHours: {
                              ...preferences.quietHours,
                              start: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className=&apos;space-y-2&apos;>
                      <Label>End Time</Label>
                      <Input
                        type=&apos;time&apos;
                        value={preferences.quietHours.end}
                        onChange={e =>
                          updatePreferences({
                            quietHours: {
                              ...preferences.quietHours,
                              end: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className=&apos;flex items-center justify-between&apos;>
                    <div>
                      <Label>Send Critical Alerts Anyway</Label>
                      <p className=&apos;text-xs text-muted-foreground&apos;>
                        Receive critical alerts even during quiet hours
                      </p>
                    </div>
                    <Switch
                      checked={preferences.quietHours.excludeCritical}
                      onCheckedChange={excludeCritical =>
                        updatePreferences({
                          quietHours: {
                            ...preferences.quietHours,
                            excludeCritical,
                          },
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
              <CardDescription>Prevent notification overload</CardDescription>
            </CardHeader>
            <CardContent className=&apos;space-y-4&apos;>
              <div className=&apos;grid grid-cols-2 gap-4&apos;>
                <div className=&apos;space-y-2&apos;>
                  <Label>Max per Hour</Label>
                  <Input
                    type=&apos;number&apos;
                    value={preferences.frequency.maxPerHour}
                    onChange={e =>
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
                <div className=&apos;space-y-2&apos;>
                  <Label>Max per Day</Label>
                  <Input
                    type=&apos;number&apos;
                    value={preferences.frequency.maxPerDay}
                    onChange={e =>
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

              <div className=&apos;flex items-center justify-between&apos;>
                <div>
                  <Label>Digest Mode</Label>
                  <p className=&apos;text-xs text-muted-foreground&apos;>
                    Bundle multiple alerts into periodic summaries
                  </p>
                </div>
                <Switch
                  checked={preferences.frequency.digestMode}
                  onCheckedChange={digestMode =>
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
        <div className=&apos;space-y-6&apos;>
          <ConfigurationInspector
            entityType={
              selectedLevel === &apos;user&apos;
                ? &apos;user&apos;
                : selectedLevel === &apos;site&apos;
                  ? &apos;site&apos;
                  : &apos;asset&apos;
            }
            entityId={selectedEntityId}
            entityName={selectedEntityName}
            userId=&apos;current-user&apos;
            siteId={selectedLevel === &apos;site&apos; ? selectedEntityId : undefined}
            assetId={selectedLevel === &apos;asset&apos; ? selectedEntityId : undefined}
            variant=&apos;card&apos;
            notificationConfigs={notificationConfigs}
          />

          <Card className=&apos;bg-blue-50 border-blue-200&apos;>
            <CardHeader>
              <CardTitle className=&apos;text-base&apos;>Configuration Tips</CardTitle>
            </CardHeader>
            <CardContent className=&apos;space-y-2 text-sm&apos;>
              <p>
                <strong>User Level:</strong> Your default preferences for all
                assets
              </p>
              <p>
                <strong>Site Level:</strong> Override for all assets at a
                specific site
              </p>
              <p>
                <strong>Asset Level:</strong> Override for a specific high-value
                asset
              </p>
              <Separator className=&apos;my-3&apos; />
              <p className=&apos;text-muted-foreground&apos;>
                More specific levels override less specific ones. Asset {&apos;>&apos;}{&apos; &apos;}
                Site {&apos;>&apos;} User
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
