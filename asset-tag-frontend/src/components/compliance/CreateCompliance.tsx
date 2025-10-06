import React, { useState, useEffect } from &apos;react&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Input } from &apos;../ui/input&apos;;
import { Label } from &apos;../ui/label&apos;;
import { Textarea } from &apos;../ui/textarea&apos;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &apos;../ui/select&apos;;
import { Calendar } from &apos;../ui/calendar&apos;;
import { Popover, PopoverContent, PopoverTrigger } from &apos;../ui/popover&apos;;
import { Card, CardContent } from &apos;../ui/card&apos;;
import { PageHeader, PageLayout } from &apos;../common&apos;;
import { cn } from &apos;../ui/utils&apos;;
import { Calendar as CalendarIcon, Shield, FileText } from &apos;lucide-react&apos;;
import { format } from &apos;date-fns&apos;;
import { toast } from &apos;sonner&apos;;
import { getAllAssets } from &apos;../../data/mockData&apos;;
import type { Asset } from &apos;../types&apos;;

interface CreateComplianceProps {
  onBack: () => void;
}

const certificationTypes = [
  { value: &apos;dot-inspection&apos;, label: &apos;DOT Inspection&apos; },
  { value: &apos;safety-cert&apos;, label: &apos;Safety Certification&apos; },
  { value: &apos;epa-compliance&apos;, label: &apos;EPA Compliance&apos; },
  { value: &apos;insurance&apos;, label: &apos;Insurance Certificate&apos; },
  { value: &apos;operator-license&apos;, label: &apos;Operator License&apos; },
  { value: &apos;emissions&apos;, label: &apos;Emissions Testing&apos; },
  { value: &apos;calibration&apos;, label: &apos;Equipment Calibration&apos; },
  { value: &apos;other&apos;, label: &apos;Other&apos; },
];

const inspectors = [
  { value: &apos;john-smith&apos;, label: &apos;John Smith&apos; },
  { value: &apos;sarah-johnson&apos;, label: &apos;Sarah Johnson&apos; },
  { value: &apos;mike-davis&apos;, label: &apos;Mike Davis&apos; },
  { value: &apos;external&apos;, label: &apos;External Inspector&apos; },
];

export function CreateCompliance({ onBack }: CreateComplianceProps) {
  const [selectedAsset, setSelectedAsset] = useState(&apos;&apos;);
  const [certificationType, setCertificationType] = useState(&apos;&apos;);
  const [customCertType, setCustomCertType] = useState(&apos;&apos;);
  const [inspector, setInspector] = useState(&apos;&apos;);
  const [externalInspector, setExternalInspector] = useState(&apos;&apos;);
  const [issueDate, setIssueDate] = useState<Date>();
  const [expiryDate, setExpiryDate] = useState<Date>();
  const [certificateNumber, setCertificateNumber] = useState(&apos;&apos;);
  const [notes, setNotes] = useState(&apos;&apos;);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);

  useEffect(() => {
    // Load all assets for dropdown
    setAvailableAssets(getAllAssets());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !selectedAsset ||
      !certificationType ||
      !inspector ||
      !issueDate ||
      !expiryDate
    ) {
      toast.error(&apos;Please fill in all required fields&apos;);
      return;
    }

    if (certificationType === &apos;other&apos; && !customCertType) {
      toast.error(&apos;Please specify the certification type&apos;);
      return;
    }

    if (inspector === &apos;external&apos; && !externalInspector) {
      toast.error(&apos;Please specify the external inspector name&apos;);
      return;
    }

    if (expiryDate <= issueDate) {
      toast.error(&apos;Expiry date must be after issue date&apos;);
      return;
    }

    // TODO: Backend integration - save compliance record
    // await api.createComplianceRecord({ ... });

    const asset = availableAssets.find(a => a.id === selectedAsset);
    const certType =
      certificationType === &apos;other&apos;
        ? customCertType
        : certificationTypes.find(t => t.value === certificationType)?.label;

    toast.success(&apos;Compliance record created successfully&apos;, {
      description: `${certType} added for ${asset?.name}`,
    });

    onBack();
  };

  return (
    <PageLayout
      variant=&apos;narrow&apos;
      padding=&apos;md&apos;
      header={
        <PageHeader
          title=&apos;Add Compliance Record&apos;
          description=&apos;Create a new certification or compliance record for an asset&apos;
          onBack={onBack}
          actions={
            <Button type=&apos;submit&apos; form=&apos;create-compliance-form&apos;>
              <Shield className=&apos;h-4 w-4 mr-2&apos; />
              Create Record
            </Button>
          }
        />
      }
    >
      <Card>
        <CardContent className=&apos;pt-6&apos;>
          <form
            id=&apos;create-compliance-form&apos;
            onSubmit={handleSubmit}
            className=&apos;space-y-6&apos;
          >
            {/* Asset Selection */}
            <div className=&apos;space-y-2&apos;>
              <Label htmlFor=&apos;asset&apos;>Asset *</Label>
              <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                <SelectTrigger id=&apos;asset&apos;>
                  <SelectValue placeholder=&apos;Select asset&apos; />
                </SelectTrigger>
                <SelectContent>
                  {availableAssets.map(asset => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name} - {asset.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Certification Type */}
            <div className=&apos;space-y-2&apos;>
              <Label htmlFor=&apos;cert-type&apos;>Certification Type *</Label>
              <Select
                value={certificationType}
                onValueChange={setCertificationType}
              >
                <SelectTrigger id=&apos;cert-type&apos;>
                  <SelectValue placeholder=&apos;Select certification type&apos; />
                </SelectTrigger>
                <SelectContent>
                  {certificationTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Certification Type */}
            {certificationType === &apos;other&apos; && (
              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;custom-cert-type&apos;>
                  Custom Certification Type *
                </Label>
                <Input
                  id=&apos;custom-cert-type&apos;
                  placeholder=&apos;Enter certification type&apos;
                  value={customCertType}
                  onChange={e => setCustomCertType(e.target.value)}
                  required
                />
              </div>
            )}

            <div className=&apos;grid gap-4 md:grid-cols-2&apos;>
              {/* Inspector */}
              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;inspector&apos;>Inspector *</Label>
                <Select value={inspector} onValueChange={setInspector}>
                  <SelectTrigger id=&apos;inspector&apos;>
                    <SelectValue placeholder=&apos;Select inspector&apos; />
                  </SelectTrigger>
                  <SelectContent>
                    {inspectors.map(insp => (
                      <SelectItem key={insp.value} value={insp.value}>
                        {insp.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Certificate Number */}
              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;cert-number&apos;>Certificate Number</Label>
                <Input
                  id=&apos;cert-number&apos;
                  placeholder=&apos;e.g., CERT-2024-001&apos;
                  value={certificateNumber}
                  onChange={e => setCertificateNumber(e.target.value)}
                />
              </div>
            </div>

            {/* External Inspector Name */}
            {inspector === &apos;external&apos; && (
              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;external-inspector&apos;>
                  External Inspector Name *
                </Label>
                <Input
                  id=&apos;external-inspector&apos;
                  placeholder=&apos;Enter inspector or company name&apos;
                  value={externalInspector}
                  onChange={e => setExternalInspector(e.target.value)}
                  required
                />
              </div>
            )}

            <div className=&apos;grid gap-4 md:grid-cols-2&apos;>
              {/* Issue Date */}
              <div className=&apos;space-y-2&apos;>
                <Label>Issue Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant=&apos;outline&apos;
                      className={cn(
                        &apos;w-full justify-start text-left&apos;,
                        !issueDate && &apos;text-muted-foreground&apos;
                      )}
                    >
                      <CalendarIcon className=&apos;mr-2 h-4 w-4&apos; />
                      {issueDate ? format(issueDate, &apos;PPP&apos;) : &apos;Pick a date&apos;}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className=&apos;w-auto p-0&apos; align=&apos;start&apos;>
                    <Calendar
                      mode=&apos;single&apos;
                      selected={issueDate}
                      onSelect={setIssueDate}
                      initialFocus
                      disabled={date => date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Expiry Date */}
              <div className=&apos;space-y-2&apos;>
                <Label>Expiry Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant=&apos;outline&apos;
                      className={cn(
                        &apos;w-full justify-start text-left&apos;,
                        !expiryDate && &apos;text-muted-foreground&apos;
                      )}
                    >
                      <CalendarIcon className=&apos;mr-2 h-4 w-4&apos; />
                      {expiryDate ? format(expiryDate, &apos;PPP&apos;) : &apos;Pick a date&apos;}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className=&apos;w-auto p-0&apos; align=&apos;start&apos;>
                    <Calendar
                      mode=&apos;single&apos;
                      selected={expiryDate}
                      onSelect={setExpiryDate}
                      initialFocus
                      disabled={date => (issueDate ? date <= issueDate : false)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Notes */}
            <div className=&apos;space-y-2&apos;>
              <Label htmlFor=&apos;notes&apos;>Notes</Label>
              <Textarea
                id=&apos;notes&apos;
                placeholder=&apos;Additional notes, findings, or recommendations...&apos;
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={4}
              />
            </div>

            {/* Document Upload Placeholder */}
            <div className=&apos;p-4 bg-muted rounded-lg border-2 border-dashed&apos;>
              <div className=&apos;flex items-center gap-2 text-muted-foreground&apos;>
                <FileText className=&apos;h-5 w-5&apos; />
                <div>
                  <p className=&apos;text-sm&apos;>Upload Certificate Document</p>
                  <p className=&apos;text-xs&apos;>Document upload feature coming soon</p>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
