import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaxiVehicleSelectorProps {
  selectedVehicle: string;
  setSelectedVehicle: (vehicle: string) => void;
}

const vehicles = [
  { id: 'sedan', name: 'Sedan', capacity: 4, luggage: 2, priceMultiplier: 1, description: 'Comfortable for small groups' },
  { id: 'suv', name: 'SUV', capacity: 6, luggage: 4, priceMultiplier: 1.5, description: 'Spacious for families' },
  { id: 'van', name: 'Van', capacity: 8, luggage: 6, priceMultiplier: 2, description: 'Perfect for large groups' },
];

export default function TaxiVehicleSelector({ selectedVehicle, setSelectedVehicle }: TaxiVehicleSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Your Vehicle</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {vehicles.map((vehicle) => (
          <button
            key={vehicle.id}
            onClick={() => setSelectedVehicle(vehicle.id)}
            className={cn(
              'w-full p-6 rounded-lg border-2 transition-all text-left',
              selectedVehicle === vehicle.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-accent'
            )}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">{vehicle.name}</h3>
                  {selectedVehicle === vehicle.id && (
                    <Badge>Selected</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{vehicle.description}</p>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{vehicle.capacity} passengers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{vehicle.luggage} bags</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Price multiplier</p>
                <p className="text-xl font-bold text-primary">{vehicle.priceMultiplier}x</p>
              </div>
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
