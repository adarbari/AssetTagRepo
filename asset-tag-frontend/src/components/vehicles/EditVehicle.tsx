import { useState, useEffect } from 'react';
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
import { PageHeader, LoadingState, PageLayout } from '../common';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { vehicleTypes, drivers } from '../../data/dropdownOptions';

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
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [driver, setDriver] = useState('');
  const [capacity, setCapacity] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('active');

  useEffect(() => {
    // Load vehicle data
    // TODO: Backend integration
    // const vehicle = await api.getVehicle(vehicleId);

    // Mock data loading
    const mockVehicle = {
      id: vehicleId,
      name: 'Truck Alpha',
      type: 'pickup-truck',
      licensePlate: 'ABC-123',
      driver: 'mike-wilson',
      capacity: 10,
      location: 'Office Parking',
      status: 'active',
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
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const updatedVehicle = {
        id: vehicleId,
        name: vehicleName,
        type:
          vehicleTypes.find(t => t.value === vehicleType)?.label || vehicleType,
        licensePlate,
        driver: drivers.find(d => d.value === driver)?.label || 'Unassigned',
        status: status as 'active' | 'inactive' | 'maintenance',
        location: location || 'Unknown',
        capacity: parseInt(capacity) || 10,
      };

      // TODO: Backend integration
      // await api.updateVehicle(vehicleId, updatedVehicle);

      toast.success('Vehicle updated successfully', {
        description: `${vehicleName} has been updated`,
      });

      if (onVehicleUpdated) {
        onVehicleUpdated(updatedVehicle);
      }

      onBack();
    } catch (error) {
// // // // // // // console.error('Error updating vehicle:', error);
      toast.error('Failed to update vehicle', {
        description: 'Please try again',
      });
    }
  };

  if (loading) {
    return <LoadingState message='Loading vehicle details...' fullScreen />;
  }

  return (
    <PageLayout
      variant='narrow'
      padding='md'
      header={
        <PageHeader
          title='Edit Vehicle'
          description='Update vehicle information and settings'
          actions={
            <div className='flex items-center gap-2'>
              <Button variant='outline' onClick={onBack}>
                <ArrowLeft className='h-4 w-4 mr-2' />
                Cancel
              </Button>
              <Button type='submit' form='edit-vehicle-form'>
                <Save className='h-4 w-4 mr-2' />
                Save Changes
              </Button>
            </div>
          }
        />
      }
    >
      <Card>
        <CardContent className='pt-6'>
          <form
            id='edit-vehicle-form'
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
                  onChange={e => setLicensePlate(e.target.value.toUpperCase())}
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
                <Label htmlFor='status'>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id='status'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='active'>Active</SelectItem>
                    <SelectItem value='inactive'>Inactive</SelectItem>
                    <SelectItem value='maintenance'>Maintenance</SelectItem>
                  </SelectContent>
                </Select>
                <p className='text-sm text-muted-foreground'>
                  Current operational status
                </p>
              </div>
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
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
            </div>
          </form>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
