import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin } from 'lucide-react';
import type { Route } from '../backend';

interface BookingSummaryProps {
  route: Route;
  selectedSeats: string[];
  selectedVehicle: string;
}

export default function BookingSummary({ route, selectedSeats, selectedVehicle }: BookingSummaryProps) {
  const quantity = route.transportType === 'taxi' ? 1 : selectedSeats.length;
  const vehicleMultiplier = selectedVehicle === 'suv' ? 1.5 : selectedVehicle === 'van' ? 2 : 1;
  
  const baseFare = Number(route.rateBreakdown.baseFare) / 100;
  const taxes = Number(route.rateBreakdown.taxes) / 100;
  const serviceFees = Number(route.rateBreakdown.serviceFees) / 100;
  const pricePerUnit = baseFare + taxes + serviceFees;
  
  const totalBaseFare = baseFare * quantity * vehicleMultiplier;
  const totalTaxes = taxes * quantity * vehicleMultiplier;
  const totalServiceFees = serviceFees * quantity * vehicleMultiplier;
  const totalPrice = pricePerUnit * quantity * vehicleMultiplier;

  const formatPrice = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <p className="font-semibold">{route.origin} → {route.destination}</p>
          </div>
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

        <div>
          <h3 className="font-semibold mb-3">Fare Breakdown</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base Fare</span>
              <span className="font-medium">{formatPrice(totalBaseFare)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Taxes</span>
              <span className="font-medium">{formatPrice(totalTaxes)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service Fees</span>
              <span className="font-medium">{formatPrice(totalServiceFees)}</span>
            </div>
            {route.transportType !== 'taxi' && quantity > 1 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Passengers</span>
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
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <span className="font-semibold">Total</span>
          <span className="text-2xl font-bold text-primary">{formatPrice(totalPrice)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
