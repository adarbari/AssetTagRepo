import { useState } from &apos;react&apos;;
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from &apos;../ui/dialog&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Label } from &apos;../ui/label&apos;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &apos;../ui/select&apos;;
import { Checkbox } from &apos;../ui/checkbox&apos;;
import { Download, FileText } from &apos;lucide-react&apos;;

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
}

export function ExportDialog({
  open,
  onOpenChange,
  title,
  description = &apos;Choose export format and options&apos;,
}: ExportDialogProps) {
  const [format, setFormat] = useState(&apos;csv&apos;);
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [includeInactive, setIncludeInactive] = useState(false);

  const handleExport = () => {
    // console.log(&apos;Exporting data:&apos;, { format, includeHeaders, includeInactive });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=&apos;max-w-md&apos;>
        <DialogHeader>
          <div className=&apos;flex items-center gap-3&apos;>
            <div className=&apos;p-2 rounded-lg bg-primary/10&apos;>
              <FileText className=&apos;h-5 w-5 text-primary&apos; />
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className=&apos;space-y-4&apos;>
          {/* Format */}
          <div className=&apos;space-y-2&apos;>
            <Label>Export Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=&apos;csv&apos;>CSV File</SelectItem>
                <SelectItem value=&apos;excel&apos;>Excel Spreadsheet</SelectItem>
                <SelectItem value=&apos;pdf&apos;>PDF Document</SelectItem>
                <SelectItem value=&apos;json&apos;>JSON Data</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Options */}
          <div className=&apos;space-y-3&apos;>
            <Label>Export Options</Label>
            <div className=&apos;space-y-3&apos;>
              <div className=&apos;flex items-center space-x-2&apos;>
                <Checkbox
                  id=&apos;headers&apos;
                  checked={includeHeaders}
                  onCheckedChange={checked =>
                    setIncludeHeaders(checked as boolean)
                  }
                />
                <label
                  htmlFor=&apos;headers&apos;
                  className=&apos;text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70&apos;
                >
                  Include column headers
                </label>
              </div>
              <div className=&apos;flex items-center space-x-2&apos;>
                <Checkbox
                  id=&apos;inactive&apos;
                  checked={includeInactive}
                  onCheckedChange={checked =>
                    setIncludeInactive(checked as boolean)
                  }
                />
                <label
                  htmlFor=&apos;inactive&apos;
                  className=&apos;text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70&apos;
                >
                  Include inactive items
                </label>
              </div>
            </div>
          </div>

          {/* Preview Info */}
          <div className=&apos;p-4 bg-muted rounded-lg&apos;>
            <p className=&apos;text-sm&apos;>
              Export will be saved in {format.toUpperCase()} format
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant=&apos;outline&apos; onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            <Download className=&apos;h-4 w-4 mr-2&apos; />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
