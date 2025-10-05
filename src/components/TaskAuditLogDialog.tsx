import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { History, User, Clock, FileText } from "lucide-react";

interface AuditEntry {
  timestamp: string;
  user: string;
  action: string;
  changes: Array<{ field: string; from: string; to: string }>;
  notes: string;
}

interface TaskAuditLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: {
    id: string;
    assetName: string;
    task: string;
    auditLog: AuditEntry[];
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
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Audit Log - {task.id}
          </DialogTitle>
          <DialogDescription>
            Complete history of all changes made to this maintenance task
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 bg-muted rounded-lg">
          <div>
            <h4>{task.assetName}</h4>
            <p className="text-sm text-muted-foreground">{task.task}</p>
          </div>
        </div>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {task.auditLog.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="mb-2">No Audit Log Entries</h3>
                <p className="text-muted-foreground">
                  No changes have been recorded for this task yet.
                </p>
              </div>
            ) : (
              task.auditLog.map((entry, index) => (
                <div key={index}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-primary/10">
                              {entry.action}
                            </Badge>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <User className="h-3 w-3" />
                              {entry.user}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {entry.timestamp}
                        </div>
                      </div>

                      {entry.changes.length > 0 && (
                        <div className="space-y-1">
                          {entry.changes.map((change, idx) => (
                            <div
                              key={idx}
                              className="text-sm bg-muted/50 rounded-md p-2"
                            >
                              <span className="text-muted-foreground">
                                {change.field}:
                              </span>{" "}
                              <span className="line-through text-muted-foreground">
                                {change.from}
                              </span>{" "}
                              → <span>{change.to}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {entry.notes && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/30 rounded-md p-2">
                          <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{entry.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {index < task.auditLog.length - 1 && (
                    <Separator className="my-4 ml-5" />
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
