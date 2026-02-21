import { Outlet, useNavigate } from '@tanstack/react-router';
import { Menu, X, Train, Bus, Car, History, Heart, Settings } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import LoginButton from './LoginButton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';

export default function Layout() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();

  const isAuthenticated = !!identity;

  const navItems = [
    { label: 'Search', path: '/search', icon: Train },
    { label: 'Compare', path: '/compare', icon: Bus },
    ...(isAuthenticated ? [{ label: 'My Bookings', path: '/bookings', icon: History }] : []),
    ...(isAdmin ? [{ label: 'Admin Cities', path: '/admin/cities', icon: Settings }] : []),
  ];

  const handleNavigation = (path: string) => {
    navigate({ to: path });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => handleNavigation('/')}
              className="flex items-center gap-2 font-bold text-xl text-primary hover:text-primary/80 transition-colors"
            >
              <div className="flex items-center gap-1">
                <Train className="h-6 w-6" />
                <Bus className="h-5 w-5" />
                <Car className="h-5 w-5" />
              </div>
              <span>Transit Hub</span>
            </button>

            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <LoginButton />
            </div>

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <nav className="flex flex-col gap-4 mt-8">
                  {navItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className="flex items-center gap-3 text-lg font-medium text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-accent"
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </button>
                  ))}
                  <div className="mt-4 pt-4 border-t">
                    <LoginButton />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border/40 bg-muted/30 mt-auto">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} Transit Hub. Built with</span>
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
              <span>using</span>
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:text-primary transition-colors"
              >
                caffeine.ai
              </a>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <button onClick={() => handleNavigation('/search')} className="hover:text-foreground transition-colors">
                Search
              </button>
              <button onClick={() => handleNavigation('/compare')} className="hover:text-foreground transition-colors">
                Compare
              </button>
              {isAuthenticated && (
                <button onClick={() => handleNavigation('/bookings')} className="hover:text-foreground transition-colors">
                  My Bookings
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
