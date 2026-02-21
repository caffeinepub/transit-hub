import { useState, useMemo } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { useGetAllRoutes } from '../hooks/useQueries';
import RouteResultCard from '../components/RouteResultCard';
import ResultsFilters from '../components/ResultsFilters';
import ResultsSorting from '../components/ResultsSorting';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { CompareProvider } from '../hooks/useCompareRoutes';

export default function ResultsPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as any;
  const { data: allRoutes = [], isLoading } = useGetAllRoutes();

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('price-asc');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filteredAndSortedRoutes = useMemo(() => {
    let filtered = allRoutes;

    // Filter by origin and destination if provided in search
    if (search?.origin && search?.destination) {
      filtered = filtered.filter((r) => {
        const originMatch = r.origin.toLowerCase().includes(search.origin.toLowerCase());
        const destMatch = r.destination.toLowerCase().includes(search.destination.toLowerCase());
        return originMatch && destMatch;
      });
    }

    // Filter by transport mode from search
    if (search?.mode && search.mode !== 'all') {
      filtered = filtered.filter((r) => r.transportType === search.mode);
    }

    // Filter by selected types from filters
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((r) => selectedTypes.includes(r.transportType));
    }

    // Filter by price range
    filtered = filtered.filter((r) => {
      const price = Number(r.priceCents);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort the results
    const sorted = [...filtered];
    if (sortBy === 'price-asc') {
      sorted.sort((a, b) => Number(a.priceCents) - Number(b.priceCents));
    } else if (sortBy === 'price-desc') {
      sorted.sort((a, b) => Number(b.priceCents) - Number(a.priceCents));
    } else if (sortBy === 'departure') {
      sorted.sort((a, b) => {
        const aTime = a.schedule[0] || BigInt(0);
        const bTime = b.schedule[0] || BigInt(0);
        return Number(aTime - bTime);
      });
    } else if (sortBy === 'duration') {
      sorted.sort((a, b) => Number(a.durationMinutes) - Number(b.durationMinutes));
    }

    return sorted;
  }, [allRoutes, search?.origin, search?.destination, search?.mode, selectedTypes, priceRange, minRating, sortBy]);

  const filtersComponent = (
    <ResultsFilters
      priceRange={priceRange}
      setPriceRange={setPriceRange}
      selectedTypes={selectedTypes}
      setSelectedTypes={setSelectedTypes}
      minRating={minRating}
      setMinRating={setMinRating}
    />
  );

  return (
    <CompareProvider>
      <div className="container py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/search' })}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Search Results</h1>
            {search?.origin && search?.destination && (
              <p className="text-muted-foreground mt-1">
                {search.origin} → {search.destination}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-20">{filtersComponent}</div>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {filteredAndSortedRoutes.length} {filteredAndSortedRoutes.length === 1 ? 'result' : 'results'} found
              </p>
              <div className="flex items-center gap-2">
                <ResultsSorting sortBy={sortBy} setSortBy={setSortBy} />
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild className="lg:hidden">
                    <Button variant="outline" size="icon">
                      <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px]">
                    {filtersComponent}
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading routes...</p>
              </div>
            ) : filteredAndSortedRoutes.length === 0 ? (
              <div className="text-center py-12">
                <img
                  src="/assets/generated/empty-results.dim_400x300.png"
                  alt="No results"
                  className="mx-auto mb-6 max-w-xs"
                />
                <h3 className="text-xl font-semibold mb-2">No routes found</h3>
                <p className="text-muted-foreground mb-6">Try adjusting your filters or search criteria</p>
                <Button onClick={() => navigate({ to: '/search' })}>New Search</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedRoutes.map((route) => (
                  <RouteResultCard key={route.id} route={route} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </CompareProvider>
  );
}
