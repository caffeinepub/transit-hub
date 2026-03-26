// @ts-ignore
import type ExcelJS from "exceljs";
import {
  BarChart3,
  Bed,
  Bus,
  Download,
  FileText,
  Filter,
  IndianRupee,
  MapPin,
  Maximize2,
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

// ── Excel Canvas Chart Renderers (for export) ────────────────────────────────

function renderBarChartToBase64(
  labels: string[],
  values: number[],
  title: string,
  barColor: string,
  width = 800,
  height = 420,
): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const padLeft = 80;
  const padRight = 30;
  const padTop = 50;
  const padBottom = 60;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#1f2937";
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "center";
  ctx.fillText(title, width / 2, 30);

  const maxVal = Math.max(...values, 1);
  const barCount = labels.length;
  const barW = (chartW / barCount) * 0.6;
  const gap = chartW / barCount;

  const gridLines = 5;
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  for (let i = 0; i <= gridLines; i++) {
    const y = padTop + chartH - (i / gridLines) * chartH;
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(padLeft + chartW, y);
    ctx.stroke();
    ctx.fillStyle = "#6b7280";
    ctx.font = "11px Arial";
    ctx.textAlign = "right";
    const labelVal = (maxVal * i) / gridLines;
    ctx.fillText(
      labelVal >= 1000000
        ? `${(labelVal / 1000000).toFixed(1)}M`
        : labelVal >= 1000
          ? `${(labelVal / 1000).toFixed(0)}K`
          : labelVal.toFixed(0),
      padLeft - 6,
      y + 4,
    );
  }

  ctx.strokeStyle = "#9ca3af";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(padLeft, padTop);
  ctx.lineTo(padLeft, padTop + chartH);
  ctx.lineTo(padLeft + chartW, padTop + chartH);
  ctx.stroke();

  values.forEach((val, i) => {
    const x = padLeft + i * gap + (gap - barW) / 2;
    const barH = (val / maxVal) * chartH;
    const y = padTop + chartH - barH;
    ctx.fillStyle = barColor;
    ctx.fillRect(x, y, barW, barH);

    ctx.fillStyle = "#374151";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    const lbl =
      labels[i].length > 10 ? `${labels[i].slice(0, 10)}\u2026` : labels[i];
    ctx.fillText(lbl, x + barW / 2, padTop + chartH + 18);

    if (barH > 20) {
      ctx.fillStyle = "#fff";
      ctx.font = "bold 10px Arial";
      ctx.fillText(
        val >= 1000000
          ? `${(val / 1000000).toFixed(1)}M`
          : val >= 1000
            ? `${(val / 1000).toFixed(0)}K`
            : val.toString(),
        x + barW / 2,
        y + 14,
      );
    }
  });

  return canvas.toDataURL("image/png").split(",")[1];
}

function renderPieChartToBase64(
  labels: string[],
  values: number[],
  title: string,
  colors: string[],
  width = 600,
  height = 400,
): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#1f2937";
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "center";
  ctx.fillText(title, width / 2, 28);

  const total = values.reduce((a, b) => a + b, 0);
  const cx = 200;
  const cy = 210;
  const r = 150;
  let startAngle = -Math.PI / 2;

  values.forEach((val, i) => {
    const slice = (val / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, startAngle + slice);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
    startAngle += slice;
  });

  const legendX = 420;
  let legendY = 80;
  labels.forEach((label, i) => {
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(legendX, legendY - 10, 14, 14);
    ctx.fillStyle = "#374151";
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    ctx.fillText(
      label.length > 14 ? `${label.slice(0, 14)}\u2026` : label,
      legendX + 20,
      legendY,
    );
    legendY += 24;
  });

  return canvas.toDataURL("image/png").split(",")[1];
}

// ── Excel Export ──────────────────────────────────────────────────────────────

async function exportDashboardToExcel() {
  // @ts-ignore
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "Dashboard App";
  wb.created = new Date();

  function styleHeader(row: ExcelJS.Row, bgColor: string) {
    row.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: `FF${bgColor.replace("#", "")}` },
      };
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = { bottom: { style: "thin", color: { argb: "FFD1D5DB" } } };
    });
  }

  function styleAltRow(row: ExcelJS.Row, isEven: boolean, lightColor: string) {
    if (isEven) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: `FF${lightColor.replace("#", "")}` },
        };
      });
    }
  }

  function addMonthlySheet(
    name: string,
    data: { month: string; bookings: number; revenue: number }[],
    accentColor: string,
    altColor: string,
  ): ExcelJS.Worksheet {
    const ws = wb.addWorksheet(name);
    ws.columns = [
      { header: "Month", key: "month", width: 15 },
      { header: "Bookings", key: "bookings", width: 14 },
      { header: "Revenue (\u20b9)", key: "revenue", width: 18 },
      { header: "MoM Change", key: "mom", width: 16 },
    ];
    styleHeader(ws.getRow(1), accentColor);
    ws.autoFilter = { from: "A1", to: "D1" };
    data.forEach((r, i) => {
      const prev = i > 0 ? data[i - 1].bookings : null;
      const mom =
        prev !== null
          ? `${(((r.bookings - prev) / prev) * 100).toFixed(1)}%`
          : "-";
      const row = ws.addRow({
        month: r.month,
        bookings: r.bookings,
        revenue: r.revenue,
        mom,
      });
      const revenueCell = row.getCell("revenue");
      revenueCell.numFmt = "\u20b9#,##0";
      styleAltRow(row, i % 2 === 1, altColor);
    });
    return ws;
  }

  function addSimpleSheet(
    name: string,
    headers: { header: string; key: string; width: number }[],
    data: Record<string, string | number>[],
    accentColor: string,
    altColor: string,
    revenueKey?: string,
  ): ExcelJS.Worksheet {
    const ws = wb.addWorksheet(name);
    ws.columns = headers;
    styleHeader(ws.getRow(1), accentColor);
    ws.autoFilter = {
      from: "A1",
      to: `${String.fromCharCode(64 + headers.length)}1`,
    };
    data.forEach((r, i) => {
      const row = ws.addRow(r);
      if (revenueKey) {
        const cell = row.getCell(revenueKey);
        cell.numFmt = "\u20b9#,##0";
      }
      styleAltRow(row, i % 2 === 1, altColor);
    });
    return ws;
  }

  // --- Sheet 1: Summary ---
  const summaryWs = wb.addWorksheet("Summary");
  summaryWs.mergeCells("A1:F1");
  const titleCell = summaryWs.getCell("A1");
  titleCell.value = "Dashboard Summary Report";
  titleCell.font = { bold: true, size: 16, color: { argb: "FF1F2937" } };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF3F4F6" },
  };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  summaryWs.getRow(1).height = 30;
  summaryWs.addRow([]);

  const summaryHeaderRow = summaryWs.addRow([
    "Service",
    "Total Bookings",
    "Total Revenue (\u20b9)",
    "Profit %",
    "Top Client/Airline/Operator",
    "Period",
  ]);
  summaryWs.columns = [
    { key: "service", width: 20 },
    { key: "bookings", width: 18 },
    { key: "revenue", width: 22 },
    { key: "profit", width: 12 },
    { key: "top", width: 28 },
    { key: "period", width: 20 },
  ];
  summaryWs.autoFilter = { from: "A3", to: "F3" };

  const serviceColors = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b"];
  const serviceAltColors = ["#eef2ff", "#f0f9ff", "#ecfdf5", "#fffbeb"];
  summaryHeaderRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: `FF${serviceColors[0].replace("#", "")}` },
    };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  const summaryData = [
    {
      service: "Train",
      bookings: dashboardData.kpis.totalBookings,
      revenue: dashboardData.kpis.totalRevenue,
      profit: "10.4%",
      top: dashboardData.topClients[0].name,
      period: "Apr 2025 \u2013 Mar 2026",
      altColor: serviceAltColors[0],
    },
    {
      service: "Flight",
      bookings: flightData.kpis.totalBookings,
      revenue: flightData.kpis.totalRevenue,
      profit: "8%",
      top: flightData.topAirlines[0].name,
      period: "Apr 2025 \u2013 Mar 2026",
      altColor: serviceAltColors[1],
    },
    {
      service: "Bus",
      bookings: busData.kpis.totalBookings,
      revenue: busData.kpis.totalRevenue,
      profit: "6%",
      top: busData.topOperators[0].name,
      period: "Apr 2025 \u2013 Mar 2026",
      altColor: serviceAltColors[2],
    },
    {
      service: "Hotel",
      bookings: hotelData.kpis.totalBookings,
      revenue: hotelData.kpis.totalRevenue,
      profit: "12%",
      top: hotelData.topHotels[0].route,
      period: "Apr 2025 \u2013 Mar 2026",
      altColor: serviceAltColors[3],
    },
  ];

  for (const d of summaryData) {
    const row = summaryWs.addRow({
      service: d.service,
      bookings: d.bookings,
      revenue: d.revenue,
      profit: d.profit,
      top: d.top,
      period: d.period,
    });
    row.getCell("revenue").numFmt = "\u20b9#,##0";
    row.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: `FF${d.altColor.replace("#", "")}` },
      };
    });
  }

  const summaryPieBase64 = renderPieChartToBase64(
    ["Train", "Flight", "Bus", "Hotel"],
    [
      dashboardData.kpis.totalRevenue,
      flightData.kpis.totalRevenue,
      busData.kpis.totalRevenue,
      hotelData.kpis.totalRevenue,
    ],
    "Revenue Distribution",
    ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b"],
    600,
    380,
  );
  const summaryPieId = wb.addImage({
    base64: summaryPieBase64,
    extension: "png",
  });
  summaryWs.addImage(summaryPieId, {
    tl: { col: 0, row: summaryWs.rowCount + 2 },
    ext: { width: 600, height: 380 },
  });

  const trainMonthlyWs = addMonthlySheet(
    "Train Monthly",
    dashboardData.monthlyTrend,
    "#6366f1",
    "#eef2ff",
  );
  const trainMonthlyChartBase64 = renderBarChartToBase64(
    dashboardData.monthlyTrend.map((d) => formatMonthLabel(d.month)),
    dashboardData.monthlyTrend.map((d) => d.bookings),
    "Monthly Bookings",
    "#6366f1",
    800,
    420,
  );
  const trainMonthlyImgId = wb.addImage({
    base64: trainMonthlyChartBase64,
    extension: "png",
  });
  trainMonthlyWs.addImage(trainMonthlyImgId, {
    tl: { col: 0, row: trainMonthlyWs.rowCount + 2 },
    ext: { width: 800, height: 420 },
  });

  const trainClientsWs = addSimpleSheet(
    "Train Clients",
    [
      { header: "Client Name", key: "name", width: 28 },
      { header: "Bookings", key: "bookings", width: 14 },
      { header: "Revenue (\u20b9)", key: "revenue", width: 18 },
      { header: "Share %", key: "share", width: 12 },
    ],
    dashboardData.topClients.map((r) => ({
      name: r.name,
      bookings: r.bookings,
      revenue: r.revenue,
      share: `${((r.bookings / dashboardData.kpis.totalBookings) * 100).toFixed(1)}%`,
    })),
    "#6366f1",
    "#eef2ff",
    "revenue",
  );
  const trainClientsChartBase64 = renderBarChartToBase64(
    dashboardData.topClients.map((d) => d.name),
    dashboardData.topClients.map((d) => d.bookings),
    "Top Bookings by Client",
    "#6366f1",
    800,
    380,
  );
  const trainClientsImgId = wb.addImage({
    base64: trainClientsChartBase64,
    extension: "png",
  });
  trainClientsWs.addImage(trainClientsImgId, {
    tl: { col: 0, row: trainClientsWs.rowCount + 2 },
    ext: { width: 800, height: 380 },
  });

  addSimpleSheet(
    "Train Routes",
    [
      { header: "Route", key: "route", width: 35 },
      { header: "Booking Count", key: "count", width: 16 },
    ],
    dashboardData.topRoutes.map((r) => ({ route: r.route, count: r.count })),
    "#6366f1",
    "#eef2ff",
  );

  const flightMonthlyWs = addMonthlySheet(
    "Flight Monthly",
    flightData.monthlyTrend,
    "#0ea5e9",
    "#f0f9ff",
  );
  const flightMonthlyChartBase64 = renderBarChartToBase64(
    flightData.monthlyTrend.map((d) => formatMonthLabel(d.month)),
    flightData.monthlyTrend.map((d) => d.bookings),
    "Monthly Bookings",
    "#0ea5e9",
    800,
    420,
  );
  const flightMonthlyImgId = wb.addImage({
    base64: flightMonthlyChartBase64,
    extension: "png",
  });
  flightMonthlyWs.addImage(flightMonthlyImgId, {
    tl: { col: 0, row: flightMonthlyWs.rowCount + 2 },
    ext: { width: 800, height: 420 },
  });

  const flightAirlinesWs = addSimpleSheet(
    "Flight Airlines",
    [
      { header: "Airline", key: "name", width: 24 },
      { header: "Bookings", key: "bookings", width: 14 },
    ],
    flightData.topAirlines.map((r) => ({ name: r.name, bookings: r.bookings })),
    "#0ea5e9",
    "#f0f9ff",
  );
  const flightAirlinesChartBase64 = renderBarChartToBase64(
    flightData.topAirlines.map((d) => d.name),
    flightData.topAirlines.map((d) => d.bookings),
    "Top Bookings by Airline",
    "#0ea5e9",
    800,
    380,
  );
  const flightAirlinesImgId = wb.addImage({
    base64: flightAirlinesChartBase64,
    extension: "png",
  });
  flightAirlinesWs.addImage(flightAirlinesImgId, {
    tl: { col: 0, row: flightAirlinesWs.rowCount + 2 },
    ext: { width: 800, height: 380 },
  });

  addSimpleSheet(
    "Flight Routes",
    [
      { header: "Route", key: "route", width: 30 },
      { header: "Count", key: "count", width: 14 },
    ],
    flightData.topRoutes.map((r) => ({ route: r.route, count: r.count })),
    "#0ea5e9",
    "#f0f9ff",
  );

  const busMonthlyWs = addMonthlySheet(
    "Bus Monthly",
    busData.monthlyTrend,
    "#10b981",
    "#ecfdf5",
  );
  const busMonthlyChartBase64 = renderBarChartToBase64(
    busData.monthlyTrend.map((d) => formatMonthLabel(d.month)),
    busData.monthlyTrend.map((d) => d.bookings),
    "Monthly Bookings",
    "#10b981",
    800,
    420,
  );
  const busMonthlyImgId = wb.addImage({
    base64: busMonthlyChartBase64,
    extension: "png",
  });
  busMonthlyWs.addImage(busMonthlyImgId, {
    tl: { col: 0, row: busMonthlyWs.rowCount + 2 },
    ext: { width: 800, height: 420 },
  });

  const busOperatorsWs = addSimpleSheet(
    "Bus Operators",
    [
      { header: "Operator", key: "name", width: 24 },
      { header: "Bookings", key: "bookings", width: 14 },
    ],
    busData.topOperators.map((r) => ({ name: r.name, bookings: r.bookings })),
    "#10b981",
    "#ecfdf5",
  );
  const busOperatorsChartBase64 = renderBarChartToBase64(
    busData.topOperators.map((d) => d.name),
    busData.topOperators.map((d) => d.bookings),
    "Top Bookings by Operator",
    "#10b981",
    800,
    380,
  );
  const busOperatorsImgId = wb.addImage({
    base64: busOperatorsChartBase64,
    extension: "png",
  });
  busOperatorsWs.addImage(busOperatorsImgId, {
    tl: { col: 0, row: busOperatorsWs.rowCount + 2 },
    ext: { width: 800, height: 380 },
  });

  addSimpleSheet(
    "Bus Routes",
    [
      { header: "Route", key: "route", width: 30 },
      { header: "Count", key: "count", width: 14 },
    ],
    busData.topRoutes.map((r) => ({ route: r.route, count: r.count })),
    "#10b981",
    "#ecfdf5",
  );

  const hotelMonthlyWs = addMonthlySheet(
    "Hotel Monthly",
    hotelData.monthlyTrend,
    "#f59e0b",
    "#fffbeb",
  );
  const hotelMonthlyChartBase64 = renderBarChartToBase64(
    hotelData.monthlyTrend.map((d) => formatMonthLabel(d.month)),
    hotelData.monthlyTrend.map((d) => d.bookings),
    "Monthly Bookings",
    "#f59e0b",
    800,
    420,
  );
  const hotelMonthlyImgId = wb.addImage({
    base64: hotelMonthlyChartBase64,
    extension: "png",
  });
  hotelMonthlyWs.addImage(hotelMonthlyImgId, {
    tl: { col: 0, row: hotelMonthlyWs.rowCount + 2 },
    ext: { width: 800, height: 420 },
  });

  const topHotelsWs = addSimpleSheet(
    "Top Hotels",
    [
      { header: "Hotel", key: "hotel", width: 28 },
      { header: "Bookings", key: "bookings", width: 14 },
    ],
    hotelData.topHotels.map((r) => ({ hotel: r.route, bookings: r.count })),
    "#f59e0b",
    "#fffbeb",
  );
  const topHotelsChartBase64 = renderBarChartToBase64(
    hotelData.topHotels.map((d) => d.route),
    hotelData.topHotels.map((d) => d.count),
    "Top Bookings by Hotel",
    "#f59e0b",
    800,
    380,
  );
  const topHotelsImgId = wb.addImage({
    base64: topHotelsChartBase64,
    extension: "png",
  });
  topHotelsWs.addImage(topHotelsImgId, {
    tl: { col: 0, row: topHotelsWs.rowCount + 2 },
    ext: { width: 800, height: 380 },
  });

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "dashboard-report.xlsx";
  a.click();
  URL.revokeObjectURL(url);
}

// ── Constants ─────────────────────────────────────────────────────────────────

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

// ── Excel-style Chart Container ───────────────────────────────────────────────

function XlChartBox({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[#d0d7de] bg-white">
      <div className="flex items-center justify-between px-3 py-2 bg-[#f3f3f3] border-b border-[#d0d7de]">
        <span className="text-xs font-bold text-[#1f2937] uppercase tracking-wide">
          {title}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="p-1 text-[#595959] hover:bg-[#e8f5e9] border border-transparent hover:border-[#d0d7de] rounded-sm"
          >
            <Filter size={11} />
          </button>
          <button
            type="button"
            className="p-1 text-[#595959] hover:bg-[#e8f5e9] border border-transparent hover:border-[#d0d7de] rounded-sm"
          >
            <Maximize2 size={11} />
          </button>
        </div>
      </div>
      <div className="p-4 bg-white">{children}</div>
    </div>
  );
}

// ── Excel KPI Card ────────────────────────────────────────────────────────────

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
      className="border border-[#d0d7de] bg-white hover:bg-[#e8f5e9] transition-colors cursor-default"
      style={{ borderTop: `3px solid ${accentColor}` }}
    >
      <div className="px-3 py-1.5 bg-[#f3f3f3] border-b border-[#d0d7de] flex items-center gap-1.5">
        <span className="text-[#595959]" style={{ color: accentColor }}>
          {icon}
        </span>
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

// ── Excel Table ───────────────────────────────────────────────────────────────

type XlRow = { key: string; cells: (string | number | React.ReactNode)[] };

function XlTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: XlRow[];
}) {
  return (
    <div className="border border-[#d0d7de] overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="px-3 py-2 text-left text-white font-bold border-r border-[#1a5c38] last:border-r-0"
                style={{ backgroundColor: "#217346" }}
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
              style={{ backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f9fafb" }}
            >
              {row.cells.map((cell, j) => (
                <td
                  key={headers[j] ?? j}
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

// ── Ribbon Button ─────────────────────────────────────────────────────────────

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
        className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-white rounded-sm border border-[#1a5c38] text-[10px] font-semibold hover:bg-[#1a5c38] transition-colors shadow-sm"
        style={{ backgroundColor: "#217346" }}
      >
        <span className="text-base">{icon}</span>
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
          ? "bg-white border-[#217346] text-[#217346] border-t-2"
          : "bg-transparent border-transparent text-[#595959] hover:bg-[#f3f3f3] hover:border-[#d0d7de]"
      }`}
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

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

  const statusBarStats: Record<ServiceType, { label: string; val: string }[]> =
    {
      train: [
        { label: "Bookings", val: "15,541" },
        { label: "Revenue", val: "₹2.42 Cr" },
        { label: "Profit", val: "10.4%" },
        { label: "Routes", val: "12" },
      ],
      flight: [
        { label: "Bookings", val: "8,420" },
        { label: "Revenue", val: "₹18.77 Cr" },
        { label: "Profit", val: "8%" },
        { label: "Airlines", val: "6" },
      ],
      bus: [
        { label: "Bookings", val: "12,380" },
        { label: "Revenue", val: "₹6.21 Cr" },
        { label: "Profit", val: "6%" },
        { label: "Operators", val: "7" },
      ],
      hotel: [
        { label: "Bookings", val: "5,840" },
        { label: "Revenue", val: "₹8.93 Cr" },
        { label: "Profit", val: "12%" },
        { label: "Cities", val: "8" },
      ],
    };

  return (
    <div
      className="flex flex-col h-screen bg-[#f3f3f3] overflow-hidden"
      style={{ fontFamily: "Segoe UI, Arial, sans-serif" }}
    >
      {/* ── Excel Title Bar ── */}
      <div
        className="flex items-center px-4 h-9 shrink-0"
        style={{ backgroundColor: "#217346" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
            <span
              className="text-[8px] font-black"
              style={{ color: "#217346" }}
            >
              X
            </span>
          </div>
          <span className="text-white font-semibold text-sm tracking-wide">
            TravelBook Analytics
          </span>
          <span className="text-white/60 text-xs ml-2">
            — {headerInfo[activeService].title}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-white/70 text-xs">
            {headerInfo[activeService].badge}
          </span>
        </div>
      </div>

      {/* ── Excel Ribbon ── */}
      <div className="bg-white border-b-2 border-[#217346] shrink-0">
        {/* Ribbon Tabs Row */}
        <div className="flex items-end px-2 pt-1 gap-0.5 border-b border-[#d0d7de]">
          {(
            [
              "Home",
              "Insert",
              "Page Layout",
              "Formulas",
              "Data",
              "Review",
              "View",
            ] as const
          ).map((tab, i) => (
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
          ))}
        </div>

        {/* Ribbon Content */}
        <div className="flex items-stretch gap-0 px-2 py-1.5 overflow-x-auto">
          {/* Group: File */}
          <div className="flex items-center gap-1 pr-3 mr-2 border-r border-[#d0d7de]">
            <RibbonBtn
              icon={<Download size={14} />}
              label="Export"
              primary
              data-ocid="dashboard.export_button"
              onClick={exportDashboardToExcel}
            />
            <div className="mt-4">
              <p className="text-[9px] text-[#595959] text-center">File</p>
            </div>
          </div>

          {/* Group: Service */}
          <div className="flex items-start gap-1 pr-3 mr-2 border-r border-[#d0d7de]">
            <div className="flex items-center gap-1">
              {(Object.keys(SERVICE_CONFIG) as ServiceType[]).map((svcKey) => {
                const cfg = SERVICE_CONFIG[svcKey];
                const Icon = cfg.icon;
                const isActive = activeService === svcKey;
                return (
                  <RibbonBtn
                    key={svcKey}
                    icon={<Icon size={14} />}
                    label={cfg.label}
                    active={isActive}
                    data-ocid={`service.${svcKey}.tab`}
                    onClick={() => {
                      setActiveService(svcKey);
                      setActiveNav("overview");
                    }}
                  />
                );
              })}
            </div>
            <div className="mt-auto">
              <p className="text-[9px] text-[#595959] text-center pt-1">
                Service
              </p>
            </div>
          </div>

          {/* Group: Navigate */}
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
            <div className="mt-auto">
              <p className="text-[9px] text-[#595959] text-center pt-1">
                Navigate
              </p>
            </div>
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
              {headerInfo[activeService].badge}
            </span>
          </div>
        </div>
      </div>

      {/* ── Formula Bar ── */}
      <div className="flex items-center bg-white border-b border-[#d0d7de] px-3 py-1 shrink-0 gap-2">
        <div className="w-24 px-2 py-0.5 border border-[#d0d7de] text-[11px] text-center text-[#1f2937] font-mono bg-white">
          A1
        </div>
        <div className="w-px h-4 bg-[#d0d7de]" />
        <span className="text-[11px] text-[#595959] italic">
          {headerInfo[activeService].title} —{" "}
          {activeNav.charAt(0).toUpperCase() + activeNav.slice(1)} View
        </span>
      </div>

      {/* ── Main content area ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel (Excel-style column headers / stats) */}
        <div className="w-44 shrink-0 bg-white border-r border-[#d0d7de] flex flex-col overflow-y-auto">
          {/* Column header cell */}
          <div className="h-6 bg-[#f3f3f3] border-b border-[#d0d7de] flex items-center justify-center text-[10px] font-bold text-[#595959]">
            Dashboard
          </div>

          {/* Service stats in cell rows */}
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

          {/* Nav as Excel row items */}
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
            {statusBarStats[activeService].map((item) => (
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
          {/* Row number bar + content */}
          <div className="p-4 space-y-4">
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

            <div className="text-center py-3 text-[10px] text-[#595959]">
              © {new Date().getFullYear()}. Built with love using{" "}
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

      {/* ── Excel Sheet Tab Strip ── */}
      <div
        className="flex items-end px-2 h-8 shrink-0 border-t border-[#d0d7de] overflow-x-auto"
        style={{ backgroundColor: "#f3f3f3" }}
      >
        <div className="flex items-end gap-0.5 mr-2">
          <button
            type="button"
            className="flex items-center justify-center w-6 h-6 mb-0.5 border border-[#d0d7de] bg-white text-[#595959] hover:bg-[#e8f5e9] hover:text-[#217346] rounded-sm"
          >
            <Plus size={11} />
          </button>
        </div>
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
                  ? "bg-white text-[#217346] border-[#d0d7de] border-t-2"
                  : "bg-[#e0e0e0] text-[#595959] border-[#bdbdbd] hover:bg-[#ebebeb]"
              }`}
              style={isActive ? { borderTopColor: cfg.accent } : undefined}
            >
              <Icon size={11} />
              {cfg.label}
            </button>
          );
        })}

        {/* Status bar info */}
        <div className="ml-auto flex items-center gap-4 pb-1 pr-2">
          {statusBarStats[activeService].map((item) => (
            <span key={item.label} className="text-[10px] text-[#595959]">
              <span className="font-semibold">{item.label}:</span> {item.val}
            </span>
          ))}
        </div>
      </div>

      {/* ── Status bar ── */}
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
          <span>Sum: All Services</span>
          <span>|</span>
          <span>Count: 4 Tabs</span>
        </div>
      </div>
    </div>
  );
}

// ── Overview Section ──────────────────────────────────────────────────────────

function OverviewSection({
  activeService,
  svc,
}: {
  activeService: ServiceType;
  svc: (typeof SERVICE_CONFIG)[ServiceType];
}) {
  const kpiCards: Record<
    ServiceType,
    {
      label: string;
      value: string;
      sub: string;
      accent: string;
      icon: React.ReactNode;
    }[]
  > = {
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
        sub: `${dashboardData.kpis.profitMargin}% margin`,
        accent: "#f59e0b",
        icon: <TrendingUp size={14} />,
      },
      {
        label: "Cancellation Rate",
        value: "3.6%",
        sub: "558 cancelled",
        accent: "#f43f5e",
        icon: <XCircle size={14} />,
      },
      {
        label: "Avg Ticket Price",
        value: "₹1,558",
        sub: "Per booking",
        accent: "#8b5cf6",
        icon: <Receipt size={14} />,
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
        sub: "Gross revenue",
        accent: "#10b981",
        icon: <IndianRupee size={14} />,
      },
      {
        label: "Total Profit",
        value: formatINR(flightData.kpis.totalProfit),
        sub: `${flightData.kpis.profitMargin}% margin`,
        accent: "#f59e0b",
        icon: <TrendingUp size={14} />,
      },
      {
        label: "Cancellation Rate",
        value: "4.2%",
        sub: "354 cancelled",
        accent: "#f43f5e",
        icon: <XCircle size={14} />,
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
        sub: "Gross revenue",
        accent: "#06b6d4",
        icon: <IndianRupee size={14} />,
      },
      {
        label: "Total Profit",
        value: formatINR(busData.kpis.totalProfit),
        sub: `${busData.kpis.profitMargin}% margin`,
        accent: "#f59e0b",
        icon: <TrendingUp size={14} />,
      },
      {
        label: "Cancellation Rate",
        value: "5.8%",
        sub: "718 cancelled",
        accent: "#f43f5e",
        icon: <XCircle size={14} />,
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
        sub: "Gross revenue",
        accent: "#10b981",
        icon: <IndianRupee size={14} />,
      },
      {
        label: "Total Profit",
        value: formatINR(hotelData.kpis.totalProfit),
        sub: `${hotelData.kpis.profitMargin}% margin`,
        accent: "#f59e0b",
        icon: <TrendingUp size={14} />,
      },
      {
        label: "Cancellation Rate",
        value: "6.4%",
        sub: "374 cancelled",
        accent: "#f43f5e",
        icon: <XCircle size={14} />,
      },
      {
        label: "Avg Nightly Rate",
        value: "₹15,294",
        sub: "Per night",
        accent: "#8b5cf6",
        icon: <Receipt size={14} />,
      },
    ],
  };

  const trendData = (() => {
    const source =
      activeService === "train"
        ? dashboardData.monthlyTrend
        : activeService === "flight"
          ? flightData.monthlyTrend
          : activeService === "bus"
            ? busData.monthlyTrend
            : hotelData.monthlyTrend;
    return source.map((d) => ({
      label: formatMonthLabel(d.month),
      bookings: d.bookings,
      revenueLakh: Math.round(d.revenue / 100000),
    }));
  })();

  const topEntityLabel: Record<ServiceType, string> = {
    train: "Top Corporate Clients",
    flight: "Top Airlines",
    bus: "Top Operators",
    hotel: "Top Cities",
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

  const distributionLabel: Record<ServiceType, string> = {
    train: "Coach Type Distribution",
    flight: "Cabin Class",
    bus: "Seat Types",
    hotel: "Room Types",
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

  const routeLabel: Record<ServiceType, string> = {
    train: "Top Routes",
    flight: "Top Routes",
    bus: "Top Routes",
    hotel: "Top Hotels",
  };

  const routeData: Record<ServiceType, { route: string; count: number }[]> = {
    train: dashboardData.topRoutes.slice(0, 5),
    flight: flightData.topRoutes.slice(0, 5),
    bus: busData.topRoutes.slice(0, 5),
    hotel: hotelData.topHotels.slice(0, 5),
  };

  const bookingStatus: Record<ServiceType, { name: string; value: number }[]> =
    {
      train: dashboardData.bookingStatus,
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

  const billingCards: Record<
    ServiceType,
    { label: string; value: string; icon: React.ReactNode }[]
  > = {
    train: [
      { label: "Unbilled", value: "9,931", icon: <FileText size={14} /> },
      { label: "Billed", value: "5,497", icon: <TicketCheck size={14} /> },
      { label: "Pending", value: "113", icon: <Receipt size={14} /> },
    ],
    flight: [
      { label: "Confirmed", value: "8,066", icon: <TicketCheck size={14} /> },
      { label: "Cancelled", value: "354", icon: <XCircle size={14} /> },
      {
        label: "Revenue",
        value: formatINR(187650000),
        icon: <IndianRupee size={14} />,
      },
    ],
    bus: [
      { label: "Confirmed", value: "11,662", icon: <TicketCheck size={14} /> },
      { label: "Cancelled", value: "718", icon: <XCircle size={14} /> },
      {
        label: "Revenue",
        value: formatINR(62145000),
        icon: <IndianRupee size={14} />,
      },
    ],
    hotel: [
      { label: "Confirmed", value: "5,466", icon: <TicketCheck size={14} /> },
      { label: "Cancelled", value: "374", icon: <XCircle size={14} /> },
      {
        label: "Revenue",
        value: formatINR(89320000),
        icon: <IndianRupee size={14} />,
      },
    ],
  };

  const confirmed = bookingStatus[activeService][0].value;
  const cancelled = bookingStatus[activeService][1].value;
  const total = confirmed + cancelled;
  const distData = distributionData[activeService];
  const topRoutes = routeData[activeService];
  const maxRouteCount = topRoutes[0]?.count ?? 1;

  return (
    <>
      {/* KPI Cards Row */}
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
          <ResponsiveContainer width="100%" height={250}>
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
                formatter={(value: number, name: string) =>
                  name === "Revenue (₹L)"
                    ? [`₹${value}L`, name]
                    : [value.toLocaleString(), name]
                }
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
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
                strokeWidth={2}
                dot={{ r: 3, fill: "#10b981" }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </XlChartBox>
      </section>

      {/* Top Entities + Distribution */}
      <section
        className="grid grid-cols-1 lg:grid-cols-2 gap-3"
        data-ocid="overview.clients.section"
      >
        <XlChartBox title={topEntityLabel[activeService]}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              layout="vertical"
              data={topEntityData[activeService]}
              margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#f3f3f3"
              />
              <XAxis
                type="number"
                tick={{ fontSize: 9, fill: "#595959" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={110}
                tick={{ fontSize: 9, fill: "#1f2937" }}
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
              <Bar dataKey="bookings" radius={0}>
                {topEntityData[activeService].map((item, i) => (
                  <Cell
                    key={item.name}
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </XlChartBox>

        <XlChartBox title={distributionLabel[activeService]}>
          <div className="flex items-center gap-3">
            <ResponsiveContainer width="45%" height={190}>
              <PieChart>
                <Pie
                  data={distData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={80}
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
                    border: "1px solid #d0d7de",
                    fontSize: 11,
                    borderRadius: 0,
                  }}
                  formatter={(v: number) => [v.toLocaleString(), "Bookings"]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {distData.map((item, i) => {
                const dtotal = distData.reduce((a, b) => a + b.value, 0);
                const pct = ((item.value / dtotal) * 100).toFixed(1);
                return (
                  <div key={item.name}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className="w-2 h-2 shrink-0"
                        style={{
                          background: CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                      <span className="text-[10px] text-[#595959] flex-1 truncate">
                        {item.name}
                      </span>
                      <span className="text-[10px] font-bold text-[#1f2937]">
                        {item.value.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1 bg-[#f3f3f3] border border-[#d0d7de] overflow-hidden ml-3">
                      <div
                        className="h-full"
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
        </XlChartBox>
      </section>

      {/* Top Routes + Financial Summary */}
      <section
        className="grid grid-cols-1 lg:grid-cols-2 gap-3"
        data-ocid="overview.finance.section"
      >
        <XlChartBox title={routeLabel[activeService]}>
          <XlTable
            headers={["#", "Route", "Bookings", "Volume"]}
            rows={topRoutes.map((r, i) => ({
              key: r.route,
              cells: [
                <span
                  key="rank"
                  className="font-bold"
                  style={{ color: i < 3 ? svc.accent : "#595959" }}
                >
                  {i + 1}
                </span>,
                r.route,
                r.count,
                <div
                  key="bar"
                  className="h-1.5 bg-[#f3f3f3] border border-[#d0d7de] w-24 overflow-hidden"
                >
                  <div
                    className="h-full"
                    style={{
                      width: `${(r.count / maxRouteCount) * 100}%`,
                      backgroundColor: svc.accent,
                    }}
                  />
                </div>,
              ],
            }))}
          />
        </XlChartBox>

        <XlChartBox title="Financial Summary">
          <div className="flex items-center gap-4 mb-3">
            <ResponsiveContainer width="38%" height={110}>
              <PieChart>
                <Pie
                  data={bookingStatus[activeService]}
                  cx="50%"
                  cy="50%"
                  innerRadius={28}
                  outerRadius={50}
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
                    border: "1px solid #d0d7de",
                    fontSize: 11,
                    borderRadius: 0,
                  }}
                  formatter={(v: number) => [v.toLocaleString(), "Bookings"]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-[#595959]">Confirmed</span>
                </div>
                <p className="text-base font-bold text-[#1f2937]">
                  {confirmed.toLocaleString()}
                </p>
                <p className="text-[9px] text-[#595959]">
                  {((confirmed / total) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-[10px] text-[#595959]">Cancelled</span>
                </div>
                <p className="text-base font-bold text-[#1f2937]">
                  {cancelled.toLocaleString()}
                </p>
                <p className="text-[9px] text-[#595959]">
                  {((cancelled / total) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {billingCards[activeService].map((item, i) => (
              <div
                key={item.label}
                data-ocid={`overview.billing.item.${i + 1}`}
                className="border border-[#d0d7de] bg-white p-2 hover:bg-[#e8f5e9] transition-colors"
                style={{ borderTop: `2px solid ${CHART_COLORS[i]}` }}
              >
                <div
                  className="text-[#595959] mb-1"
                  style={{ color: CHART_COLORS[i] }}
                >
                  {item.icon}
                </div>
                <p className="text-sm font-bold text-[#1f2937] truncate">
                  {item.value}
                </p>
                <p className="text-[9px] text-[#595959] mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </XlChartBox>
      </section>
    </>
  );
}

// ── Clients Section ───────────────────────────────────────────────────────────

function ClientsSection({ activeService }: { activeService: ServiceType }) {
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
      className="grid grid-cols-1 lg:grid-cols-2 gap-3"
      data-ocid="clients.section"
    >
      <XlChartBox title={clientsLabel[activeService]}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="#f3f3f3"
            />
            <XAxis
              type="number"
              tick={{ fontSize: 9, fill: "#595959" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              tick={{ fontSize: 9, fill: "#1f2937" }}
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
            <Bar dataKey="bookings" radius={0}>
              {data.map((item, i) => (
                <Cell
                  key={item.name}
                  fill={CHART_COLORS[i % CHART_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </XlChartBox>

      <XlChartBox title={distributionLabel[activeService]}>
        <div className="flex items-center gap-3">
          <ResponsiveContainer width="45%" height={220}>
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
                  border: "1px solid #d0d7de",
                  fontSize: 11,
                  borderRadius: 0,
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
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className="w-2 h-2 shrink-0"
                      style={{
                        background: CHART_COLORS[i % CHART_COLORS.length],
                      }}
                    />
                    <span className="text-[10px] text-[#595959] flex-1 truncate">
                      {item.name}
                    </span>
                    <span className="text-[10px] font-bold text-[#1f2937]">
                      {item.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1 bg-[#f3f3f3] border border-[#d0d7de] overflow-hidden ml-3">
                    <div
                      className="h-full"
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
      </XlChartBox>
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
      <XlChartBox title={`${info.title} — ${info.subtitle}`}>
        <XlTable
          headers={["#", info.col, "Bookings", "Volume"]}
          rows={routes.map((r, i) => ({
            key: r.route,
            cells: [
              <span
                key="rank"
                className="font-bold"
                style={{ color: i < 3 ? svc.accent : "#595959" }}
              >
                {i + 1}
              </span>,
              r.route,
              r.count,
              <div
                key="bar"
                className="h-2 bg-[#f3f3f3] border border-[#d0d7de] w-32 overflow-hidden"
              >
                <div
                  className="h-full"
                  style={{
                    width: `${(r.count / maxCount) * 100}%`,
                    backgroundColor: svc.accent,
                  }}
                />
              </div>,
            ],
          }))}
        />
      </XlChartBox>
    </section>
  );
}

// ── Finance Section ───────────────────────────────────────────────────────────

function FinanceSection({ activeService }: { activeService: ServiceType }) {
  const bookingStatusMap: Record<
    ServiceType,
    { name: string; value: number }[]
  > = {
    train: dashboardData.bookingStatus,
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

  const distributionLabel: Record<ServiceType, string> = {
    train: "Billing Type Breakdown",
    flight: "Cabin Class Breakdown",
    bus: "Seat Type Breakdown",
    hotel: "Room Type Breakdown",
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

  const billingCards: Record<
    ServiceType,
    { label: string; value: string; icon: React.ReactNode }[]
  > = {
    train: [
      { label: "Unbilled", value: "9,931", icon: <FileText size={16} /> },
      { label: "Billed", value: "5,497", icon: <TicketCheck size={16} /> },
      {
        label: "Pending Verification",
        value: "113",
        icon: <Receipt size={16} />,
      },
    ],
    flight: [
      { label: "Confirmed", value: "8,066", icon: <TicketCheck size={16} /> },
      { label: "Cancelled", value: "354", icon: <XCircle size={16} /> },
      {
        label: "Total Revenue",
        value: formatINR(187650000),
        icon: <IndianRupee size={16} />,
      },
    ],
    bus: [
      { label: "Confirmed", value: "11,662", icon: <TicketCheck size={16} /> },
      { label: "Cancelled", value: "718", icon: <XCircle size={16} /> },
      {
        label: "Total Revenue",
        value: formatINR(62145000),
        icon: <IndianRupee size={16} />,
      },
    ],
    hotel: [
      { label: "Confirmed", value: "5,466", icon: <TicketCheck size={16} /> },
      { label: "Cancelled", value: "374", icon: <XCircle size={16} /> },
      {
        label: "Total Revenue",
        value: formatINR(89320000),
        icon: <IndianRupee size={16} />,
      },
    ],
  };

  const showQuota = activeService === "train";
  const quotaColors = ["#6366f1", "#f59e0b", "#f43f5e"];
  const quotaTotal = dashboardData.quotaUsed.reduce((a, b) => a + b.value, 0);
  const bookingStatus = bookingStatusMap[activeService];
  const confirmed = bookingStatus[0].value;
  const cancelled = bookingStatus[1].value;
  const total = confirmed + cancelled;
  const distData = distributionData[activeService];

  return (
    <div className="space-y-3">
      <section
        className="grid grid-cols-1 lg:grid-cols-2 gap-3"
        data-ocid="finance.section"
      >
        <XlChartBox title="Booking Status — Confirmed vs Cancelled">
          <div className="flex items-center justify-around">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie
                  data={bookingStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={78}
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
                    border: "1px solid #d0d7de",
                    fontSize: 11,
                    borderRadius: 0,
                  }}
                  formatter={(v: number) => [v.toLocaleString(), "Bookings"]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-4">
              <div className="text-center">
                <div className="flex items-center gap-1 mb-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  <span className="text-[10px] text-[#595959]">Confirmed</span>
                </div>
                <p className="text-xl font-bold text-[#1f2937]">
                  {confirmed.toLocaleString()}
                </p>
                <p className="text-[10px] text-[#595959]">
                  {((confirmed / total) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 mb-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                  <span className="text-[10px] text-[#595959]">Cancelled</span>
                </div>
                <p className="text-xl font-bold text-[#1f2937]">
                  {cancelled.toLocaleString()}
                </p>
                <p className="text-[10px] text-[#595959]">
                  {((cancelled / total) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </XlChartBox>

        <XlChartBox title={distributionLabel[activeService]}>
          <div className="space-y-2.5">
            {distData.map((item, i) => {
              const dtotal = distData.reduce((a, b) => a + b.value, 0);
              const pct = ((item.value / dtotal) * 100).toFixed(1);
              return (
                <div key={item.name}>
                  <div className="flex justify-between mb-0.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2"
                        style={{
                          background: CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                      <span className="text-[10px] font-medium text-[#1f2937]">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#595959]">{pct}%</span>
                      <span className="text-[10px] font-bold text-[#1f2937]">
                        {item.value.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-[#f3f3f3] border border-[#d0d7de] overflow-hidden">
                    <div
                      className="h-full"
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
        </XlChartBox>
      </section>

      {showQuota && (
        <section data-ocid="quota.section">
          <XlChartBox title="Quota Used — General vs Tatkal Breakdown">
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="28%" height={160}>
                <PieChart>
                  <Pie
                    data={dashboardData.quotaUsed}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {dashboardData.quotaUsed.map((quota, i) => (
                      <Cell key={quota.name} fill={quotaColors[i]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      border: "1px solid #d0d7de",
                      fontSize: 11,
                      borderRadius: 0,
                    }}
                    formatter={(v: number) => [v.toLocaleString(), "Tickets"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2.5">
                {dashboardData.quotaUsed.map((item, i) => {
                  const pct = ((item.value / quotaTotal) * 100).toFixed(1);
                  return (
                    <div key={item.name}>
                      <div className="flex justify-between mb-0.5">
                        <span className="text-[10px] font-medium text-[#1f2937]">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-[#595959]">
                          {pct}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#f3f3f3] border border-[#d0d7de] overflow-hidden">
                        <div
                          className="h-full"
                          style={{
                            width: `${pct}%`,
                            background: quotaColors[i],
                          }}
                        />
                      </div>
                      <p className="text-[9px] text-[#595959] mt-0.5">
                        {item.value.toLocaleString()} tickets
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </XlChartBox>
        </section>
      )}

      <section data-ocid="billing.section">
        <div className="border border-[#d0d7de] bg-[#f3f3f3] px-3 py-1.5 mb-0">
          <p className="text-[10px] font-bold text-[#595959] uppercase tracking-wide">
            Financial Summary
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 border border-t-0 border-[#d0d7de] p-3 bg-white">
          {billingCards[activeService].map((item, i) => (
            <div
              key={item.label}
              data-ocid={`billing.item.${i + 1}`}
              className="border border-[#d0d7de] bg-white p-3 hover:bg-[#e8f5e9] transition-colors"
              style={{ borderTop: `3px solid ${CHART_COLORS[i]}` }}
            >
              <div className="mb-2" style={{ color: CHART_COLORS[i] }}>
                {item.icon}
              </div>
              <p className="text-lg font-bold text-[#1f2937] truncate">
                {item.value}
              </p>
              <p className="text-[10px] text-[#595959] mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
