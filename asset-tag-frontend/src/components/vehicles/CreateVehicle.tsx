import React from &apos;react&apos;;
import { useState } from &apos;react&apos;;
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
import { PageHeader } from &apos;../common&apos;;
import { Truck, ArrowLeft } from &apos;lucide-react&apos;;
import { toast } from &apos;sonner&apos;;
import { vehicleTypes, drivers } from &apos;../../data/dropdownOptions&apos;;

interface CreateVehicleProps {
  onBack: () => void;
  onVehicleCreated?: (vehicle: any) => void;
}

export function CreateVehicle({
  onBack,
  onVehicleCreated,
}: CreateVehicleProps) {
  const [vehicleName, setVehicleName] = useState(&apos;&apos;);
  const [vehicleType, setVehicleType] = useState(&apos;&apos;);
  const [licensePlate, setLicensePlate] = useState(&apos;&apos;);
  const [driver, setDriver] = useState(&apos;&apos;);
  const [capacity, setCapacity] = useState(&apos;&apos;);
  const [location, setLocation] = useState(&apos;&apos;);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!vehicleName || !vehicleType || !licensePlate) {
      toast.error(&apos;Please fill in all required fields&apos;);
      return;
    }

    try {
      // Create new vehicle
      const newVehicle = {
        id: `VEH-${String(Math.floor(Math.random() * 1000)).padStart(3, &apos;0&apos;)}`,
        name: vehicleName,
        type:
          vehicleTypes.find(t => t.value === vehicleType)?.label || vehicleType,
        licensePlate,
        driver: drivers.find(d => d.value === driver)?.label || &apos;Unassigned&apos;,
        status: &apos;active&apos; as const,
        location: location || &apos;Office Parking&apos;,
        capacity: parseInt(capacity) || 10,
        assetsLoaded: [],
      };

      // TODO: Backend integration
      // await api.createVehicle(newVehicle);

      toast.success(&apos;Vehicle added successfully&apos;, {
        description: `${vehicleName} has been added to the fleet`,
      });

      // Notify parent component
      if (onVehicleCreated) {
        onVehicleCreated(newVehicle);
      }

      onBack();
    } catch (error) {
// // // // // // console.error(&apos;Error adding vehicle:&apos;, error);
      toast.error(&apos;Failed to add vehicle&apos;, {
        description: &apos;Please try again&apos;,
      });
    }
  };

  return (
    <div className=&apos;h-full flex flex-col&apos;>
      {/* Header */}
      <PageHeader
        title=&apos;Add New Vehicle&apos;
        description=&apos;Register a new vehicle to the tracking system&apos;
        actions={
          <div className=&apos;flex items-center gap-2&apos;>
            <Button variant=&apos;outline&apos; onClick={onBack}>
              <ArrowLeft className=&apos;h-4 w-4 mr-2&apos; />
              Cancel
            </Button>
            <Button type=&apos;submit&apos; form=&apos;create-vehicle-form&apos;>
              <Truck className=&apos;h-4 w-4 mr-2&apos; />
              Add Vehicle
            </Button>
          </div>
        }
      />

      {/* Form Content */}
      <div className=&apos;flex-1 overflow-auto p-8&apos;>
        <div className=&apos;max-w-3xl mx-auto&apos;>
          <Card>
            <CardContent className=&apos;pt-6&apos;>
              <form
                id=&apos;create-vehicle-form&apos;
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
                      onChange={e =>
                        setLicensePlate(e.target.value.toUpperCase())
                      }
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
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
