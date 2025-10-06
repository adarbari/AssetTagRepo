import React from &apos;react&apos;;
import { useState } from &apos;react&apos;;
import { Card, CardContent, CardHeader, CardTitle } from &apos;../ui/card&apos;;
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
import { Badge } from &apos;../ui/badge&apos;;
import { RadioGroup, RadioGroupItem } from &apos;../ui/radio-group&apos;;
import { Calendar } from &apos;../ui/calendar&apos;;
import { Popover, PopoverContent, PopoverTrigger } from &apos;../ui/popover&apos;;
import { cn } from &apos;../ui/utils&apos;;
import {
  LogIn,
  LogOut,
  User,
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from &apos;lucide-react&apos;;
import { format } from &apos;date-fns&apos;;
import { toast } from &apos;sonner&apos;;
import { updateAsset } from &apos;../../data/mockData&apos;;
import { PageHeader, PageLayout } from &apos;../common&apos;;
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from &apos;../ui/breadcrumb&apos;;
import type { Asset } from &apos;../types&apos;;

interface CreateCheckInOutProps {
  onBack: () => void;
  assetId: string;
  assetName: string;
  currentStatus: Asset[&apos;status&apos;];
  mode: &apos;check-in&apos; | &apos;check-out&apos;;
  assetContext?: Asset;
  onComplete?: (updates: Partial<Asset>) => void;
}

export function CreateCheckInOut({
  onBack,
  assetId,
  assetName,
  currentStatus,
  mode,
  assetContext,
  onComplete,
}: CreateCheckInOutProps) {
  const [assignedTo, setAssignedTo] = useState(&apos;&apos;);
  const [project, setProject] = useState(&apos;&apos;);
  const [location, setLocation] = useState(&apos;&apos;);
  const [expectedReturn, setExpectedReturn] = useState<Date>();
  const [condition, setCondition] = useState(&apos;good&apos;);
  const [notes, setNotes] = useState(&apos;&apos;);

  const handleSubmit = () => {
    const updates: Partial<Asset> = {};

    if (mode === &apos;check-out&apos;) {
      // Update status to checked-out
      updates.status = &apos;checked-out&apos;;

      // Update assignment if provided
      if (assignedTo) {
        updates.assignedTo = assignedTo;
      }

      toast.success(`${assetName} checked out successfully`, {
        description: `Assigned to ${assignedTo || &apos;unassigned&apos;}`,
      });
    } else {
      // Update status back to active on check-in
      updates.status = &apos;active&apos;;

      // If asset is damaged or in poor condition, mark for maintenance
      if (condition === &apos;damaged&apos; || condition === &apos;poor&apos;) {
        updates.status = &apos;maintenance&apos;;
      }

      toast.success(`${assetName} checked in successfully`, {
        description: `Condition: ${condition}`,
      });
    }

    // Update the asset via callback
    if (onComplete) {
      onComplete(updates);
    }

    // Update mock data for persistence across components
    try {
      updateAsset(assetId, updates);
    } catch (error) {
// // // // // // // console.error(&apos;Error updating asset in mock data:&apos;, error);
    }

    // Navigate back
    onBack();
  };

  const getConditionColor = (cond: string) => {
    switch (cond) {
      case &apos;excellent&apos;:
        return &apos;bg-green-100 text-green-700 border-green-200&apos;;
      case &apos;good&apos;:
        return &apos;bg-blue-100 text-blue-700 border-blue-200&apos;;
      case &apos;fair&apos;:
        return &apos;bg-yellow-100 text-yellow-700 border-yellow-200&apos;;
      case &apos;poor&apos;:
        return &apos;bg-orange-100 text-orange-700 border-orange-200&apos;;
      case &apos;damaged&apos;:
        return &apos;bg-red-100 text-red-700 border-red-200&apos;;
      default:
        return &apos;bg-gray-100 text-gray-700 border-gray-200&apos;;
    }
  };

  return (
    <PageLayout
      variant=&apos;narrow&apos;
      padding=&apos;md&apos;
      header={
        <div className=&apos;border-b bg-background px-8 py-4&apos;>
          <div className=&apos;flex items-center gap-4 mb-4&apos;>
            <Button variant=&apos;ghost&apos; size=&apos;icon&apos; onClick={onBack}>
              <ArrowLeft className=&apos;h-5 w-5&apos; />
            </Button>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={onBack} className=&apos;cursor-pointer&apos;>
                    {assetName}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {mode === &apos;check-out&apos; ? &apos;Check Out&apos; : &apos;Check In&apos;}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <PageHeader
            title={mode === &apos;check-out&apos; ? &apos;Check Out Asset&apos; : &apos;Check In Asset&apos;}
            description={
              mode === &apos;check-out&apos;
                ? &apos;Assign this asset to a user or project&apos;
                : &apos;Return this asset and assess its condition&apos;
            }
            icon={mode === &apos;check-out&apos; ? LogOut : LogIn}
          />
        </div>
      }
    >
      {/* Asset Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className=&apos;p-4 bg-muted rounded-lg&apos;>
            <div className=&apos;flex items-center justify-between&apos;>
              <div>
                <h4>{assetName}</h4>
                <p className=&apos;text-sm text-muted-foreground&apos;>{assetId}</p>
                {assetContext && (
                  <div className=&apos;mt-2 text-sm space-y-1&apos;>
                    <p>
                      <span className=&apos;text-muted-foreground&apos;>Type:</span>{&apos; &apos;}
                      {assetContext.type}
                    </p>
                    <p>
                      <span className=&apos;text-muted-foreground&apos;>Location:</span>{&apos; &apos;}
                      {assetContext.location}
                    </p>
                  </div>
                )}
              </div>
              <Badge
                variant=&apos;outline&apos;
                className=&apos;bg-blue-100 text-blue-700 border-blue-200&apos;
              >
                {currentStatus}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === &apos;check-out&apos; ? &apos;Check-Out Details&apos; : &apos;Check-In Details&apos;}
          </CardTitle>
        </CardHeader>
        <CardContent className=&apos;space-y-6&apos;>
          {mode === &apos;check-out&apos; ? (
            <>
              {/* Check-out Form */}
              <div className=&apos;space-y-4&apos;>
                <div className=&apos;space-y-2&apos;>
                  <Label htmlFor=&apos;assigned-to&apos;>
                    <User className=&apos;h-4 w-4 inline mr-2&apos; />
                    Assign To
                  </Label>
                  <Select value={assignedTo} onValueChange={setAssignedTo}>
                    <SelectTrigger id=&apos;assigned-to&apos;>
                      <SelectValue placeholder=&apos;Select user or team&apos; />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=&apos;john-smith&apos;>John Smith</SelectItem>
                      <SelectItem value=&apos;sarah-johnson&apos;>
                        Sarah Johnson
                      </SelectItem>
                      <SelectItem value=&apos;mike-wilson&apos;>Mike Wilson</SelectItem>
                      <SelectItem value=&apos;team-alpha&apos;>Team Alpha</SelectItem>
                      <SelectItem value=&apos;team-beta&apos;>Team Beta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className=&apos;space-y-2&apos;>
                  <Label htmlFor=&apos;project&apos;>
                    <FileText className=&apos;h-4 w-4 inline mr-2&apos; />
                    Project / Job Site
                  </Label>
                  <Select value={project} onValueChange={setProject}>
                    <SelectTrigger id=&apos;project&apos;>
                      <SelectValue placeholder=&apos;Select project (optional)&apos; />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=&apos;job-alpha&apos;>Job Site Alpha</SelectItem>
                      <SelectItem value=&apos;job-beta&apos;>Job Site Beta</SelectItem>
                      <SelectItem value=&apos;warehouse&apos;>
                        Warehouse District
                      </SelectItem>
                      <SelectItem value=&apos;campus&apos;>Corporate Campus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className=&apos;space-y-2&apos;>
                  <Label htmlFor=&apos;location&apos;>
                    <MapPin className=&apos;h-4 w-4 inline mr-2&apos; />
                    Destination Location
                  </Label>
                  <Input
                    id=&apos;location&apos;
                    placeholder=&apos;Enter location or address&apos;
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                  />
                </div>

                <div className=&apos;space-y-2&apos;>
                  <Label htmlFor=&apos;expected-return-date&apos;>
                    <CalendarIcon className=&apos;h-4 w-4 inline mr-2&apos; />
                    Expected Return Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id=&apos;expected-return-date&apos;
                        variant=&apos;outline&apos;
                        className={cn(
                          &apos;w-full justify-start text-left&apos;,
                          !expectedReturn && &apos;text-muted-foreground&apos;
                        )}
                      >
                        <CalendarIcon className=&apos;mr-2 h-4 w-4&apos; />
                        {expectedReturn
                          ? format(expectedReturn, &apos;PPP&apos;)
                          : &apos;Pick a date&apos;}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className=&apos;w-auto p-0&apos; align=&apos;start&apos;>
                      <Calendar
                        mode=&apos;single&apos;
                        selected={expectedReturn}
                        onSelect={setExpectedReturn}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className=&apos;space-y-2&apos;>
                  <Label htmlFor=&apos;checkout-notes&apos;>
                    <FileText className=&apos;h-4 w-4 inline mr-2&apos; />
                    Notes (Optional)
                  </Label>
                  <Textarea
                    id=&apos;checkout-notes&apos;
                    placeholder=&apos;Add any notes about this checkout...&apos;
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Check-in Form */}
              <div className=&apos;space-y-4&apos;>
                <div className=&apos;space-y-2&apos;>
                  <Label>
                    <AlertCircle className=&apos;h-4 w-4 inline mr-2&apos; />
                    Asset Condition
                  </Label>
                  <RadioGroup value={condition} onValueChange={setCondition}>
                    <div className=&apos;space-y-2&apos;>
                      {[
                        {
                          value: &apos;excellent&apos;,
                          label: &apos;Excellent&apos;,
                          desc: &apos;Perfect condition, no issues&apos;,
                        },
                        {
                          value: &apos;good&apos;,
                          label: &apos;Good&apos;,
                          desc: &apos;Normal wear, fully functional&apos;,
                        },
                        {
                          value: &apos;fair&apos;,
                          label: &apos;Fair&apos;,
                          desc: &apos;Some wear, may need minor service&apos;,
                        },
                        {
                          value: &apos;poor&apos;,
                          label: &apos;Poor&apos;,
                          desc: &apos;Significant wear, needs attention&apos;,
                        },
                        {
                          value: &apos;damaged&apos;,
                          label: &apos;Damaged&apos;,
                          desc: &apos;Requires immediate repair&apos;,
                        },
                      ].map(option => (
                        <div
                          key={option.value}
                          className={cn(
                            &apos;flex items-start space-x-3 p-3 rounded-lg border&apos;,
                            condition === option.value &&
                              &apos;border-primary bg-accent&apos;
                          )}
                        >
                          <RadioGroupItem
                            value={option.value}
                            id={option.value}
                          />
                          <div className=&apos;flex-1&apos;>
                            <Label
                              htmlFor={option.value}
                              className=&apos;flex items-center gap-2 cursor-pointer&apos;
                            >
                              {option.label}
                              <Badge
                                variant=&apos;outline&apos;
                                className={getConditionColor(option.value)}
                              >
                                {option.label}
                              </Badge>
                            </Label>
                            <p className=&apos;text-sm text-muted-foreground&apos;>
                              {option.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                <div className=&apos;space-y-2&apos;>
                  <Label htmlFor=&apos;return-location&apos;>
                    <MapPin className=&apos;h-4 w-4 inline mr-2&apos; />
                    Return Location
                  </Label>
                  <Select defaultValue=&apos;warehouse&apos;>
                    <SelectTrigger id=&apos;return-location&apos;>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=&apos;warehouse&apos;>
                        Warehouse District
                      </SelectItem>
                      <SelectItem value=&apos;depot&apos;>Service Depot C</SelectItem>
                      <SelectItem value=&apos;campus&apos;>Corporate Campus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {condition === &apos;damaged&apos; || condition === &apos;poor&apos; ? (
                  <div className=&apos;p-4 bg-orange-50 border border-orange-200 rounded-lg&apos;>
                    <div className=&apos;flex items-start gap-2&apos;>
                      <AlertCircle className=&apos;h-5 w-5 text-orange-600 mt-0.5&apos; />
                      <div className=&apos;flex-1&apos;>
                        <h4 className=&apos;text-orange-900&apos;>
                          Maintenance Required
                        </h4>
                        <p className=&apos;text-sm text-orange-700&apos;>
                          This asset will be flagged for maintenance review
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className=&apos;space-y-2&apos;>
                  <Label htmlFor=&apos;checkin-notes&apos;>
                    <FileText className=&apos;h-4 w-4 inline mr-2&apos; />
                    Inspection Notes
                  </Label>
                  <Textarea
                    id=&apos;checkin-notes&apos;
                    placeholder=&apos;Describe any issues, damage, or observations...&apos;
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            </>
          )}

          {/* Timestamp */}
          <div className=&apos;flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t&apos;>
            <Clock className=&apos;h-4 w-4&apos; />
            <span>
              {mode === &apos;check-out&apos; ? &apos;Check-out&apos; : &apos;Check-in&apos;} time:{&apos; &apos;}
              {format(new Date(), &apos;PPpp&apos;)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className=&apos;flex items-center justify-end gap-2&apos;>
        <Button variant=&apos;outline&apos; onClick={onBack}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          {mode === &apos;check-out&apos; ? (
            <>
              <LogOut className=&apos;h-4 w-4 mr-2&apos; />
              Check Out
            </>
          ) : (
            <>
              <CheckCircle className=&apos;h-4 w-4 mr-2&apos; />
              Check In
            </>
          )}
        </Button>
      </div>
    </PageLayout>
  );
}
