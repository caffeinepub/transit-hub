import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetAllRoutes, useGetReviewsForRoute, useGetUserBookings } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Train, Bus, Car, Star, Clock, MapPin, Navigation } from 'lucide-react';
import ReviewsList from '../components/ReviewsList';
import ReviewForm from '../components/ReviewForm';

export default function RouteDetailPage() {
  const { routeId } = useParams({ strict: false });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: routes = [] } = useGetAllRoutes();
  const { data: reviews = [] } = useGetReviewsForRoute(routeId);
  const { data: userBookings = [] } = useGetUserBookings(identity?.getPrincipal().toString());

  const route = routes.find((r) => r.id === routeId);

  const hasCompletedBooking = userBookings.some(
    (b) => b.route.id === routeId && b.status.hasOwnProperty('completed')
  );

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
    : 0;

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

  const getIcon = () => {
    switch (route.transportType) {
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

  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (minutes: bigint) => {
    const totalMinutes = Number(minutes);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const formatPrice = (cents: bigint) => {
    return `₹${(Number(cents) / 100).toFixed(2)}`;
  };

  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/results' })}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Route Details</h1>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getIcon()}
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    {route.origin} → {route.destination}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{route.operatorName}</p>
                </div>
              </div>
              <Badge className="capitalize">{route.transportType}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Price per person</p>
                <p className="text-3xl font-bold text-primary">{formatPrice(route.priceCents)}</p>
              </div>
              {averageRating > 0 && (
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{reviews.length} reviews</p>
                </div>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">Fare Breakdown</h3>
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Base Fare</span>
                  <span className="font-medium">{formatPrice(route.rateBreakdown.baseFare)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxes</span>
                  <span className="font-medium">{formatPrice(route.rateBreakdown.taxes)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service Fees</span>
                  <span className="font-medium">{formatPrice(route.rateBreakdown.serviceFees)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary text-lg">{formatPrice(route.priceCents)}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Number(route.distanceKm) > 0 && (
                <div className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Distance</p>
                    <p className="font-semibold">{Number(route.distanceKm)} km</p>
                  </div>
                </div>
              )}
              {Number(route.durationMinutes) > 0 && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-semibold">{formatDuration(route.durationMinutes)}</p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Available Schedules
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {route.schedule.slice(0, 8).map((time, index) => (
                  <Badge key={index} variant="outline" className="justify-center py-2">
                    {formatTime(time)}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <Button
              className="w-full"
              size="lg"
              onClick={() => navigate({ to: '/select/$routeId', params: { routeId: route.id } })}
            >
              Book This Route
            </Button>
          </CardContent>
        </Card>

        {hasCompletedBooking && identity && (
          <ReviewForm routeId={route.id} />
        )}

        <ReviewsList reviews={reviews} />
      </div>
    </div>
  );
}
