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
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Checkbox } from '../ui/checkbox';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Download, FileText } from 'lucide-react';

interface GenerateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportType: string;
}

export function GenerateReportDialog({
  open,
  onOpenChange,
  reportType,
}: GenerateReportDialogProps) {
  const [dateRange, setDateRange] = useState('30days');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [format_type, setFormat] = useState('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);

  const reportTitles: { [key: string]: string } = {
    inventory: 'Inventory Audit Report',
    costing: 'Job Costing Report',
    utilization: 'Utilization Report',
    compliance: 'Compliance Report',
    battery: 'Battery Health Report',
    theft: 'Theft/Loss Report',
  };

  const handleGenerate = () => {
    // console.log('Generating report:', {
    //   type: reportType,
    //   dateRange,
    //   startDate,
    //   endDate,
    //   format_type,
    //   includeCharts,
    //   includeDetails,
    // });
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
              <DialogTitle>
                {reportTitles[reportType] || 'Generate Report'}
              </DialogTitle>
              <DialogDescription>Configure report parameters</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Date Range */}
          <div className='space-y-2'>
            <Label>Date Range</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='7days'>Last 7 days</SelectItem>
                <SelectItem value='30days'>Last 30 days</SelectItem>
                <SelectItem value='90days'>Last 90 days</SelectItem>
                <SelectItem value='12months'>Last 12 months</SelectItem>
                <SelectItem value='custom'>Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range */}
          {dateRange === 'custom' && (
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant='outline' className='w-full justify-start'>
                      <CalendarIcon className='h-4 w-4 mr-2' />
                      {startDate ? format(startDate, 'PPP') : 'Pick date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <Calendar
                      mode='single'
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className='space-y-2'>
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant='outline' className='w-full justify-start'>
                      <CalendarIcon className='h-4 w-4 mr-2' />
                      {endDate ? format(endDate, 'PPP') : 'Pick date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <Calendar
                      mode='single'
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Format */}
          <div className='space-y-2'>
            <Label>Export Format</Label>
            <Select value={format_type} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='pdf'>PDF Document</SelectItem>
                <SelectItem value='excel'>Excel Spreadsheet</SelectItem>
                <SelectItem value='csv'>CSV File</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Options */}
          <div className='space-y-3'>
            <Label>Report Options</Label>
            <div className='space-y-3'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='charts'
                  checked={includeCharts}
                  onCheckedChange={checked =>
                    setIncludeCharts(checked as boolean)
                  }
                />
                <label
                  htmlFor='charts'
                  className='text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                >
                  Include charts and visualizations
                </label>
              </div>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='details'
                  checked={includeDetails}
                  onCheckedChange={checked =>
                    setIncludeDetails(checked as boolean)
                  }
                />
                <label
                  htmlFor='details'
                  className='text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                >
                  Include detailed asset listings
                </label>
              </div>
            </div>
          </div>

          {/* Preview Info */}
          <div className='p-4 bg-muted rounded-lg'>
            <p className='text-sm'>
              Report will include data from{' '}
              {dateRange === 'custom'
                ? `${startDate ? format(startDate, 'PP') : '...'} to ${
                    endDate ? format(endDate, 'PP') : '...'
                  }`
                : dateRange
                    .replace('days', ' days')
                    .replace('months', ' months')}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate}>
            <Download className='h-4 w-4 mr-2' />
            Generate Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
