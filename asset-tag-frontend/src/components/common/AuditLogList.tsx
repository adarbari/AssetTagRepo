import React from &apos;react&apos;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &apos;../ui/card&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import { Separator } from &apos;../ui/separator&apos;;
import { History, User, Clock, FileText } from &apos;lucide-react&apos;;
import { EmptyState } from &apos;./EmptyState&apos;;

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
  variant?: &apos;card&apos; | &apos;dialog&apos; | &apos;inline&apos;;
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
  title = &apos;Audit Log&apos;,
  description = &apos;Complete history of all changes&apos;,
  variant = &apos;card&apos;,
  showEmptyState = true,
  emptyStateTitle = &apos;No Audit Log Entries&apos;,
  emptyStateDescription = &apos;No changes have been recorded yet.&apos;,
  formatDate = defaultFormatDate,
  className,
}: AuditLogListProps) {
  const renderEntry = (entry: AuditLogEntry, index: number) => {
    const user = entry.changedBy || entry.user || &apos;Unknown User&apos;;
    const isLast = index === entries.length - 1;

    if (variant === &apos;dialog&apos;) {
      return (
        <div key={entry.id || index}>
          <div className=&apos;flex items-start gap-4&apos;>
            <div className=&apos;flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary&apos; />
            <div className=&apos;flex-1 space-y-2&apos;>
              <div className=&apos;flex items-start justify-between&apos;>
                <div>
                  <div className=&apos;flex items-center gap-2&apos;>
                    <Badge variant=&apos;outline&apos; className=&apos;bg-primary/10&apos;>
                      {entry.action}
                    </Badge>
                    <div className=&apos;flex items-center gap-1 text-sm text-muted-foreground&apos;>
                      <User className=&apos;h-3 w-3&apos; />
                      {user}
                    </div>
                  </div>
                </div>
                <div className=&apos;flex items-center gap-1 text-sm text-muted-foreground&apos;>
                  <Clock className=&apos;h-3 w-3&apos; />
                  {formatDate(entry.timestamp)}
                </div>
              </div>

              {entry.changes && entry.changes.length > 0 && (
                <div className=&apos;space-y-1&apos;>
                  {entry.changes.map((change, idx) => (
                    <div
                      key={idx}
                      className=&apos;text-sm bg-muted/50 rounded-md p-2&apos;
                    >
                      <span className=&apos;text-muted-foreground&apos;>
                        {change.field}:
                      </span>{&apos; &apos;}
                      <span className=&apos;line-through text-muted-foreground&apos;>
                        {change.from}
                      </span>{&apos; &apos;}
                      → <span>{change.to}</span>
                    </div>
                  ))}
                </div>
              )}

              {entry.field && entry.oldValue && entry.newValue && (
                <div className=&apos;text-sm bg-muted/50 rounded-md p-2&apos;>
                  <span className=&apos;text-muted-foreground&apos;>{entry.field}:</span>{&apos; &apos;}
                  <span className=&apos;line-through text-muted-foreground&apos;>
                    {entry.oldValue}
                  </span>{&apos; &apos;}
                  → <span>{entry.newValue}</span>
                </div>
              )}

              {entry.notes && (
                <div className=&apos;flex items-start gap-2 text-sm text-muted-foreground bg-muted/30 rounded-md p-2&apos;>
                  <FileText className=&apos;h-4 w-4 mt-0.5 flex-shrink-0&apos; />
                  <span>{entry.notes}</span>
                </div>
              )}
            </div>
          </div>
          {!isLast && <Separator className=&apos;my-4 ml-5&apos; />}
        </div>
      );
    }

    // Card and inline variants
    return (
      <div
        key={entry.id || index}
        className=&apos;flex items-start gap-4 p-4 border rounded-lg&apos;
      >
        <div className=&apos;flex-shrink-0&apos;>
          <div className=&apos;w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center&apos;>
            <User className=&apos;h-4 w-4 text-primary&apos; />
          </div>
        </div>
        <div className=&apos;flex-1 min-w-0&apos;>
          <div className=&apos;flex items-center gap-2 mb-1&apos;>
            <span className=&apos;font-medium text-sm&apos;>{user}</span>
            <span className=&apos;text-xs text-muted-foreground&apos;>
              {formatDate(entry.timestamp)}
            </span>
          </div>
          <p className=&apos;text-sm text-muted-foreground&apos;>
            {entry.action === &apos;created&apos; ? &apos;Created&apos; : &apos;Updated&apos;}{&apos; &apos;}
            {entry.field || &apos;record&apos;}
            {entry.oldValue && entry.newValue && (
              <span className=&apos;ml-1&apos;>
                from &quot;{entry.oldValue}&quot; to &quot;{entry.newValue}
                &quot;
              </span>
            )}
          </p>
          {entry.notes && (
            <p className=&apos;text-xs text-muted-foreground mt-1 italic&apos;>
              {entry.notes}
            </p>
          )}
        </div>
      </div>
    );
  };

  const content = (
    <div className=&apos;space-y-4&apos;>
      {entries.map((entry, index) => renderEntry(entry, index))}
    </div>
  );

  if (entries.length === 0 && showEmptyState) {
    return (
      <div className={className}>
        {variant === &apos;card&apos; ? (
          <Card>
            <CardHeader>
              <CardTitle className=&apos;flex items-center gap-2&apos;>
                <History className=&apos;h-5 w-5&apos; />
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

  if (variant === &apos;card&apos;) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className=&apos;flex items-center gap-2&apos;>
            <History className=&apos;h-5 w-5&apos; />
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
