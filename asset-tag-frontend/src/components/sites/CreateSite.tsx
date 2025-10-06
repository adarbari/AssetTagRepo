import React, { useState } from &apos;react&apos;;
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
import { Card, CardContent } from &apos;../ui/card&apos;;
import { PageHeader, PageLayout } from &apos;../common&apos;;
import { MapPin, Building2 } from &apos;lucide-react&apos;;
import { toast } from &apos;sonner&apos;;

interface CreateSiteProps {
  onBack: () => void;
}

export function CreateSite({ onBack }: CreateSiteProps) {
  const [siteName, setSiteName] = useState(&apos;&apos;);
  const [address, setAddress] = useState(&apos;&apos;);
  const [city, setCity] = useState(&apos;&apos;);
  const [state, setState] = useState(&apos;&apos;);
  const [zipCode, setZipCode] = useState(&apos;&apos;);
  const [latitude, setLatitude] = useState(&apos;&apos;);
  const [longitude, setLongitude] = useState(&apos;&apos;);
  const [boundaryType, setBoundaryType] = useState(&apos;radius&apos;);
  const [boundaryRadius, setBoundaryRadius] = useState(&apos;&apos;);
  const [tolerance, setTolerance] = useState(&apos;50&apos;);
  const [contactName, setContactName] = useState(&apos;&apos;);
  const [contactPhone, setContactPhone] = useState(&apos;&apos;);
  const [contactEmail, setContactEmail] = useState(&apos;&apos;);
  const [notes, setNotes] = useState(&apos;&apos;);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !siteName ||
      !address ||
      !city ||
      !state ||
      !zipCode ||
      !latitude ||
      !longitude ||
      !boundaryRadius ||
      !tolerance
    ) {
      toast.error(&apos;Please fill in all required fields&apos;);
      return;
    }

    // Handle form submission
    // console.log({
      siteName,
      address,
      city,
      state,
      zipCode,
      latitude,
      longitude,
      boundaryType,
      boundaryRadius,
      tolerance,
      contactName,
      contactPhone,
      contactEmail,
      notes,
    });

    toast.success(&apos;Site created successfully&apos;, {
      description: `${siteName} has been added to your sites`,
    });

    onBack();
  };

  return (
    <PageLayout
      variant=&apos;narrow&apos;
      padding=&apos;md&apos;
      header={
        <PageHeader
          title=&apos;Create New Site&apos;
          description=&apos;Define a new physical site location with boundary configurations&apos;
          onBack={onBack}
          actions={
            <Button type=&apos;submit&apos; form=&apos;create-site-form&apos;>
              <Building2 className=&apos;h-4 w-4 mr-2&apos; />
              Create Site
            </Button>
          }
        />
      }
    >
      <form id=&apos;create-site-form&apos; onSubmit={handleSubmit} className=&apos;space-y-8&apos;>
        {/* Basic Information */}
        <Card>
          <CardContent className=&apos;pt-6&apos;>
            <div className=&apos;space-y-6&apos;>
              <div>
                <h3 className=&apos;flex items-center gap-2 mb-4&apos;>
                  <Building2 className=&apos;h-5 w-5&apos; />
                  Basic Information
                </h3>
                <p className=&apos;text-sm text-muted-foreground mb-6&apos;>
                  Enter the basic details about this site location
                </p>
              </div>

              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;site-name&apos;>Site Name *</Label>
                <Input
                  id=&apos;site-name&apos;
                  placeholder=&apos;e.g., Main Warehouse, Job Site Alpha&apos;
                  value={siteName}
                  onChange={e => setSiteName(e.target.value)}
                  required
                />
              </div>

              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;address&apos;>Street Address *</Label>
                <Input
                  id=&apos;address&apos;
                  placeholder=&apos;1234 Main Street&apos;
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className=&apos;grid gap-4 md:grid-cols-3&apos;>
                <div className=&apos;space-y-2&apos;>
                  <Label htmlFor=&apos;city&apos;>City *</Label>
                  <Input
                    id=&apos;city&apos;
                    placeholder=&apos;City&apos;
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    required
                  />
                </div>

                <div className=&apos;space-y-2&apos;>
                  <Label htmlFor=&apos;state&apos;>State *</Label>
                  <Input
                    id=&apos;state&apos;
                    placeholder=&apos;TX&apos;
                    value={state}
                    onChange={e => setState(e.target.value)}
                    required
                  />
                </div>

                <div className=&apos;space-y-2&apos;>
                  <Label htmlFor=&apos;zip&apos;>ZIP Code *</Label>
                  <Input
                    id=&apos;zip&apos;
                    placeholder=&apos;78701&apos;
                    value={zipCode}
                    onChange={e => setZipCode(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Boundary Configuration */}
        <Card>
          <CardContent className=&apos;pt-6&apos;>
            <div className=&apos;space-y-6&apos;>
              <div>
                <h3 className=&apos;flex items-center gap-2 mb-4&apos;>
                  <MapPin className=&apos;h-5 w-5&apos; />
                  Boundary Configuration
                </h3>
                <p className=&apos;text-sm text-muted-foreground mb-6&apos;>
                  Define the geographic boundaries and tolerance settings for
                  this site
                </p>
              </div>

              <div className=&apos;grid gap-4 md:grid-cols-2&apos;>
                <div className=&apos;space-y-2&apos;>
                  <Label htmlFor=&apos;latitude&apos;>Latitude (Center Point) *</Label>
                  <Input
                    id=&apos;latitude&apos;
                    placeholder=&apos;30.2672&apos;
                    value={latitude}
                    onChange={e => setLatitude(e.target.value)}
                    required
                  />
                  <p className=&apos;text-sm text-muted-foreground&apos;>
                    Decimal format (e.g., 30.2672)
                  </p>
                </div>

                <div className=&apos;space-y-2&apos;>
                  <Label htmlFor=&apos;longitude&apos;>Longitude (Center Point) *</Label>
                  <Input
                    id=&apos;longitude&apos;
                    placeholder=&apos;-97.7431&apos;
                    value={longitude}
                    onChange={e => setLongitude(e.target.value)}
                    required
                  />
                  <p className=&apos;text-sm text-muted-foreground&apos;>
                    Decimal format (e.g., -97.7431)
                  </p>
                </div>
              </div>

              <div className=&apos;grid gap-4 md:grid-cols-2&apos;>
                <div className=&apos;space-y-2&apos;>
                  <Label htmlFor=&apos;boundary-type&apos;>Boundary Type</Label>
                  <Select value={boundaryType} onValueChange={setBoundaryType}>
                    <SelectTrigger id=&apos;boundary-type&apos;>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=&apos;radius&apos;>Circular Radius</SelectItem>
                      <SelectItem value=&apos;polygon&apos;>Custom Polygon</SelectItem>
                      <SelectItem value=&apos;rectangle&apos;>Rectangle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className=&apos;space-y-2&apos;>
                  <Label htmlFor=&apos;radius&apos;>
                    {boundaryType === &apos;radius&apos;
                      ? &apos;Radius (feet) *&apos;
                      : &apos;Area Size (feet) *&apos;}
                  </Label>
                  <Input
                    id=&apos;radius&apos;
                    type=&apos;number&apos;
                    placeholder=&apos;500&apos;
                    value={boundaryRadius}
                    onChange={e => setBoundaryRadius(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;tolerance&apos;>Boundary Tolerance (feet) *</Label>
                <Input
                  id=&apos;tolerance&apos;
                  type=&apos;number&apos;
                  placeholder=&apos;50&apos;
                  value={tolerance}
                  onChange={e => setTolerance(e.target.value)}
                  required
                />
                <p className=&apos;text-sm text-muted-foreground&apos;>
                  Assets within ± this distance from the boundary are considered
                  within the site
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardContent className=&apos;pt-6&apos;>
            <div className=&apos;space-y-6&apos;>
              <div>
                <h3>Contact Information</h3>
                <p className=&apos;text-sm text-muted-foreground mt-2&apos;>
                  Optional contact details for site management
                </p>
              </div>

              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;contact-name&apos;>Site Contact Name</Label>
                <Input
                  id=&apos;contact-name&apos;
                  placeholder=&apos;John Smith&apos;
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                />
              </div>

              <div className=&apos;grid gap-4 md:grid-cols-2&apos;>
                <div className=&apos;space-y-2&apos;>
                  <Label htmlFor=&apos;contact-phone&apos;>Contact Phone</Label>
                  <Input
                    id=&apos;contact-phone&apos;
                    type=&apos;tel&apos;
                    placeholder=&apos;(555) 123-4567&apos;
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                  />
                </div>

                <div className=&apos;space-y-2&apos;>
                  <Label htmlFor=&apos;contact-email&apos;>Contact Email</Label>
                  <Input
                    id=&apos;contact-email&apos;
                    type=&apos;email&apos;
                    placeholder=&apos;contact@example.com&apos;
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;notes&apos;>Additional Notes</Label>
                <Textarea
                  id=&apos;notes&apos;
                  placeholder=&apos;Any additional information about this site...&apos;
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </PageLayout>
  );
}
