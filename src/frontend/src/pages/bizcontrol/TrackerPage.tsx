import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Crown,
  Edit2,
  IndianRupee,
  Percent,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { TransactionType } from "../../backend";
import {
  useAddTransaction,
  useDeleteTransaction,
  useGetTransactions,
  useUpdateTransaction,
} from "../../hooks/useBizControl";
import type { Transaction, TransactionFormData } from "../../types/bizcontrol";

// ── Categories ────────────────────────────────────────────────
const INCOME_CATEGORIES = [
  "Salary",
  "Sales Revenue",
  "Consulting",
  "Investment Returns",
  "Other Income",
];
const EXPENSE_CATEGORIES = [
  "Rent",
  "Utilities",
  "Salaries Paid",
  "Travel",
  "Office Supplies",
  "Marketing",
  "Professional Fees",
  "Other Expense",
];

// ── Currency formatter ────────────────────────────────────────
function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Quick filter helpers ──────────────────────────────────────
function getQuickRange(preset: "month" | "quarter" | "year"): {
  start: string;
  end: string;
} {
  const now = new Date();
  const end = now.toISOString().split("T")[0];
  if (preset === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    return { start, end };
  }
  if (preset === "quarter") {
    const start = new Date(now.getFullYear(), now.getMonth() - 2, 1)
      .toISOString()
      .split("T")[0];
    return { start, end };
  }
  const start = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
  return { start, end };
}

// ── Empty state ───────────────────────────────────────────────
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 text-center"
      data-ocid="transactions-empty"
    >
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <IndianRupee className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold font-display text-foreground mb-1">
        No transactions yet
      </h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-xs">
        Add your first transaction to get started tracking your income and
        expenses.
      </p>
      <Button onClick={onAdd} className="btn-action" data-ocid="empty-add-btn">
        <Plus className="w-4 h-4 mr-2" />
        Add Transaction
      </Button>
    </div>
  );
}

// ── KPI Card ─────────────────────────────────────────────────
interface KpiProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string;
  subtext?: string;
}
function KpiCard({ label, value, icon, colorClass, subtext }: KpiProps) {
  return (
    <Card className={`p-4 border-l-4 ${colorClass}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            {label}
          </p>
          <p className="text-xl font-bold font-mono text-foreground leading-tight truncate">
            {value}
          </p>
          {subtext && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtext}</p>
          )}
        </div>
        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
      </div>
    </Card>
  );
}

// ── Transaction Form Dialog ───────────────────────────────────
const DEFAULT_FORM: TransactionFormData = {
  amount: 0,
  description: "",
  category: "",
  transactionType: TransactionType.income,
  date: new Date().toISOString().split("T")[0],
  notes: "",
};

interface TransactionDialogProps {
  open: boolean;
  onClose: () => void;
  editTx?: Transaction | null;
}

function TransactionDialog({ open, onClose, editTx }: TransactionDialogProps) {
  const addTx = useAddTransaction();
  const updateTx = useUpdateTransaction();

  const [form, setForm] = useState<TransactionFormData>(() =>
    editTx
      ? {
          amount: editTx.amount,
          description: editTx.description,
          category: editTx.category,
          transactionType: editTx.transactionType,
          date: editTx.date,
          notes: editTx.notes,
        }
      : DEFAULT_FORM,
  );

  // Reset form when dialog opens
  const handleOpenChange = (v: boolean) => {
    if (!v) {
      onClose();
    } else if (!editTx) {
      setForm(DEFAULT_FORM);
    }
  };

  // When editTx changes (dialog re-opened for different tx), sync form
  useEffect(() => {
    if (editTx) {
      setForm({
        amount: editTx.amount,
        description: editTx.description,
        category: editTx.category,
        transactionType: editTx.transactionType,
        date: editTx.date,
        notes: editTx.notes,
      });
    } else {
      setForm(DEFAULT_FORM);
    }
  }, [editTx]);

  const categories =
    form.transactionType === TransactionType.income
      ? INCOME_CATEGORIES
      : EXPENSE_CATEGORIES;

  const isLoading = addTx.isPending || updateTx.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description || !form.category || form.amount <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      if (editTx) {
        await updateTx.mutateAsync({
          id: editTx.id,
          tx: {
            ...editTx,
            amount: Number(form.amount),
            description: form.description,
            category: form.category,
            transactionType: form.transactionType,
            date: form.date,
            notes: form.notes,
          },
        });
        toast.success("Transaction updated");
      } else {
        await addTx.mutateAsync({
          id: crypto.randomUUID(),
          // userId is assigned server-side; cast to satisfy type
          userId: null as unknown as Transaction["userId"],
          createdAt: BigInt(Date.now()),
          amount: Number(form.amount),
          description: form.description,
          category: form.category,
          transactionType: form.transactionType,
          date: form.date,
          notes: form.notes,
        });
        toast.success("Transaction added");
      }
      onClose();
    } catch {
      toast.error("Failed to save transaction");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg" data-ocid="transaction-dialog">
        <DialogHeader>
          <DialogTitle className="font-display">
            {editTx ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
              Transaction Type
            </Label>
            <div className="grid grid-cols-2 gap-2" data-ocid="tx-type-toggle">
              {[TransactionType.income, TransactionType.expense].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, transactionType: t, category: "" }))
                  }
                  className={`py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                    form.transactionType === t
                      ? t === TransactionType.income
                        ? "border-success bg-success/10 text-success"
                        : "border-destructive bg-destructive/10 text-destructive"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  {t === TransactionType.income ? "Income" : "Expense"}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <Label htmlFor="amount" className="mb-1.5 block">
              Amount (₹) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                className="pl-9"
                placeholder="0.00"
                value={form.amount || ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    amount: Number.parseFloat(e.target.value) || 0,
                  }))
                }
                data-ocid="tx-amount-input"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <Label className="mb-1.5 block">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
            >
              <SelectTrigger data-ocid="tx-category-select">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="mb-1.5 block">
              Description <span className="text-destructive">*</span>
            </Label>
            <Input
              id="description"
              required
              placeholder="Brief description"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              data-ocid="tx-description-input"
            />
          </div>

          {/* Date */}
          <div>
            <Label htmlFor="date" className="mb-1.5 block">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              data-ocid="tx-date-input"
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="mb-1.5 block">
              Notes{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              rows={2}
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              data-ocid="tx-notes-input"
            />
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="tx-cancel-btn"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className={
                form.transactionType === TransactionType.income
                  ? "btn-income"
                  : "btn-expense"
              }
              data-ocid="tx-save-btn"
            >
              {isLoading ? "Saving…" : editTx ? "Update" : "Save Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete Confirm Dialog ─────────────────────────────────────
function DeleteDialog({
  open,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm" data-ocid="delete-dialog">
        <DialogHeader>
          <DialogTitle>Delete Transaction</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete this transaction? This action cannot
          be undone.
        </p>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            data-ocid="delete-cancel-btn"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={loading}
            onClick={onConfirm}
            data-ocid="delete-confirm-btn"
          >
            {loading ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────
interface TrackerPageProps {
  planType?: "free" | "premium";
  onUpgrade?: () => void;
}

const FREE_TX_LIMIT = 50;

export default function TrackerPage({
  planType = "free",
  onUpgrade,
}: TrackerPageProps) {
  const { data: transactions = [], isLoading } = useGetTransactions();
  const deleteTx = useDeleteTransaction();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all",
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  function applyQuickFilter(preset: "month" | "quarter" | "year") {
    const r = getQuickRange(preset);
    setStartDate(r.start);
    setEndDate(r.end);
  }

  // Filtered & sorted transactions
  const filtered = useMemo(() => {
    return transactions
      .filter((tx) => {
        if (filterType !== "all" && tx.transactionType !== filterType)
          return false;
        if (startDate && tx.date < startDate) return false;
        if (endDate && tx.date > endDate) return false;
        return true;
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [transactions, filterType, startDate, endDate]);

  // KPIs from ALL transactions (unfiltered)
  const { totalIncome, totalExpenses, netBalance, profitMargin } =
    useMemo(() => {
      const inc = transactions
        .filter((t) => t.transactionType === TransactionType.income)
        .reduce((s, t) => s + t.amount, 0);
      const exp = transactions
        .filter((t) => t.transactionType === TransactionType.expense)
        .reduce((s, t) => s + t.amount, 0);
      const net = inc - exp;
      const margin = inc > 0 ? (net / inc) * 100 : 0;
      return {
        totalIncome: inc,
        totalExpenses: exp,
        netBalance: net,
        profitMargin: margin,
      };
    }, [transactions]);

  // Running balance for table
  const txsWithBalance = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => (a.date > b.date ? 1 : -1));
    let running = 0;
    return sorted
      .map((tx) => {
        running +=
          tx.transactionType === TransactionType.income
            ? tx.amount
            : -tx.amount;
        return { ...tx, runningBalance: running };
      })
      .reverse();
  }, [filtered]);

  const atFreeLimit =
    planType === "free" && transactions.length >= FREE_TX_LIMIT;

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteTx.mutateAsync(deleteId);
      toast.success("Transaction deleted");
    } catch {
      toast.error("Failed to delete transaction");
    } finally {
      setDeleteId(null);
    }
  }

  function openAdd() {
    setEditTx(null);
    setDialogOpen(true);
  }

  function openEdit(tx: Transaction) {
    setEditTx(tx);
    setDialogOpen(true);
  }

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold font-display text-foreground">
            Transactions
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your income and expenses
          </p>
        </div>
        {atFreeLimit ? (
          <div
            className="flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-lg px-4 py-2 text-sm"
            data-ocid="freemium-banner"
          >
            <Crown className="w-4 h-4 text-accent flex-shrink-0" />
            <span className="text-foreground/80">
              Free plan limit reached (50 transactions)
            </span>
            {onUpgrade && (
              <Button
                size="sm"
                onClick={onUpgrade}
                className="btn-action h-7 text-xs ml-1"
                data-ocid="freemium-upgrade-btn"
              >
                Upgrade
              </Button>
            )}
          </div>
        ) : (
          <Button
            onClick={openAdd}
            className="btn-action"
            data-ocid="add-transaction-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        )}
      </div>

      {/* KPI Summary */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {(["kpi-0", "kpi-1", "kpi-2", "kpi-3"] as const).map((k) => (
            <Skeleton key={k} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            label="Total Income"
            value={formatINR(totalIncome)}
            icon={<TrendingUp className="w-4 h-4 text-success" />}
            colorClass="border-l-success"
          />
          <KpiCard
            label="Total Expenses"
            value={formatINR(totalExpenses)}
            icon={<TrendingDown className="w-4 h-4 text-destructive" />}
            colorClass="border-l-destructive"
          />
          <KpiCard
            label="Net Balance"
            value={formatINR(netBalance)}
            icon={
              <Wallet
                className={`w-4 h-4 ${netBalance >= 0 ? "text-success" : "text-destructive"}`}
              />
            }
            colorClass={
              netBalance >= 0 ? "border-l-success" : "border-l-destructive"
            }
          />
          <KpiCard
            label="Profit Margin"
            value={`${profitMargin.toFixed(1)}%`}
            icon={<Percent className="w-4 h-4 text-accent" />}
            colorClass="border-l-accent"
          />
        </div>
      )}

      {/* Filters */}
      <Card className="p-4" data-ocid="filter-bar">
        <div className="flex flex-col gap-3">
          {/* Quick filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide mr-1">
              Quick:
            </span>
            {(
              [
                { id: "month", label: "This Month" },
                { id: "quarter", label: "Last 3 Months" },
                { id: "year", label: "This Year" },
              ] as const
            ).map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => applyQuickFilter(q.id)}
                className="px-3 py-1 rounded-full text-xs font-medium border border-border hover:border-accent hover:text-accent transition-colors"
                data-ocid={`quick-filter-${q.id}`}
              >
                {q.label}
              </button>
            ))}
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="px-3 py-1 rounded-full text-xs font-medium border border-border text-muted-foreground hover:text-foreground transition-colors"
                data-ocid="clear-date-filter"
              >
                Clear dates
              </button>
            )}
          </div>

          {/* Date range + type filter */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2 flex-1">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-sm h-9"
                placeholder="Start date"
                data-ocid="filter-start-date"
              />
              <span className="text-muted-foreground text-sm">–</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-sm h-9"
                placeholder="End date"
                data-ocid="filter-end-date"
              />
            </div>
            <div className="flex gap-1.5">
              {(
                [
                  { id: "all", label: "All" },
                  { id: "income", label: "Income" },
                  { id: "expense", label: "Expense" },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterType(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    filterType === f.id
                      ? f.id === "income"
                        ? "bg-success/10 border-success text-success"
                        : f.id === "expense"
                          ? "bg-destructive/10 border-destructive text-destructive"
                          : "bg-primary/10 border-primary text-primary"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                  data-ocid={`type-filter-${f.id}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Transactions list / table */}
      {isLoading ? (
        <div className="space-y-2">
          {(["sk-0", "sk-1", "sk-2", "sk-3", "sk-4"] as const).map((k) => (
            <Skeleton key={k} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : txsWithBalance.length === 0 ? (
        transactions.length === 0 ? (
          <EmptyState onAdd={openAdd} />
        ) : (
          <div
            className="flex flex-col items-center py-12 text-center text-muted-foreground"
            data-ocid="filtered-empty"
          >
            <AlertTriangle className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">No transactions match your filters.</p>
          </div>
        )
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block" data-ocid="transactions-table">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                        Date
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                        Description
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                        Category
                      </th>
                      <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                        Amount
                      </th>
                      <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                        Balance
                      </th>
                      <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {txsWithBalance.map((tx) => (
                      <tr
                        key={tx.id}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                        data-ocid={`tx-row-${tx.id}`}
                      >
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {formatDate(tx.date)}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground max-w-xs">
                          <span className="truncate block">
                            {tx.description}
                          </span>
                          {tx.notes && (
                            <span className="text-xs text-muted-foreground truncate block">
                              {tx.notes}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="secondary"
                            className="text-xs font-medium"
                          >
                            {tx.category}
                          </Badge>
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-mono font-semibold whitespace-nowrap ${
                            tx.transactionType === TransactionType.income
                              ? "text-success"
                              : "text-destructive"
                          }`}
                        >
                          {tx.transactionType === TransactionType.income
                            ? "+"
                            : "−"}
                          {formatINR(tx.amount)}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-mono text-xs whitespace-nowrap ${
                            tx.runningBalance >= 0
                              ? "text-success"
                              : "text-destructive"
                          }`}
                        >
                          {formatINR(tx.runningBalance)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openEdit(tx)}
                              className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                              aria-label="Edit transaction"
                              data-ocid={`edit-tx-${tx.id}`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteId(tx.id)}
                              className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                              aria-label="Delete transaction"
                              data-ocid={`delete-tx-${tx.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Mobile card list */}
          <div
            className="md:hidden space-y-2"
            data-ocid="transactions-mobile-list"
          >
            {txsWithBalance.map((tx) => (
              <Card key={tx.id} className="p-4" data-ocid={`tx-card-${tx.id}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          tx.transactionType === TransactionType.income
                            ? "bg-success"
                            : "bg-destructive"
                        }`}
                      />
                      <p className="font-medium text-foreground text-sm truncate">
                        {tx.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {tx.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(tx.date)}
                      </span>
                    </div>
                    {tx.notes && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {tx.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span
                      className={`font-mono font-bold text-sm ${
                        tx.transactionType === TransactionType.income
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    >
                      {tx.transactionType === TransactionType.income
                        ? "+"
                        : "−"}
                      {formatINR(tx.amount)}
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(tx)}
                        className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground"
                        aria-label="Edit"
                        data-ocid={`edit-mobile-${tx.id}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(tx.id)}
                        className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                        aria-label="Delete"
                        data-ocid={`delete-mobile-${tx.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Dialogs */}
      <TransactionDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditTx(null);
        }}
        editTx={editTx}
      />
      <DeleteDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleteTx.isPending}
      />
    </div>
  );
}
