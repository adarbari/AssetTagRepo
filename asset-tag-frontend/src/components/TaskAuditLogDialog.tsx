import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { AuditLogList, type AuditLogEntry } from './common';

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
      <DialogContent className='max-w-3xl max-h-[85vh]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <History className='h-5 w-5' />
            Audit Log - {task.id}
          </DialogTitle>
          <DialogDescription>
            Complete history of all changes made to this maintenance task
          </DialogDescription>
        </DialogHeader>

        <div className='p-4 bg-muted rounded-lg'>
          <div>
            <h4>{task.assetName}</h4>
            <p className='text-sm text-muted-foreground'>{task.task}</p>
          </div>
        </div>

        <ScrollArea className='h-[500px] pr-4'>
          <AuditLogList
            entries={task.auditLog.map((entry, index) => ({
              id: `audit-${index}`,
              timestamp: entry.timestamp,
              action: entry.action,
              changedBy: entry.user,
              changes: entry.changes,
              notes: entry.notes,
            }))}
            variant='dialog'
            showEmptyState={true}
            emptyStateTitle='No Audit Log Entries'
            emptyStateDescription='No changes have been recorded for this task yet.'
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
