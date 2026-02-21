import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // Backend doesn't have getCallerUserProfile yet, return null for now
      // This will trigger profile setup modal
      return null;
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}
