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
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Download, FileText } from 'lucide-react';

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
  description = 'Choose export format and options',
}: ExportDialogProps) {
  const [format, setFormat] = useState('csv');
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [includeInactive, setIncludeInactive] = useState(false);

  const handleExport = () => {
// // // // // // // console.log('Exporting data:', { format, includeHeaders, includeInactive });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <div className='flex items-center gap-3'>
            <div className='p-2 rounded-lg bg-primary/10'>
              <FileText className='h-5 w-5 text-primary' />
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Format */}
          <div className='space-y-2'>
            <Label>Export Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='csv'>CSV File</SelectItem>
                <SelectItem value='excel'>Excel Spreadsheet</SelectItem>
                <SelectItem value='pdf'>PDF Document</SelectItem>
                <SelectItem value='json'>JSON Data</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Options */}
          <div className='space-y-3'>
            <Label>Export Options</Label>
            <div className='space-y-3'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='headers'
                  checked={includeHeaders}
                  onCheckedChange={checked =>
                    setIncludeHeaders(checked as boolean)
                  }
                />
                <label
                  htmlFor='headers'
                  className='text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                >
                  Include column headers
                </label>
              </div>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='inactive'
                  checked={includeInactive}
                  onCheckedChange={checked =>
                    setIncludeInactive(checked as boolean)
                  }
                />
                <label
                  htmlFor='inactive'
                  className='text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                >
                  Include inactive items
                </label>
              </div>
            </div>
          </div>

          {/* Preview Info */}
          <div className='p-4 bg-muted rounded-lg'>
            <p className='text-sm'>
              Export will be saved in {format.toUpperCase()} format
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            <Download className='h-4 w-4 mr-2' />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
