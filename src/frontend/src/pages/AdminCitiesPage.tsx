import { useState } from 'react';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import AdminRouteForm from '../components/AdminRouteForm';
import AdminRoutesTable from '../components/AdminRoutesTable';
import type { Route } from '../backend';

export default function AdminCitiesPage() {
  const { data: isAdmin, isLoading } = useIsCallerAdmin();
  const [editRoute, setEditRoute] = useState<Route | null>(null);

  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to access this page. Only administrators can manage city routes and rates.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Manage City Routes & Rates</h1>
        <p className="text-muted-foreground">
          Add, edit, or delete transportation routes between cities with detailed rate breakdowns.
        </p>
      </div>

      <div className="space-y-8">
        <AdminRouteForm editRoute={editRoute} onCancelEdit={() => setEditRoute(null)} />
        <AdminRoutesTable onEditRoute={setEditRoute} />
      </div>
    </div>
  );
}
