import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  BellOff,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Info,
  Save,
  Settings2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertType } from "../../backend";
import {
  useDismissAlert,
  useGetAlertSettings,
  useGetAlerts,
  useMarkAlertRead,
  useSaveAlertSettings,
} from "../../hooks/useBizControl";
import type { AlertSettings } from "../../types/bizcontrol";

// ── Alert type config ──────────────────────────────────────────
const ALERT_CONFIG: Record<
  AlertType,
  {
    icon: React.ComponentType<{ className?: string }>;
    iconClass: string;
    badgeClass: string;
    label: string;
  }
> = {
  [AlertType.lowBalance]: {
    icon: AlertCircle,
    iconClass: "text-destructive",
    badgeClass: "bg-red-100 text-red-700 border-red-200",
    label: "Low Balance",
  },
  [AlertType.unusualSpending]: {
    icon: AlertTriangle,
    iconClass: "text-orange-500",
    badgeClass: "bg-orange-100 text-orange-700 border-orange-200",
    label: "Unusual Spending",
  },
  [AlertType.pendingInvoice]: {
    icon: Clock,
    iconClass: "text-primary",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
    label: "Pending Invoice",
  },
  [AlertType.custom]: {
    icon: Info,
    iconClass: "text-muted-foreground",
    badgeClass: "bg-muted text-muted-foreground border-border",
    label: "Notice",
  },
};

function formatTime(createdAt: bigint): string {
  const ms = Number(createdAt) / 1_000_000;
  const now = Date.now();
  const diff = now - ms;
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

// ── Alert Settings Panel ───────────────────────────────────────
function AlertSettingsPanel() {
  const { data: settings, isLoading } = useGetAlertSettings();
  const saveSettings = useSaveAlertSettings();

  const [threshold, setThreshold] = useState("1000");
  const [multiplier, setMultiplier] = useState("2");
  const [reminderDays, setReminderDays] = useState("7");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (settings) {
      setThreshold(String(settings.lowBalanceThreshold));
      setMultiplier(String(settings.unusualSpendingMultiplier));
      setReminderDays(String(Number(settings.pendingInvoiceDays)));
    }
  }, [settings]);

  function handleSave() {
    const s: AlertSettings = {
      lowBalanceThreshold: Number(threshold) || 1000,
      unusualSpendingMultiplier: Number(multiplier) || 2,
      pendingInvoiceDays: BigInt(Number(reminderDays) || 7),
    };
    saveSettings.mutate(s, {
      onSuccess: () => toast.success("Alert settings saved"),
      onError: () => toast.error("Failed to save settings"),
    });
  }

  return (
    <Card
      className="border border-border shadow-sm"
      data-ocid="alert-settings-card"
    >
      <button
        type="button"
        className="w-full"
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
        data-ocid="alert-settings-toggle"
      >
        <CardHeader className="px-5 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Settings2 className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-sm font-semibold text-foreground">
                Alert Settings
              </CardTitle>
            </div>
            {open ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </CardHeader>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <CardContent className="p-5">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-1.5">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-9 w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="threshold"
                        className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                      >
                        Low Balance Threshold (₹)
                      </Label>
                      <Input
                        id="threshold"
                        type="number"
                        min="0"
                        value={threshold}
                        onChange={(e) => setThreshold(e.target.value)}
                        placeholder="1000"
                        className="h-9 text-sm"
                        data-ocid="threshold-input"
                      />
                      <p className="text-xs text-muted-foreground">
                        Alert when balance drops below this amount
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="multiplier"
                        className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                      >
                        Unusual Spending Multiplier (x)
                      </Label>
                      <Input
                        id="multiplier"
                        type="number"
                        min="1"
                        step="0.5"
                        value={multiplier}
                        onChange={(e) => setMultiplier(e.target.value)}
                        placeholder="2"
                        className="h-9 text-sm"
                        data-ocid="multiplier-input"
                      />
                      <p className="text-xs text-muted-foreground">
                        Alert when spending exceeds average by this factor
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="reminder-days"
                        className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                      >
                        Invoice Reminder (days)
                      </Label>
                      <Input
                        id="reminder-days"
                        type="number"
                        min="1"
                        value={reminderDays}
                        onChange={(e) => setReminderDays(e.target.value)}
                        placeholder="7"
                        className="h-9 text-sm"
                        data-ocid="reminder-days-input"
                      />
                      <p className="text-xs text-muted-foreground">
                        Days before invoice due date to send reminder
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-border">
                    <Button
                      onClick={handleSave}
                      disabled={saveSettings.isPending}
                      size="sm"
                      className="gap-2 font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                      data-ocid="save-settings-btn"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {saveSettings.isPending ? "Saving..." : "Save Settings"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ── Alerts Page ────────────────────────────────────────────────
export default function AlertsPage() {
  const { data: alerts = [], isLoading } = useGetAlerts();
  const markRead = useMarkAlertRead();
  const dismiss = useDismissAlert();

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  function handleMarkAllRead() {
    const unread = alerts.filter((a) => !a.isRead);
    Promise.all(unread.map((a) => markRead.mutateAsync(a.id))).then(() =>
      toast.success("All alerts marked as read"),
    );
  }

  function handleMarkRead(id: string) {
    markRead.mutate(id, {
      onSuccess: () => toast.success("Alert marked as read"),
    });
  }

  function handleDismiss(id: string) {
    dismiss.mutate(id, {
      onSuccess: () => toast.success("Alert dismissed"),
      onError: () => toast.error("Failed to dismiss alert"),
    });
  }

  return (
    <div className="p-5 lg:p-7 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Notifications
          </p>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold font-display text-foreground">
              Alert Center
            </h1>
            {unreadCount > 0 && (
              <Badge className="bg-destructive text-destructive-foreground border-0 text-xs h-5 px-2">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Stay on top of your business activity
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={markRead.isPending}
            className="gap-2 text-xs font-semibold shrink-0"
            data-ocid="mark-all-read-btn"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Mark All as Read
          </Button>
        )}
      </motion.div>

      {/* Alert list */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold text-foreground">
              All Alerts
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0" data-ocid="alerts-list">
          {isLoading ? (
            <div className="p-5 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-16 text-center"
              data-ocid="alerts-empty-state"
            >
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-base font-semibold font-display text-foreground mb-1">
                All clear!
              </h3>
              <p className="text-sm text-muted-foreground">
                No alerts at the moment. Keep up the great work!
              </p>
            </motion.div>
          ) : (
            <AnimatePresence initial={false}>
              {alerts.map((alert, i) => {
                const cfg =
                  ALERT_CONFIG[alert.alertType] ??
                  ALERT_CONFIG[AlertType.custom];
                const Icon = cfg.icon;
                const isRead = alert.isRead;

                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8, height: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                    className={`flex items-start gap-4 px-5 py-4 border-b border-border last:border-0 transition-colors ${
                      isRead
                        ? "opacity-60 bg-muted/20"
                        : "bg-card hover:bg-muted/10"
                    }`}
                    data-ocid={`alert-item-${alert.id}`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isRead ? "bg-muted" : "bg-muted/40"}`}
                    >
                      <Icon
                        className={`w-4 h-4 ${isRead ? "text-muted-foreground" : cfg.iconClass}`}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold px-1.5 py-0 h-4 ${cfg.badgeClass}`}
                        >
                          {cfg.label}
                        </Badge>
                        {!isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-destructive inline-block" />
                        )}
                      </div>
                      <p
                        className={`text-sm leading-snug mb-1 ${isRead ? "text-muted-foreground" : "text-foreground font-medium"}`}
                      >
                        {alert.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(alert.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                      {!isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkRead(alert.id)}
                          disabled={markRead.isPending}
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                          data-ocid={`mark-read-${alert.id}`}
                          aria-label="Mark as read"
                        >
                          <Check className="w-3 h-3" />
                          Read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDismiss(alert.id)}
                        disabled={dismiss.isPending}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive gap-1"
                        data-ocid={`dismiss-${alert.id}`}
                        aria-label="Dismiss alert"
                      >
                        <X className="w-3 h-3" />
                        Dismiss
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </CardContent>
      </Card>

      {/* Empty state (no alerts) with helpful info */}
      {!isLoading && alerts.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: AlertCircle,
              iconClass: "text-destructive",
              bg: "bg-red-50",
              title: "Low Balance Alert",
              desc: "Get notified when your bank balance drops below your threshold.",
            },
            {
              icon: AlertTriangle,
              iconClass: "text-orange-500",
              bg: "bg-orange-50",
              title: "Unusual Spending",
              desc: "Detect large or unexpected transactions automatically.",
            },
            {
              icon: Clock,
              iconClass: "text-primary",
              bg: "bg-blue-50",
              title: "Invoice Reminders",
              desc: "Never miss a due invoice with timely payment reminders.",
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
              >
                <Card className="border border-border shadow-sm">
                  <CardContent className="p-4">
                    <div
                      className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center mb-3`}
                    >
                      <Icon className={`w-4 h-4 ${item.iconClass}`} />
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-1">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Settings panel */}
      <AlertSettingsPanel />

      {/* Inactive / read banner */}
      {!isLoading && alerts.length > 0 && unreadCount === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3"
          data-ocid="all-read-banner"
        >
          <BellOff className="w-4 h-4 text-green-600 shrink-0" />
          <p className="text-sm text-green-700 font-medium">
            All caught up! No unread alerts.
          </p>
        </motion.div>
      )}
    </div>
  );
}
