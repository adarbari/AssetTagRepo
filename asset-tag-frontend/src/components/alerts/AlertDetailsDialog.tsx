import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import {
  AlertTriangle,
  Battery,
  MapPin,
  Clock,
  CheckCircle,
  User,
  Calendar,
  Package,
} from 'lucide-react';

interface Alert {
  id: string;
  type: string;
  category: string;
  title: string;
  description: string;
  asset: string;
  time: string;
  status: string;
  resolvedBy?: string;
}

interface AlertDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alert: Alert | null;
  onResolve?: () => void;
}

export function AlertDetailsDialog({
  open,
  onOpenChange,
  alert,
  onResolve,
}: AlertDetailsDialogProps) {
  const [resolutionNotes, setResolutionNotes] = useState('');

  if (!alert) return null;

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getAlertIcon = (category: string) => {
    switch (category) {
      case 'geofence':
        return <MapPin className='h-5 w-5' />;
      case 'battery':
        return <Battery className='h-5 w-5' />;
      case 'theft':
        return <AlertTriangle className='h-5 w-5' />;
      default:
        return <AlertTriangle className='h-5 w-5' />;
    }
  };

  const handleResolve = () => {
    // In a real app, this would save to backend
// console.log('Resolving alert:', alert.id, 'Notes:', resolutionNotes);
    onResolve?.();
    onOpenChange(false);
    setResolutionNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <div className='flex items-start gap-4'>
            <div
              className={`p-3 rounded-lg ${
                alert.status === 'resolved' ? 'bg-green-50' : 'bg-muted'
              }`}
            >
              {alert.status === 'resolved' ? (
                <CheckCircle className='h-5 w-5 text-green-600' />
              ) : (
                getAlertIcon(alert.category)
              )}
            </div>
            <div className='flex-1'>
              <div className='flex items-center gap-2 mb-2'>
                <DialogTitle>{alert.title}</DialogTitle>
                <Badge
                  variant='outline'
                  className={
                    alert.status === 'resolved'
                      ? 'bg-green-50 text-green-700'
                      : getAlertColor(alert.type)
                  }
                >
                  {alert.status === 'resolved' ? 'resolved' : alert.type}
                </Badge>
                <Badge variant='outline'>{alert.category}</Badge>
              </div>
              <DialogDescription>{alert.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className='space-y-4'>
          <Separator />

          {/* Alert Details */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <Package className='h-4 w-4' />
                <span>Asset ID</span>
              </div>
              <p className='font-mono'>{alert.asset}</p>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <Clock className='h-4 w-4' />
                <span>Triggered</span>
              </div>
              <p>{alert.time}</p>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <AlertTriangle className='h-4 w-4' />
                <span>Alert ID</span>
              </div>
              <p className='font-mono text-sm'>{alert.id}</p>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <Calendar className='h-4 w-4' />
                <span>Status</span>
              </div>
              <p className='capitalize'>{alert.status}</p>
            </div>
          </div>

          {alert.status === 'resolved' && alert.resolvedBy && (
            <>
              <Separator />
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <User className='h-4 w-4' />
                  <span>Resolved By</span>
                </div>
                <p>{alert.resolvedBy}</p>
              </div>
            </>
          )}

          {alert.status === 'active' && (
            <>
              <Separator />
              <div className='space-y-2'>
                <Label htmlFor='notes'>Resolution Notes (Optional)</Label>
                <Textarea
                  id='notes'
                  placeholder='Add notes about how this alert was resolved...'
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </>
          )}

          {/* Recommended Actions */}
          {alert.status === 'active' && (
            <>
              <Separator />
              <div className='space-y-2'>
                <h4>Recommended Actions</h4>
                <div className='space-y-2 text-sm'>
                  {alert.category === 'battery' && (
                    <ul className='list-disc list-inside space-y-1 text-muted-foreground'>
                      <li>Replace or recharge the battery immediately</li>
                      <li>
                        Check battery health and consider replacement if
                        degraded
                      </li>
                      <li>Review battery maintenance schedule</li>
                    </ul>
                  )}
                  {alert.category === 'geofence' && (
                    <ul className='list-disc list-inside space-y-1 text-muted-foreground'>
                      <li>Verify asset location on map</li>
                      <li>Contact site manager or asset operator</li>
                      <li>Check if asset has proper authorization</li>
                    </ul>
                  )}
                  {alert.category === 'theft' && (
                    <ul className='list-disc list-inside space-y-1 text-muted-foreground'>
                      <li>Immediately verify asset location</li>
                      <li>
                        Contact security and local authorities if necessary
                      </li>
                      <li>Review surveillance footage if available</li>
                    </ul>
                  )}
                  {alert.category === 'offline' && (
                    <ul className='list-disc list-inside space-y-1 text-muted-foreground'>
                      <li>Check if asset is in a known signal dead zone</li>
                      <li>Inspect tracker for damage or battery issues</li>
                      <li>Verify last known location</li>
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {alert.status === 'active' && (
            <>
              <Button variant='outline'>View Asset</Button>
              <Button onClick={handleResolve}>
                <CheckCircle className='h-4 w-4 mr-2' />
                Mark as Resolved
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
