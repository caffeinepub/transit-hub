import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowLeftRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  DollarSign,
  FileText,
  Loader2,
  Percent,
  QrCode,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { TransactionType } from "../backend";
import {
  useGetAlerts,
  useGetBusinessProfile,
  useGetInvoices,
  useGetTransactions,
} from "../hooks/useBizControl";
import { BizControlLayout } from "../layouts/BizControlLayout";
import type { BizSection, DashboardSummary } from "../types/bizcontrol";
import AlertsPage from "./bizcontrol/AlertsPage";
import InvoicesPage from "./bizcontrol/InvoicesPage";
import PricingPage from "./bizcontrol/PricingPage";
import QRScannerPage from "./bizcontrol/QRScannerPage";
import ReportsPage from "./bizcontrol/ReportsPage";
import TrackerPage from "./bizcontrol/TrackerPage";

// ── KPI Card ─────────────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: string;
  subLabel?: string;
  subValue?: string;
  trend?: "up" | "down" | "neutral";
  variant: "income" | "expense" | "balance" | "accent";
  icon: React.ComponentType<{ className?: string }>;
  index: number;
}

const VARIANT_STYLES: Record<
  KpiCardProps["variant"],
  { badge: string; icon: string; trend: string }
> = {
  income: {
    badge: "bg-green-100 text-green-700 border-green-200",
    icon: "text-green-600",
    trend: "text-green-600",
  },
  expense: {
    badge: "bg-red-100 text-red-700 border-red-200",
    icon: "text-red-500",
    trend: "text-red-500",
  },
  balance: {
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    icon: "text-primary",
    trend: "text-primary",
  },
  accent: {
    badge: "bg-orange-100 text-orange-700 border-orange-200",
    icon: "text-accent",
    trend: "text-accent",
  },
};

function KpiCard({
  label,
  value,
  subLabel,
  subValue,
  trend,
  variant,
  icon: Icon,
  index,
}: KpiCardProps) {
  const styles = VARIANT_STYLES[variant];
  const TrendIcon =
    trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35, ease: "easeOut" }}
    >
      <Card className="border border-border shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <Badge
              variant="outline"
              className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 ${styles.badge}`}
            >
              {label}
            </Badge>
            <Icon className={`w-5 h-5 ${styles.icon}`} />
          </div>
          <p className="text-2xl font-bold font-display text-foreground leading-none mb-1">
            {value}
          </p>
          {subLabel && subValue && (
            <div className="flex items-center gap-1.5 mt-2">
              {TrendIcon && (
                <TrendIcon className={`w-3.5 h-3.5 ${styles.trend}`} />
              )}
              <span className="text-xs text-muted-foreground">{subLabel}</span>
              <span className={`text-xs font-semibold ${styles.trend}`}>
                {subValue}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

const SECTION_CARDS = [
  {
    id: "transactions" as BizSection,
    icon: ArrowLeftRight,
    label: "Transactions",
    desc: "Track income & expenses",
    color: "text-primary bg-blue-50",
  },
  {
    id: "invoices" as BizSection,
    icon: FileText,
    label: "Invoices",
    desc: "Manage billing & GST",
    color: "text-green-600 bg-green-50",
  },
  {
    id: "qrscanner" as BizSection,
    icon: QrCode,
    label: "QR Scanner",
    desc: "Verify UPI payments",
    color: "text-purple-600 bg-purple-50",
  },
  {
    id: "reports" as BizSection,
    icon: BarChart3,
    label: "Reports",
    desc: "Analytics & insights",
    color: "text-orange-500 bg-orange-50",
  },
  {
    id: "alerts" as BizSection,
    icon: Bell,
    label: "Alerts",
    desc: "Smart notifications",
    color: "text-red-500 bg-red-50",
  },
];

// ── Dashboard Overview ────────────────────────────────────────
function DashboardOverview({
  onNavigate,
}: { onNavigate: (s: BizSection) => void }) {
  const { data: transactions = [], isLoading: txLoading } =
    useGetTransactions();
  const { data: invoices = [], isLoading: invLoading } = useGetInvoices();
  const { data: alerts = [] } = useGetAlerts();

  const summary = useMemo<DashboardSummary>(() => {
    const totalIncome = transactions
      .filter((t) => t.transactionType === TransactionType.income)
      .reduce((s, t) => s + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.transactionType === TransactionType.expense)
      .reduce((s, t) => s + t.amount, 0);
    const netBalance = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0;
    const pendingInvoices = invoices.filter(
      (i) => i.status === "pending",
    ).length;
    const pendingAmount = invoices
      .filter((i) => i.status === "pending")
      .reduce((s, i) => s + i.total, 0);
    return {
      totalIncome,
      totalExpenses,
      netBalance,
      profitMargin,
      pendingInvoices,
      pendingAmount,
      recentAlerts: alerts.filter((a) => !a.isRead).length,
    };
  }, [transactions, invoices, alerts]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  const isLoading = txLoading || invLoading;

  const kpis: KpiCardProps[] = [
    {
      label: "Income",
      value: isLoading ? "..." : fmt(summary.totalIncome),
      subLabel: `${transactions.filter((t) => t.transactionType === TransactionType.income).length} transactions`,
      subValue: "",
      trend: "up",
      variant: "income",
      icon: TrendingUp,
      index: 0,
    },
    {
      label: "Expenses",
      value: isLoading ? "..." : fmt(summary.totalExpenses),
      subLabel: `${transactions.filter((t) => t.transactionType === TransactionType.expense).length} transactions`,
      subValue: "",
      trend: "down",
      variant: "expense",
      icon: TrendingDown,
      index: 1,
    },
    {
      label: "Net Balance",
      value: isLoading ? "..." : fmt(summary.netBalance),
      subLabel: summary.netBalance >= 0 ? "Positive" : "Deficit",
      subValue: "",
      trend: summary.netBalance >= 0 ? "up" : "down",
      variant: "balance",
      icon: DollarSign,
      index: 2,
    },
    {
      label: "Profit Margin",
      value: isLoading ? "..." : `${summary.profitMargin.toFixed(1)}%`,
      subLabel: `${summary.pendingInvoices} pending invoices`,
      subValue: summary.pendingInvoices > 0 ? fmt(summary.pendingAmount) : "",
      trend: summary.profitMargin > 0 ? "up" : "down",
      variant: "accent",
      icon: Percent,
      index: 3,
    },
  ];

  return (
    <div className="p-5 lg:p-7 space-y-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
          Overview
        </p>
        <h1 className="text-2xl font-bold font-display text-foreground">
          BizControl Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </motion.div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }, (_, i) => `skeleton-${i}`).map((key) => (
            <Card key={key} className="border border-border shadow-sm">
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
          data-ocid="kpi-grid"
        >
          {kpis.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </div>
      )}

      {/* Alerts banner */}
      {summary.recentAlerts > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-3 bg-destructive/8 border border-destructive/20 rounded-xl px-4 py-3"
          data-ocid="alert-banner"
        >
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
          <p className="text-sm text-foreground flex-1">
            You have{" "}
            <span className="font-semibold text-destructive">
              {summary.recentAlerts} unread alert
              {summary.recentAlerts > 1 ? "s" : ""}
            </span>{" "}
            that need your attention.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("alerts")}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs font-semibold"
          >
            View Alerts
          </Button>
        </motion.div>
      )}

      {/* Quick access */}
      <div>
        <h2 className="text-base font-semibold font-display text-foreground mb-3">
          Quick Access
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {SECTION_CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                onClick={() => onNavigate(card.id)}
                data-ocid={`quick-${card.id}`}
                className="flex flex-col items-start gap-2.5 p-4 bg-card border border-border rounded-xl shadow-sm hover:shadow-md hover:border-accent/30 transition-all duration-200 text-left group"
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.color} group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground leading-tight">
                    {card.label}
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                    {card.desc}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border border-border shadow-sm">
          <CardHeader className="px-5 py-4 pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">
                Recent Transactions
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate("transactions")}
                className="text-xs text-accent hover:text-accent/80 font-medium h-7"
                data-ocid="view-all-transactions"
              >
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-10 text-center" data-ocid="empty-transactions">
                <ArrowLeftRight className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No transactions yet
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate("transactions")}
                  className="mt-2 text-accent text-xs"
                >
                  Add your first transaction
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {transactions.slice(0, 5).map((tx) => {
                  const isIncome =
                    tx.transactionType === TransactionType.income;
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center gap-3 px-5 py-3"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isIncome ? "bg-green-100" : "bg-red-100"}`}
                      >
                        {isIncome ? (
                          <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {tx.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tx.category} · {tx.date}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-semibold flex-shrink-0 ${isIncome ? "text-green-600" : "text-red-500"}`}
                      >
                        {isIncome ? "+" : "-"}
                        {fmt(tx.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardHeader className="px-5 py-4 pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">
                Recent Invoices
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate("invoices")}
                className="text-xs text-accent hover:text-accent/80 font-medium h-7"
                data-ocid="view-all-invoices"
              >
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : invoices.length === 0 ? (
              <div className="py-10 text-center" data-ocid="empty-invoices">
                <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No invoices yet</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate("invoices")}
                  className="mt-2 text-accent text-xs"
                >
                  Create your first invoice
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {invoices.slice(0, 5).map((inv) => {
                  const statusMap: Record<string, string> = {
                    paid: "bg-green-100 text-green-700",
                    pending: "bg-orange-100 text-orange-700",
                    overdue: "bg-red-100 text-red-700",
                  };
                  return (
                    <div
                      key={inv.id}
                      className="flex items-center gap-3 px-5 py-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {inv.customerName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {inv.invoiceNumber} · {inv.date}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-sm font-semibold text-foreground">
                          {fmt(inv.total)}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${statusMap[inv.status] ?? "bg-muted text-muted-foreground"}`}
                        >
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Section Placeholder ───────────────────────────────────────
function SectionPlaceholder({ section }: { section: BizSection }) {
  const config: Record<
    BizSection,
    {
      icon: React.ComponentType<{ className?: string }>;
      title: string;
      desc: string;
    }
  > = {
    dashboard: { icon: BarChart3, title: "Dashboard", desc: "" },
    transactions: {
      icon: ArrowLeftRight,
      title: "Transactions",
      desc: "Log and categorize income & expense transactions",
    },
    invoices: {
      icon: FileText,
      title: "Invoices",
      desc: "Create GST-compliant invoices and track payment status",
    },
    qrscanner: {
      icon: QrCode,
      title: "QR Scanner",
      desc: "Scan and verify UPI QR codes before making payments",
    },
    reports: {
      icon: BarChart3,
      title: "Reports",
      desc: "Comprehensive analytics, profit/loss reports and trends",
    },
    alerts: {
      icon: Bell,
      title: "Alerts",
      desc: "Smart notifications for low balance, overdue invoices and more",
    },
    pricing: {
      icon: BarChart3,
      title: "Pricing",
      desc: "Upgrade to premium for unlimited features",
    },
  };
  const c = config[section];
  const Icon = c.icon;
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-96 text-center p-10">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-accent" />
      </div>
      <h2 className="text-xl font-bold font-display text-foreground mb-2">
        {c.title}
      </h2>
      <p className="text-sm text-muted-foreground max-w-xs">{c.desc}</p>
      <Badge variant="outline" className="mt-4 text-xs text-muted-foreground">
        Coming in next update
      </Badge>
    </div>
  );
}

// ── Login Gate ────────────────────────────────────────────────
function LoginGate({ onLogin }: { onLogin: () => void }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-background p-6"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 80%, oklch(0.5 0.15 240 / 0.06), transparent 60%), radial-gradient(circle at 80% 20%, oklch(0.62 0.18 45 / 0.06), transparent 60%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="border border-border shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-5">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold font-display text-foreground mb-2">
              Welcome to BizControl
            </h1>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Your all-in-one business finance manager. Track transactions,
              create invoices, and monitor your cash flow.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                {
                  icon: ArrowLeftRight,
                  label: "Transactions",
                  color: "text-primary",
                },
                { icon: FileText, label: "Invoices", color: "text-green-600" },
                { icon: BarChart3, label: "Reports", color: "text-accent" },
              ].map((f) => (
                <div
                  key={f.label}
                  className="flex flex-col items-center gap-1.5 p-3 bg-muted/40 rounded-xl"
                >
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                  <span className="text-xs font-medium text-muted-foreground">
                    {f.label}
                  </span>
                </div>
              ))}
            </div>

            <Button
              onClick={onLogin}
              size="lg"
              className="w-full font-semibold bg-accent hover:bg-accent/90 text-accent-foreground"
              data-ocid="login-btn"
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              Sign in with Internet Identity
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              Secure · Decentralized · No passwords
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function BizControlPage() {
  const { loginStatus, identity, login } = useInternetIdentity();
  const [activeSection, setActiveSection] = useState<BizSection>("dashboard");

  const { data: alerts = [] } = useGetAlerts();
  const { data: profile } = useGetBusinessProfile();

  const unreadAlerts = alerts.filter((a) => !a.isRead).length;
  const planType = (profile?.planType === "premium" ? "premium" : "free") as
    | "free"
    | "premium";
  const businessName = profile?.businessName || "My Business";

  if (loginStatus === "logging-in") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Signing you in...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return <LoginGate onLogin={login} />;
  }

  return (
    <BizControlLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      alertCount={unreadAlerts}
      planType={planType}
      businessName={businessName}
    >
      {activeSection === "dashboard" ? (
        <DashboardOverview onNavigate={setActiveSection} />
      ) : activeSection === "transactions" ? (
        <TrackerPage
          planType={planType}
          onUpgrade={() => setActiveSection("pricing")}
        />
      ) : activeSection === "invoices" ? (
        <InvoicesPage />
      ) : activeSection === "qrscanner" ? (
        <QRScannerPage />
      ) : activeSection === "alerts" ? (
        <AlertsPage />
      ) : activeSection === "reports" ? (
        <ReportsPage planType={planType} />
      ) : activeSection === "pricing" ? (
        <PricingPage />
      ) : (
        <SectionPlaceholder section={activeSection} />
      )}
    </BizControlLayout>
  );
}
