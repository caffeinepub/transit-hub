import { Toaster } from "@/components/ui/sonner";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import BizControlPage from "./pages/BizControlPage";
import DashboardPage from "./pages/DashboardPage";
import InvitationPage from "./pages/InvitationPage";

const rootRoute = createRootRoute();

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});

const invitationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/invitation",
  component: InvitationPage,
});

const bizControlRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/bizcontrol",
  component: BizControlPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  invitationRoute,
  bizControlRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      forcedTheme="light"
    >
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
