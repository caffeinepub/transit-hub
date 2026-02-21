import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Edit, Trash2, Loader2, Train, Bus, Car } from 'lucide-react';
import { useGetAllRoutes, useDeleteRoute } from '../hooks/useQueries';
import { toast } from 'sonner';
import { TransportType, type Route } from '../backend';

interface AdminRoutesTableProps {
  onEditRoute: (route: Route) => void;
}

export default function AdminRoutesTable({ onEditRoute }: AdminRoutesTableProps) {
  const { data: routes, isLoading } = useGetAllRoutes();
  const deleteRoute = useDeleteRoute();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<Route | null>(null);

  const handleDeleteClick = (route: Route) => {
    setRouteToDelete(route);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!routeToDelete) return;

    try {
      await deleteRoute.mutateAsync(routeToDelete.id);
      toast.success('Route deleted successfully');
      setDeleteDialogOpen(false);
      setRouteToDelete(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete route');
    }
  };

  const getTransportIcon = (type: TransportType) => {
    switch (type) {
      case TransportType.train:
        return <Train className="h-4 w-4" />;
      case TransportType.bus:
        return <Bus className="h-4 w-4" />;
      case TransportType.taxi:
        return <Car className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const formatPrice = (cents: bigint) => {
    return `₹${(Number(cents) / 100).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Existing Routes</CardTitle>
          <CardDescription>Manage all transportation routes and their pricing</CardDescription>
        </CardHeader>
        <CardContent>
          {!routes || routes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No routes found. Add your first route using the form above.</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Operator</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Base Fare</TableHead>
                    <TableHead>Taxes</TableHead>
                    <TableHead>Fees</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routes.map((route) => (
                    <TableRow key={route.id}>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          {getTransportIcon(route.transportType)}
                          <span className="capitalize">{route.transportType}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{route.origin}</TableCell>
                      <TableCell className="font-medium">{route.destination}</TableCell>
                      <TableCell>{route.operatorName}</TableCell>
                      <TableCell>{Number(route.distanceKm)} km</TableCell>
                      <TableCell>{Number(route.durationMinutes)} min</TableCell>
                      <TableCell>{formatPrice(route.rateBreakdown.baseFare)}</TableCell>
                      <TableCell>{formatPrice(route.rateBreakdown.taxes)}</TableCell>
                      <TableCell>{formatPrice(route.rateBreakdown.serviceFees)}</TableCell>
                      <TableCell className="font-semibold">{formatPrice(route.priceCents)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditRoute(route)}
                            title="Edit route"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(route)}
                            title="Delete route"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the route from {routeToDelete?.origin} to {routeToDelete?.destination}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={deleteRoute.isPending}>
              {deleteRoute.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
