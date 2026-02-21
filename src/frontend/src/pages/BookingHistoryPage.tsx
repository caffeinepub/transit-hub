import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetUserBookings } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BookingCard from '../components/BookingCard';
import { useMemo } from 'react';

export default function BookingHistoryPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: bookings = [], isLoading } = useGetUserBookings(identity?.getPrincipal().toString());

  const categorizedBookings = useMemo(() => {
    const now = Date.now() * 1000000;
    return {
      upcoming: bookings.filter((b) => b.status.hasOwnProperty('confirmed') && Number(b.bookingTime) > now),
      completed: bookings.filter((b) => b.status.hasOwnProperty('completed')),
      cancelled: bookings.filter((b) => b.status.hasOwnProperty('cancelled')),
    };
  }, [bookings]);

  if (!identity) {
    return (
      <div className="container py-8">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Please login to view your bookings</p>
          <Button onClick={() => navigate({ to: '/search' })}>Back to Search</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming ({categorizedBookings.upcoming.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({categorizedBookings.completed.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({categorizedBookings.cancelled.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : categorizedBookings.upcoming.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No upcoming bookings</p>
              <Button onClick={() => navigate({ to: '/search' })}>Book a Trip</Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {categorizedBookings.upcoming.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {categorizedBookings.completed.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No completed bookings</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {categorizedBookings.completed.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          {categorizedBookings.cancelled.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No cancelled bookings</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {categorizedBookings.cancelled.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
