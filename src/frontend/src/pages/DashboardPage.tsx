import {
  BarChart3,
  Bed,
  Bus,
  ChevronRight,
  Download,
  FileText,
  IndianRupee,
  MapPin,
  Plane,
  Receipt,
  TicketCheck,
  Train,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import * as XLSX from "xlsx";
import {
  busData,
  dashboardData,
  flightData,
  formatINR,
  formatMonthLabel,
  hotelData,
} from "../data/dashboardData";

function exportDashboardToExcel() {
  const wb = XLSX.utils.book_new();

  // Train sheet
  const trainMonthly = dashboardData.monthlyTrend.map((r) => ({
    Month: r.month,
    Bookings: r.bookings,
    Revenue_INR: r.revenue,
  }));
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(trainMonthly),
    "Train Monthly",
  );

  const trainClients = dashboardData.topClients.map((r) => ({
    Client: r.name,
    Bookings: r.bookings,
    Revenue_INR: r.revenue,
  }));
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(trainClients),
    "Train Clients",
  );

  const trainRoutes = dashboardData.topRoutes.map((r) => ({
    Route: r.route,
    Count: r.count,
  }));
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(trainRoutes),
    "Train Routes",
  );

  // Flight sheet
  const flightMonthly = flightData.monthlyTrend.map((r) => ({
    Month: r.month,
    Bookings: r.bookings,
    Revenue_INR: r.revenue,
  }));
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(flightMonthly),
    "Flight Monthly",
  );

  const flightAirlines = flightData.topAirlines.map((r) => ({
    Airline: r.name,
    Bookings: r.bookings,
  }));
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(flightAirlines),
    "Flight Airlines",
  );

  const flightRoutes = flightData.topRoutes.map((r) => ({
    Route: r.route,
    Count: r.count,
  }));
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(flightRoutes),
    "Flight Routes",
  );

  // Bus sheet
  const busMonthly = busData.monthlyTrend.map((r) => ({
    Month: r.month,
    Bookings: r.bookings,
    Revenue_INR: r.revenue,
  }));
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(busMonthly),
    "Bus Monthly",
  );

  const busOperators = busData.topOperators.map((r) => ({
    Operator: r.name,
    Bookings: r.bookings,
  }));
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(busOperators),
    "Bus Operators",
  );

  const busRoutes = busData.topRoutes.map((r) => ({
    Route: r.route,
    Count: r.count,
  }));
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(busRoutes),
    "Bus Routes",
  );

  // Hotel sheet
  const hotelMonthly = hotelData.monthlyTrend.map((r) => ({
    Month: r.month,
    Bookings: r.bookings,
    Revenue_INR: r.revenue,
  }));
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(hotelMonthly),
    "Hotel Monthly",
  );

  const hotelHotels = hotelData.topHotels.map((r) => ({
    Hotel: r.route,
    Bookings: r.count,
  }));
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(hotelHotels),
    "Top Hotels",
  );

  XLSX.writeFile(wb, "dashboard-report.xlsx");
}

const CHART_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#8b5cf6",
  "#06b6d4",
  "#3b82f6",
  "#84cc16",
];

type ServiceType = "train" | "flight" | "bus" | "hotel";
type NavItem = "overview" | "clients" | "routes" | "finance";

const SERVICE_CONFIG = {
  train: {
    label: "Train",
    icon: Train,
    accent: "#6366f1",
    accentLight: "#e0e7ff",
    accentText: "text-indigo-600",
    accentBg: "bg-indigo-500",
    accentBorder: "border-indigo-500",
    accentTab: "bg-indigo-600 text-white",
    trendFill: "#e0e7ff",
    trendStroke: "#6366f1",
  },
  flight: {
    label: "Flight",
    icon: Plane,
    accent: "#0ea5e9",
    accentLight: "#e0f2fe",
    accentText: "text-sky-600",
    accentBg: "bg-sky-500",
    accentBorder: "border-sky-500",
    accentTab: "bg-sky-600 text-white",
    trendFill: "#e0f2fe",
    trendStroke: "#0ea5e9",
  },
  bus: {
    label: "Bus",
    icon: Bus,
    accent: "#10b981",
    accentLight: "#d1fae5",
    accentText: "text-emerald-600",
    accentBg: "bg-emerald-500",
    accentBorder: "border-emerald-500",
    accentTab: "bg-emerald-600 text-white",
    trendFill: "#d1fae5",
    trendStroke: "#10b981",
  },
  hotel: {
    label: "Hotel",
    icon: Bed,
    accent: "#f59e0b",
    accentLight: "#fef3c7",
    accentText: "text-amber-600",
    accentBg: "bg-amber-500",
    accentBorder: "border-amber-500",
    accentTab: "bg-amber-600 text-white",
    trendFill: "#fef3c7",
    trendStroke: "#f59e0b",
  },
};

export default function DashboardPage() {
  const [activeService, setActiveService] = useState<ServiceType>("train");
  const [activeNav, setActiveNav] = useState<NavItem>("overview");

  const svc = SERVICE_CONFIG[activeService];
  const ServiceIcon = svc.icon;

  const navItems: { id: NavItem; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <BarChart3 size={18} /> },
    { id: "clients", label: "Clients", icon: <Users size={18} /> },
    { id: "routes", label: "Routes", icon: <MapPin size={18} /> },
    { id: "finance", label: "Finance", icon: <IndianRupee size={18} /> },
  ];

  // Per-service sidebar footer stats
  const sidebarStats: Record<ServiceType, { label: string; value: string }[]> =
    {
      train: [
        { label: "Period", value: "Apr '25 – Mar '26" },
        { label: "Clients", value: "10" },
        { label: "Routes", value: "12" },
        { label: "Coach Types", value: "8" },
      ],
      flight: [
        { label: "Period", value: "Apr '25 – Mar '26" },
        { label: "Airlines", value: "6" },
        { label: "Routes", value: "8" },
        { label: "Cabin Classes", value: "3" },
      ],
      bus: [
        { label: "Period", value: "Apr '25 – Mar '26" },
        { label: "Operators", value: "7" },
        { label: "Routes", value: "8" },
        { label: "Seat Types", value: "4" },
      ],
      hotel: [
        { label: "Period", value: "Apr '25 – Mar '26" },
        { label: "Cities", value: "8" },
        { label: "Hotel Brands", value: "8" },
        { label: "Room Types", value: "4" },
      ],
    };

  // Header info per service
  const headerInfo: Record<
    ServiceType,
    { title: string; subtitle: string; badge: string }
  > = {
    train: {
      title: "Train Booking Analytics",
      subtitle: "April 2025 – March 2026 · 15,541 Bookings",
      badge: "Apr 2025 – Mar 2026",
    },
    flight: {
      title: "Flight Booking Analytics",
      subtitle: "April 2025 – March 2026 · 8,420 Bookings",
      badge: "Apr 2025 – Mar 2026",
    },
    bus: {
      title: "Bus Booking Analytics",
      subtitle: "April 2025 – March 2026 · 12,380 Bookings",
      badge: "Apr 2025 – Mar 2026",
    },
    hotel: {
      title: "Hotel Booking Analytics",
      subtitle: "April 2025 – March 2026 · 5,840 Bookings",
      badge: "Apr 2025 – Mar 2026",
    },
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-900 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: svc.accent }}
            >
              <ServiceIcon size={17} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">
                TravelBook
              </p>
              <p className="text-slate-400 text-xs">Analytics Dashboard</p>
            </div>
          </div>
        </div>

        {/* Service Tabs */}
        <div className="px-3 pt-4 pb-3 border-b border-slate-700">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2 px-1">
            Service
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {(Object.keys(SERVICE_CONFIG) as ServiceType[]).map((svcKey) => {
              const cfg = SERVICE_CONFIG[svcKey];
              const Icon = cfg.icon;
              const isActive = activeService === svcKey;
              return (
                <button
                  key={svcKey}
                  type="button"
                  data-ocid={`service.${svcKey}.tab`}
                  onClick={() => {
                    setActiveService(svcKey);
                    setActiveNav("overview");
                  }}
                  className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? cfg.accentTab
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon size={16} />
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.id}
              data-ocid={`nav.${item.id}.link`}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeNav === item.id
                  ? "text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
              style={
                activeNav === item.id
                  ? { backgroundColor: svc.accent }
                  : undefined
              }
            >
              {item.icon}
              {item.label}
              {activeNav === item.id && (
                <ChevronRight size={14} className="ml-auto" />
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="px-4 py-5 border-t border-slate-700">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-3">
            Data Summary
          </p>
          <div className="space-y-2">
            {sidebarStats[activeService].map((item) => (
              <div key={item.label} className="flex justify-between">
                <span className="text-slate-400 text-xs">{item.label}</span>
                <span className="text-slate-200 text-xs font-medium">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {headerInfo[activeService].title}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {headerInfo[activeService].subtitle}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-semibold px-3 py-1.5 rounded-full border"
              style={{
                backgroundColor: svc.accentLight,
                color: svc.accent,
                borderColor: `${svc.accent}40`,
              }}
            >
              {headerInfo[activeService].badge}
            </span>
            <button
              type="button"
              data-ocid="dashboard.export_button"
              onClick={exportDashboardToExcel}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow transition-all hover:opacity-90 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              }}
            >
              <Download className="w-4 h-4" />
              Export to Excel
            </button>
          </div>
        </header>

        <div className="px-8 py-6 space-y-6">
          {activeNav === "overview" && (
            <OverviewSection activeService={activeService} svc={svc} />
          )}
          {activeNav === "clients" && (
            <ClientsSection activeService={activeService} />
          )}
          {activeNav === "routes" && (
            <RoutesSection activeService={activeService} svc={svc} />
          )}
          {activeNav === "finance" && (
            <FinanceSection activeService={activeService} />
          )}

          <footer className="text-center py-4 text-xs text-slate-400">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: svc.accent }}
            >
              caffeine.ai
            </a>
          </footer>
        </div>
      </main>
    </div>
  );
}

// ── Overview Section ─────────────────────────────────────────────────────────

function OverviewSection({
  activeService,
  svc,
}: {
  activeService: ServiceType;
  svc: (typeof SERVICE_CONFIG)[ServiceType];
}) {
  // ── KPI Cards ────────────────────────────────────────────────────────────
  const kpiCards: Record<
    ServiceType,
    {
      label: string;
      value: string;
      sub: string;
      accent: string;
      iconBg: string;
      icon: React.ReactNode;
    }[]
  > = {
    train: [
      {
        label: "Total Bookings",
        value: "15,541",
        sub: "FY 2025-26",
        accent: "border-indigo-500",
        iconBg: "bg-indigo-50 text-indigo-600",
        icon: <TicketCheck size={20} />,
      },
      {
        label: "Total Revenue",
        value: formatINR(24218319),
        sub: "+8.2% YoY",
        accent: "border-emerald-500",
        iconBg: "bg-emerald-50 text-emerald-600",
        icon: <IndianRupee size={20} />,
      },
      {
        label: "Total Profit",
        value: formatINR(dashboardData.kpis.totalProfit),
        sub: `${dashboardData.kpis.profitMargin}% margin`,
        accent: "border-amber-500",
        iconBg: "bg-amber-50 text-amber-600",
        icon: <TrendingUp size={20} />,
      },
      {
        label: "Cancellation Rate",
        value: "3.6%",
        sub: "558 cancelled",
        accent: "border-rose-500",
        iconBg: "bg-rose-50 text-rose-600",
        icon: <XCircle size={20} />,
      },
      {
        label: "Avg Ticket Price",
        value: "₹1,558",
        sub: "Per booking",
        accent: "border-violet-500",
        iconBg: "bg-violet-50 text-violet-600",
        icon: <Receipt size={20} />,
      },
    ],
    flight: [
      {
        label: "Total Bookings",
        value: "8,420",
        sub: "FY 2025-26",
        accent: "border-sky-500",
        iconBg: "bg-sky-50 text-sky-600",
        icon: <TicketCheck size={20} />,
      },
      {
        label: "Total Revenue",
        value: formatINR(187650000),
        sub: "Gross revenue",
        accent: "border-emerald-500",
        iconBg: "bg-emerald-50 text-emerald-600",
        icon: <IndianRupee size={20} />,
      },
      {
        label: "Total Profit",
        value: formatINR(flightData.kpis.totalProfit),
        sub: `${flightData.kpis.profitMargin}% margin`,
        accent: "border-amber-500",
        iconBg: "bg-amber-50 text-amber-600",
        icon: <TrendingUp size={20} />,
      },
      {
        label: "Cancellation Rate",
        value: "4.2%",
        sub: "354 cancelled",
        accent: "border-rose-500",
        iconBg: "bg-rose-50 text-rose-600",
        icon: <XCircle size={20} />,
      },
      {
        label: "Avg Fare",
        value: "₹22,286",
        sub: "Per ticket",
        accent: "border-violet-500",
        iconBg: "bg-violet-50 text-violet-600",
        icon: <Receipt size={20} />,
      },
    ],
    bus: [
      {
        label: "Total Trips",
        value: "12,380",
        sub: "FY 2025-26",
        accent: "border-emerald-500",
        iconBg: "bg-emerald-50 text-emerald-600",
        icon: <TicketCheck size={20} />,
      },
      {
        label: "Total Revenue",
        value: formatINR(62145000),
        sub: "Gross revenue",
        accent: "border-teal-500",
        iconBg: "bg-teal-50 text-teal-600",
        icon: <IndianRupee size={20} />,
      },
      {
        label: "Total Profit",
        value: formatINR(busData.kpis.totalProfit),
        sub: `${busData.kpis.profitMargin}% margin`,
        accent: "border-amber-500",
        iconBg: "bg-amber-50 text-amber-600",
        icon: <TrendingUp size={20} />,
      },
      {
        label: "Cancellation Rate",
        value: "5.8%",
        sub: "718 cancelled",
        accent: "border-rose-500",
        iconBg: "bg-rose-50 text-rose-600",
        icon: <XCircle size={20} />,
      },
      {
        label: "Avg Fare",
        value: "₹5,020",
        sub: "Per ticket",
        accent: "border-indigo-500",
        iconBg: "bg-indigo-50 text-indigo-600",
        icon: <Receipt size={20} />,
      },
    ],
    hotel: [
      {
        label: "Total Bookings",
        value: "5,840",
        sub: "FY 2025-26",
        accent: "border-amber-500",
        iconBg: "bg-amber-50 text-amber-600",
        icon: <TicketCheck size={20} />,
      },
      {
        label: "Total Revenue",
        value: formatINR(89320000),
        sub: "Gross revenue",
        accent: "border-emerald-500",
        iconBg: "bg-emerald-50 text-emerald-600",
        icon: <IndianRupee size={20} />,
      },
      {
        label: "Total Profit",
        value: formatINR(hotelData.kpis.totalProfit),
        sub: `${hotelData.kpis.profitMargin}% margin`,
        accent: "border-amber-500",
        iconBg: "bg-amber-50 text-amber-600",
        icon: <TrendingUp size={20} />,
      },
      {
        label: "Cancellation Rate",
        value: "6.4%",
        sub: "374 cancelled",
        accent: "border-rose-500",
        iconBg: "bg-rose-50 text-rose-600",
        icon: <XCircle size={20} />,
      },
      {
        label: "Avg Nightly Rate",
        value: "₹15,294",
        sub: "Per night",
        accent: "border-sky-500",
        iconBg: "bg-sky-50 text-sky-600",
        icon: <Receipt size={20} />,
      },
    ],
  };

  // ── Monthly Trend ────────────────────────────────────────────────────────
  const trendSource = {
    train: dashboardData.monthlyTrend,
    flight: flightData.monthlyTrend,
    bus: busData.monthlyTrend,
    hotel: hotelData.monthlyTrend,
  }[activeService];

  const trendData = trendSource.map((d) => ({
    ...d,
    label: formatMonthLabel(d.month),
    revenueLakh: Number.parseFloat((d.revenue / 100000).toFixed(2)),
  }));

  // ── Top Clients/Airlines/Operators/Cities (top 5) ────────────────────────
  const topEntityData: Record<
    ServiceType,
    { name: string; bookings: number }[]
  > = {
    train: dashboardData.topClients
      .slice(0, 5)
      .map((c) => ({ name: c.name, bookings: c.bookings })),
    flight: flightData.topAirlines.slice(0, 5),
    bus: busData.topOperators.slice(0, 5),
    hotel: hotelData.topCities.slice(0, 5),
  };
  const topEntityLabel: Record<ServiceType, string> = {
    train: "Top Clients",
    flight: "Top Airlines",
    bus: "Top Operators",
    hotel: "Top Cities",
  };

  // ── Category Distribution ────────────────────────────────────────────────
  const distributionData: Record<
    ServiceType,
    { name: string; value: number }[]
  > = {
    train: dashboardData.coachTypes,
    flight: flightData.cabinClass,
    bus: busData.seatTypes,
    hotel: hotelData.roomTypes,
  };
  const distributionLabel: Record<ServiceType, string> = {
    train: "Coach Type Breakdown",
    flight: "Cabin Class Breakdown",
    bus: "Seat Type Breakdown",
    hotel: "Room Type Breakdown",
  };

  // ── Top Routes (top 5) ───────────────────────────────────────────────────
  const routeData: Record<ServiceType, { route: string; count: number }[]> = {
    train: dashboardData.topRoutes.slice(0, 5),
    flight: flightData.topRoutes.slice(0, 5),
    bus: busData.topRoutes.slice(0, 5),
    hotel: hotelData.topHotels.slice(0, 5),
  };
  const routeLabel: Record<ServiceType, string> = {
    train: "Top Routes",
    flight: "Top Routes",
    bus: "Top Routes",
    hotel: "Top Hotels",
  };

  // ── Booking Status ───────────────────────────────────────────────────────
  const bookingStatus = {
    train: dashboardData.bookingStatus,
    flight: flightData.bookingStatus,
    bus: busData.bookingStatus,
    hotel: hotelData.bookingStatus,
  }[activeService];

  const billingCards: Record<
    ServiceType,
    {
      label: string;
      value: string;
      color: string;
      bg: string;
      text: string;
      icon: React.ReactNode;
    }[]
  > = {
    train: [
      {
        label: "Unbilled",
        value: "9,931",
        color: "border-amber-500",
        bg: "bg-amber-50",
        text: "text-amber-700",
        icon: <FileText size={20} />,
      },
      {
        label: "Billed",
        value: "5,497",
        color: "border-emerald-500",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        icon: <TicketCheck size={20} />,
      },
      {
        label: "Pending Verification",
        value: "113",
        color: "border-violet-500",
        bg: "bg-violet-50",
        text: "text-violet-700",
        icon: <Receipt size={20} />,
      },
    ],
    flight: [
      {
        label: "Confirmed",
        value: "8,066",
        color: "border-emerald-500",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        icon: <TicketCheck size={20} />,
      },
      {
        label: "Cancelled",
        value: "354",
        color: "border-rose-500",
        bg: "bg-rose-50",
        text: "text-rose-700",
        icon: <XCircle size={20} />,
      },
      {
        label: "Total Revenue",
        value: formatINR(187650000),
        color: "border-sky-500",
        bg: "bg-sky-50",
        text: "text-sky-700",
        icon: <IndianRupee size={20} />,
      },
    ],
    bus: [
      {
        label: "Confirmed",
        value: "11,662",
        color: "border-emerald-500",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        icon: <TicketCheck size={20} />,
      },
      {
        label: "Cancelled",
        value: "718",
        color: "border-rose-500",
        bg: "bg-rose-50",
        text: "text-rose-700",
        icon: <XCircle size={20} />,
      },
      {
        label: "Total Revenue",
        value: formatINR(62145000),
        color: "border-emerald-500",
        bg: "bg-teal-50",
        text: "text-teal-700",
        icon: <IndianRupee size={20} />,
      },
    ],
    hotel: [
      {
        label: "Confirmed",
        value: "5,466",
        color: "border-emerald-500",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        icon: <TicketCheck size={20} />,
      },
      {
        label: "Cancelled",
        value: "374",
        color: "border-rose-500",
        bg: "bg-rose-50",
        text: "text-rose-700",
        icon: <XCircle size={20} />,
      },
      {
        label: "Total Revenue",
        value: formatINR(89320000),
        color: "border-amber-500",
        bg: "bg-amber-50",
        text: "text-amber-700",
        icon: <IndianRupee size={20} />,
      },
    ],
  };

  const confirmed = bookingStatus[0].value;
  const cancelled = bookingStatus[1].value;
  const total = confirmed + cancelled;
  const distData = distributionData[activeService];
  const topRoutes = routeData[activeService];
  const maxRouteCount = topRoutes[0]?.count ?? 1;

  return (
    <>
      {/* A) KPI Cards */}
      <section data-ocid="kpi.section">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {kpiCards[activeService].map((card) => (
            <div
              key={card.label}
              className={`bg-white rounded-xl border border-slate-200 border-l-4 ${card.accent} p-5 shadow-sm`}
            >
              <div
                className={`w-10 h-10 ${card.iconBg} rounded-lg flex items-center justify-center mb-3`}
              >
                {card.icon}
              </div>
              <p className="text-2xl font-bold text-slate-800">{card.value}</p>
              <p className="text-sm text-slate-500 mt-0.5">{card.label}</p>
              {card.sub && (
                <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* B) Monthly Trend */}
      <section data-ocid="trend.section">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-800">
              Monthly Booking & Revenue Trend
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Bookings count vs Revenue (₹ Lakhs)
            </p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart
              data={trendData}
              margin={{ top: 4, right: 24, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v}L`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                }}
                formatter={(value: number, name: string) =>
                  name === "Revenue (₹L)"
                    ? [`₹${value}L`, name]
                    : [value.toLocaleString(), name]
                }
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="revenueLakh"
                name="Revenue (₹L)"
                fill={svc.trendFill}
                stroke={svc.trendStroke}
                strokeWidth={2}
                fillOpacity={0.5}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="bookings"
                name="Bookings"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#10b981" }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* C + D) Top Entities + Category Distribution */}
      <section
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        data-ocid="overview.clients.section"
      >
        {/* C) Top Clients/Airlines/Operators/Cities */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800 mb-1">
            {topEntityLabel[activeService]}
          </h2>
          <p className="text-xs text-slate-500 mb-4">Top 5 by bookings</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              layout="vertical"
              data={topEntityData[activeService]}
              margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#f1f5f9"
              />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={110}
                tick={{ fontSize: 10, fill: "#475569" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                }}
                formatter={(v: number) => [v.toLocaleString(), "Bookings"]}
              />
              <Bar dataKey="bookings" radius={[0, 4, 4, 0]}>
                {topEntityData[activeService].map((item, i) => (
                  <Cell
                    key={item.name}
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* D) Category Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800 mb-1">
            {distributionLabel[activeService]}
          </h2>
          <p className="text-xs text-slate-500 mb-4">Bookings by category</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie
                  data={distData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {distData.map((item, i) => (
                    <Cell
                      key={item.name}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [v.toLocaleString(), "Bookings"]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {distData.map((item, i) => {
                const dtotal = distData.reduce((a, b) => a + b.value, 0);
                const pct = ((item.value / dtotal) * 100).toFixed(1);
                return (
                  <div key={item.name}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          background: CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                      <span className="text-xs text-slate-600 flex-1 truncate">
                        {item.name}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">
                        {item.value.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden ml-4">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* E + F) Top Routes + Financial Summary */}
      <section
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        data-ocid="overview.finance.section"
      >
        {/* E) Top Routes condensed */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                {routeLabel[activeService]}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Top 5 by booking volume
              </p>
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Top 5
            </span>
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-8">
                    #
                  </th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-20">
                    Bookings
                  </th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Vol
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topRoutes.map((r, i) => {
                  const pct = (r.count / maxRouteCount) * 100;
                  return (
                    <tr
                      key={r.route}
                      data-ocid={`overview.routes.item.${i + 1}`}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-3 py-2.5">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                          style={
                            i < 3
                              ? {
                                  backgroundColor: `${svc.accent}20`,
                                  color: svc.accent,
                                }
                              : { backgroundColor: "#f1f5f9", color: "#94a3b8" }
                          }
                        >
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-700 font-medium text-xs">
                        {r.route}
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold text-slate-800 text-xs">
                        {r.count}
                      </td>
                      <td className="px-3 py-2.5 w-28">
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: svc.accent,
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* F) Financial Summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800 mb-1">
            Financial Summary
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Booking status & key metrics
          </p>

          {/* Mini donut */}
          <div className="flex items-center gap-6 mb-5">
            <ResponsiveContainer width="40%" height={130}>
              <PieChart>
                <Pie
                  data={bookingStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={58}
                  paddingAngle={3}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#f43f5e" />
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [v.toLocaleString(), "Bookings"]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs text-slate-600">Confirmed</span>
                </div>
                <p className="text-xl font-bold text-slate-800">
                  {confirmed.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">
                  {((confirmed / total) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-xs text-slate-600">Cancelled</span>
                </div>
                <p className="text-xl font-bold text-slate-800">
                  {cancelled.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">
                  {((cancelled / total) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Billing cards */}
          <div className="grid grid-cols-3 gap-3">
            {billingCards[activeService].map((item, i) => (
              <div
                key={item.label}
                data-ocid={`overview.billing.item.${i + 1}`}
                className={`rounded-lg border border-slate-200 border-l-4 ${item.color} p-3 shadow-sm`}
              >
                <div
                  className={`w-8 h-8 ${item.bg} ${item.text} rounded-lg flex items-center justify-center mb-2`}
                >
                  {item.icon}
                </div>
                <p className="text-lg font-bold text-slate-800">{item.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// ── Clients Section ───────────────────────────────────────────────────────────

function ClientsSection({
  activeService,
}: {
  activeService: ServiceType;
}) {
  const clientsData: Record<ServiceType, { name: string; bookings: number }[]> =
    {
      train: dashboardData.topClients.map((c) => ({
        name: c.name,
        bookings: c.bookings,
      })),
      flight: flightData.topAirlines,
      bus: busData.topOperators,
      hotel: hotelData.topCities,
    };

  const clientsLabel: Record<ServiceType, string> = {
    train: "Top Corporate Clients",
    flight: "Top Airlines by Bookings",
    bus: "Top Bus Operators",
    hotel: "Top Destination Cities",
  };

  const distributionData: Record<
    ServiceType,
    { name: string; value: number }[]
  > = {
    train: dashboardData.coachTypes,
    flight: flightData.cabinClass,
    bus: busData.seatTypes,
    hotel: hotelData.roomTypes,
  };

  const distributionLabel: Record<ServiceType, string> = {
    train: "Coach Type Distribution",
    flight: "Cabin Class Distribution",
    bus: "Seat Type Distribution",
    hotel: "Room Type Distribution",
  };

  const data = clientsData[activeService];
  const distData = distributionData[activeService];

  return (
    <section
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      data-ocid="clients.section"
    >
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800 mb-1">
          {clientsLabel[activeService]}
        </h2>
        <p className="text-xs text-slate-500 mb-4">Ranked by total bookings</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="#f1f5f9"
            />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              tick={{ fontSize: 10, fill: "#475569" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: 12,
              }}
              formatter={(v: number) => [v.toLocaleString(), "Bookings"]}
            />
            <Bar dataKey="bookings" radius={[0, 4, 4, 0]}>
              {data.map((item, i) => (
                <Cell
                  key={item.name}
                  fill={CHART_COLORS[i % CHART_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800 mb-1">
          {distributionLabel[activeService]}
        </h2>
        <p className="text-xs text-slate-500 mb-4">Bookings by category</p>
        <div className="flex items-center gap-4">
          <ResponsiveContainer width="50%" height={240}>
            <PieChart>
              <Pie
                data={distData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {distData.map((item, i) => (
                  <Cell
                    key={item.name}
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                }}
                formatter={(v: number) => [v.toLocaleString(), "Bookings"]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-2">
            {distData.map((item, i) => {
              const total = distData.reduce((a, b) => a + b.value, 0);
              const pct = ((item.value / total) * 100).toFixed(1);
              return (
                <div key={item.name}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        background: CHART_COLORS[i % CHART_COLORS.length],
                      }}
                    />
                    <span className="text-xs text-slate-600 flex-1 truncate">
                      {item.name}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      {item.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden ml-4">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: CHART_COLORS[i % CHART_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Routes Section ────────────────────────────────────────────────────────────

function RoutesSection({
  activeService,
  svc,
}: {
  activeService: ServiceType;
  svc: (typeof SERVICE_CONFIG)[ServiceType];
}) {
  const routesData: Record<ServiceType, { route: string; count: number }[]> = {
    train: dashboardData.topRoutes,
    flight: flightData.topRoutes,
    bus: busData.topRoutes,
    hotel: hotelData.topHotels,
  };

  const routeLabels: Record<
    ServiceType,
    { title: string; subtitle: string; col: string }
  > = {
    train: {
      title: "Top Train Routes",
      subtitle: "Most booked city pairs",
      col: "Route",
    },
    flight: {
      title: "Top Flight Routes",
      subtitle: "Most popular air routes",
      col: "Route",
    },
    bus: {
      title: "Top Bus Routes",
      subtitle: "Most booked intercity routes",
      col: "Route",
    },
    hotel: {
      title: "Top Hotel Brands",
      subtitle: "Most popular hotel chains",
      col: "Brand",
    },
  };

  const routes = routesData[activeService];
  const maxCount = routes[0].count;
  const info = routeLabels[activeService];

  return (
    <section data-ocid="routes.section">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              {info.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{info.subtitle}</p>
          </div>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            Top {routes.length}
          </span>
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-10">
                  #
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {info.col}
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">
                  Bookings
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Volume
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {routes.map((r, i) => {
                const pct = (r.count / maxCount) * 100;
                return (
                  <tr
                    key={r.route}
                    data-ocid={`routes.item.${i + 1}`}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={
                          i < 3
                            ? {
                                backgroundColor: `${svc.accent}20`,
                                color: svc.accent,
                              }
                            : { backgroundColor: "#f1f5f9", color: "#94a3b8" }
                        }
                      >
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      {r.route}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">
                      {r.count}
                    </td>
                    <td className="px-4 py-3 w-48">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: svc.accent,
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ── Finance Section ───────────────────────────────────────────────────────────

function FinanceSection({
  activeService,
}: {
  activeService: ServiceType;
}) {
  const bookingStatus = {
    train: dashboardData.bookingStatus,
    flight: flightData.bookingStatus,
    bus: busData.bookingStatus,
    hotel: hotelData.bookingStatus,
  }[activeService];

  const distributionData: Record<
    ServiceType,
    { name: string; value: number }[]
  > = {
    train: dashboardData.coachTypes,
    flight: flightData.cabinClass,
    bus: busData.seatTypes,
    hotel: hotelData.roomTypes,
  };

  const distributionLabel: Record<ServiceType, string> = {
    train: "Coach Type Revenue Split",
    flight: "Cabin Class Breakdown",
    bus: "Seat Type Breakdown",
    hotel: "Room Type Breakdown",
  };

  const billingCards: Record<
    ServiceType,
    {
      label: string;
      value: string | number;
      color: string;
      bg: string;
      text: string;
      icon: React.ReactNode;
    }[]
  > = {
    train: [
      {
        label: "Unbilled",
        value: "9,931",
        color: "border-amber-500",
        bg: "bg-amber-50",
        text: "text-amber-700",
        icon: <FileText size={20} />,
      },
      {
        label: "Billed",
        value: "5,497",
        color: "border-emerald-500",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        icon: <TicketCheck size={20} />,
      },
      {
        label: "Pending Verification",
        value: "113",
        color: "border-violet-500",
        bg: "bg-violet-50",
        text: "text-violet-700",
        icon: <Receipt size={20} />,
      },
    ],
    flight: [
      {
        label: "Confirmed",
        value: "8,066",
        color: "border-emerald-500",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        icon: <TicketCheck size={20} />,
      },
      {
        label: "Cancelled",
        value: "354",
        color: "border-rose-500",
        bg: "bg-rose-50",
        text: "text-rose-700",
        icon: <XCircle size={20} />,
      },
      {
        label: "Total Revenue",
        value: formatINR(187650000),
        color: "border-sky-500",
        bg: "bg-sky-50",
        text: "text-sky-700",
        icon: <IndianRupee size={20} />,
      },
    ],
    bus: [
      {
        label: "Confirmed",
        value: "11,662",
        color: "border-emerald-500",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        icon: <TicketCheck size={20} />,
      },
      {
        label: "Cancelled",
        value: "718",
        color: "border-rose-500",
        bg: "bg-rose-50",
        text: "text-rose-700",
        icon: <XCircle size={20} />,
      },
      {
        label: "Total Revenue",
        value: formatINR(62145000),
        color: "border-emerald-500",
        bg: "bg-teal-50",
        text: "text-teal-700",
        icon: <IndianRupee size={20} />,
      },
    ],
    hotel: [
      {
        label: "Confirmed",
        value: "5,466",
        color: "border-emerald-500",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        icon: <TicketCheck size={20} />,
      },
      {
        label: "Cancelled",
        value: "374",
        color: "border-rose-500",
        bg: "bg-rose-50",
        text: "text-rose-700",
        icon: <XCircle size={20} />,
      },
      {
        label: "Total Revenue",
        value: formatINR(89320000),
        color: "border-amber-500",
        bg: "bg-amber-50",
        text: "text-amber-700",
        icon: <IndianRupee size={20} />,
      },
    ],
  };

  const confirmed = bookingStatus[0].value;
  const cancelled = bookingStatus[1].value;
  const total = confirmed + cancelled;
  const distData = distributionData[activeService];

  // Train quota
  const showQuota = activeService === "train";
  const quotaColors = ["#6366f1", "#f59e0b", "#f43f5e"];
  const quotaTotal = dashboardData.quotaUsed.reduce((a, b) => a + b.value, 0);

  return (
    <div className="space-y-6">
      {/* Booking Status + Distribution */}
      <section
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        data-ocid="finance.section"
      >
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800 mb-1">
            Booking Status
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Confirmed vs Cancelled distribution
          </p>
          <div className="flex items-center justify-around">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie
                  data={bookingStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#f43f5e" />
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [v.toLocaleString(), "Bookings"]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-4">
              <div className="text-center">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs text-slate-600">Confirmed</span>
                </div>
                <p className="text-2xl font-bold text-slate-800">
                  {confirmed.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">
                  {((confirmed / total) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="text-xs text-slate-600">Cancelled</span>
                </div>
                <p className="text-2xl font-bold text-slate-800">
                  {cancelled.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">
                  {((cancelled / total) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800 mb-1">
            {distributionLabel[activeService]}
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Booking share by category
          </p>
          <div className="space-y-3">
            {distData.map((item, i) => {
              const dtotal = distData.reduce((a, b) => a + b.value, 0);
              const pct = ((item.value / dtotal) * 100).toFixed(1);
              return (
                <div key={item.name}>
                  <div className="flex justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          background: CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                      <span className="text-xs font-medium text-slate-700">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">{pct}%</span>
                      <span className="text-xs font-semibold text-slate-800">
                        {item.value.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: CHART_COLORS[i % CHART_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Train Quota (only for train) */}
      {showQuota && (
        <section data-ocid="quota.section">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-800 mb-1">
              Quota Used
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              General vs Tatkal breakdown
            </p>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="30%" height={180}>
                <PieChart>
                  <Pie
                    data={dashboardData.quotaUsed}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {dashboardData.quotaUsed.map((quota, i) => (
                      <Cell key={quota.name} fill={quotaColors[i]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                    formatter={(v: number) => [v.toLocaleString(), "Tickets"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {dashboardData.quotaUsed.map((item, i) => {
                  const pct = ((item.value / quotaTotal) * 100).toFixed(1);
                  return (
                    <div key={item.name}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium text-slate-700">
                          {item.name}
                        </span>
                        <span className="text-xs text-slate-500">{pct}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: quotaColors[i],
                          }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.value.toLocaleString()} tickets
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Billing/summary cards */}
      <section data-ocid="billing.section">
        <h2 className="text-base font-semibold text-slate-800 mb-3">
          Financial Summary
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {billingCards[activeService].map((item, i) => (
            <div
              key={item.label}
              data-ocid={`billing.item.${i + 1}`}
              className={`bg-white rounded-xl border border-slate-200 border-l-4 ${item.color} p-5 shadow-sm`}
            >
              <div
                className={`w-10 h-10 ${item.bg} ${item.text} rounded-lg flex items-center justify-center mb-3`}
              >
                {item.icon}
              </div>
              <p className="text-2xl font-bold text-slate-800">{item.value}</p>
              <p className="text-sm text-slate-500 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
