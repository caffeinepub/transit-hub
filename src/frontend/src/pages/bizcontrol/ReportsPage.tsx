import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock,
  Crown,
  Download,
  FileText,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TransactionType } from "../../backend";
import { useGetInvoices, useGetTransactions } from "../../hooks/useBizControl";
import type { Invoice, Transaction } from "../../types/bizcontrol";

// ── Formatting ────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const fmtShort = (n: number): string => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
};

// ── Date Utils ────────────────────────────────────────────────
const toYYYYMM = (dateStr: string): string => {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const monthLabel = (yyyymm: string): string => {
  const [y, m] = yyyymm.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
};

// ── Quick Filters ─────────────────────────────────────────────
type QuickFilter = "this_month" | "last_3_months" | "this_year" | "custom";

function getQuickRange(filter: QuickFilter): { start: string; end: string } {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  if (filter === "this_month") {
    const start = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
    return { start, end: today };
  }
  if (filter === "last_3_months") {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 2);
    d.setDate(1);
    const start = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`;
    return { start, end: today };
  }
  // this_year
  return { start: `${now.getFullYear()}-01-01`, end: today };
}

// ── Colours ───────────────────────────────────────────────────
const INCOME_COLOR = "#16a34a";
const EXPENSE_COLOR = "#ef4444";
const PIE_COLORS = [
  "#6366f1",
  "#f59e0b",
  "#06b6d4",
  "#8b5cf6",
  "#f43f5e",
  "#10b981",
  "#3b82f6",
  "#84cc16",
];

// ── Custom Tooltip ─────────────────────────────────────────────
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-lg px-4 py-3 text-xs">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: p.color }}
          />
          <span className="text-muted-foreground capitalize">{p.name}:</span>
          <span className="font-semibold text-foreground ml-auto pl-3">
            {fmt(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Pie Tooltip ────────────────────────────────────────────────
function PieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { pct: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="bg-card border border-border rounded-xl shadow-lg px-4 py-3 text-xs">
      <p className="font-semibold text-foreground">{p.name}</p>
      <p className="text-muted-foreground mt-1">
        {fmt(p.value)}{" "}
        <span className="font-bold text-foreground">({p.payload.pct})</span>
      </p>
    </div>
  );
}

// ── Chart Card ─────────────────────────────────────────────────
function ChartCard({
  title,
  children,
  badge,
}: {
  title: string;
  children: React.ReactNode;
  badge?: string;
}) {
  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="px-5 py-4 pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-accent" />
            {title}
          </CardTitle>
          {badge && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              {badge}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  );
}

// ── KPI Stat Card ──────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  index,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "green" | "red" | "blue" | "amber" | "purple" | "orange";
  index: number;
}) {
  const colorMap = {
    green: {
      bg: "bg-green-50",
      text: "text-green-600",
      badge: "bg-green-100 text-green-700 border-green-200",
    },
    red: {
      bg: "bg-red-50",
      text: "text-red-500",
      badge: "bg-red-100 text-red-700 border-red-200",
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      badge: "bg-blue-100 text-blue-700 border-blue-200",
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-500",
      badge: "bg-amber-100 text-amber-700 border-amber-200",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      badge: "bg-purple-100 text-purple-700 border-purple-200",
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-500",
      badge: "bg-orange-100 text-orange-700 border-orange-200",
    },
  };
  const c = colorMap[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35, ease: "easeOut" }}
    >
      <Card className="border border-border shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <Badge
              variant="outline"
              className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 ${c.badge}`}
            >
              {label}
            </Badge>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.bg}`}
            >
              <Icon className={`w-4 h-4 ${c.text}`} />
            </div>
          </div>
          <p className="text-2xl font-bold font-display text-foreground leading-none mb-1">
            {value}
          </p>
          {sub && <p className="text-xs text-muted-foreground mt-1.5">{sub}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Upgrade Prompt ─────────────────────────────────────────────
function UpgradePrompt({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
      onClick={onClose}
    >
      <dialog
        className="bg-card rounded-2xl border border-border shadow-2xl p-8 max-w-sm w-full text-center m-0"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        open
        aria-label="Upgrade to Premium"
      >
        <div className="w-14 h-14 rounded-2xl bg-yellow-100 flex items-center justify-center mx-auto mb-4">
          <Crown className="w-7 h-7 text-yellow-500" />
        </div>
        <h3 className="text-xl font-bold font-display text-foreground mb-2">
          Premium Feature
        </h3>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          CSV export is available on the Premium plan. Upgrade to unlock full
          data export, advanced analytics, and unlimited storage.
        </p>
        <Button
          className="w-full font-semibold bg-accent hover:bg-accent/90 text-accent-foreground"
          data-ocid="upgrade-premium-btn"
        >
          <Crown className="w-4 h-4 mr-2" />
          Upgrade to Premium
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="mt-2 w-full text-muted-foreground hover:text-foreground"
          data-ocid="upgrade-dismiss-btn"
        >
          Maybe later
        </Button>
      </dialog>
    </motion.div>
  );
}

// ── CSV Export ─────────────────────────────────────────────────
function exportCSV(transactions: Transaction[], invoices: Invoice[]) {
  const txRows = transactions.map((t) =>
    [
      t.date,
      t.transactionType,
      t.category,
      t.description,
      t.amount,
      t.notes,
    ].join(","),
  );
  const invRows = invoices.map((i) =>
    [
      i.date,
      i.invoiceNumber,
      i.customerName,
      i.status,
      i.subtotal,
      i.gstAmount,
      i.total,
    ].join(","),
  );
  const content = [
    "=== TRANSACTIONS ===",
    "Date,Type,Category,Description,Amount,Notes",
    ...txRows,
    "",
    "=== INVOICES ===",
    "Date,Invoice#,Customer,Status,Subtotal,GST,Total",
    ...invRows,
  ].join("\n");
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bizcontrol-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main Component ─────────────────────────────────────────────
export default function ReportsPage({
  planType = "free",
}: {
  planType?: "free" | "premium";
}) {
  const { data: transactions = [], isLoading: txLoading } =
    useGetTransactions();
  const { data: invoices = [], isLoading: invLoading } = useGetInvoices();
  const isLoading = txLoading || invLoading;

  const today = new Date().toISOString().slice(0, 10);
  const yearStart = `${new Date().getFullYear()}-01-01`;

  const [startDate, setStartDate] = useState(yearStart);
  const [endDate, setEndDate] = useState(today);
  const [activeQuick, setActiveQuick] = useState<QuickFilter>("this_year");
  const [showUpgrade, setShowUpgrade] = useState(false);

  const applyQuick = (q: QuickFilter) => {
    setActiveQuick(q);
    if (q !== "custom") {
      const { start, end } = getQuickRange(q);
      setStartDate(start);
      setEndDate(end);
    }
  };

  // ── Filtered transactions ──────────────────────────────────
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      return t.date >= startDate && t.date <= endDate;
    });
  }, [transactions, startDate, endDate]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((i) => i.date >= startDate && i.date <= endDate);
  }, [invoices, startDate, endDate]);

  // ── KPIs ───────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const totalIncome = filtered
      .filter((t) => t.transactionType === TransactionType.income)
      .reduce((s, t) => s + t.amount, 0);
    const totalExpenses = filtered
      .filter((t) => t.transactionType === TransactionType.expense)
      .reduce((s, t) => s + t.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
    const invoiceRevenue = filteredInvoices
      .filter((i) => i.status === "paid")
      .reduce((s, i) => s + i.total, 0);
    const pendingTotal = filteredInvoices
      .filter((i) => i.status === "pending" || i.status === "overdue")
      .reduce((s, i) => s + i.total, 0);
    return {
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin,
      invoiceRevenue,
      pendingTotal,
    };
  }, [filtered, filteredInvoices]);

  // ── Monthly data for charts ────────────────────────────────
  const monthlyData = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    for (const t of filtered) {
      const key = toYYYYMM(t.date);
      if (!key) continue;
      const cur = map.get(key) ?? { income: 0, expense: 0 };
      if (t.transactionType === TransactionType.income) {
        cur.income += t.amount;
      } else {
        cur.expense += t.amount;
      }
      map.set(key, cur);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => ({
        month: monthLabel(k),
        income: v.income,
        expense: v.expense,
      }));
  }, [filtered]);

  // ── Expense categories (top 6) ────────────────────────────
  const expenseCategories = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of filtered.filter(
      (t) => t.transactionType === TransactionType.expense,
    )) {
      const cat = t.category || "Uncategorized";
      map.set(cat, (map.get(cat) ?? 0) + t.amount);
    }
    const total = Array.from(map.values()).reduce((s, v) => s + v, 0);
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({
        name,
        value,
        pct: total > 0 ? `${((value / total) * 100).toFixed(1)}%` : "0%",
      }));
  }, [filtered]);

  // ── Income categories ─────────────────────────────────────
  const incomeCategories = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of filtered.filter(
      (t) => t.transactionType === TransactionType.income,
    )) {
      const cat = t.category || "Uncategorized";
      map.set(cat, (map.get(cat) ?? 0) + t.amount);
    }
    const total = Array.from(map.values()).reduce((s, v) => s + v, 0);
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({
        name,
        value,
        pct: total > 0 ? `${((value / total) * 100).toFixed(1)}%` : "0%",
      }));
  }, [filtered]);

  // ── Invoice stats ──────────────────────────────────────────
  const invoiceStats = useMemo(() => {
    const total = filteredInvoices.length;
    const paid = filteredInvoices.filter((i) => i.status === "paid").length;
    const pending = filteredInvoices.filter(
      (i) => i.status === "pending",
    ).length;
    const overdue = filteredInvoices.filter(
      (i) => i.status === "overdue",
    ).length;
    const statusDist = [
      {
        name: "Paid",
        value: paid,
        pct: total > 0 ? `${((paid / total) * 100).toFixed(0)}%` : "0%",
      },
      {
        name: "Pending",
        value: pending,
        pct: total > 0 ? `${((pending / total) * 100).toFixed(0)}%` : "0%",
      },
      {
        name: "Overdue",
        value: overdue,
        pct: total > 0 ? `${((overdue / total) * 100).toFixed(0)}%` : "0%",
      },
    ].filter((s) => s.value > 0);
    return { total, paid, pending, overdue, statusDist };
  }, [filteredInvoices]);

  const QUICK_BTNS: { id: QuickFilter; label: string }[] = [
    { id: "this_month", label: "This Month" },
    { id: "last_3_months", label: "Last 3 Months" },
    { id: "this_year", label: "This Year" },
  ];

  const INV_COLORS = ["#16a34a", "#f59e0b", "#ef4444"];

  if (isLoading) {
    return (
      <div className="p-5 lg:p-7 space-y-6" data-ocid="reports-loading">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, i) => `sk-${i}`).map((k) => (
            <Skeleton key={k} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {["c1", "c2", "c3", "c4"].map((k) => (
            <Skeleton key={k} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const noData = filtered.length === 0;

  return (
    <div className="p-5 lg:p-7 space-y-6" data-ocid="reports-page">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Analytics
          </p>
          <h1 className="text-2xl font-bold font-display text-foreground">
            Reports & Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Financial insights for your business
          </p>
        </div>
        <Button
          onClick={() => {
            if (planType === "premium") {
              exportCSV(filtered, filteredInvoices);
            } else {
              setShowUpgrade(true);
            }
          }}
          variant="outline"
          className="flex items-center gap-2 font-semibold border-border hover:border-accent/40 hover:text-accent transition-colors"
          data-ocid="export-csv-btn"
        >
          {planType === "free" && (
            <Crown className="w-3.5 h-3.5 text-yellow-500" />
          )}
          <Download className="w-3.5 h-3.5" />
          Export Data
        </Button>
      </motion.div>

      {/* ── Filter Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.3 }}
        className="flex flex-wrap items-center gap-3 bg-muted/40 border border-border rounded-xl px-4 py-3"
        data-ocid="reports-filter-bar"
      >
        <CalendarDays className="w-4 h-4 text-accent flex-shrink-0" />
        <div className="flex items-center gap-2">
          <label
            htmlFor="report-start"
            className="text-xs text-muted-foreground font-medium sr-only"
          >
            Start date
          </label>
          <input
            id="report-start"
            type="date"
            value={startDate}
            max={endDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setActiveQuick("custom");
            }}
            className="text-xs border border-input bg-card rounded-lg px-2.5 py-1.5 text-foreground outline-none focus:ring-2 focus:ring-ring cursor-pointer"
            data-ocid="filter-start-date"
          />
          <span className="text-xs text-muted-foreground">→</span>
          <label
            htmlFor="report-end"
            className="text-xs text-muted-foreground font-medium sr-only"
          >
            End date
          </label>
          <input
            id="report-end"
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setActiveQuick("custom");
            }}
            className="text-xs border border-input bg-card rounded-lg px-2.5 py-1.5 text-foreground outline-none focus:ring-2 focus:ring-ring cursor-pointer"
            data-ocid="filter-end-date"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {QUICK_BTNS.map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => applyQuick(q.id)}
              data-ocid={`filter-${q.id}`}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-150 ${
                activeQuick === q.id
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-card border-border text-muted-foreground hover:border-accent/40 hover:text-foreground"
              }`}
            >
              {q.label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-muted-foreground font-medium">
          {filtered.length} transactions
        </span>
      </motion.div>

      {/* ── KPI Cards ── */}
      {noData ? (
        <div
          className="flex flex-col items-center justify-center py-16 text-center bg-muted/20 rounded-xl border border-border"
          data-ocid="reports-empty-state"
        >
          <BarChart3 className="w-12 h-12 text-muted-foreground/40 mb-3" />
          <h3 className="text-base font-semibold text-foreground mb-1">
            No data for selected period
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Try selecting a different date range or add transactions to see your
            analytics.
          </p>
        </div>
      ) : (
        <>
          <div
            className="grid grid-cols-2 xl:grid-cols-3 gap-4"
            data-ocid="kpi-cards"
          >
            <StatCard
              label="Total Income"
              value={fmt(kpis.totalIncome)}
              sub={`${filtered.filter((t) => t.transactionType === TransactionType.income).length} transactions`}
              icon={TrendingUp}
              color="green"
              index={0}
            />
            <StatCard
              label="Total Expenses"
              value={fmt(kpis.totalExpenses)}
              sub={`${filtered.filter((t) => t.transactionType === TransactionType.expense).length} transactions`}
              icon={TrendingDown}
              color="red"
              index={1}
            />
            <StatCard
              label="Net Profit"
              value={fmt(kpis.netProfit)}
              sub={kpis.netProfit >= 0 ? "Positive balance" : "Deficit"}
              icon={kpis.netProfit >= 0 ? TrendingUp : TrendingDown}
              color={kpis.netProfit >= 0 ? "green" : "red"}
              index={2}
            />
            <StatCard
              label="Profit Margin"
              value={`${kpis.profitMargin.toFixed(1)}%`}
              sub="Of total income"
              icon={BarChart3}
              color="orange"
              index={3}
            />
            <StatCard
              label="Invoice Revenue"
              value={fmt(kpis.invoiceRevenue)}
              sub={`${invoiceStats.paid} paid invoices`}
              icon={CheckCircle2}
              color="blue"
              index={4}
            />
            <StatCard
              label="Pending Invoices"
              value={fmt(kpis.pendingTotal)}
              sub={`${invoiceStats.pending + invoiceStats.overdue} awaiting payment`}
              icon={Clock}
              color="amber"
              index={5}
            />
          </div>

          {/* ── Charts Row 1 ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Income vs Expense Line Chart */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <ChartCard
                title="Income vs Expense Trend"
                badge={`${monthlyData.length} months`}
              >
                {monthlyData.length === 0 ? (
                  <div className="h-56 flex items-center justify-center text-sm text-muted-foreground">
                    No monthly data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart
                      data={monthlyData}
                      margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 10, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tickFormatter={fmtShort}
                        tick={{ fontSize: 10, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                        width={52}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                        formatter={(val) => (
                          <span style={{ color: "#64748b" }}>{val}</span>
                        )}
                      />
                      <Line
                        type="monotone"
                        dataKey="income"
                        stroke={INCOME_COLOR}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: INCOME_COLOR }}
                        activeDot={{ r: 5 }}
                        name="Income"
                      />
                      <Line
                        type="monotone"
                        dataKey="expense"
                        stroke={EXPENSE_COLOR}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: EXPENSE_COLOR }}
                        activeDot={{ r: 5 }}
                        name="Expense"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </motion.div>

            {/* Monthly Breakdown Bar Chart */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              <ChartCard title="Monthly Breakdown" badge="Grouped bars">
                {monthlyData.length === 0 ? (
                  <div className="h-56 flex items-center justify-center text-sm text-muted-foreground">
                    No monthly data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={monthlyData}
                      margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                      barCategoryGap="28%"
                      barGap={4}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 10, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tickFormatter={fmtShort}
                        tick={{ fontSize: 10, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                        width={52}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                        formatter={(val) => (
                          <span style={{ color: "#64748b" }}>{val}</span>
                        )}
                      />
                      <Bar
                        dataKey="income"
                        fill={INCOME_COLOR}
                        radius={[3, 3, 0, 0]}
                        name="Income"
                      />
                      <Bar
                        dataKey="expense"
                        fill={EXPENSE_COLOR}
                        radius={[3, 3, 0, 0]}
                        name="Expense"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </motion.div>
          </div>

          {/* ── Charts Row 2 ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Expense Category Donut */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <ChartCard
                title="Expense Categories"
                badge={`Top ${expenseCategories.length}`}
              >
                {expenseCategories.length === 0 ? (
                  <div className="h-56 flex items-center justify-center text-sm text-muted-foreground">
                    No expense data
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={expenseCategories}
                          cx="50%"
                          cy="50%"
                          innerRadius={52}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {expenseCategories.map((cat, idx) => (
                            <Cell
                              key={cat.name}
                              fill={PIE_COLORS[idx % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="w-full sm:w-44 flex-shrink-0 space-y-2">
                      {expenseCategories.map((cat, idx) => (
                        <div
                          key={cat.name}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{
                              background: PIE_COLORS[idx % PIE_COLORS.length],
                            }}
                          />
                          <span className="text-muted-foreground flex-1 truncate min-w-0">
                            {cat.name}
                          </span>
                          <span className="font-semibold text-foreground flex-shrink-0">
                            {cat.pct}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </ChartCard>
            </motion.div>

            {/* Income Category Donut */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              <ChartCard
                title="Income Categories"
                badge={`Top ${incomeCategories.length}`}
              >
                {incomeCategories.length === 0 ? (
                  <div className="h-56 flex items-center justify-center text-sm text-muted-foreground">
                    No income data
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={incomeCategories}
                          cx="50%"
                          cy="50%"
                          innerRadius={52}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {incomeCategories.map((cat, idx) => (
                            <Cell
                              key={cat.name}
                              fill={PIE_COLORS[idx % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="w-full sm:w-44 flex-shrink-0 space-y-2">
                      {incomeCategories.map((cat, idx) => (
                        <div
                          key={cat.name}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{
                              background: PIE_COLORS[idx % PIE_COLORS.length],
                            }}
                          />
                          <span className="text-muted-foreground flex-1 truncate min-w-0">
                            {cat.name}
                          </span>
                          <span className="font-semibold text-foreground flex-shrink-0">
                            {cat.pct}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </ChartCard>
            </motion.div>
          </div>

          {/* ── Invoice Analytics ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <Card
              className="border border-border shadow-sm"
              data-ocid="invoice-analytics"
            >
              <CardHeader className="px-5 py-4 pb-3 border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4 text-accent" />
                    Invoice Analytics
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className="text-xs text-muted-foreground"
                  >
                    {invoiceStats.total} invoices
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                {invoiceStats.total === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center py-10 text-center"
                    data-ocid="invoice-empty"
                  >
                    <FileText className="w-10 h-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No invoices in selected period
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Count stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 lg:w-56 flex-shrink-0">
                      {[
                        {
                          label: "Total",
                          value: invoiceStats.total,
                          icon: FileText,
                          cls: "text-primary",
                          bg: "bg-blue-50",
                        },
                        {
                          label: "Paid",
                          value: invoiceStats.paid,
                          icon: CheckCircle2,
                          cls: "text-green-600",
                          bg: "bg-green-50",
                        },
                        {
                          label: "Pending",
                          value: invoiceStats.pending,
                          icon: Clock,
                          cls: "text-amber-500",
                          bg: "bg-amber-50",
                        },
                        {
                          label: "Overdue",
                          value: invoiceStats.overdue,
                          icon: AlertCircle,
                          cls: "text-destructive",
                          bg: "bg-red-50",
                        },
                      ].map((s) => {
                        const SIcon = s.icon;
                        return (
                          <div
                            key={s.label}
                            className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-muted/20 text-center gap-1"
                            data-ocid={`invoice-stat-${s.label.toLowerCase()}`}
                          >
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.bg}`}
                            >
                              <SIcon className={`w-4 h-4 ${s.cls}`} />
                            </div>
                            <span className="text-lg font-bold text-foreground leading-none">
                              {s.value}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {s.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Status pie */}
                    {invoiceStats.statusDist.length > 0 && (
                      <div className="flex-1 flex flex-col sm:flex-row items-center gap-4">
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={invoiceStats.statusDist}
                              cx="50%"
                              cy="50%"
                              innerRadius={52}
                              outerRadius={80}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {invoiceStats.statusDist.map((entry, idx) => (
                                <Cell
                                  key={entry.name}
                                  fill={INV_COLORS[idx % INV_COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip content={<PieTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="w-full sm:w-44 flex-shrink-0 space-y-2">
                          {invoiceStats.statusDist.map((s, idx) => (
                            <div
                              key={s.name}
                              className="flex items-center gap-2 text-xs"
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{
                                  background:
                                    INV_COLORS[idx % INV_COLORS.length],
                                }}
                              />
                              <span className="text-muted-foreground flex-1">
                                {s.name}
                              </span>
                              <span className="font-semibold text-foreground">
                                {s.pct}
                              </span>
                            </div>
                          ))}
                          <div className="mt-3 pt-3 border-t border-border">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">
                                Collected
                              </span>
                              <span className="font-semibold text-green-600">
                                {fmt(kpis.invoiceRevenue)}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs mt-1">
                              <span className="text-muted-foreground">
                                Outstanding
                              </span>
                              <span className="font-semibold text-amber-500">
                                {fmt(kpis.pendingTotal)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Premium export notice for free ── */}
          {planType === "free" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3"
              data-ocid="premium-export-notice"
            >
              <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              <p className="text-sm text-foreground flex-1">
                <span className="font-semibold">Export your data</span> —
                Download all transactions and invoices as CSV with a Premium
                plan.
              </p>
              <Button
                size="sm"
                onClick={() => setShowUpgrade(true)}
                className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-semibold"
                data-ocid="reports-upgrade-cta"
              >
                Upgrade
              </Button>
            </motion.div>
          )}
        </>
      )}

      {/* ── Upgrade modal ── */}
      {showUpgrade && <UpgradePrompt onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}
