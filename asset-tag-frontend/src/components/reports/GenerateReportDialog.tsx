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
import { Calendar } from &apos;../ui/calendar&apos;;
import { Popover, PopoverContent, PopoverTrigger } from &apos;../ui/popover&apos;;
import { Checkbox } from &apos;../ui/checkbox&apos;;
import { format } from &apos;date-fns&apos;;
import { Calendar as CalendarIcon, Download, FileText } from &apos;lucide-react&apos;;

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
  const [dateRange, setDateRange] = useState(&apos;30days&apos;);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [format_type, setFormat] = useState(&apos;pdf&apos;);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);

  const reportTitles: { [key: string]: string } = {
    inventory: &apos;Inventory Audit Report&apos;,
    costing: &apos;Job Costing Report&apos;,
    utilization: &apos;Utilization Report&apos;,
    compliance: &apos;Compliance Report&apos;,
    battery: &apos;Battery Health Report&apos;,
    theft: &apos;Theft/Loss Report&apos;,
  };

  const handleGenerate = () => {
// console.log(&apos;Generating report:&apos;, {
      type: reportType,
      dateRange,
      startDate,
      endDate,
      format: format_type,
      includeCharts,
      includeDetails,
    });
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
              <DialogTitle>
                {reportTitles[reportType] || &apos;Generate Report&apos;}
              </DialogTitle>
              <DialogDescription>Configure report parameters</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className=&apos;space-y-4&apos;>
          {/* Date Range */}
          <div className=&apos;space-y-2&apos;>
            <Label>Date Range</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=&apos;7days&apos;>Last 7 days</SelectItem>
                <SelectItem value=&apos;30days&apos;>Last 30 days</SelectItem>
                <SelectItem value=&apos;90days&apos;>Last 90 days</SelectItem>
                <SelectItem value=&apos;12months&apos;>Last 12 months</SelectItem>
                <SelectItem value=&apos;custom&apos;>Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range */}
          {dateRange === &apos;custom&apos; && (
            <div className=&apos;grid grid-cols-2 gap-4&apos;>
              <div className=&apos;space-y-2&apos;>
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant=&apos;outline&apos; className=&apos;w-full justify-start&apos;>
                      <CalendarIcon className=&apos;h-4 w-4 mr-2&apos; />
                      {startDate ? format(startDate, &apos;PPP&apos;) : &apos;Pick date&apos;}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className=&apos;w-auto p-0&apos;>
                    <Calendar
                      mode=&apos;single&apos;
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className=&apos;space-y-2&apos;>
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant=&apos;outline&apos; className=&apos;w-full justify-start&apos;>
                      <CalendarIcon className=&apos;h-4 w-4 mr-2&apos; />
                      {endDate ? format(endDate, &apos;PPP&apos;) : &apos;Pick date&apos;}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className=&apos;w-auto p-0&apos;>
                    <Calendar
                      mode=&apos;single&apos;
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
          <div className=&apos;space-y-2&apos;>
            <Label>Export Format</Label>
            <Select value={format_type} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=&apos;pdf&apos;>PDF Document</SelectItem>
                <SelectItem value=&apos;excel&apos;>Excel Spreadsheet</SelectItem>
                <SelectItem value=&apos;csv&apos;>CSV File</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Options */}
          <div className=&apos;space-y-3&apos;>
            <Label>Report Options</Label>
            <div className=&apos;space-y-3&apos;>
              <div className=&apos;flex items-center space-x-2&apos;>
                <Checkbox
                  id=&apos;charts&apos;
                  checked={includeCharts}
                  onCheckedChange={checked =>
                    setIncludeCharts(checked as boolean)
                  }
                />
                <label
                  htmlFor=&apos;charts&apos;
                  className=&apos;text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70&apos;
                >
                  Include charts and visualizations
                </label>
              </div>
              <div className=&apos;flex items-center space-x-2&apos;>
                <Checkbox
                  id=&apos;details&apos;
                  checked={includeDetails}
                  onCheckedChange={checked =>
                    setIncludeDetails(checked as boolean)
                  }
                />
                <label
                  htmlFor=&apos;details&apos;
                  className=&apos;text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70&apos;
                >
                  Include detailed asset listings
                </label>
              </div>
            </div>
          </div>

          {/* Preview Info */}
          <div className=&apos;p-4 bg-muted rounded-lg&apos;>
            <p className=&apos;text-sm&apos;>
              Report will include data from{&apos; &apos;}
              {dateRange === &apos;custom&apos;
                ? `${startDate ? format(startDate, &apos;PP&apos;) : &apos;...&apos;} to ${
                    endDate ? format(endDate, &apos;PP&apos;) : &apos;...&apos;
                  }`
                : dateRange
                    .replace(&apos;days&apos;, &apos; days&apos;)
                    .replace(&apos;months&apos;, &apos; months&apos;)}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant=&apos;outline&apos; onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate}>
            <Download className=&apos;h-4 w-4 mr-2&apos; />
            Generate Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
