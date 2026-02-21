import { useParams, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useGetAllRoutes, useCreateBooking, useCreateCheckoutSession, useIsStripeConfigured } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import PassengerDetailsForm from '../components/PassengerDetailsForm';
import PaymentSetup from '../components/PaymentSetup';
import { toast } from 'sonner';

export default function BookingPage() {
  const { routeId } = useParams({ strict: false });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: routes = [] } = useGetAllRoutes();
  const { data: isStripeConfigured = false } = useIsStripeConfigured();
  const route = routes.find((r) => r.id === routeId);
  const createBooking = useCreateBooking();
  const createCheckoutSession = useCreateCheckoutSession();

  const [passengerDetails, setPassengerDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  if (!identity) {
    return (
      <div className="container py-8">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Please login to continue with booking</p>
          <Button onClick={() => navigate({ to: '/search' })}>Back to Search</Button>
        </Card>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="container py-8">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Route not found</p>
          <Button onClick={() => navigate({ to: '/results' })}>Back to Results</Button>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passengerDetails.firstName || !passengerDetails.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const bookingId = `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const booking = {
        id: bookingId,
        user: identity.getPrincipal(),
        route,
        bookingTime: BigInt(Date.now() * 1000000),
        status: { confirmed: null } as any,
        costInStripeCents: route.priceCents,
      };

      await createBooking.mutateAsync(booking);

      const shoppingItems = [
        {
          productName: route.routeName,
          productDescription: `${route.operatorName} - ${route.transportType}`,
          priceInCents: route.priceCents,
          quantity: BigInt(1),
          currency: 'USD',
        },
      ];

      const session = await createCheckoutSession.mutateAsync(shoppingItems);
      if (!session?.url) throw new Error('Stripe session missing url');
      window.location.href = session.url;
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to create booking');
    }
  };

  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: `/select/${routeId}` })}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Complete Your Booking</h1>
          <p className="text-muted-foreground">{route.routeName} - {route.operatorName}</p>
        </div>
      </div>

      {!isStripeConfigured && <PaymentSetup />}

      <div className="max-w-2xl mx-auto">
        <PassengerDetailsForm
          details={passengerDetails}
          setDetails={setPassengerDetails}
          onSubmit={handleSubmit}
          isLoading={createBooking.isPending || createCheckoutSession.isPending}
        />
      </div>
    </div>
  );
}
