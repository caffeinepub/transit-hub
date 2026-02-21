import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAddRouteWithRateBreakdown, useUpdateRoute } from '../hooks/useQueries';
import { TransportType, type Route } from '../backend';

interface AdminRouteFormProps {
  editRoute: Route | null;
  onCancelEdit: () => void;
}

export default function AdminRouteForm({ editRoute, onCancelEdit }: AdminRouteFormProps) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [transportType, setTransportType] = useState<TransportType>(TransportType.train);
  const [operatorName, setOperatorName] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [baseFare, setBaseFare] = useState('');
  const [taxes, setTaxes] = useState('');
  const [serviceFees, setServiceFees] = useState('');

  const addRoute = useAddRouteWithRateBreakdown();
  const updateRoute = useUpdateRoute();

  const isEditMode = !!editRoute;

  useEffect(() => {
    if (editRoute) {
      setOrigin(editRoute.origin);
      setDestination(editRoute.destination);
      setTransportType(editRoute.transportType);
      setOperatorName(editRoute.operatorName);
      setDistanceKm(editRoute.distanceKm.toString());
      setDurationMinutes(editRoute.durationMinutes.toString());
      setBaseFare((Number(editRoute.rateBreakdown.baseFare) / 100).toFixed(2));
      setTaxes((Number(editRoute.rateBreakdown.taxes) / 100).toFixed(2));
      setServiceFees((Number(editRoute.rateBreakdown.serviceFees) / 100).toFixed(2));
      
      if (editRoute.schedule.length > 0) {
        const date = new Date(Number(editRoute.schedule[0]) / 1000000);
        setDepartureTime(date.toISOString().slice(0, 16));
      }
    }
  }, [editRoute]);

  const resetForm = () => {
    setOrigin('');
    setDestination('');
    setTransportType(TransportType.train);
    setOperatorName('');
    setDepartureTime('');
    setArrivalTime('');
    setDistanceKm('');
    setDurationMinutes('');
    setBaseFare('');
    setTaxes('');
    setServiceFees('');
    onCancelEdit();
  };

  const calculateTotalPrice = () => {
    const base = parseFloat(baseFare) || 0;
    const tax = parseFloat(taxes) || 0;
    const fees = parseFloat(serviceFees) || 0;
    return (base + tax + fees).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (origin.trim() === destination.trim()) {
      toast.error('Origin and destination must be different cities');
      return;
    }

    const baseFareCents = Math.round(parseFloat(baseFare) * 100);
    const taxesCents = Math.round(parseFloat(taxes) * 100);
    const serviceFeesCents = Math.round(parseFloat(serviceFees) * 100);

    if (baseFareCents < 0 || taxesCents < 0 || serviceFeesCents < 0) {
      toast.error('All rate fields must be positive numbers');
      return;
    }

    try {
      if (isEditMode && editRoute) {
        const departureDate = new Date(departureTime);
        const scheduleTime = BigInt(departureDate.getTime() * 1000000);

        const updatedRoute: Route = {
          ...editRoute,
          origin: origin.trim(),
          destination: destination.trim(),
          transportType,
          operatorName: operatorName.trim(),
          distanceKm: BigInt(distanceKm),
          durationMinutes: BigInt(durationMinutes),
          schedule: [scheduleTime],
          priceCents: BigInt(baseFareCents + taxesCents + serviceFeesCents),
          rateBreakdown: {
            baseFare: BigInt(baseFareCents),
            taxes: BigInt(taxesCents),
            serviceFees: BigInt(serviceFeesCents),
          },
        };

        await updateRoute.mutateAsync(updatedRoute);
        toast.success('Route updated successfully');
      } else {
        const routeId = `route-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const routeName = `${origin} to ${destination}`;
        const departureDate = new Date(departureTime);
        const scheduleTime = BigInt(departureDate.getTime() * 1000000);

        await addRoute.mutateAsync({
          transportType,
          id: routeId,
          operatorName: operatorName.trim(),
          routeName,
          origin: origin.trim(),
          destination: destination.trim(),
          distanceKm: BigInt(distanceKm),
          durationMinutes: BigInt(durationMinutes),
          schedule: [scheduleTime],
          baseFare: BigInt(baseFareCents),
          taxes: BigInt(taxesCents),
          serviceFees: BigInt(serviceFeesCents),
        });
        toast.success('Route added successfully');
      }

      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save route');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? 'Edit Route' : 'Add New Route'}</CardTitle>
        <CardDescription>
          {isEditMode
            ? 'Update the route details and rate breakdown'
            : 'Enter route details including origin, destination, and rate breakdown'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin">Origin City *</Label>
              <Input
                id="origin"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g., Mumbai"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Destination City *</Label>
              <Input
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g., Delhi"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transportType">Transport Type *</Label>
              <Select value={transportType} onValueChange={(value) => setTransportType(value as TransportType)}>
                <SelectTrigger id="transportType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TransportType.train}>Train</SelectItem>
                  <SelectItem value={TransportType.bus}>Bus</SelectItem>
                  <SelectItem value={TransportType.taxi}>Taxi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="operatorName">Operator Name *</Label>
              <Input
                id="operatorName"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                placeholder="e.g., Indian Railways"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="departureTime">Departure Time *</Label>
              <Input
                id="departureTime"
                type="datetime-local"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="distanceKm">Distance (km) *</Label>
              <Input
                id="distanceKm"
                type="number"
                min="1"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                placeholder="e.g., 1400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="durationMinutes">Duration (minutes) *</Label>
              <Input
                id="durationMinutes"
                type="number"
                min="1"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder="e.g., 960"
                required
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Rate Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="baseFare">Base Fare (₹) *</Label>
                <Input
                  id="baseFare"
                  type="number"
                  step="0.01"
                  min="0"
                  value={baseFare}
                  onChange={(e) => setBaseFare(e.target.value)}
                  placeholder="e.g., 1200.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxes">Taxes (₹) *</Label>
                <Input
                  id="taxes"
                  type="number"
                  step="0.01"
                  min="0"
                  value={taxes}
                  onChange={(e) => setTaxes(e.target.value)}
                  placeholder="e.g., 150.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceFees">Service Fees (₹) *</Label>
                <Input
                  id="serviceFees"
                  type="number"
                  step="0.01"
                  min="0"
                  value={serviceFees}
                  onChange={(e) => setServiceFees(e.target.value)}
                  placeholder="e.g., 50.00"
                  required
                />
              </div>
            </div>

            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Price:</span>
                <span className="text-2xl font-bold text-primary">₹{calculateTotalPrice()}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={addRoute.isPending || updateRoute.isPending}>
              {(addRoute.isPending || updateRoute.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Update Route' : 'Add Route'}
            </Button>
            {isEditMode && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel Edit
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
