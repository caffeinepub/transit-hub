import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import InvitationPage from "./pages/InvitationPage";

export default function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      forcedTheme="light"
    >
      <InvitationPage />
      <Toaster />
    </ThemeProvider>
  );
}
