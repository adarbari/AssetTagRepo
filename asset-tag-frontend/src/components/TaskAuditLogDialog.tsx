import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from &apos;./ui/dialog&apos;;
import { ScrollArea } from &apos;./ui/scroll-area&apos;;
import { AuditLogList, type AuditLogEntry } from &apos;./common&apos;;
import { History } from &apos;lucide-react&apos;;

interface TaskAuditLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: {
    id: string;
    assetName: string;
    task: string;
    auditLog: AuditLogEntry[];
  } | null;
}

export function TaskAuditLogDialog({
  open,
  onOpenChange,
  task,
}: TaskAuditLogDialogProps) {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=&apos;max-w-3xl max-h-[85vh]&apos;>
        <DialogHeader>
          <DialogTitle className=&apos;flex items-center gap-2&apos;>
            <History className=&apos;h-5 w-5&apos; />
            Audit Log - {task.id}
          </DialogTitle>
          <DialogDescription>
            Complete history of all changes made to this maintenance task
          </DialogDescription>
        </DialogHeader>

        <div className=&apos;p-4 bg-muted rounded-lg&apos;>
          <div>
            <h4>{task.assetName}</h4>
            <p className=&apos;text-sm text-muted-foreground&apos;>{task.task}</p>
          </div>
        </div>

        <ScrollArea className=&apos;h-[500px] pr-4&apos;>
          <AuditLogList
            entries={task.auditLog.map((entry, index) => ({
              id: `audit-${index}`,
              timestamp: entry.timestamp,
              action: entry.action,
              changedBy: entry.user,
              changes: entry.changes,
              notes: entry.notes,
            }))}
            variant=&apos;dialog&apos;
            showEmptyState={true}
            emptyStateTitle=&apos;No Audit Log Entries&apos;
            emptyStateDescription=&apos;No changes have been recorded for this task yet.&apos;
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
