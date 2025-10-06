import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { History, User, Clock, FileText } from 'lucide-react';
import { EmptyState } from './EmptyState';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  changedBy?: string;
  user?: string; // Alternative to changedBy
  notes?: string;
  changes?: Array<{
    field: string;
    from: string;
    to: string;
  }>;
}

interface AuditLogListProps {
  entries: AuditLogEntry[];
  title?: string;
  description?: string;
  variant?: 'card' | 'dialog' | 'inline';
  showEmptyState?: boolean;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  formatDate?: (dateString: string) => string;
  className?: string;
}

const defaultFormatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

export function AuditLogList({
  entries,
  title = 'Audit Log',
  description = 'Complete history of all changes',
  variant = 'card',
  showEmptyState = true,
  emptyStateTitle = 'No Audit Log Entries',
  emptyStateDescription = 'No changes have been recorded yet.',
  formatDate = defaultFormatDate,
  className,
}: AuditLogListProps) {
  const renderEntry = (entry: AuditLogEntry, index: number) => {
    const user = entry.changedBy || entry.user || 'Unknown User';
    const isLast = index === entries.length - 1;

    if (variant === 'dialog') {
      return (
        <div key={entry.id || index}>
          <div className='flex items-start gap-4'>
            <div className='flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary' />
            <div className='flex-1 space-y-2'>
              <div className='flex items-start justify-between'>
                <div>
                  <div className='flex items-center gap-2'>
                    <Badge variant='outline' className='bg-primary/10'>
                      {entry.action}
                    </Badge>
                    <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                      <User className='h-3 w-3' />
                      {user}
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                  <Clock className='h-3 w-3' />
                  {formatDate(entry.timestamp)}
                </div>
              </div>

              {entry.changes && entry.changes.length > 0 && (
                <div className='space-y-1'>
                  {entry.changes.map((change, idx) => (
                    <div
                      key={idx}
                      className='text-sm bg-muted/50 rounded-md p-2'
                    >
                      <span className='text-muted-foreground'>
                        {change.field}:
                      </span>{' '}
                      <span className='line-through text-muted-foreground'>
                        {change.from}
                      </span>{' '}
                      → <span>{change.to}</span>
                    </div>
                  ))}
                </div>
              )}

              {entry.field && entry.oldValue && entry.newValue && (
                <div className='text-sm bg-muted/50 rounded-md p-2'>
                  <span className='text-muted-foreground'>{entry.field}:</span>{' '}
                  <span className='line-through text-muted-foreground'>
                    {entry.oldValue}
                  </span>{' '}
                  → <span>{entry.newValue}</span>
                </div>
              )}

              {entry.notes && (
                <div className='flex items-start gap-2 text-sm text-muted-foreground bg-muted/30 rounded-md p-2'>
                  <FileText className='h-4 w-4 mt-0.5 flex-shrink-0' />
                  <span>{entry.notes}</span>
                </div>
              )}
            </div>
          </div>
          {!isLast && <Separator className='my-4 ml-5' />}
        </div>
      );
    }

    // Card and inline variants
    return (
      <div
        key={entry.id || index}
        className='flex items-start gap-4 p-4 border rounded-lg'
      >
        <div className='flex-shrink-0'>
          <div className='w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center'>
            <User className='h-4 w-4 text-primary' />
          </div>
        </div>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 mb-1'>
            <span className='font-medium text-sm'>{user}</span>
            <span className='text-xs text-muted-foreground'>
              {formatDate(entry.timestamp)}
            </span>
          </div>
          <p className='text-sm text-muted-foreground'>
            {entry.action === 'created' ? 'Created' : 'Updated'}{' '}
            {entry.field || 'record'}
            {entry.oldValue && entry.newValue && (
              <span className='ml-1'>
                from "{entry.oldValue}" to "{entry.newValue}"
              </span>
            )}
          </p>
          {entry.notes && (
            <p className='text-xs text-muted-foreground mt-1 italic'>
              {entry.notes}
            </p>
          )}
        </div>
      </div>
    );
  };

  const content = (
    <div className='space-y-4'>
      {entries.map((entry, index) => renderEntry(entry, index))}
    </div>
  );

  if (entries.length === 0 && showEmptyState) {
    return (
      <div className={className}>
        {variant === 'card' ? (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <History className='h-5 w-5' />
                {title}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={History}
                title={emptyStateTitle}
                description={emptyStateDescription}
              />
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            icon={History}
            title={emptyStateTitle}
            description={emptyStateDescription}
          />
        )}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <History className='h-5 w-5' />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    );
  }

  return <div className={className}>{content}</div>;
}
