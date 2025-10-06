import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Card, CardContent } from '../ui/card';
import { PageHeader } from '../common';
import { Truck, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { vehicleTypes, drivers } from '../../data/dropdownOptions';

interface CreateVehicleProps {
  onBack: () => void;
  onVehicleCreated?: (vehicle: any) => void;
}

export function CreateVehicle({
  onBack,
  onVehicleCreated,
}: CreateVehicleProps) {
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [driver, setDriver] = useState('');
  const [capacity, setCapacity] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!vehicleName || !vehicleType || !licensePlate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Create new vehicle
      const newVehicle = {
        id: `VEH-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        name: vehicleName,
        type:
          vehicleTypes.find(t => t.value === vehicleType)?.label || vehicleType,
        licensePlate,
        driver: drivers.find(d => d.value === driver)?.label || 'Unassigned',
        status: 'active' as const,
        location: location || 'Office Parking',
        capacity: parseInt(capacity) || 10,
        assetsLoaded: [],
      };

      // TODO: Backend integration
      // await api.createVehicle(newVehicle);

      toast.success('Vehicle added successfully', {
        description: `${vehicleName} has been added to the fleet`,
      });

      // Notify parent component
      if (onVehicleCreated) {
        onVehicleCreated(newVehicle);
      }

      onBack();
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast.error('Failed to add vehicle', {
        description: 'Please try again',
      });
    }
  };

  return (
    <div className='h-full flex flex-col'>
      {/* Header */}
      <PageHeader
        title='Add New Vehicle'
        description='Register a new vehicle to the tracking system'
        actions={
          <div className='flex items-center gap-2'>
            <Button variant='outline' onClick={onBack}>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Cancel
            </Button>
            <Button type='submit' form='create-vehicle-form'>
              <Truck className='h-4 w-4 mr-2' />
              Add Vehicle
            </Button>
          </div>
        }
      />

      {/* Form Content */}
      <div className='flex-1 overflow-auto p-8'>
        <div className='max-w-3xl mx-auto'>
          <Card>
            <CardContent className='pt-6'>
              <form
                id='create-vehicle-form'
                onSubmit={handleSubmit}
                className='space-y-6'
              >
                <div className='space-y-2'>
                  <Label htmlFor='vehicle-name'>Vehicle Name *</Label>
                  <Input
                    id='vehicle-name'
                    placeholder='e.g., Truck Alpha'
                    value={vehicleName}
                    onChange={e => setVehicleName(e.target.value)}
                    required
                  />
                  <p className='text-sm text-muted-foreground'>
                    A descriptive name to identify this vehicle
                  </p>
                </div>

                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='vehicle-type'>Vehicle Type *</Label>
                    <Select
                      value={vehicleType}
                      onValueChange={setVehicleType}
                      required
                    >
                      <SelectTrigger id='vehicle-type'>
                        <SelectValue placeholder='Select type' />
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

                  <div className='space-y-2'>
                    <Label htmlFor='license-plate'>License Plate *</Label>
                    <Input
                      id='license-plate'
                      placeholder='e.g., ABC-123'
                      value={licensePlate}
                      onChange={e =>
                        setLicensePlate(e.target.value.toUpperCase())
                      }
                      required
                    />
                  </div>
                </div>

                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='driver'>Assigned Driver</Label>
                    <Select value={driver} onValueChange={setDriver}>
                      <SelectTrigger id='driver'>
                        <SelectValue placeholder='Select driver (optional)' />
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
                    <p className='text-sm text-muted-foreground'>
                      Default driver assigned to this vehicle
                    </p>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='capacity'>Asset Capacity</Label>
                    <Input
                      id='capacity'
                      type='number'
                      placeholder='10'
                      value={capacity}
                      onChange={e => setCapacity(e.target.value)}
                      min='1'
                    />
                    <p className='text-sm text-muted-foreground'>
                      Maximum number of assets this vehicle can carry
                    </p>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='location'>Current Location</Label>
                  <Input
                    id='location'
                    placeholder='e.g., Office Parking'
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                  />
                  <p className='text-sm text-muted-foreground'>
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
