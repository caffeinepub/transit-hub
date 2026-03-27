import {
  BarChart3,
  Bed,
  Bus,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  IndianRupee,
  MapPin,
  Plane,
  Plus,
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
import {
  busData,
  dashboardData,
  flightData,
  formatINR,
  formatMonthLabel,
  hotelData,
} from "../data/dashboardData";

// ── Types ─────────────────────────────────────────────────────────────────────

type ServiceType = "train" | "flight" | "bus" | "hotel";
type NavItem = "overview" | "clients" | "routes" | "finance";

// ── Service Config ────────────────────────────────────────────────────────────

const SERVICE_CONFIG = {
  train: {
    label: "Train",
    icon: Train,
    accent: "#6366f1",
    accentLight: "#e0e7ff",
    trendFill: "#e0e7ff",
    trendStroke: "#6366f1",
  },
  flight: {
    label: "Flight",
    icon: Plane,
    accent: "#0ea5e9",
    accentLight: "#e0f2fe",
    trendFill: "#e0f2fe",
    trendStroke: "#0ea5e9",
  },
  bus: {
    label: "Bus",
    icon: Bus,
    accent: "#10b981",
    accentLight: "#d1fae5",
    trendFill: "#d1fae5",
    trendStroke: "#10b981",
  },
  hotel: {
    label: "Hotel",
    icon: Bed,
    accent: "#f59e0b",
    accentLight: "#fef3c7",
    trendFill: "#fef3c7",
    trendStroke: "#f59e0b",
  },
} as const;

// ── Chart colors ─────────────────────────────────────────────────────────────

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

// ── Canvas chart helpers for Excel export ────────────────────────────────────

// ── Excel Export (xlsx CDN) ───────────────────────────────────────────────────

declare global {
  interface Window {
    XLSX: any;
  }
}

async function loadXLSX(): Promise<any> {
  if (window.XLSX) return window.XLSX;
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js";
    script.onload = () => resolve(window.XLSX);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function exportDashboardToExcel() {
  const XLSX = await loadXLSX();
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryRows = [
    ["Service", "Bookings", "Revenue (₹)", "Profit %", "Period"],
    ["Train", 15541, 24218319, "10.4%", "Apr 2025 – Mar 2026"],
    ["Flight", 8420, 187650000, "8%", "Apr 2025 – Mar 2026"],
    ["Bus", 12380, 62145000, "6%", "Apr 2025 – Mar 2026"],
    ["Hotel", 5840, 89320000, "12%", "Apr 2025 – Mar 2026"],
  ];
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

  // Helper: monthly sheet
  function addMonthlySheet(
    name: string,
    data: { month: string; bookings: number; revenue: number }[],
  ) {
    const rows = [
      ["Month", "Bookings", "Revenue (₹)"],
      ...data.map((d) => [formatMonthLabel(d.month), d.bookings, d.revenue]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), name);
  }

  // Helper: simple sheet
  function addSimpleSheet(
    name: string,
    headers: string[],
    data: (string | number)[][],
  ) {
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet([headers, ...data]),
      name,
    );
  }

  addMonthlySheet("Train_Monthly", dashboardData.monthlyTrend);
  addSimpleSheet(
    "Train_Clients",
    ["Client", "Bookings", "Revenue (₹)"],
    dashboardData.topClients.map((c) => [c.name, c.bookings, c.revenue]),
  );
  addSimpleSheet(
    "Train_Routes",
    ["Route", "Count"],
    dashboardData.topRoutes.map((r) => [r.route, r.count]),
  );

  addMonthlySheet("Flight_Monthly", flightData.monthlyTrend);
  addSimpleSheet(
    "Flight_Airlines",
    ["Airline", "Bookings"],
    flightData.topAirlines.map((a) => [a.name, a.bookings]),
  );
  addSimpleSheet(
    "Flight_Routes",
    ["Route", "Count"],
    flightData.topRoutes.map((r) => [r.route, r.count]),
  );

  addMonthlySheet("Bus_Monthly", busData.monthlyTrend);
  addSimpleSheet(
    "Bus_Operators",
    ["Operator", "Bookings"],
    busData.topOperators.map((o) => [o.name, o.bookings]),
  );
  addSimpleSheet(
    "Bus_Routes",
    ["Route", "Count"],
    busData.topRoutes.map((r) => [r.route, r.count]),
  );

  addMonthlySheet("Hotel_Monthly", hotelData.monthlyTrend);
  addSimpleSheet(
    "Hotel_Cities",
    ["City", "Bookings"],
    hotelData.topCities.map((c) => [c.name, c.bookings]),
  );
  addSimpleSheet(
    "Hotel_Hotels",
    ["Hotel", "Bookings"],
    hotelData.topHotels.map((h) => [h.route, h.count]),
  );

  XLSX.writeFile(wb, "analytics-dashboard.xlsx");
}

// ── UI Primitives ─────────────────────────────────────────────────────────────

function XlKpiCard({
  label,
  value,
  sub,
  icon,
  accentColor,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accentColor: string;
}) {
  return (
    <div
      className="border border-[#d0d7de] bg-white hover:bg-[#f9fafb] transition-colors"
      style={{ borderTop: `3px solid ${accentColor}` }}
    >
      <div className="px-3 py-1.5 bg-[#f3f3f3] border-b border-[#d0d7de] flex items-center gap-1.5">
        <span style={{ color: accentColor }}>{icon}</span>
        <span className="text-[10px] font-bold text-[#595959] uppercase tracking-wide truncate">
          {label}
        </span>
      </div>
      <div className="px-3 py-3">
        <p className="text-xl font-bold text-[#1f2937] leading-tight">
          {value}
        </p>
        {sub && <p className="text-[10px] text-[#595959] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function XlChartBox({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[#d0d7de] bg-white">
      <div className="flex items-center px-3 py-2 bg-[#f3f3f3] border-b border-[#d0d7de]">
        <span className="text-[11px] font-bold text-[#1f2937] uppercase tracking-wide">
          {title}
        </span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function XlTable({
  headers,
  rows,
  accentColor,
}: {
  headers: string[];
  rows: { key: string; cells: (string | number | React.ReactNode)[] }[];
  accentColor?: string;
}) {
  const headerBg = accentColor ?? "#217346";
  return (
    <div className="border border-[#d0d7de] overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="px-3 py-2 text-left text-white font-bold border-r last:border-r-0"
                style={{ backgroundColor: headerBg, borderColor: "#ffffff30" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={row.key}
              className="border-t border-[#d0d7de] hover:bg-[#e8f5e9] transition-colors"
              style={{ backgroundColor: idx % 2 === 0 ? "#fff" : "#f9fafb" }}
            >
              {row.cells.map((cell, j) => (
                <td
                  key={`${row.key}-${headers[j] ?? j}`}
                  className="px-3 py-1.5 border-r border-[#d0d7de] last:border-r-0 text-[#1f2937]"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RibbonBtn({
  icon,
  label,
  active,
  onClick,
  primary,
  "data-ocid": dataOcid,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  primary?: boolean;
  "data-ocid"?: string;
}) {
  if (primary) {
    return (
      <button
        type="button"
        onClick={onClick}
        data-ocid={dataOcid}
        className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-white rounded-sm border border-[#1a5c38] text-[10px] font-semibold hover:bg-[#1a5c38] transition-colors"
        style={{ backgroundColor: "#217346" }}
      >
        <span>{icon}</span>
        <span>{label}</span>
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      data-ocid={dataOcid}
      className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-sm text-[10px] font-semibold transition-colors border ${
        active
          ? "bg-white border-[#217346] text-[#217346]"
          : "bg-transparent border-transparent text-[#595959] hover:bg-[#f3f3f3]"
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

// ── Main DashboardPage ───────────────────────────────────────────────────────

export default function DashboardPage() {
  const [activeService, setActiveService] = useState<ServiceType>("train");
  const [activeNav, setActiveNav] = useState<NavItem>("overview");
  const svc = SERVICE_CONFIG[activeService];

  const navItems: { id: NavItem; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <BarChart3 size={14} /> },
    { id: "clients", label: "Clients", icon: <Users size={14} /> },
    { id: "routes", label: "Routes", icon: <MapPin size={14} /> },
    { id: "finance", label: "Finance", icon: <IndianRupee size={14} /> },
  ];

  const headerTitle: Record<ServiceType, string> = {
    train: "Train Booking Analytics",
    flight: "Flight Booking Analytics",
    bus: "Bus Booking Analytics",
    hotel: "Hotel Booking Analytics",
  };

  const statusStats: Record<ServiceType, { label: string; val: string }[]> = {
    train: [
      { label: "Bookings", val: "15,541" },
      { label: "Revenue", val: "₹2.42 Cr" },
      { label: "Profit", val: "10.4%" },
    ],
    flight: [
      { label: "Bookings", val: "8,420" },
      { label: "Revenue", val: "₹18.77 Cr" },
      { label: "Profit", val: "8%" },
    ],
    bus: [
      { label: "Bookings", val: "12,380" },
      { label: "Revenue", val: "₹6.21 Cr" },
      { label: "Profit", val: "6%" },
    ],
    hotel: [
      { label: "Bookings", val: "5,840" },
      { label: "Revenue", val: "₹8.93 Cr" },
      { label: "Profit", val: "12%" },
    ],
  };

  return (
    <div
      className="flex flex-col h-screen bg-[#f3f3f3] overflow-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', Segoe UI, Arial, sans-serif" }}
    >
      {/* Title Bar */}
      <div
        className="flex items-center px-4 h-9 shrink-0 gap-2"
        style={{ backgroundColor: "#217346" }}
      >
        <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
          <FileSpreadsheet size={12} style={{ color: "#217346" }} />
        </div>
        <span className="text-white font-semibold text-sm">
          TravelBook Analytics
        </span>
        <span className="text-white/60 text-xs ml-2">
          — {headerTitle[activeService]}
        </span>
        <div className="ml-auto">
          <span className="text-white/70 text-xs">FY 2025-26</span>
        </div>
      </div>

      {/* Ribbon */}
      <div className="bg-white border-b-2 border-[#217346] shrink-0">
        {/* Tab row */}
        <div className="flex items-end px-2 pt-1 gap-0.5 border-b border-[#d0d7de]">
          {["Home", "Insert", "Page Layout", "Formulas", "Data", "View"].map(
            (tab, i) => (
              <div
                key={tab}
                className={`px-3 py-1 text-[11px] cursor-pointer rounded-t-sm ${
                  i === 0
                    ? "bg-white border border-b-0 border-[#d0d7de] text-[#217346] font-semibold -mb-px"
                    : "text-[#595959] hover:bg-[#f3f3f3]"
                }`}
              >
                {tab}
              </div>
            ),
          )}
        </div>

        {/* Ribbon buttons */}
        <div className="flex items-stretch gap-0 px-2 py-1.5 overflow-x-auto">
          {/* Export group */}
          <div className="flex items-center gap-1 pr-3 mr-2 border-r border-[#d0d7de]">
            <RibbonBtn
              icon={<Download size={14} />}
              label="Export"
              primary
              data-ocid="dashboard.export_button"
              onClick={exportDashboardToExcel}
            />
            <p className="text-[9px] text-[#595959] self-end pb-0.5">File</p>
          </div>

          {/* Service group */}
          <div className="flex items-start gap-1 pr-3 mr-2 border-r border-[#d0d7de]">
            <div className="flex items-center gap-1">
              {(Object.keys(SERVICE_CONFIG) as ServiceType[]).map((svcKey) => {
                const cfg = SERVICE_CONFIG[svcKey];
                const Icon = cfg.icon;
                return (
                  <RibbonBtn
                    key={svcKey}
                    icon={<Icon size={14} />}
                    label={cfg.label}
                    active={activeService === svcKey}
                    data-ocid={`service.${svcKey}.tab`}
                    onClick={() => {
                      setActiveService(svcKey);
                      setActiveNav("overview");
                    }}
                  />
                );
              })}
            </div>
            <p className="text-[9px] text-[#595959] self-end pb-0.5">Service</p>
          </div>

          {/* Navigate group */}
          <div className="flex items-start gap-1 pr-3 mr-2 border-r border-[#d0d7de]">
            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <RibbonBtn
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  active={activeNav === item.id}
                  data-ocid={`nav.${item.id}.link`}
                  onClick={() => setActiveNav(item.id)}
                />
              ))}
            </div>
            <p className="text-[9px] text-[#595959] self-end pb-0.5">
              Navigate
            </p>
          </div>

          {/* Period badge */}
          <div className="ml-auto flex items-center pr-2">
            <span
              className="text-[10px] font-semibold px-2.5 py-1 border rounded-sm"
              style={{
                backgroundColor: svc.accentLight,
                color: svc.accent,
                borderColor: `${svc.accent}60`,
              }}
            >
              Apr 2025 – Mar 2026
            </span>
          </div>
        </div>
      </div>

      {/* Formula Bar */}
      <div className="flex items-center bg-white border-b border-[#d0d7de] px-3 py-1 shrink-0 gap-2">
        <div className="w-20 px-2 py-0.5 border border-[#d0d7de] text-[11px] text-center font-mono bg-white text-[#1f2937]">
          A1
        </div>
        <div className="w-px h-4 bg-[#d0d7de]" />
        <span className="text-[11px] text-[#595959] italic">
          {headerTitle[activeService]} —{" "}
          {activeNav.charAt(0).toUpperCase() + activeNav.slice(1)} View
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div className="w-44 shrink-0 bg-white border-r border-[#d0d7de] flex flex-col overflow-y-auto">
          <div className="h-6 bg-[#f3f3f3] border-b border-[#d0d7de] flex items-center justify-center text-[10px] font-bold text-[#595959]">
            Dashboard
          </div>

          {/* Service info */}
          <div className="border-b border-[#d0d7de]">
            <div className="px-2 py-1.5 bg-[#f3f3f3] border-b border-[#d0d7de]">
              <p className="text-[9px] font-bold text-[#595959] uppercase tracking-wide">
                Service Info
              </p>
            </div>
            {[
              { label: "Service", value: SERVICE_CONFIG[activeService].label },
              { label: "Period", value: "Apr '25–Mar '26" },
              { label: "Status", value: "Active" },
            ].map((item) => (
              <div key={item.label} className="flex border-b border-[#d0d7de]">
                <div className="w-16 px-2 py-1.5 bg-[#f3f3f3] border-r border-[#d0d7de] text-[9px] text-[#595959] font-medium">
                  {item.label}
                </div>
                <div className="flex-1 px-2 py-1.5 text-[9px] text-[#1f2937] font-mono">
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Nav */}
          <div className="border-b border-[#d0d7de]">
            <div className="px-2 py-1.5 bg-[#f3f3f3] border-b border-[#d0d7de]">
              <p className="text-[9px] font-bold text-[#595959] uppercase tracking-wide">
                Views
              </p>
            </div>
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                data-ocid={`sidebar.${item.id}.link`}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-2 px-2 py-2 border-b border-[#d0d7de] text-[11px] text-left transition-colors ${
                  activeNav === item.id
                    ? "bg-[#e8f5e9] text-[#217346] font-semibold border-l-2 border-l-[#217346]"
                    : "text-[#595959] hover:bg-[#f3f3f3]"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          {/* Quick stats */}
          <div className="flex-1">
            <div className="px-2 py-1.5 bg-[#f3f3f3] border-b border-[#d0d7de]">
              <p className="text-[9px] font-bold text-[#595959] uppercase tracking-wide">
                Quick Stats
              </p>
            </div>
            {statusStats[activeService].map((item) => (
              <div key={item.label} className="flex border-b border-[#d0d7de]">
                <div className="w-16 px-2 py-1.5 bg-[#f3f3f3] border-r border-[#d0d7de] text-[9px] text-[#595959] font-medium">
                  {item.label}
                </div>
                <div className="flex-1 px-2 py-1.5 text-[9px] text-[#1f2937] font-mono font-semibold">
                  {item.val}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-[#f3f3f3]">
          <div className="p-4 space-y-4">
            {activeNav === "overview" && (
              <OverviewSection activeService={activeService} />
            )}
            {activeNav === "clients" && (
              <ClientsSection activeService={activeService} />
            )}
            {activeNav === "routes" && (
              <RoutesSection activeService={activeService} />
            )}
            {activeNav === "finance" && (
              <FinanceSection activeService={activeService} />
            )}

            <div className="text-center py-3 text-[10px] text-[#595959]">
              © {new Date().getFullYear()}. Built with ❤ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: "#217346" }}
              >
                caffeine.ai
              </a>
            </div>
          </div>
        </main>
      </div>

      {/* Sheet tab strip */}
      <div
        className="flex items-end px-2 h-8 shrink-0 border-t border-[#d0d7de] overflow-x-auto"
        style={{ backgroundColor: "#f3f3f3" }}
      >
        <button
          type="button"
          className="flex items-center justify-center w-6 h-6 mb-0.5 mr-1 border border-[#d0d7de] bg-white text-[#595959] hover:bg-[#e8f5e9] hover:text-[#217346] rounded-sm"
        >
          <Plus size={11} />
        </button>
        {(Object.keys(SERVICE_CONFIG) as ServiceType[]).map((svcKey) => {
          const cfg = SERVICE_CONFIG[svcKey];
          const Icon = cfg.icon;
          const isActive = activeService === svcKey;
          return (
            <button
              key={svcKey}
              type="button"
              data-ocid={`sheet.${svcKey}.tab`}
              onClick={() => {
                setActiveService(svcKey);
                setActiveNav("overview");
              }}
              className={`flex items-center gap-1.5 px-3 h-7 text-[11px] font-medium border border-b-0 mr-0.5 transition-colors rounded-t-sm ${
                isActive
                  ? "bg-white text-[#217346] border-[#d0d7de]"
                  : "bg-[#e0e0e0] text-[#595959] border-[#bdbdbd] hover:bg-[#ebebeb]"
              }`}
              style={
                isActive
                  ? { borderTopColor: cfg.accent, borderTopWidth: 2 }
                  : undefined
              }
            >
              <Icon size={11} />
              {cfg.label}
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-4 pb-1 pr-2">
          {statusStats[activeService].map((item) => (
            <span key={item.label} className="text-[10px] text-[#595959]">
              <span className="font-semibold">{item.label}:</span> {item.val}
            </span>
          ))}
        </div>
      </div>

      {/* Status bar */}
      <div
        className="flex items-center px-4 h-5 shrink-0 text-[10px] text-white/80 gap-4"
        style={{ backgroundColor: "#217346" }}
      >
        <span>Ready</span>
        <span>|</span>
        <span>FY 2025-26</span>
        <span>|</span>
        <span>TravelBook Analytics Dashboard</span>
        <div className="ml-auto flex items-center gap-3">
          <span>4 Services</span>
          <span>|</span>
          <span>42,181 Total Bookings</span>
        </div>
      </div>
    </div>
  );
}

// ── Overview Section ──────────────────────────────────────────────────────────

function OverviewSection({ activeService }: { activeService: ServiceType }) {
  const svc = SERVICE_CONFIG[activeService];

  type KpiCard = {
    label: string;
    value: string;
    sub: string;
    accent: string;
    icon: React.ReactNode;
  };
  const kpiCards: Record<ServiceType, KpiCard[]> = {
    train: [
      {
        label: "Total Bookings",
        value: "15,541",
        sub: "FY 2025-26",
        accent: "#6366f1",
        icon: <TicketCheck size={14} />,
      },
      {
        label: "Total Revenue",
        value: formatINR(24218319),
        sub: "+8.2% YoY",
        accent: "#10b981",
        icon: <IndianRupee size={14} />,
      },
      {
        label: "Total Profit",
        value: formatINR(dashboardData.kpis.totalProfit),
        sub: "10.4% margin",
        accent: "#f59e0b",
        icon: <TrendingUp size={14} />,
      },
      {
        label: "Confirmed",
        value: "14,983",
        sub: "96.4% confirm rate",
        accent: "#10b981",
        icon: <CheckCircle2 size={14} />,
      },
      {
        label: "Cancelled",
        value: "558",
        sub: "3.6% cancel rate",
        accent: "#f43f5e",
        icon: <XCircle size={14} />,
      },
    ],
    flight: [
      {
        label: "Total Bookings",
        value: "8,420",
        sub: "FY 2025-26",
        accent: "#0ea5e9",
        icon: <TicketCheck size={14} />,
      },
      {
        label: "Total Revenue",
        value: formatINR(187650000),
        sub: "Gross",
        accent: "#10b981",
        icon: <IndianRupee size={14} />,
      },
      {
        label: "Total Profit",
        value: formatINR(flightData.kpis.totalProfit),
        sub: "8% margin",
        accent: "#f59e0b",
        icon: <TrendingUp size={14} />,
      },
      {
        label: "Confirmed",
        value: "8,066",
        sub: "95.8% confirm rate",
        accent: "#10b981",
        icon: <CheckCircle2 size={14} />,
      },
      {
        label: "Avg Fare",
        value: "₹22,286",
        sub: "Per ticket",
        accent: "#8b5cf6",
        icon: <Receipt size={14} />,
      },
    ],
    bus: [
      {
        label: "Total Trips",
        value: "12,380",
        sub: "FY 2025-26",
        accent: "#10b981",
        icon: <TicketCheck size={14} />,
      },
      {
        label: "Total Revenue",
        value: formatINR(62145000),
        sub: "Gross",
        accent: "#06b6d4",
        icon: <IndianRupee size={14} />,
      },
      {
        label: "Total Profit",
        value: formatINR(busData.kpis.totalProfit),
        sub: "6% margin",
        accent: "#f59e0b",
        icon: <TrendingUp size={14} />,
      },
      {
        label: "Confirmed",
        value: "11,662",
        sub: "94.2% confirm rate",
        accent: "#10b981",
        icon: <CheckCircle2 size={14} />,
      },
      {
        label: "Avg Fare",
        value: "₹5,020",
        sub: "Per ticket",
        accent: "#6366f1",
        icon: <Receipt size={14} />,
      },
    ],
    hotel: [
      {
        label: "Total Bookings",
        value: "5,840",
        sub: "FY 2025-26",
        accent: "#f59e0b",
        icon: <TicketCheck size={14} />,
      },
      {
        label: "Total Revenue",
        value: formatINR(89320000),
        sub: "Gross",
        accent: "#10b981",
        icon: <IndianRupee size={14} />,
      },
      {
        label: "Total Profit",
        value: formatINR(hotelData.kpis.totalProfit),
        sub: "12% margin",
        accent: "#f59e0b",
        icon: <TrendingUp size={14} />,
      },
      {
        label: "Confirmed",
        value: "5,466",
        sub: "93.6% confirm rate",
        accent: "#10b981",
        icon: <CheckCircle2 size={14} />,
      },
      {
        label: "Avg Rate",
        value: "₹15,294",
        sub: "Per night",
        accent: "#8b5cf6",
        icon: <Receipt size={14} />,
      },
    ],
  };

  const trendData = (() => {
    const src =
      activeService === "train"
        ? dashboardData.monthlyTrend
        : activeService === "flight"
          ? flightData.monthlyTrend
          : activeService === "bus"
            ? busData.monthlyTrend
            : hotelData.monthlyTrend;
    return src.map((d) => ({
      label: formatMonthLabel(d.month),
      bookings: d.bookings,
      revL: Math.round(d.revenue / 100000),
    }));
  })();

  const distData: Record<ServiceType, { name: string; value: number }[]> = {
    train: dashboardData.coachTypes,
    flight: flightData.cabinClass,
    bus: busData.seatTypes,
    hotel: hotelData.roomTypes,
  };

  const distLabel: Record<ServiceType, string> = {
    train: "Coach Type Distribution",
    flight: "Cabin Class Distribution",
    bus: "Seat Type Distribution",
    hotel: "Room Type Distribution",
  };

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

  const allServicesFinance = [
    {
      service: "Train",
      revenue: "₹2.42 Cr",
      cost: "₹2.17 Cr",
      profit: "₹25.1 L",
      pct: "10.4%",
      color: "#6366f1",
    },
    {
      service: "Flight",
      revenue: "₹18.77 Cr",
      cost: "₹17.27 Cr",
      profit: "₹1.50 Cr",
      pct: "8%",
      color: "#0ea5e9",
    },
    {
      service: "Bus",
      revenue: "₹6.21 Cr",
      cost: "₹5.84 Cr",
      profit: "₹37.3 L",
      pct: "6%",
      color: "#10b981",
    },
    {
      service: "Hotel",
      revenue: "₹8.93 Cr",
      cost: "₹7.86 Cr",
      profit: "₹1.07 Cr",
      pct: "12%",
      color: "#f59e0b",
    },
  ];

  return (
    <>
      {/* KPI Cards */}
      <section data-ocid="kpi.section">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
          {kpiCards[activeService].map((card) => (
            <XlKpiCard
              key={card.label}
              label={card.label}
              value={card.value}
              sub={card.sub}
              icon={card.icon}
              accentColor={card.accent}
            />
          ))}
        </div>
      </section>

      {/* Monthly Trend */}
      <section data-ocid="trend.section">
        <XlChartBox title="Monthly Booking & Revenue Trend">
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart
              data={trendData}
              margin={{ top: 4, right: 24, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f3f3" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#595959" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 10, fill: "#595959" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 10, fill: "#595959" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v}L`}
              />
              <Tooltip
                contentStyle={{
                  border: "1px solid #d0d7de",
                  fontSize: 11,
                  borderRadius: 0,
                }}
                formatter={(v: number, n: string) =>
                  n === "Revenue (₹L)" ? [`₹${v}L`, n] : [v.toLocaleString(), n]
                }
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="revL"
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
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </XlChartBox>
      </section>

      {/* Clients + Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <XlChartBox title={topEntityLabel[activeService]}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={topEntityData[activeService]}
              layout="vertical"
              margin={{ top: 4, right: 24, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f3f3f3"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: "#595959" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={110}
                tick={{ fontSize: 10, fill: "#595959" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  border: "1px solid #d0d7de",
                  fontSize: 11,
                  borderRadius: 0,
                }}
                formatter={(v: number) => [v.toLocaleString(), "Bookings"]}
              />
              <Bar dataKey="bookings" fill={svc.accent} radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </XlChartBox>

        <XlChartBox title={distLabel[activeService]}>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={distData[activeService]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                  fontSize={10}
                >
                  {distData[activeService].map((entry, idx) => (
                    <Cell
                      key={entry.name}
                      fill={CHART_COLORS[idx % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    border: "1px solid #d0d7de",
                    fontSize: 11,
                    borderRadius: 0,
                  }}
                  formatter={(v: number) => [v.toLocaleString(), "Bookings"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </XlChartBox>
      </div>

      {/* Top routes */}
      <XlChartBox title={routeLabel[activeService]}>
        <XlTable
          headers={["#", "Route / Location", "Bookings"]}
          accentColor={svc.accent}
          rows={routeData[activeService].map((r, i) => ({
            key: r.route,
            cells: [
              i + 1,
              r.route,
              <span key="cnt" className="font-mono font-semibold">
                {r.count.toLocaleString()}
              </span>,
            ],
          }))}
        />
      </XlChartBox>

      {/* All-services financial summary */}
      <XlChartBox title="Financial Summary — All Services">
        <XlTable
          headers={["Service", "Revenue", "Cost", "Profit", "Profit %"]}
          accentColor="#217346"
          rows={allServicesFinance.map((r) => ({
            key: r.service,
            cells: [
              <span key="svc" className="flex items-center gap-2">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: r.color }}
                />
                {r.service}
              </span>,
              r.revenue,
              r.cost,
              r.profit,
              <span
                key="pct"
                className="font-semibold"
                style={{ color: r.color }}
              >
                {r.pct}
              </span>,
            ],
          }))}
        />
      </XlChartBox>
    </>
  );
}

// ── Clients Section ───────────────────────────────────────────────────────────

function ClientsSection({ activeService }: { activeService: ServiceType }) {
  const svc = SERVICE_CONFIG[activeService];

  const tableData: Record<
    ServiceType,
    { key: string; cells: (string | number | React.ReactNode)[] }[]
  > = {
    train: dashboardData.topClients.map((c, i) => ({
      key: c.name,
      cells: [
        i + 1,
        c.name,
        c.bookings.toLocaleString(),
        formatINR(c.revenue),
        `${((c.bookings / dashboardData.kpis.totalBookings) * 100).toFixed(1)}%`,
      ],
    })),
    flight: flightData.topAirlines.map((a, i) => ({
      key: a.name,
      cells: [
        i + 1,
        a.name,
        a.bookings.toLocaleString(),
        "—",
        `${((a.bookings / flightData.kpis.totalBookings) * 100).toFixed(1)}%`,
      ],
    })),
    bus: busData.topOperators.map((o, i) => ({
      key: o.name,
      cells: [
        i + 1,
        o.name,
        o.bookings.toLocaleString(),
        "—",
        `${((o.bookings / busData.kpis.totalBookings) * 100).toFixed(1)}%`,
      ],
    })),
    hotel: hotelData.topCities.map((c, i) => ({
      key: c.name,
      cells: [
        i + 1,
        c.name,
        c.bookings.toLocaleString(),
        "—",
        `${((c.bookings / hotelData.kpis.totalBookings) * 100).toFixed(1)}%`,
      ],
    })),
  };

  const clientLabel: Record<ServiceType, string> = {
    train: "Client",
    flight: "Airline",
    bus: "Operator",
    hotel: "City",
  };

  const chartData: Record<ServiceType, { name: string; bookings: number }[]> = {
    train: dashboardData.topClients
      .slice(0, 8)
      .map((c) => ({ name: c.name, bookings: c.bookings })),
    flight: flightData.topAirlines.map((a) => ({
      name: a.name,
      bookings: a.bookings,
    })),
    bus: busData.topOperators.map((o) => ({
      name: o.name,
      bookings: o.bookings,
    })),
    hotel: hotelData.topCities.map((c) => ({
      name: c.name,
      bookings: c.bookings,
    })),
  };

  return (
    <>
      <XlChartBox title={`Bookings by ${clientLabel[activeService]}`}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={chartData[activeService]}
            margin={{ top: 4, right: 24, left: 0, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f3f3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 9, fill: "#595959" }}
              axisLine={false}
              tickLine={false}
              angle={-30}
              textAnchor="end"
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#595959" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                border: "1px solid #d0d7de",
                fontSize: 11,
                borderRadius: 0,
              }}
              formatter={(v: number) => [v.toLocaleString(), "Bookings"]}
            />
            <Bar dataKey="bookings" radius={[2, 2, 0, 0]}>
              {chartData[activeService].map((entry, idx) => (
                <Cell
                  key={entry.name}
                  fill={CHART_COLORS[idx % CHART_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </XlChartBox>

      <XlChartBox title={`${clientLabel[activeService]} Breakdown Table`}>
        <XlTable
          headers={[
            "#",
            clientLabel[activeService],
            "Bookings",
            "Revenue",
            "Share %",
          ]}
          accentColor={svc.accent}
          rows={tableData[activeService]}
        />
      </XlChartBox>
    </>
  );
}

// ── Routes Section ────────────────────────────────────────────────────────────

function RoutesSection({ activeService }: { activeService: ServiceType }) {
  const svc = SERVICE_CONFIG[activeService];

  const routeData: Record<ServiceType, { route: string; count: number }[]> = {
    train: dashboardData.topRoutes,
    flight: flightData.topRoutes,
    bus: busData.topRoutes,
    hotel: hotelData.topHotels,
  };

  const routes = routeData[activeService];
  const maxCount = routes[0]?.count ?? 1;

  return (
    <>
      <XlChartBox title="Route / Location Bookings">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={routes}
            layout="vertical"
            margin={{ top: 4, right: 60, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f3f3f3"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: "#595959" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="route"
              width={160}
              tick={{ fontSize: 10, fill: "#595959" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                border: "1px solid #d0d7de",
                fontSize: 11,
                borderRadius: 0,
              }}
              formatter={(v: number) => [v.toLocaleString(), "Bookings"]}
            />
            <Bar dataKey="count" fill={svc.accent} radius={[0, 2, 2, 0]}>
              {routes.map((entry, idx) => (
                <Cell
                  key={entry.route}
                  fill={CHART_COLORS[idx % CHART_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </XlChartBox>

      <XlChartBox title="Routes Detail Table">
        <XlTable
          headers={["#", "Route / Location", "Bookings", "Share %"]}
          accentColor={svc.accent}
          rows={routes.map((r, i) => ({
            key: r.route,
            cells: [
              i + 1,
              r.route,
              r.count.toLocaleString(),
              `${((r.count / maxCount) * 100).toFixed(1)}%`,
            ],
          }))}
        />
      </XlChartBox>
    </>
  );
}

// ── Finance Section ───────────────────────────────────────────────────────────

function FinanceSection({ activeService }: { activeService: ServiceType }) {
  const svc = SERVICE_CONFIG[activeService];

  const financeData: Record<
    ServiceType,
    {
      label: string;
      revenue: number;
      cost: number;
      profit: number;
      profitPct: number;
    }
  > = {
    train: {
      label: "Train",
      revenue: 24218319,
      cost: 21703729,
      profit: 2514590,
      profitPct: 10.4,
    },
    flight: {
      label: "Flight",
      revenue: 187650000,
      cost: 172638000,
      profit: 15012000,
      profitPct: 8.0,
    },
    bus: {
      label: "Bus",
      revenue: 62145000,
      cost: 58416300,
      profit: 3728700,
      profitPct: 6.0,
    },
    hotel: {
      label: "Hotel",
      revenue: 89320000,
      cost: 78601600,
      profit: 10718400,
      profitPct: 12.0,
    },
  };

  const fd = financeData[activeService];

  const monthlySrc =
    activeService === "train"
      ? dashboardData.monthlyTrend
      : activeService === "flight"
        ? flightData.monthlyTrend
        : activeService === "bus"
          ? busData.monthlyTrend
          : hotelData.monthlyTrend;

  const monthlyFinance = monthlySrc.map((d) => ({
    label: formatMonthLabel(d.month),
    revenue: Math.round(d.revenue / 100000),
    profit: Math.round((d.revenue * fd.profitPct) / 100 / 100000),
  }));

  const billStatus: Record<ServiceType, { name: string; value: number }[]> = {
    train: dashboardData.billStatus,
    flight: [
      { name: "Confirmed", value: 8066 },
      { name: "Cancelled", value: 354 },
    ],
    bus: [
      { name: "Confirmed", value: 11662 },
      { name: "Cancelled", value: 718 },
    ],
    hotel: [
      { name: "Confirmed", value: 5466 },
      { name: "Cancelled", value: 374 },
    ],
  };

  return (
    <>
      {/* Finance KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <XlKpiCard
          label="Total Revenue"
          value={formatINR(fd.revenue)}
          sub="Gross"
          icon={<IndianRupee size={14} />}
          accentColor={svc.accent}
        />
        <XlKpiCard
          label="Total Cost"
          value={formatINR(fd.cost)}
          sub="Operational"
          icon={<Receipt size={14} />}
          accentColor="#f43f5e"
        />
        <XlKpiCard
          label="Net Profit"
          value={formatINR(fd.profit)}
          sub={`${fd.profitPct}% margin`}
          icon={<TrendingUp size={14} />}
          accentColor="#10b981"
        />
        <XlKpiCard
          label="Profit %"
          value={`${fd.profitPct}%`}
          sub="FY 2025-26"
          icon={<BarChart3 size={14} />}
          accentColor="#f59e0b"
        />
      </div>

      {/* Monthly Revenue & Profit */}
      <XlChartBox title="Monthly Revenue & Profit (₹ Lakhs)">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={monthlyFinance}
            margin={{ top: 4, right: 24, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f3f3" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#595959" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#595959" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${v}L`}
            />
            <Tooltip
              contentStyle={{
                border: "1px solid #d0d7de",
                fontSize: 11,
                borderRadius: 0,
              }}
              formatter={(v: number, n: string) => [`₹${v}L`, n]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar
              dataKey="revenue"
              name="Revenue (₹L)"
              fill={svc.accent}
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="profit"
              name="Profit (₹L)"
              fill="#10b981"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </XlChartBox>

      {/* Billing status */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <XlChartBox title="Booking Status">
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={billStatus[activeService]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                  fontSize={10}
                >
                  {billStatus[activeService].map((entry, idx) => (
                    <Cell
                      key={entry.name}
                      fill={CHART_COLORS[idx % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    border: "1px solid #d0d7de",
                    fontSize: 11,
                    borderRadius: 0,
                  }}
                  formatter={(v: number) => [v.toLocaleString(), "Count"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </XlChartBox>

        <XlChartBox title="Financial Summary Table">
          <XlTable
            headers={["Metric", "Value"]}
            accentColor={svc.accent}
            rows={[
              {
                key: "revenue",
                cells: ["Total Revenue", formatINR(fd.revenue)],
              },
              { key: "cost", cells: ["Total Cost", formatINR(fd.cost)] },
              { key: "profit", cells: ["Net Profit", formatINR(fd.profit)] },
              { key: "margin", cells: ["Profit Margin", `${fd.profitPct}%`] },
              {
                key: "bookings",
                cells: [
                  "Total Bookings",
                  activeService === "train"
                    ? "15,541"
                    : activeService === "flight"
                      ? "8,420"
                      : activeService === "bus"
                        ? "12,380"
                        : "5,840",
                ],
              },
            ]}
          />
        </XlChartBox>
      </div>
    </>
  );
}
