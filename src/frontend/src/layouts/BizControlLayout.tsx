import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftRight,
  BarChart3,
  Bell,
  ChevronRight,
  Crown,
  FileText,
  LayoutDashboard,
  Menu,
  QrCode,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { useState } from "react";
import type { BizSection } from "../types/bizcontrol";

interface NavItem {
  id: BizSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "transactions", label: "Transactions", icon: ArrowLeftRight },
  { id: "invoices", label: "Invoices", icon: FileText },
  { id: "qrscanner", label: "QR Scanner", icon: QrCode },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "pricing", label: "Upgrade", icon: Sparkles },
];

interface BizControlLayoutProps {
  activeSection: BizSection;
  onSectionChange: (section: BizSection) => void;
  alertCount?: number;
  planType?: "free" | "premium";
  businessName?: string;
  onUpgrade?: () => void;
  children: React.ReactNode;
}

export function BizControlLayout({
  activeSection,
  onSectionChange,
  alertCount = 0,
  planType = "free",
  businessName = "My Business",
  onUpgrade,
  children,
}: BizControlLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = NAV_ITEMS.map((item) =>
    item.id === "alerts"
      ? { ...item, badge: alertCount > 0 ? alertCount : undefined }
      : item,
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
          role="presentation"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 flex flex-col
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{ backgroundColor: "#0F172A" }}
        data-ocid="biz-sidebar"
      >
        {/* Logo / Brand */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="text-white text-lg font-semibold tracking-tight font-display">
              BizControl
            </span>
          </div>
          <button
            type="button"
            className="lg:hidden text-white/60 hover:text-white transition-colors touch-target flex items-center justify-center"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Business name */}
        <div className="px-5 py-3 border-b border-white/10">
          <p className="text-white/40 text-xs uppercase tracking-wider font-medium mb-0.5">
            Workspace
          </p>
          <p className="text-white/80 text-sm font-medium truncate">
            {businessName}
          </p>
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 px-3 py-4 overflow-y-auto"
          aria-label="BizControl navigation"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            const isPricing = item.id === "pricing";
            return (
              <div key={item.id}>
                {isPricing && <div className="border-t border-white/10 my-2" />}
                <button
                  type="button"
                  onClick={() => {
                    onSectionChange(item.id);
                    setSidebarOpen(false);
                  }}
                  data-ocid={`nav-${item.id}`}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1
                    text-sm font-medium transition-all duration-150
                    ${
                      isActive
                        ? "bg-accent text-white shadow-sm"
                        : isPricing
                          ? "text-yellow-400/80 hover:text-yellow-400 hover:bg-white/8"
                          : "text-white/60 hover:text-white hover:bg-white/8"
                    }
                  `}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : isPricing ? "text-yellow-400/80" : ""}`}
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge !== undefined && (
                    <Badge className="h-5 min-w-5 text-xs px-1.5 bg-destructive/90 text-destructive-foreground border-0">
                      {item.badge}
                    </Badge>
                  )}
                  {isActive && (
                    <ChevronRight className="w-3 h-3 text-white/60" />
                  )}
                </button>
              </div>
            );
          })}
        </nav>

        {/* User / Plan section */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Crown
              className={`w-4 h-4 flex-shrink-0 ${planType === "premium" ? "text-yellow-400" : "text-white/40"}`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-xs font-medium">
                {planType === "premium" ? "Premium Plan" : "Free Plan"}
              </p>
              {planType === "free" && (
                <p className="text-white/40 text-xs">Limited features</p>
              )}
            </div>
          </div>
          {planType === "free" && onUpgrade && (
            <Button
              onClick={onUpgrade}
              size="sm"
              className="w-full text-xs font-semibold bg-accent hover:bg-accent/90 text-accent-foreground border-0"
              data-ocid="upgrade-btn"
            >
              Upgrade to Premium
            </Button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-card border-b border-border shadow-sm">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="touch-target flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors"
            aria-label="Open sidebar"
            data-ocid="mobile-menu-btn"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span className="font-semibold font-display text-foreground">
              BizControl
            </span>
          </div>
          {alertCount > 0 && (
            <Badge className="ml-auto bg-destructive text-destructive-foreground border-0 text-xs">
              {alertCount}
            </Badge>
          )}
        </header>

        {/* Content area */}
        <main
          className="flex-1 overflow-y-auto bg-background"
          data-ocid="biz-main-content"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
