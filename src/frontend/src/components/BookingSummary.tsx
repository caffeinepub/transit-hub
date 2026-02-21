import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Route } from '../backend';

interface BookingSummaryProps {
  route: Route;
  selectedSeats: string[];
  selectedVehicle: string;
}

export default function BookingSummary({ route, selectedSeats, selectedVehicle }: BookingSummaryProps) {
  const basePrice = Number(route.priceCents) / 100;
  const quantity = route.transportType === 'taxi' ? 1 : selectedSeats.length;
  
  const vehicleMultiplier = selectedVehicle === 'suv' ? 1.5 : selectedVehicle === 'van' ? 2 : 1;
  const totalPrice = basePrice * quantity * vehicleMultiplier;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-semibold">{route.routeName}</p>
          <p className="text-sm text-muted-foreground">{route.operatorName}</p>
        </div>

        <Separator />

        {route.transportType === 'taxi' ? (
          <div>
            <p className="text-sm text-muted-foreground">Vehicle Type</p>
            <p className="font-medium capitalize">{selectedVehicle || 'Not selected'}</p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground">Selected Seats</p>
            <p className="font-medium">
              {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'No seats selected'}
            </p>
          </div>
        )}

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Base Price</span>
            <span>${basePrice.toFixed(2)}</span>
          </div>
          {route.transportType !== 'taxi' && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Quantity</span>
              <span>× {quantity}</span>
            </div>
          )}
          {route.transportType === 'taxi' && vehicleMultiplier !== 1 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Vehicle Multiplier</span>
              <span>× {vehicleMultiplier}</span>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <span className="font-semibold">Total</span>
          <span className="text-2xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
