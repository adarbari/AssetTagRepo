import { useState } from "react";
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
import { Separator } from "../ui/separator";
import { Card, CardContent } from "../ui/card";
import { PageHeader } from "../common";
import { ArrowLeft, MapPin, Building2 } from "lucide-react";
import { toast } from "sonner";

interface CreateSiteProps {
  onBack: () => void;
}

export function CreateSite({ onBack }: CreateSiteProps) {
  const [siteName, setSiteName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [boundaryType, setBoundaryType] = useState("radius");
  const [boundaryRadius, setBoundaryRadius] = useState("");
  const [tolerance, setTolerance] = useState("50");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!siteName || !address || !city || !state || !zipCode || !latitude || !longitude || !boundaryRadius || !tolerance) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Handle form submission
    console.log({
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

    toast.success("Site created successfully", {
      description: `${siteName} has been added to your sites`,
    });
    
    onBack();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <PageHeader
        title="Create New Site"
        description="Define a new physical site location with boundary configurations"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" form="create-site-form">
              <Building2 className="h-4 w-4 mr-2" />
              Create Site
            </Button>
          </div>
        }
      />

      {/* Form Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto">
          <form id="create-site-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="flex items-center gap-2 mb-4">
                      <Building2 className="h-5 w-5" />
                      Basic Information
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Enter the basic details about this site location
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="site-name">Site Name *</Label>
                    <Input
                      id="site-name"
                      placeholder="e.g., Main Warehouse, Job Site Alpha"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      placeholder="1234 Main Street"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        placeholder="TX"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP Code *</Label>
                      <Input
                        id="zip"
                        placeholder="78701"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Boundary Configuration */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="flex items-center gap-2 mb-4">
                      <MapPin className="h-5 w-5" />
                      Boundary Configuration
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Define the geographic boundaries and tolerance settings for this site
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude (Center Point) *</Label>
                      <Input
                        id="latitude"
                        placeholder="30.2672"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        Decimal format (e.g., 30.2672)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude (Center Point) *</Label>
                      <Input
                        id="longitude"
                        placeholder="-97.7431"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        Decimal format (e.g., -97.7431)
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="boundary-type">Boundary Type</Label>
                      <Select value={boundaryType} onValueChange={setBoundaryType}>
                        <SelectTrigger id="boundary-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="radius">Circular Radius</SelectItem>
                          <SelectItem value="polygon">Custom Polygon</SelectItem>
                          <SelectItem value="rectangle">Rectangle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="radius">
                        {boundaryType === "radius"
                          ? "Radius (feet) *"
                          : "Area Size (feet) *"}
                      </Label>
                      <Input
                        id="radius"
                        type="number"
                        placeholder="500"
                        value={boundaryRadius}
                        onChange={(e) => setBoundaryRadius(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tolerance">Boundary Tolerance (feet) *</Label>
                    <Input
                      id="tolerance"
                      type="number"
                      placeholder="50"
                      value={tolerance}
                      onChange={(e) => setTolerance(e.target.value)}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Assets within ± this distance from the boundary are considered within the site
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <h3>Contact Information</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Optional contact details for site management
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Site Contact Name</Label>
                    <Input
                      id="contact-name"
                      placeholder="John Smith"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contact-phone">Contact Phone</Label>
                      <Input
                        id="contact-phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-email">Contact Email</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        placeholder="contact@example.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional information about this site..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
