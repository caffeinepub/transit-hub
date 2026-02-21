import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from '@tanstack/react-router';
import { Train, Bus, Car, Clock, Star, Info, MapPin, Navigation, Receipt } from 'lucide-react';
import type { Route } from '../backend';
import { useGetReviewsForRoute } from '../hooks/useQueries';
import { useCompareRoutes } from '../hooks/useCompareRoutes';

interface RouteResultCardProps {
  route: Route;
}

export default function RouteResultCard({ route }: RouteResultCardProps) {
  const navigate = useNavigate();
  const { data: reviews = [] } = useGetReviewsForRoute(route.id);
  const { selectedRoutes, addRoute, removeRoute, canAddMore } = useCompareRoutes();

  const isSelected = selectedRoutes.some((r) => r.id === route.id);

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
    : 0;

  const getIcon = () => {
    switch (route.transportType) {
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

  const getTypeColor = () => {
    switch (route.transportType) {
      case 'train':
        return 'bg-chart-1 text-white';
      case 'bus':
        return 'bg-chart-2 text-white';
      case 'taxi':
        return 'bg-chart-3 text-white';
      default:
        return 'bg-primary text-primary-foreground';
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
    return `₹${(Number(cents) / 100).toFixed(0)}`;
  };

  const handleCompareToggle = () => {
    if (isSelected) {
      removeRoute(route.id);
    } else if (canAddMore) {
      addRoute(route);
    }
  };

  const fareBreakdownContent = (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Base Fare:</span>
        <span className="font-medium">{formatPrice(route.rateBreakdown.baseFare)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Taxes:</span>
        <span className="font-medium">{formatPrice(route.rateBreakdown.taxes)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Service Fees:</span>
        <span className="font-medium">{formatPrice(route.rateBreakdown.serviceFees)}</span>
      </div>
      <div className="border-t pt-2 flex justify-between font-semibold">
        <span>Total:</span>
        <span className="text-primary">{formatPrice(route.priceCents)}</span>
      </div>
    </div>
  );

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleCompareToggle}
              disabled={!isSelected && !canAddMore}
              aria-label="Add to comparison"
            />
            <Badge className={getTypeColor()}>
              <span className="flex items-center gap-1">
                {getIcon()}
                {route.transportType}
              </span>
            </Badge>
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-lg">
                    {route.origin} → {route.destination}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{route.operatorName}</p>
              </div>
              <div className="text-right">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <div className="flex items-center gap-1 justify-end">
                          <p className="text-2xl font-bold text-primary">
                            {formatPrice(route.priceCents)}
                          </p>
                          <Receipt className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground">per person</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="w-64">
                      {fareBreakdownContent}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {route.schedule.length > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Departs: {formatTime(route.schedule[0])}</span>
                </div>
              )}
              {Number(route.durationMinutes) > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Duration: {formatDuration(route.durationMinutes)}</span>
                </div>
              )}
              {Number(route.distanceKm) > 0 && (
                <div className="flex items-center gap-1">
                  <Navigation className="h-4 w-4" />
                  <span>{Number(route.distanceKm)} km</span>
                </div>
              )}
              {averageRating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{averageRating.toFixed(1)} ({reviews.length} reviews)</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: '/routes/$routeId', params: { routeId: route.id } })}
            >
              <Info className="h-4 w-4 mr-1" />
              Details
            </Button>
            <Button
              size="sm"
              onClick={() => navigate({ to: '/select/$routeId', params: { routeId: route.id } })}
            >
              Book Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
