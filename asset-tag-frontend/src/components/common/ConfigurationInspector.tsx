
/**
 * Configuration Inspector
 *
 * Shows which notification configuration is being applied and why.
 * Displays the inheritance chain and overrides for debugging.
 */

import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
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
} from 'lucide-react';
import type { Asset, Site } from '../types';
import { inspectConfiguration } from '../../services/notificationConfigService';
import type {
  ConfigurationInspection,
  NotificationPreferences,
} from '../../types/notificationConfig';

interface ConfigurationInspectorProps {
  entityType: 'user' | 'site' | 'asset';
  entityId: string;
  entityName: string;
  userId?: string;
  siteId?: string;
  assetId?: string;
  asset?: Asset;
  site?: Site;
  variant?: 'button' | 'inline' | 'card';
  // Optional: Pass centralized configs from App.tsx
  notificationConfigs?: Record<string, NotificationPreferences>;
}

export function ConfigurationInspector({
  entityType,
  entityId,
  entityName,
  userId = 'current-user',
  siteId,
  assetId,
  asset,
  site,
  variant = 'button',
  notificationConfigs,
}: ConfigurationInspectorProps) {
  const [inspection, setInspection] = useState<ConfigurationInspection | null>(
    null
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen || variant === 'inline' || variant === 'card') {
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
      case 'user':
        return <User className='h-4 w-4' />;
      case 'site':
        return <Building2 className='h-4 w-4' />;
      case 'asset':
        return <Package className='h-4 w-4' />;
      default:
        return <Settings className='h-4 w-4' />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className='h-4 w-4' />;
      case 'sms':
        return <MessageSquare className='h-4 w-4' />;
      case 'push':
        return <Smartphone className='h-4 w-4' />;
      case 'webhook':
        return <Webhook className='h-4 w-4' />;
      default:
        return null;
    }
  };

  const renderInspectionContent = () => {
    if (!inspection) {
      return <div className='text-muted-foreground'>Loading...</div>;
    }

    const { effectiveConfig, availableLevels } = inspection;

    return (
      <div className='space-y-6'>
        {/* Active Configuration */}
        <div>
          <h3 className='flex items-center gap-2 mb-3'>
            <CheckCircle2 className='h-5 w-5 text-green-600' />
            Active Configuration
          </h3>
          <Card className='p-4'>
            <div className='flex items-center justify-between mb-3'>
              <div className='flex items-center gap-2'>
                {getLevelIcon(effectiveConfig.source.level)}
                <div>
                  <div className='flex items-center gap-2'>
                    <span>{effectiveConfig.source.entityName}</span>
                    <Badge variant='outline' className='capitalize'>
                      {effectiveConfig.source.level} Level
                    </Badge>
                  </div>
                  <p className='text-muted-foreground'>
                    This configuration is currently being used
                  </p>
                </div>
              </div>
            </div>

            {/* Channel Summary */}
            <div className='grid grid-cols-2 gap-3 mt-4'>
              {Object.entries(effectiveConfig.preferences.channels).map(
                ([channel, config]) => (
                  <div key={channel} className='flex items-center gap-2'>
                    {getChannelIcon(channel)}
                    <span className='capitalize'>{channel}</span>
                    <Badge
                      variant={config.enabled ? 'default' : 'secondary'}
                      className='ml-auto'
                    >
                      {config.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                )
              )}
            </div>

            {/* Quiet Hours */}
            {effectiveConfig.preferences.quietHours.enabled && (
              <div className='mt-4 p-3 bg-muted rounded-md'>
                <div className='flex items-center gap-2'>
                  <Info className='h-4 w-4' />
                  <span>
                    Quiet Hours: {effectiveConfig.preferences.quietHours.start}{' '}
                    - {effectiveConfig.preferences.quietHours.end}
                  </span>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Inheritance Chain */}
        <div>
          <h3 className='flex items-center gap-2 mb-3'>
            <Info className='h-5 w-5 text-blue-600' />
            Configuration Inheritance
          </h3>
          <Card className='p-4'>
            <div className='space-y-2'>
              {effectiveConfig.inheritanceChain.map((item, index) => (
                <div key={`${item.level}-${item.entityId}`}>
                  <div className='flex items-center gap-3'>
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        item.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {getLevelIcon(item.level)}
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2'>
                        <span
                          className={
                            item.isActive ? '' : 'text-muted-foreground'
                          }
                        >
                          {item.entityName}
                        </span>
                        <Badge
                          variant={item.isActive ? 'default' : 'outline'}
                          className='capitalize'
                        >
                          {item.level}
                        </Badge>
                        {item.isActive && (
                          <Badge variant='default' className='bg-green-600'>
                            Active
                          </Badge>
                        )}
                      </div>
                      {!item.isActive && (
                        <p className='text-muted-foreground'>
                          Overridden by {effectiveConfig.source.level} level
                        </p>
                      )}
                    </div>
                  </div>
                  {index < effectiveConfig.inheritanceChain.length - 1 && (
                    <div className='ml-4 my-1'>
                      <ChevronRight className='h-4 w-4 text-muted-foreground' />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {effectiveConfig.inheritanceChain.length === 1 && (
              <p className='text-muted-foreground mt-2'>
                No overrides configured. Using default{' '}
                {effectiveConfig.source.level}-level settings.
              </p>
            )}
          </Card>
        </div>

        {/* Available Configurations */}
        <div>
          <h3 className='flex items-center gap-2 mb-3'>
            <Settings className='h-5 w-5 text-gray-600' />
            Available Configurations
          </h3>
          <Card className='p-4'>
            <div className='space-y-2'>
              {availableLevels.map(level => (
                <div
                  key={level.level}
                  className='flex items-center justify-between p-2 rounded hover:bg-muted'
                >
                  <div className='flex items-center gap-2'>
                    {getLevelIcon(level.level)}
                    <span className='capitalize'>{level.level} Level</span>
                  </div>
                  {level.exists ? (
                    <Badge variant='outline' className='gap-1'>
                      <CheckCircle2 className='h-3 w-3' />
                      Configured
                    </Badge>
                  ) : (
                    <Badge variant='secondary' className='gap-1'>
                      <AlertCircle className='h-3 w-3' />
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
            <h3 className='flex items-center gap-2 mb-3'>
              <AlertCircle className='h-5 w-5 text-orange-600' />
              Active Overrides
            </h3>
            <Card className='p-4'>
              <div className='space-y-2'>
                {effectiveConfig.overrides.map((override, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between'
                  >
                    <code className='text-sm'>{override.field}</code>
                    <div className='flex items-center gap-2'>
                      <Badge variant='outline'>{String(override.value)}</Badge>
                      <span className='text-muted-foreground'>from</span>
                      <Badge className='capitalize'>{override.source}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Help Text */}
        <Card className='p-4 bg-blue-50 border-blue-200'>
          <div className='flex gap-3'>
            <Info className='h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5' />
            <div className='space-y-2'>
              <p>
                <strong>How it works:</strong> Notification settings inherit
                from User → Site → Asset. More specific levels override less
                specific ones.
              </p>
              <ul className='space-y-1 text-muted-foreground'>
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
  if (variant === 'button') {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant='outline' className='gap-2'>
            <Eye className='h-4 w-4' />
            View Configuration
          </Button>
        </DialogTrigger>
        <DialogContent className='max-w-3xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Notification Configuration Inspector</DialogTitle>
            <DialogDescription>
              View which notification settings are being applied for{' '}
              {entityName}
            </DialogDescription>
          </DialogHeader>
          {renderInspectionContent()}
        </DialogContent>
      </Dialog>
    );
  }

  // Card variant
  if (variant === 'card') {
    return (
      <Card className='p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='flex items-center gap-2'>
            <Eye className='h-5 w-5' />
            Configuration Inspector
          </h2>
          <Button variant='outline' size='sm' onClick={loadInspection}>
            Refresh
          </Button>
        </div>
        <Separator className='mb-6' />
        {renderInspectionContent()}
      </Card>
    );
  }

  // Inline variant
  return <div className='space-y-4'>{renderInspectionContent()}</div>;
}
