import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from '@tanstack/react-router';
import { Train, Bus, Car, Calendar, DollarSign } from 'lucide-react';
import type { Booking } from '../backend';

interface BookingCardProps {
  booking: Booking;
}

export default function BookingCard({ booking }: BookingCardProps) {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (booking.route.transportType) {
      case 'train':
        return <Train className="h-5 w-5" />;
      case 'bus':
        return <Bus className="h-5 w-5" />;
      case 'taxi':
        return <Car className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getStatusBadge = () => {
    if (booking.status.hasOwnProperty('confirmed')) {
      return <Badge className="bg-green-500">Confirmed</Badge>;
    } else if (booking.status.hasOwnProperty('completed')) {
      return <Badge className="bg-blue-500">Completed</Badge>;
    } else if (booking.status.hasOwnProperty('cancelled')) {
      return <Badge variant="destructive">Cancelled</Badge>;
    }
    return null;
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3">
            {getIcon()}
            <div>
              <h3 className="font-semibold text-lg">{booking.route.routeName}</h3>
              <p className="text-sm text-muted-foreground">{booking.route.operatorName}</p>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(booking.bookingTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>${(Number(booking.costInStripeCents) / 100).toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {getStatusBadge()}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: '/bookings/$bookingId', params: { bookingId: booking.id } })}
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
