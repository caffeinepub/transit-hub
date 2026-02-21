import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import Layout from './components/Layout';
import SearchPage from './pages/SearchPage';
import ResultsPage from './pages/ResultsPage';
import SelectionPage from './pages/SelectionPage';
import BookingPage from './pages/BookingPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import BookingHistoryPage from './pages/BookingHistoryPage';
import BookingDetailPage from './pages/BookingDetailPage';
import ComparePage from './pages/ComparePage';
import RouteDetailPage from './pages/RouteDetailPage';
import AdminCitiesPage from './pages/AdminCitiesPage';
import { Toaster } from '@/components/ui/sonner';

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: SearchPage,
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search',
  component: SearchPage,
});

const resultsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/results',
  component: ResultsPage,
});

const selectionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/select/$routeId',
  component: SelectionPage,
});

const bookingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/booking/$routeId',
  component: BookingPage,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-success',
  component: PaymentSuccessPage,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-failure',
  component: PaymentFailurePage,
});

const bookingHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bookings',
  component: BookingHistoryPage,
});

const bookingDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bookings/$bookingId',
  component: BookingDetailPage,
});

const compareRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/compare',
  component: ComparePage,
});

const routeDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/routes/$routeId',
  component: RouteDetailPage,
});

const adminCitiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/cities',
  component: AdminCitiesPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  searchRoute,
  resultsRoute,
  selectionRoute,
  bookingRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
  bookingHistoryRoute,
  bookingDetailRoute,
  compareRoute,
  routeDetailRoute,
  adminCitiesRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
