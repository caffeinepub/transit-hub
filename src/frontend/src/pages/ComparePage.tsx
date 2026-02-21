import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Train, Bus, Car, X } from 'lucide-react';
import { useCompareRoutes } from '../hooks/useCompareRoutes';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ComparePage() {
  const navigate = useNavigate();
  const { selectedRoutes, removeRoute, clearRoutes } = useCompareRoutes();

  const getIcon = (type: string) => {
    switch (type) {
      case 'train':
        return <Train className="h-4 w-4" />;
      case 'bus':
        return <Bus className="h-4 w-4" />;
      case 'taxi':
        return <Car className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (selectedRoutes.length < 2) {
    return (
      <div className="container py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/results' })}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Compare Routes</h1>
        </div>
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground mb-4">Select at least 2 routes to compare</p>
            <Button onClick={() => navigate({ to: '/results' })}>Go to Search Results</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/results' })}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Compare Routes</h1>
        </div>
        <Button variant="outline" onClick={clearRoutes}>
          Clear All
        </Button>
      </div>

      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Feature</TableHead>
                  {selectedRoutes.map((route) => (
                    <TableHead key={route.id} className="text-center">
                      <div className="flex items-center justify-between">
                        <span className="flex-1">{route.routeName}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeRoute(route.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Type</TableCell>
                  {selectedRoutes.map((route) => (
                    <TableCell key={route.id} className="text-center">
                      <Badge className="capitalize">
                        <span className="flex items-center gap-1">
                          {getIcon(route.transportType)}
                          {route.transportType}
                        </span>
                      </Badge>
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Operator</TableCell>
                  {selectedRoutes.map((route) => (
                    <TableCell key={route.id} className="text-center">
                      {route.operatorName}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Price</TableCell>
                  {selectedRoutes.map((route) => (
                    <TableCell key={route.id} className="text-center">
                      <span className="text-lg font-bold text-primary">
                        ${(Number(route.priceCents) / 100).toFixed(2)}
                      </span>
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Departure</TableCell>
                  {selectedRoutes.map((route) => (
                    <TableCell key={route.id} className="text-center">
                      {route.schedule.length > 0 ? formatTime(route.schedule[0]) : 'N/A'}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Action</TableCell>
                  {selectedRoutes.map((route) => (
                    <TableCell key={route.id} className="text-center">
                      <Button
                        size="sm"
                        onClick={() => navigate({ to: '/select/$routeId', params: { routeId: route.id } })}
                      >
                        Book Now
                      </Button>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="md:hidden space-y-4">
        {selectedRoutes.map((route) => (
          <Card key={route.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{route.routeName}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => removeRoute(route.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <Badge className="capitalize">
                  <span className="flex items-center gap-1">
                    {getIcon(route.transportType)}
                    {route.transportType}
                  </span>
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Operator:</span>
                <span>{route.operatorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price:</span>
                <span className="text-lg font-bold text-primary">
                  ${(Number(route.priceCents) / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Departure:</span>
                <span>{route.schedule.length > 0 ? formatTime(route.schedule[0]) : 'N/A'}</span>
              </div>
              <Button
                className="w-full"
                onClick={() => navigate({ to: '/select/$routeId', params: { routeId: route.id } })}
              >
                Book Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
