import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Card, CardContent } from "../ui/card";
import { PageHeader } from "../common";
import { cn } from "../ui/utils";
import { Calendar as CalendarIcon, Shield, ArrowLeft, FileText } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { getAllAssets } from "../../data/mockData";
import type { Asset } from "../types";

interface CreateComplianceProps {
  onBack: () => void;
}

const certificationTypes = [
  { value: "dot-inspection", label: "DOT Inspection" },
  { value: "safety-cert", label: "Safety Certification" },
  { value: "epa-compliance", label: "EPA Compliance" },
  { value: "insurance", label: "Insurance Certificate" },
  { value: "operator-license", label: "Operator License" },
  { value: "emissions", label: "Emissions Testing" },
  { value: "calibration", label: "Equipment Calibration" },
  { value: "other", label: "Other" },
];

const inspectors = [
  { value: "john-smith", label: "John Smith" },
  { value: "sarah-johnson", label: "Sarah Johnson" },
  { value: "mike-davis", label: "Mike Davis" },
  { value: "external", label: "External Inspector" },
];

export function CreateCompliance({ onBack }: CreateComplianceProps) {
  const [selectedAsset, setSelectedAsset] = useState("");
  const [certificationType, setCertificationType] = useState("");
  const [customCertType, setCustomCertType] = useState("");
  const [inspector, setInspector] = useState("");
  const [externalInspector, setExternalInspector] = useState("");
  const [issueDate, setIssueDate] = useState<Date>();
  const [expiryDate, setExpiryDate] = useState<Date>();
  const [certificateNumber, setCertificateNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);

  useEffect(() => {
    // Load all assets for dropdown
    setAvailableAssets(getAllAssets());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAsset || !certificationType || !inspector || !issueDate || !expiryDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (certificationType === "other" && !customCertType) {
      toast.error("Please specify the certification type");
      return;
    }

    if (inspector === "external" && !externalInspector) {
      toast.error("Please specify the external inspector name");
      return;
    }

    if (expiryDate <= issueDate) {
      toast.error("Expiry date must be after issue date");
      return;
    }

    // TODO: Backend integration - save compliance record
    // await api.createComplianceRecord({ ... });

    const asset = availableAssets.find(a => a.id === selectedAsset);
    const certType = certificationType === "other" ? customCertType : 
                     certificationTypes.find(t => t.value === certificationType)?.label;

    toast.success("Compliance record created successfully", {
      description: `${certType} added for ${asset?.name}`,
    });

    onBack();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <PageHeader
        title="Add Compliance Record"
        description="Create a new certification or compliance record for an asset"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" form="create-compliance-form">
              <Shield className="h-4 w-4 mr-2" />
              Create Record
            </Button>
          </div>
        }
      />

      {/* Form Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <form id="create-compliance-form" onSubmit={handleSubmit} className="space-y-6">
                {/* Asset Selection */}
                <div className="space-y-2">
                  <Label htmlFor="asset">Asset *</Label>
                  <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                    <SelectTrigger id="asset">
                      <SelectValue placeholder="Select asset" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAssets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.name} - {asset.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Certification Type */}
                <div className="space-y-2">
                  <Label htmlFor="cert-type">Certification Type *</Label>
                  <Select value={certificationType} onValueChange={setCertificationType}>
                    <SelectTrigger id="cert-type">
                      <SelectValue placeholder="Select certification type" />
                    </SelectTrigger>
                    <SelectContent>
                      {certificationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Certification Type */}
                {certificationType === "other" && (
                  <div className="space-y-2">
                    <Label htmlFor="custom-cert-type">Custom Certification Type *</Label>
                    <Input
                      id="custom-cert-type"
                      placeholder="Enter certification type"
                      value={customCertType}
                      onChange={(e) => setCustomCertType(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Inspector */}
                  <div className="space-y-2">
                    <Label htmlFor="inspector">Inspector *</Label>
                    <Select value={inspector} onValueChange={setInspector}>
                      <SelectTrigger id="inspector">
                        <SelectValue placeholder="Select inspector" />
                      </SelectTrigger>
                      <SelectContent>
                        {inspectors.map((insp) => (
                          <SelectItem key={insp.value} value={insp.value}>
                            {insp.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Certificate Number */}
                  <div className="space-y-2">
                    <Label htmlFor="cert-number">Certificate Number</Label>
                    <Input
                      id="cert-number"
                      placeholder="e.g., CERT-2024-001"
                      value={certificateNumber}
                      onChange={(e) => setCertificateNumber(e.target.value)}
                    />
                  </div>
                </div>

                {/* External Inspector Name */}
                {inspector === "external" && (
                  <div className="space-y-2">
                    <Label htmlFor="external-inspector">External Inspector Name *</Label>
                    <Input
                      id="external-inspector"
                      placeholder="Enter inspector or company name"
                      value={externalInspector}
                      onChange={(e) => setExternalInspector(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Issue Date */}
                  <div className="space-y-2">
                    <Label>Issue Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left",
                            !issueDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {issueDate ? format(issueDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={issueDate}
                          onSelect={setIssueDate}
                          initialFocus
                          disabled={(date) => date > new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Expiry Date */}
                  <div className="space-y-2">
                    <Label>Expiry Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left",
                            !expiryDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {expiryDate ? format(expiryDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={expiryDate}
                          onSelect={setExpiryDate}
                          initialFocus
                          disabled={(date) => issueDate ? date <= issueDate : false}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes, findings, or recommendations..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                {/* Document Upload Placeholder */}
                <div className="p-4 bg-muted rounded-lg border-2 border-dashed">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-5 w-5" />
                    <div>
                      <p className="text-sm">Upload Certificate Document</p>
                      <p className="text-xs">Document upload feature coming soon</p>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
