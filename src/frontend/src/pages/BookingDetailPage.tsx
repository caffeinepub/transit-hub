import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetBooking, useUpdateBooking } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Train, Bus, Car, Calendar, DollarSign, MapPin } from 'lucide-react';
import CancellationModal from '../components/CancellationModal';
import { useState } from 'react';

export default function BookingDetailPage() {
  const { bookingId } = useParams({ strict: false });
  const navigate = useNavigate();
  const { data: booking, isLoading } = useGetBooking(bookingId);
  const [showCancelModal, setShowCancelModal] = useState(false);

  if (isLoading) {
    return (
      <div className="container py-8">
        <p className="text-center text-muted-foreground">Loading booking details...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container py-8">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Booking not found</p>
          <Button onClick={() => navigate({ to: '/bookings' })}>Back to Bookings</Button>
        </Card>
      </div>
    );
  }

  const getIcon = () => {
    switch (booking.route.transportType) {
      case 'train':
        return <Train className="h-6 w-6" />;
      case 'bus':
        return <Bus className="h-6 w-6" />;
      case 'taxi':
        return <Car className="h-6 w-6" />;
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
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const canCancel = booking.status.hasOwnProperty('confirmed');

  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/bookings' })}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Booking Details</h1>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getIcon()}
                <div>
                  <CardTitle>{booking.route.routeName}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{booking.route.operatorName}</p>
                </div>
              </div>
              {getStatusBadge()}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Booking Date</span>
                </div>
                <p className="font-medium">{formatDate(booking.bookingTime)}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>Total Cost</span>
                </div>
                <p className="font-medium text-2xl text-primary">
                  ${(Number(booking.costInStripeCents) / 100).toFixed(2)}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Route Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">{booking.route.transportType} Service</span>
                </div>
                <p className="text-muted-foreground">Booking ID: {booking.id}</p>
              </div>
            </div>

            {canCancel && (
              <>
                <Separator />
                <div className="flex gap-3">
                  <Button variant="destructive" onClick={() => setShowCancelModal(true)}>
                    Cancel Booking
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {showCancelModal && (
        <CancellationModal
          booking={booking}
          onClose={() => setShowCancelModal(false)}
        />
      )}
    </div>
  );
}
