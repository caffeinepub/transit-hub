import {
  BarChart3,
  Bed,
  Bus,
  Calendar,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Filter,
  IndianRupee,
  MapPin,
  Plane,
  Plus,
  Receipt,
  RotateCcw,
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
// ── Month config ─────────────────────────────────────────────────────────────

const MONTHS = [
  { label: "Apr 2025", value: "2025-04" },
  { label: "May 2025", value: "2025-05" },
  { label: "Jun 2025", value: "2025-06" },
  { label: "Jul 2025", value: "2025-07" },
  { label: "Aug 2025", value: "2025-08" },
  { label: "Sep 2025", value: "2025-09" },
  { label: "Oct 2025", value: "2025-10" },
  { label: "Nov 2025", value: "2025-11" },
  { label: "Dec 2025", value: "2025-12" },
  { label: "Jan 2026", value: "2026-01" },
  { label: "Feb 2026", value: "2026-02" },
  { label: "Mar 2026", value: "2026-03" },
];

type QuickFilter = "Q1" | "Q2" | "Q3" | "Q4" | "All";

function useMonthFilter() {
  const [fromIdx, setFromIdx] = useState(0);
  const [toIdx, setToIdx] = useState(11);
  const [activeQuick, setActiveQuick] = useState<QuickFilter>("All");

  const applyQuick = (q: QuickFilter) => {
    setActiveQuick(q);
    if (q === "Q1") {
      setFromIdx(0);
      setToIdx(2);
    } else if (q === "Q2") {
      setFromIdx(3);
      setToIdx(5);
    } else if (q === "Q3") {
      setFromIdx(6);
      setToIdx(8);
    } else if (q === "Q4") {
      setFromIdx(9);
      setToIdx(11);
    } else {
      setFromIdx(0);
      setToIdx(11);
    }
  };

  const reset = () => applyQuick("All");

  function filterTrend<T extends { month: string }>(data: T[]): T[] {
    return data.filter((d) => {
      const idx = MONTHS.findIndex((m) => m.value === d.month);
      return idx >= fromIdx && idx <= toIdx;
    });
  }

  return {
    fromIdx,
    toIdx,
    setFromIdx,
    setToIdx,
    activeQuick,
    applyQuick,
    reset,
    filterTrend,
  };
}

function FilterBar({
  accentColor,
  fromIdx,
  toIdx,
  setFromIdx,
  setToIdx,
  activeQuick,
  applyQuick,
  reset,
}: {
  accentColor: string;
  fromIdx: number;
  toIdx: number;
  setFromIdx: (i: number) => void;
  setToIdx: (i: number) => void;
  activeQuick: QuickFilter;
  applyQuick: (q: QuickFilter) => void;
  reset: () => void;
}) {
  const quickFilters: QuickFilter[] = ["Q1", "Q2", "Q3", "Q4", "All"];
  const _quickLabels: Record<QuickFilter, string> = {
    Q1: "Q1 Apr–Jun",
    Q2: "Q2 Jul–Sep",
    Q3: "Q3 Oct–Dec",
    Q4: "Q4 Jan–Mar",
    All: "All Months",
  };
  return (
    <div
      className="rounded-xl p-3 flex flex-wrap items-center gap-3 mb-1"
      style={{
        background: "linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)",
        border: `1.5px solid ${accentColor}40`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
      data-ocid="filter.panel"
    >
      <div className="flex items-center gap-1.5">
        <Filter size={13} style={{ color: accentColor }} />
        <span
          className="text-[11px] font-bold uppercase tracking-wide"
          style={{ color: accentColor }}
        >
          Filters
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <Calendar size={12} className="text-gray-400" />
        <select
          data-ocid="filter.from.select"
          value={fromIdx}
          onChange={(e) => {
            setFromIdx(Number(e.target.value));
            applyQuick("All");
          }}
          className="text-[11px] border rounded-lg px-2 py-1 bg-white text-gray-700 cursor-pointer outline-none focus:ring-2"
          style={
            {
              borderColor: `${accentColor}60`,
              focusRingColor: accentColor,
            } as React.CSSProperties
          }
        >
          {MONTHS.slice(0, toIdx + 1).map((m, i) => (
            <option key={m.value} value={i}>
              {m.label}
            </option>
          ))}
        </select>
        <span className="text-[11px] text-gray-400">→</span>
        <select
          data-ocid="filter.to.select"
          value={toIdx}
          onChange={(e) => {
            setToIdx(Number(e.target.value));
            applyQuick("All");
          }}
          className="text-[11px] border rounded-lg px-2 py-1 bg-white text-gray-700 cursor-pointer outline-none focus:ring-2"
          style={{ borderColor: `${accentColor}60` } as React.CSSProperties}
        >
          {MONTHS.slice(fromIdx).map((m, i) => (
            <option key={m.value} value={fromIdx + i}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-1">
        {quickFilters.map((q) => (
          <button
            key={q}
            type="button"
            data-ocid={`filter.${q.toLowerCase()}.button`}
            onClick={() => applyQuick(q)}
            className="text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all"
            style={
              activeQuick === q
                ? {
                    backgroundColor: accentColor,
                    color: "#fff",
                    borderColor: accentColor,
                  }
                : {
                    backgroundColor: "#fff",
                    color: accentColor,
                    borderColor: `${accentColor}60`,
                  }
            }
          >
            {q === "All" ? "All" : q}
          </button>
        ))}
      </div>
      <div className="ml-auto">
        <button
          type="button"
          data-ocid="filter.reset.button"
          onClick={reset}
          className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 transition-all"
        >
          <RotateCcw size={10} />
          Reset
        </button>
      </div>
    </div>
  );
}

// ── Canvas chart helpers for Excel export ────────────────────────────────────

// ── Excel Export (ExcelJS CDN) ────────────────────────────────────────────────

declare global {
  interface Window {
    ExcelJS: any;
  }
}

async function loadExcelJS(): Promise<any> {
  if (window.ExcelJS) return window.ExcelJS;
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js";
    script.onload = () => resolve(window.ExcelJS);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

type CellBorder = { style: "thin" | "medium" | "thick" };
type FullBorder = {
  top: CellBorder;
  left: CellBorder;
  bottom: CellBorder;
  right: CellBorder;
};

const THIN_BORDER: FullBorder = {
  top: { style: "thin" },
  left: { style: "thin" },
  bottom: { style: "thin" },
  right: { style: "thin" },
};

function applyServiceSheet(
  ws: any,
  serviceLabel: string,
  titleColor: string,
  kpiLightBg: string,
  kpis: { label: string; value: string | number }[],
  monthly: { month: string; bookings: number; revenue: number }[],
  table2: { header: string; rows: (string | number)[][] },
  table3: { header: string; rows: (string | number)[][] },
) {
  // Column widths
  ws.getColumn("A").width = 25;
  ws.getColumn("B").width = 18;
  ws.getColumn("C").width = 22;
  ws.getColumn("D").width = 18;
  ws.getColumn("E").width = 18;
  ws.getColumn("F").width = 18;

  // Row 1: Title
  ws.mergeCells("A1:F1");
  const titleCell = ws.getCell("A1");
  titleCell.value = serviceLabel;
  titleCell.font = { bold: true, size: 18, color: { argb: "FFFFFFFF" } };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: titleColor },
  };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(1).height = 42;

  // Row 2: empty spacer
  ws.getRow(2).height = 8;

  // KPI cards rows 3-6
  // kpiLightBg is passed in per-service
  const kpiPositions = ["A3", "C3", "E3", "A5"];
  const kpiMerges = ["A3:B4", "C3:D4", "E3:F4", "A5:B6"];
  kpis.forEach((kpi, i) => {
    ws.mergeCells(kpiMerges[i]);
    const cell = ws.getCell(kpiPositions[i]);
    cell.value = `${kpi.label}\n${kpi.value}`;
    cell.font = { bold: true, size: 13, color: { argb: "FF1e1b4b" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: kpiLightBg },
    };
    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
    cell.border = THIN_BORDER;
    ws.getRow(i < 3 ? 3 : 5).height = 28;
    ws.getRow(i < 3 ? 4 : 6).height = 28;
  });

  // Add Quarter Filter visual rows (rows 7-8)
  ws.mergeCells("A7:B7");
  const qfLabel = ws.getCell("A7");
  qfLabel.value = "Filter by Quarter:";
  qfLabel.font = { bold: true, size: 10, color: { argb: titleColor } };
  qfLabel.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: kpiLightBg },
  };
  qfLabel.alignment = { horizontal: "left", vertical: "middle" };
  ws.getRow(7).height = 20;

  const quarterLabels = [
    "Q1: Apr–Jun",
    "Q2: Jul–Sep",
    "Q3: Oct–Dec",
    "Q4: Jan–Mar",
    "All Months",
  ];
  quarterLabels.forEach((ql, qi) => {
    const cell = ws.getRow(7).getCell(3 + qi);
    cell.value = ql;
    cell.font = { bold: true, size: 9, color: { argb: titleColor } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: kpiLightBg },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = THIN_BORDER;
  });

  ws.mergeCells("A8:H8");
  const qfNote = ws.getCell("A8");
  qfNote.value =
    "ℹ️  Use Excel AutoFilter dropdowns (▼) in the header rows below to filter data by month, bookings, or revenue";
  qfNote.font = { italic: true, size: 9, color: { argb: "FF64748b" } };
  qfNote.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFf8faff" },
  };
  qfNote.alignment = { horizontal: "left", vertical: "middle" };
  ws.getRow(8).height = 18;

  let currentRow = 10;
  let firstTableHeaderRow = -1;
  let firstTableHeaderCols = 3;

  function addTable(
    sectionTitle: string,
    headers: string[],
    rows: (string | number)[][],
    headerColor: string,
  ) {
    // Section header
    ws.mergeCells(`A${currentRow}:F${currentRow}`);
    const secCell = ws.getCell(`A${currentRow}`);
    secCell.value = sectionTitle;
    secCell.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
    secCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: headerColor },
    };
    secCell.alignment = { horizontal: "left", vertical: "middle" };
    ws.getRow(currentRow).height = 24;
    currentRow++;

    // Column headers
    const colHeaderRow = currentRow;
    if (firstTableHeaderRow === -1) {
      firstTableHeaderRow = colHeaderRow;
      firstTableHeaderCols = headers.length;
    }
    const headerRow = ws.getRow(currentRow);
    headers.forEach((h, ci) => {
      const cell = headerRow.getCell(ci + 1);
      cell.value = h;
      cell.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: titleColor },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = THIN_BORDER;
    });
    ws.getRow(currentRow).height = 22;
    currentRow++;

    // Data rows
    rows.forEach((rowData, ri) => {
      const dataRow = ws.getRow(currentRow);
      const isAlt = ri % 2 === 1;
      rowData.forEach((val, ci) => {
        const cell = dataRow.getCell(ci + 1);
        cell.value = val;
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: isAlt ? "FFf5f3ff" : "FFFFFFFF" },
        };
        cell.border = THIN_BORDER;
        if (typeof val === "number" && ci === 2) {
          cell.numFmt = "₹#,##0";
        }
        cell.alignment = { vertical: "middle" };
      });
      ws.getRow(currentRow).height = 20;
      currentRow++;
    });

    currentRow += 2; // spacer
  }

  addTable(
    "📅 Monthly Trend",
    ["Month", "Bookings", "Revenue (₹)"],
    monthly.map((d) => [formatMonthLabel(d.month), d.bookings, d.revenue]),
    titleColor,
  );

  addTable(
    table2.header,
    table2.header.includes("Client")
      ? ["Client", "Bookings", "Revenue (₹)"]
      : ["Name", "Bookings"],
    table2.rows,
    titleColor,
  );
  addTable(
    table3.header,
    ["Route / Name", "Count / Bookings"],
    table3.rows,
    titleColor,
  );

  // Set autoFilter on first table's header row
  if (firstTableHeaderRow > 0) {
    ws.autoFilter = {
      from: { row: firstTableHeaderRow, column: 1 },
      to: { row: currentRow - 1, column: firstTableHeaderCols },
    };
  }

  // Freeze panes: freeze title + KPI + filter rows (first 9 rows)
  ws.views = [{ state: "frozen", ySplit: 9 }];
}

async function exportDashboardToExcel() {
  const ExcelJS = await loadExcelJS();
  const wb = new ExcelJS.Workbook();
  wb.creator = "Analytics Dashboard";
  wb.created = new Date();

  // ── Summary Sheet ─────────────────────────────────────────────────────────
  const ws0 = wb.addWorksheet("Summary");
  ws0.getColumn("A").width = 22;
  ws0.getColumn("B").width = 16;
  ws0.getColumn("C").width = 22;
  ws0.getColumn("D").width = 14;
  ws0.getColumn("E").width = 18;
  ws0.getColumn("F").width = 20;

  // Title
  ws0.mergeCells("A1:F1");
  const t = ws0.getCell("A1");
  t.value = "📊 ANALYTICS DASHBOARD SUMMARY";
  t.font = { bold: true, size: 20, color: { argb: "FFFFFFFF" } };
  t.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1e1b4b" } };
  t.alignment = { horizontal: "center", vertical: "middle" };
  ws0.getRow(1).height = 48;

  ws0.mergeCells("A2:F2");
  const sub = ws0.getCell("A2");
  sub.value = "FY 2025–2026  |  All Services Overview";
  sub.font = { bold: false, size: 12, color: { argb: "FFc7d2fe" } };
  sub.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF312e81" },
  };
  sub.alignment = { horizontal: "center", vertical: "middle" };
  ws0.getRow(2).height = 28;

  ws0.getRow(3).height = 10;

  // Headers row 4
  const hRow = ws0.getRow(4);
  [
    "Service",
    "Bookings",
    "Revenue (₹)",
    "Profit %",
    "Avg/Booking",
    "Period",
  ].forEach((h, i) => {
    const c = hRow.getCell(i + 1);
    c.value = h;
    c.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } };
    c.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4f46e5" },
    };
    c.alignment = { horizontal: "center", vertical: "middle" };
    c.border = THIN_BORDER;
  });
  ws0.getRow(4).height = 24;

  const services = [
    {
      name: "🚂 Train",
      bookings: 15541,
      revenue: 24218319,
      profit: "10.4%",
      avg: "₹1,558",
      color: "FFe0e7ff",
      nameColor: "FF4f46e5",
    },
    {
      name: "✈️ Flight",
      bookings: 8420,
      revenue: 187650000,
      profit: "8%",
      avg: "₹22,286",
      color: "FFe0f2fe",
      nameColor: "FF0284c7",
    },
    {
      name: "🚌 Bus",
      bookings: 12380,
      revenue: 62145000,
      profit: "6%",
      avg: "₹5,020",
      color: "FFd1fae5",
      nameColor: "FF059669",
    },
    {
      name: "🏨 Hotel",
      bookings: 5840,
      revenue: 89320000,
      profit: "12%",
      avg: "₹15,295",
      color: "FFfef3c7",
      nameColor: "FFd97706",
    },
  ];

  let totalBookings = 0;
  let totalRevenue = 0;
  services.forEach((s, i) => {
    const row = ws0.getRow(5 + i);
    const vals = [
      s.name,
      s.bookings,
      s.revenue,
      s.profit,
      s.avg,
      "Apr 2025 – Mar 2026",
    ];
    vals.forEach((v, ci) => {
      const c = row.getCell(ci + 1);
      c.value = v;
      c.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: s.color },
      };
      c.border = THIN_BORDER;
      if (ci === 0) {
        c.font = { bold: true, color: { argb: s.nameColor } };
      }
      if (ci === 2 && typeof v === "number") c.numFmt = "₹#,##0";
      c.alignment = { vertical: "middle" };
    });
    row.height = 22;
    totalBookings += s.bookings;
    totalRevenue += s.revenue;
  });

  // Total row
  const totRow = ws0.getRow(9);
  ["TOTAL", totalBookings, totalRevenue, "", "", ""].forEach((v, i) => {
    const c = totRow.getCell(i + 1);
    c.value = v;
    c.font = { bold: true, size: 12, color: { argb: "FF1e1b4b" } };
    c.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFc7d2fe" },
    };
    c.border = THIN_BORDER;
    if (i === 2 && typeof v === "number") c.numFmt = "₹#,##0";
  });
  totRow.height = 24;

  // Service Breakdown section
  ws0.getRow(11).height = 10;
  ws0.mergeCells("A12:F12");
  const brkTitle = ws0.getCell("A12");
  brkTitle.value = "SERVICE BREAKDOWN — Share of Total";
  brkTitle.font = { bold: true, size: 13, color: { argb: "FFFFFFFF" } };
  brkTitle.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1e1b4b" },
  };
  brkTitle.alignment = { horizontal: "center", vertical: "middle" };
  ws0.getRow(12).height = 26;

  const brkHRow = ws0.getRow(13);
  [
    "Service",
    "Bookings",
    "Bookings %",
    "Revenue (₹)",
    "Revenue %",
    "Profit %",
  ].forEach((h, i) => {
    const c = brkHRow.getCell(i + 1);
    c.value = h;
    c.font = { bold: true, color: { argb: "FFFFFFFF" } };
    c.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4f46e5" },
    };
    c.border = THIN_BORDER;
    c.alignment = { horizontal: "center" };
  });
  ws0.getRow(13).height = 22;

  services.forEach((s, i) => {
    const row = ws0.getRow(14 + i);
    const bPct = `${((s.bookings / totalBookings) * 100).toFixed(1)}%`;
    const rPct = `${((s.revenue / totalRevenue) * 100).toFixed(1)}%`;
    [s.name, s.bookings, bPct, s.revenue, rPct, s.profit].forEach((v, ci) => {
      const c = row.getCell(ci + 1);
      c.value = v;
      c.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: i % 2 === 0 ? "FFf5f3ff" : "FFFFFFFF" },
      };
      c.border = THIN_BORDER;
      if (ci === 3 && typeof v === "number") c.numFmt = "₹#,##0";
      c.alignment = { vertical: "middle" };
    });
    row.height = 20;
  });

  // Add autoFilter and freeze on summary sheet
  ws0.autoFilter = {
    from: { row: 4, column: 1 },
    to: { row: 8, column: 6 },
  };
  ws0.views = [{ state: "frozen", ySplit: 4 }];

  // ── Service Sheets ────────────────────────────────────────────────────────
  const ws1 = wb.addWorksheet("Train");
  applyServiceSheet(
    ws1,
    "🚂 TRAIN BOOKING DASHBOARD",
    "FF6366f1",
    "FFe0e7ff",
    [
      { label: "Total Bookings", value: "15,541" },
      { label: "Total Revenue", value: "₹2.42 Cr" },
      { label: "Profit %", value: "10.4%" },
      { label: "Avg/Booking", value: "₹1,558" },
    ],
    dashboardData.monthlyTrend,
    {
      header: "👥 Top Clients",
      rows: dashboardData.topClients.map((c: any) => [
        c.name,
        c.bookings,
        c.revenue,
      ]),
    },
    {
      header: "🗺️ Top Routes",
      rows: dashboardData.topRoutes.map((r: any) => [r.route, r.count]),
    },
  );

  const ws2 = wb.addWorksheet("Flight");
  applyServiceSheet(
    ws2,
    "✈️ FLIGHT BOOKING DASHBOARD",
    "FF0ea5e9",
    "FFe0f2fe",
    [
      { label: "Total Bookings", value: "8,420" },
      { label: "Total Revenue", value: "₹18.77 Cr" },
      { label: "Profit %", value: "8%" },
      { label: "Avg/Booking", value: "₹22,286" },
    ],
    flightData.monthlyTrend,
    {
      header: "✈️ Top Airlines",
      rows: flightData.topAirlines.map((a: any) => [a.name, a.bookings]),
    },
    {
      header: "🗺️ Top Routes",
      rows: flightData.topRoutes.map((r: any) => [r.route, r.count]),
    },
  );

  const ws3 = wb.addWorksheet("Bus");
  applyServiceSheet(
    ws3,
    "🚌 BUS BOOKING DASHBOARD",
    "FF10b981",
    "FFd1fae5",
    [
      { label: "Total Bookings", value: "12,380" },
      { label: "Total Revenue", value: "₹6.21 Cr" },
      { label: "Profit %", value: "6%" },
      { label: "Avg/Booking", value: "₹5,020" },
    ],
    busData.monthlyTrend,
    {
      header: "🚌 Top Operators",
      rows: busData.topOperators.map((o: any) => [o.name, o.bookings]),
    },
    {
      header: "🗺️ Top Routes",
      rows: busData.topRoutes.map((r: any) => [r.route, r.count]),
    },
  );

  const ws4 = wb.addWorksheet("Hotel");
  applyServiceSheet(
    ws4,
    "🏨 HOTEL BOOKING DASHBOARD",
    "FFf59e0b",
    "FFfef3c7",
    [
      { label: "Total Bookings", value: "5,840" },
      { label: "Total Revenue", value: "₹8.93 Cr" },
      { label: "Profit %", value: "12%" },
      { label: "Avg/Booking", value: "₹15,295" },
    ],
    hotelData.monthlyTrend,
    {
      header: "🏙️ Top Cities",
      rows: hotelData.topCities.map((c: any) => [c.name, c.bookings]),
    },
    {
      header: "🏨 Top Hotels",
      rows: hotelData.topHotels.map((h: any) => [h.route, h.count]),
    },
  );

  // Download
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "analytics-dashboard.xlsx";
  a.click();
  URL.revokeObjectURL(url);
}

// ── UI Primitives ─────────────────────────────────────────────────────────────

function XlKpiCard({
  label,
  value,
  sub,
  icon,
  accentColor,
  trend,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accentColor: string;
  trend?: string;
}) {
  // Build gradient from accent color
  const hexToRgb = (hex: string) => {
    const r = Number.parseInt(hex.slice(1, 3), 16);
    const g = Number.parseInt(hex.slice(3, 5), 16);
    const b = Number.parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
  };
  const rgb = hexToRgb(accentColor.startsWith("#") ? accentColor : "#6366f1");
  return (
    <div
      className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all cursor-default"
      style={{
        background: `linear-gradient(135deg, ${accentColor} 0%, rgba(${rgb},0.75) 100%)`,
      }}
    >
      <div className="px-4 py-3 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest truncate">
            {label}
          </span>
          <span className="text-white/70">{icon}</span>
        </div>
        <p className="text-2xl font-extrabold text-white leading-tight tracking-tight">
          {value}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {sub && <p className="text-[10px] text-white/70">{sub}</p>}
          {trend && (
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-white/90 bg-white/20 rounded-full px-1.5 py-0.5">
              <TrendingUp size={9} />
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function XlChartBox({
  title,
  children,
  accentColor,
}: {
  title: string;
  children: React.ReactNode;
  accentColor?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div
        className="flex items-center px-4 py-2.5 border-b border-gray-100"
        style={
          accentColor
            ? { borderLeft: `3px solid ${accentColor}`, paddingLeft: "12px" }
            : {}
        }
      >
        <span className="text-[12px] font-bold text-gray-700 tracking-wide">
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
  const {
    fromIdx,
    toIdx,
    setFromIdx,
    setToIdx,
    activeQuick,
    applyQuick,
    reset,
    filterTrend,
  } = useMonthFilter();

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
    return filterTrend(src).map((d) => ({
      label: formatMonthLabel(d.month),
      bookings: d.bookings,
      revL: Math.round(d.revenue / 100000),
      month: d.month,
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
      {/* Filter Bar */}
      <FilterBar
        accentColor={svc.accent}
        fromIdx={fromIdx}
        toIdx={toIdx}
        setFromIdx={setFromIdx}
        setToIdx={setToIdx}
        activeQuick={activeQuick}
        applyQuick={applyQuick}
        reset={reset}
      />

      {/* KPI Cards */}
      <section data-ocid="kpi.section">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {kpiCards[activeService].map((card, i) => (
            <XlKpiCard
              key={card.label}
              label={card.label}
              value={card.value}
              sub={card.sub}
              icon={card.icon}
              accentColor={card.accent}
              trend={i === 0 ? "+4.2%" : i === 1 ? "+8.2%" : undefined}
            />
          ))}
        </div>
      </section>

      {/* Monthly Trend */}
      <section data-ocid="trend.section">
        <XlChartBox
          title="Monthly Booking & Revenue Trend"
          accentColor={svc.accent}
        >
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart
              data={trendData}
              margin={{ top: 10, right: 24, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id={`revGrad-${activeService}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={svc.accent} stopOpacity={0.35} />
                  <stop
                    offset="95%"
                    stopColor={svc.accent}
                    stopOpacity={0.02}
                  />
                </linearGradient>
                <linearGradient id="bkgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v}L`}
              />
              <Tooltip
                contentStyle={{
                  border: "1px solid #e5e7eb",
                  fontSize: 11,
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
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
                fill={`url(#revGrad-${activeService})`}
                stroke={svc.accent}
                strokeWidth={2.5}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="bookings"
                name="Bookings"
                fill="url(#bkgGrad)"
                stroke="#10b981"
                strokeWidth={2.5}
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

        <XlChartBox title={distLabel[activeService]} accentColor={svc.accent}>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={distData[activeService]}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="value"
                  paddingAngle={2}
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
                    border: "1px solid #e5e7eb",
                    fontSize: 11,
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  formatter={(v: number) => [v.toLocaleString(), "Bookings"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </XlChartBox>
      </div>

      {/* Top routes */}
      <XlChartBox title={routeLabel[activeService]} accentColor={svc.accent}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={routeData[activeService]}
            layout="vertical"
            margin={{ top: 4, right: 40, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="route"
              width={150}
              tick={{ fontSize: 9, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                border: "1px solid #e5e7eb",
                fontSize: 11,
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              formatter={(v: number) => [v.toLocaleString(), "Bookings"]}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]}>
              {routeData[activeService].map((entry, idx) => (
                <Cell
                  key={entry.route}
                  fill={CHART_COLORS[idx % CHART_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </XlChartBox>

      {/* All-services financial summary */}
      <XlChartBox
        title="Financial Summary — All Services"
        accentColor="#217346"
      >
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

      {/* Service Comparison */}
      <section data-ocid="service_comparison.section">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <XlChartBox
            title="Service Comparison — Bookings"
            accentColor="#6366f1"
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={[
                  { service: "Train", bookings: 15541, fill: "#6366f1" },
                  { service: "Flight", bookings: 8420, fill: "#0ea5e9" },
                  { service: "Bus", bookings: 12380, fill: "#10b981" },
                  { service: "Hotel", bookings: 5840, fill: "#f59e0b" },
                ]}
                margin={{ top: 10, right: 24, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="service"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    border: "1px solid #e5e7eb",
                    fontSize: 11,
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  formatter={(v: number) => [v.toLocaleString(), "Bookings"]}
                />
                <Bar dataKey="bookings" radius={[6, 6, 0, 0]}>
                  {[
                    { svc: "train", fill: "#6366f1" },
                    { svc: "flight", fill: "#0ea5e9" },
                    { svc: "bus", fill: "#10b981" },
                    { svc: "hotel", fill: "#f59e0b" },
                  ].map((entry) => (
                    <Cell key={entry.svc} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </XlChartBox>

          <XlChartBox
            title="Revenue Distribution Across Services"
            accentColor="#f59e0b"
          >
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Train", value: 24218319 },
                    { name: "Flight", value: 187650000 },
                    { name: "Bus", value: 62145000 },
                    { name: "Hotel", value: 89320000 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="value"
                  paddingAngle={3}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                  fontSize={10}
                >
                  {[
                    { name: "train", color: "#6366f1" },
                    { name: "flight", color: "#0ea5e9" },
                    { name: "bus", color: "#10b981" },
                    { name: "hotel", color: "#f59e0b" },
                  ].map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    border: "1px solid #e5e7eb",
                    fontSize: 11,
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  formatter={(v: number) => [formatINR(v), "Revenue"]}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </XlChartBox>
        </div>
      </section>
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
  const {
    fromIdx,
    toIdx,
    setFromIdx,
    setToIdx,
    activeQuick,
    applyQuick,
    reset,
    filterTrend,
  } = useMonthFilter();

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

  const monthlyFinance = filterTrend(monthlySrc).map((d) => ({
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
      {/* Filter Bar */}
      <FilterBar
        accentColor={svc.accent}
        fromIdx={fromIdx}
        toIdx={toIdx}
        setFromIdx={setFromIdx}
        setToIdx={setToIdx}
        activeQuick={activeQuick}
        applyQuick={applyQuick}
        reset={reset}
      />
      {/* Finance KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
      <XlChartBox
        title="Monthly Revenue & Profit (₹ Lakhs)"
        accentColor={svc.accent}
      >
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart
            data={monthlyFinance}
            margin={{ top: 10, right: 24, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id={`finRevGrad-${activeService}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={svc.accent} stopOpacity={0.35} />
                <stop offset="95%" stopColor={svc.accent} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="finProfGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${v}L`}
            />
            <Tooltip
              contentStyle={{
                border: "1px solid #e5e7eb",
                fontSize: 11,
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              formatter={(v: number, n: string) => [`₹${v}L`, n]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenue (₹L)"
              fill={`url(#finRevGrad-${activeService})`}
              stroke={svc.accent}
              strokeWidth={2.5}
            />
            <Area
              type="monotone"
              dataKey="profit"
              name="Profit (₹L)"
              fill="url(#finProfGrad)"
              stroke="#10b981"
              strokeWidth={2.5}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </XlChartBox>

      {/* Billing status */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <XlChartBox title="Booking Status" accentColor={svc.accent}>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={billStatus[activeService]}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
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
                    border: "1px solid #e5e7eb",
                    fontSize: 11,
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
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
