import { useState, useEffect } from &apos;react&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Input } from &apos;../ui/input&apos;;
import { Label } from &apos;../ui/label&apos;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &apos;../ui/select&apos;;
import { Card, CardContent } from &apos;../ui/card&apos;;
import { PageHeader, LoadingState, PageLayout } from &apos;../common&apos;;
import { ArrowLeft, Save } from &apos;lucide-react&apos;;
import { toast } from &apos;sonner&apos;;
import { vehicleTypes, drivers } from &apos;../../data/dropdownOptions&apos;;

interface EditVehicleProps {
  vehicleId: string;
  onBack: () => void;
  onVehicleUpdated?: (vehicle: any) => void;
}

export function EditVehicle({
  vehicleId,
  onBack,
  onVehicleUpdated,
}: EditVehicleProps) {
  const [loading, setLoading] = useState(true);
  const [vehicleName, setVehicleName] = useState(&apos;&apos;);
  const [vehicleType, setVehicleType] = useState(&apos;&apos;);
  const [licensePlate, setLicensePlate] = useState(&apos;&apos;);
  const [driver, setDriver] = useState(&apos;&apos;);
  const [capacity, setCapacity] = useState(&apos;&apos;);
  const [location, setLocation] = useState(&apos;&apos;);
  const [status, setStatus] = useState(&apos;active&apos;);

  useEffect(() => {
    // Load vehicle data
    // TODO: Backend integration
    // const vehicle = await api.getVehicle(vehicleId);

    // Mock data loading
    const mockVehicle = {
      id: vehicleId,
      name: &apos;Truck Alpha&apos;,
      type: &apos;pickup-truck&apos;,
      licensePlate: &apos;ABC-123&apos;,
      driver: &apos;mike-wilson&apos;,
      capacity: 10,
      location: &apos;Office Parking&apos;,
      status: &apos;active&apos;,
    };

    setVehicleName(mockVehicle.name);
    setVehicleType(mockVehicle.type);
    setLicensePlate(mockVehicle.licensePlate);
    setDriver(mockVehicle.driver);
    setCapacity(String(mockVehicle.capacity));
    setLocation(mockVehicle.location);
    setStatus(mockVehicle.status);
    setLoading(false);
  }, [vehicleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vehicleName || !vehicleType || !licensePlate) {
      toast.error(&apos;Please fill in all required fields&apos;);
      return;
    }

    try {
      const updatedVehicle = {
        id: vehicleId,
        name: vehicleName,
        type:
          vehicleTypes.find(t => t.value === vehicleType)?.label || vehicleType,
        licensePlate,
        driver: drivers.find(d => d.value === driver)?.label || &apos;Unassigned&apos;,
        status: status as &apos;active&apos; | &apos;inactive&apos; | &apos;maintenance&apos;,
        location: location || &apos;Unknown&apos;,
        capacity: parseInt(capacity) || 10,
      };

      // TODO: Backend integration
      // await api.updateVehicle(vehicleId, updatedVehicle);

      toast.success(&apos;Vehicle updated successfully&apos;, {
        description: `${vehicleName} has been updated`,
      });

      if (onVehicleUpdated) {
        onVehicleUpdated(updatedVehicle);
      }

      onBack();
    } catch (error) {
      // console.error(&apos;Error updating vehicle:&apos;, error);
      toast.error(&apos;Failed to update vehicle&apos;, {
        description: &apos;Please try again&apos;,
      });
    }
  };

  if (loading) {
    return <LoadingState message=&apos;Loading vehicle details...&apos; fullScreen />;
  }

  return (
    <PageLayout
      variant=&apos;narrow&apos;
      padding=&apos;md&apos;
      header={
        <PageHeader
          title=&apos;Edit Vehicle&apos;
          description=&apos;Update vehicle information and settings&apos;
          actions={
            <div className=&apos;flex items-center gap-2&apos;>
              <Button variant=&apos;outline&apos; onClick={onBack}>
                <ArrowLeft className=&apos;h-4 w-4 mr-2&apos; />
                Cancel
              </Button>
              <Button type=&apos;submit&apos; form=&apos;edit-vehicle-form&apos;>
                <Save className=&apos;h-4 w-4 mr-2&apos; />
                Save Changes
              </Button>
            </div>
          }
        />
      }
    >
      <Card>
        <CardContent className=&apos;pt-6&apos;>
          <form
            id=&apos;edit-vehicle-form&apos;
            onSubmit={handleSubmit}
            className=&apos;space-y-6&apos;
          >
            <div className=&apos;space-y-2&apos;>
              <Label htmlFor=&apos;vehicle-name&apos;>Vehicle Name *</Label>
              <Input
                id=&apos;vehicle-name&apos;
                placeholder=&apos;e.g., Truck Alpha&apos;
                value={vehicleName}
                onChange={e => setVehicleName(e.target.value)}
                required
              />
              <p className=&apos;text-sm text-muted-foreground&apos;>
                A descriptive name to identify this vehicle
              </p>
            </div>

            <div className=&apos;grid gap-4 md:grid-cols-2&apos;>
              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;vehicle-type&apos;>Vehicle Type *</Label>
                <Select
                  value={vehicleType}
                  onValueChange={setVehicleType}
                  required
                >
                  <SelectTrigger id=&apos;vehicle-type&apos;>
                    <SelectValue placeholder=&apos;Select type&apos; />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;license-plate&apos;>License Plate *</Label>
                <Input
                  id=&apos;license-plate&apos;
                  placeholder=&apos;e.g., ABC-123&apos;
                  value={licensePlate}
                  onChange={e => setLicensePlate(e.target.value.toUpperCase())}
                  required
                />
              </div>
            </div>

            <div className=&apos;grid gap-4 md:grid-cols-2&apos;>
              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;driver&apos;>Assigned Driver</Label>
                <Select value={driver} onValueChange={setDriver}>
                  <SelectTrigger id=&apos;driver&apos;>
                    <SelectValue placeholder=&apos;Select driver (optional)&apos; />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map(driverOption => (
                      <SelectItem
                        key={driverOption.value}
                        value={driverOption.value}
                      >
                        {driverOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className=&apos;text-sm text-muted-foreground&apos;>
                  Default driver assigned to this vehicle
                </p>
              </div>

              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;status&apos;>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id=&apos;status&apos;>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=&apos;active&apos;>Active</SelectItem>
                    <SelectItem value=&apos;inactive&apos;>Inactive</SelectItem>
                    <SelectItem value=&apos;maintenance&apos;>Maintenance</SelectItem>
                  </SelectContent>
                </Select>
                <p className=&apos;text-sm text-muted-foreground&apos;>
                  Current operational status
                </p>
              </div>
            </div>

            <div className=&apos;grid gap-4 md:grid-cols-2&apos;>
              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;capacity&apos;>Asset Capacity</Label>
                <Input
                  id=&apos;capacity&apos;
                  type=&apos;number&apos;
                  placeholder=&apos;10&apos;
                  value={capacity}
                  onChange={e => setCapacity(e.target.value)}
                  min=&apos;1&apos;
                />
                <p className=&apos;text-sm text-muted-foreground&apos;>
                  Maximum number of assets this vehicle can carry
                </p>
              </div>

              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;location&apos;>Current Location</Label>
                <Input
                  id=&apos;location&apos;
                  placeholder=&apos;e.g., Office Parking&apos;
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
                <p className=&apos;text-sm text-muted-foreground&apos;>
                  Where this vehicle is currently located
                </p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
