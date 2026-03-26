import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      forcedTheme="light"
    >
      <DashboardPage />
      <Toaster />
    </ThemeProvider>
  );
}
