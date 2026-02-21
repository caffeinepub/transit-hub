import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useGetAllRoutes } from '../hooks/useQueries';
import { useState } from 'react';
import SeatMap from '../components/SeatMap';
import TaxiVehicleSelector from '../components/TaxiVehicleSelector';
import BookingSummary from '../components/BookingSummary';

export default function SelectionPage() {
  const { routeId } = useParams({ strict: false });
  const navigate = useNavigate();
  const { data: routes = [] } = useGetAllRoutes();
  const route = routes.find((r) => r.id === routeId);

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');

  if (!route) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">Route not found</p>
            <Button onClick={() => navigate({ to: '/results' })}>Back to Results</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleContinue = () => {
    navigate({ to: '/booking/$routeId', params: { routeId: route.id } });
  };

  const canContinue = route.transportType === 'taxi' ? !!selectedVehicle : selectedSeats.length > 0;

  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/results' })}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Select Your {route.transportType === 'taxi' ? 'Vehicle' : 'Seats'}</h1>
          <p className="text-muted-foreground">{route.routeName} - {route.operatorName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {route.transportType === 'taxi' ? (
            <TaxiVehicleSelector
              selectedVehicle={selectedVehicle}
              setSelectedVehicle={setSelectedVehicle}
            />
          ) : (
            <SeatMap
              transportType={route.transportType}
              selectedSeats={selectedSeats}
              setSelectedSeats={setSelectedSeats}
            />
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <BookingSummary
              route={route}
              selectedSeats={selectedSeats}
              selectedVehicle={selectedVehicle}
            />
            <Button
              className="w-full mt-4"
              size="lg"
              disabled={!canContinue}
              onClick={handleContinue}
            >
              Continue to Booking
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
