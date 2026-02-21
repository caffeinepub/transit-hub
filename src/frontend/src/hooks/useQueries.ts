import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Route, Booking, Review, TransportType, ShoppingItem } from '../backend';
import { UserProfile } from './useGetCallerUserProfile';

export function useGetAllRoutes() {
  const { actor, isFetching } = useActor();

  return useQuery<Route[]>({
    queryKey: ['routes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRoutes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRoutesForType(transportType: TransportType | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Route[]>({
    queryKey: ['routes', transportType],
    queryFn: async () => {
      if (!actor) return [];
      if (!transportType) return actor.getAllRoutes();
      return actor.getAllRoutesForType(transportType);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchRoutesByTimeRange(fromTime: bigint | null, toTime: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Route[]>({
    queryKey: ['routes', 'timeRange', fromTime?.toString(), toTime?.toString()],
    queryFn: async () => {
      if (!actor || !fromTime || !toTime) return [];
      return actor.searchRoutesByTimeRange(fromTime, toTime);
    },
    enabled: !!actor && !isFetching && !!fromTime && !!toTime,
  });
}

export function useGetUserBookings(userPrincipal: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Booking[]>({
    queryKey: ['bookings', userPrincipal],
    queryFn: async () => {
      if (!actor || !userPrincipal) return [];
      const { Principal } = await import('@dfinity/principal');
      return actor.getUserBookings(Principal.fromText(userPrincipal));
    },
    enabled: !!actor && !isFetching && !!userPrincipal,
  });
}

export function useGetBooking(bookingId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Booking | null>({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      if (!actor || !bookingId) return null;
      return actor.getBooking(bookingId);
    },
    enabled: !!actor && !isFetching && !!bookingId,
  });
}

export function useCreateBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (booking: Booking) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createBooking(booking);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useUpdateBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (booking: Booking) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBooking(booking);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking'] });
    },
  });
}

export function useGetReviewsForRoute(routeId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Review[]>({
    queryKey: ['reviews', routeId],
    queryFn: async () => {
      if (!actor || !routeId) return [];
      return actor.getReviewsForRoute(routeId);
    },
    enabled: !!actor && !isFetching && !!routeId,
  });
}

export function useAddReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, rating, reviewText }: { bookingId: string; rating: number; reviewText: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addReview(bookingId, BigInt(rating), reviewText);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      // Backend doesn't have saveCallerUserProfile yet
      // Store in local state for now
      console.log('Profile would be saved:', profile);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['stripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: { secretKey: string; allowedCountries: string[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripeConfigured'] });
    },
  });
}

export type CheckoutSession = {
  id: string;
  url: string;
};

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (items: ShoppingItem[]): Promise<CheckoutSession> => {
      if (!actor) throw new Error('Actor not available');
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      const session = JSON.parse(result) as CheckoutSession;
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      return session;
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}
