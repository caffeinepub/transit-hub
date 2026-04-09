import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  Crown,
  Eye,
  FileText,
  Pencil,
  Plus,
  Printer,
  Trash2,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import {
  useAddInvoice,
  useDeleteInvoice,
  useGetInvoices,
  useUpdateInvoice,
} from "../../hooks/useBizControl";
import type { Invoice, InvoiceItem } from "../../types/bizcontrol";

// ── Constants ─────────────────────────────────────────────────
const GST_RATES = [0, 5, 12, 18, 28] as const;
const FREE_LIMIT = 5;

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);

function genInvoiceNumber(count: number) {
  const year = new Date().getFullYear();
  const num = String(count + 1).padStart(3, "0");
  return `INV-${year}-${num}`;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function dueDateDefault() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

// ── Types ─────────────────────────────────────────────────────
interface FormState {
  businessName: string;
  businessGst: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  customerName: string;
  customerAddress: string;
  items: InvoiceItem[];
  gstRate: number;
  paymentTerms: string;
  status: string;
}

function emptyForm(count: number): FormState {
  return {
    businessName: "",
    businessGst: "",
    invoiceNumber: genInvoiceNumber(count),
    date: todayStr(),
    dueDate: dueDateDefault(),
    customerName: "",
    customerAddress: "",
    items: [{ description: "", quantity: 1, rate: 0, amount: 0 }],
    gstRate: 18,
    paymentTerms: "",
    status: "draft",
  };
}

// ── Status Badge ──────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-orange-100 text-orange-700 border-orange-200",
  draft: "bg-muted text-muted-foreground border-border",
  overdue: "bg-red-100 text-red-700 border-red-200",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={`text-xs font-semibold capitalize px-2 py-0.5 ${STATUS_STYLES[status] ?? STATUS_STYLES.draft}`}
    >
      {status}
    </Badge>
  );
}

// ── Line Item Row ─────────────────────────────────────────────
interface ItemRowProps {
  item: InvoiceItem;
  index: number;
  onChange: (
    index: number,
    field: keyof InvoiceItem,
    value: string | number,
  ) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

function ItemRow({ item, index, onChange, onRemove, canRemove }: ItemRowProps) {
  return (
    <div className="grid grid-cols-[1fr_80px_100px_100px_36px] gap-2 items-start">
      <Input
        placeholder="Item description"
        value={item.description}
        onChange={(e) => onChange(index, "description", e.target.value)}
        className="text-sm"
        data-ocid={`item-desc-${index}`}
      />
      <Input
        type="number"
        min={1}
        placeholder="Qty"
        value={item.quantity || ""}
        onChange={(e) => onChange(index, "quantity", Number(e.target.value))}
        className="text-sm text-right"
        data-ocid={`item-qty-${index}`}
      />
      <Input
        type="number"
        min={0}
        placeholder="Rate ₹"
        value={item.rate || ""}
        onChange={(e) => onChange(index, "rate", Number(e.target.value))}
        className="text-sm text-right"
        data-ocid={`item-rate-${index}`}
      />
      <div className="flex items-center h-9 px-3 bg-muted/50 rounded-md text-sm font-medium text-foreground justify-end">
        ₹{(item.quantity * item.rate).toLocaleString("en-IN")}
      </div>
      <button
        type="button"
        onClick={() => onRemove(index)}
        disabled={!canRemove}
        aria-label="Remove item"
        className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        data-ocid={`item-remove-${index}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Invoice Form Dialog ────────────────────────────────────────
interface InvoiceFormDialogProps {
  open: boolean;
  onClose: () => void;
  initialData?: Invoice | null;
  totalCount: number;
  identity?: { getPrincipal: () => unknown } | null;
}

function InvoiceFormDialog({
  open,
  onClose,
  initialData,
  totalCount,
  identity,
}: InvoiceFormDialogProps) {
  const isEdit = !!initialData;
  const addInvoice = useAddInvoice();
  const updateInvoice = useUpdateInvoice();

  const [form, setForm] = useState<FormState>(() => {
    if (initialData) {
      return {
        businessName: initialData.businessName,
        businessGst: initialData.businessGst,
        invoiceNumber: initialData.invoiceNumber,
        date: initialData.date,
        dueDate: initialData.dueDate,
        customerName: initialData.customerName,
        customerAddress: initialData.customerAddress,
        items:
          initialData.items.length > 0
            ? initialData.items
            : [{ description: "", quantity: 1, rate: 0, amount: 0 }],
        gstRate: initialData.gstRate,
        paymentTerms: "",
        status: initialData.status,
      };
    }
    return emptyForm(totalCount);
  });

  const [previewOpen, setPreviewOpen] = useState(false);

  const setField = useCallback(
    <K extends keyof FormState>(key: K, val: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: val }));
    },
    [],
  );

  const handleItemChange = useCallback(
    (index: number, field: keyof InvoiceItem, value: string | number) => {
      setForm((prev) => {
        const items = prev.items.map((item, i) => {
          if (i !== index) return item;
          const updated = { ...item, [field]: value };
          updated.amount = updated.quantity * updated.rate;
          return updated;
        });
        return { ...prev, items };
      });
    },
    [],
  );

  const addItem = () =>
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { description: "", quantity: 1, rate: 0, amount: 0 },
      ],
    }));

  const removeItem = (index: number) =>
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));

  const subtotal = form.items.reduce(
    (s, item) => s + item.quantity * item.rate,
    0,
  );
  const gstAmount = subtotal * (form.gstRate / 100);
  const total = subtotal + gstAmount;

  const buildInvoice = (): Invoice => ({
    id: initialData?.id ?? crypto.randomUUID(),
    invoiceNumber: form.invoiceNumber,
    businessName: form.businessName,
    businessGst: form.businessGst,
    date: form.date,
    dueDate: form.dueDate,
    customerName: form.customerName,
    customerAddress: form.customerAddress,
    items: form.items.map((it) => ({ ...it, amount: it.quantity * it.rate })),
    gstRate: form.gstRate,
    gstAmount,
    subtotal,
    total,
    status: form.status,
    userId: identity?.getPrincipal() as unknown as Invoice["userId"],
    createdAt: initialData?.createdAt ?? BigInt(Date.now()),
  });

  const handleSave = async (status?: string) => {
    if (!form.customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }
    const inv = buildInvoice();
    if (status) inv.status = status;

    try {
      if (isEdit && initialData) {
        await updateInvoice.mutateAsync({ id: initialData.id, invoice: inv });
        toast.success("Invoice updated");
      } else {
        await addInvoice.mutateAsync(inv);
        toast.success("Invoice saved");
      }
      onClose();
    } catch {
      toast.error("Failed to save invoice");
    }
  };

  const isPending = addInvoice.isPending || updateInvoice.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border sticky top-0 bg-card z-10">
            <DialogTitle className="text-lg font-semibold font-display">
              {isEdit ? "Edit Invoice" : "Create Invoice"}
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-5 space-y-6">
            {/* Business Details */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Business Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    placeholder="Your Business Name"
                    value={form.businessName}
                    onChange={(e) => setField("businessName", e.target.value)}
                    data-ocid="form-business-name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gstId">GST / Tax ID</Label>
                  <Input
                    id="gstId"
                    placeholder="22AAAAA0000A1Z5"
                    value={form.businessGst}
                    onChange={(e) => setField("businessGst", e.target.value)}
                    data-ocid="form-gst-id"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={form.invoiceNumber}
                    onChange={(e) => setField("invoiceNumber", e.target.value)}
                    data-ocid="form-invoice-number"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="invoiceDate">Invoice Date</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={form.date}
                    onChange={(e) => setField("date", e.target.value)}
                    data-ocid="form-invoice-date"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2 sm:max-w-[calc(50%-6px)]">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setField("dueDate", e.target.value)}
                    data-ocid="form-due-date"
                  />
                </div>
              </div>
            </section>

            {/* Customer Details */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Customer Details
              </h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    placeholder="Customer or Company Name"
                    value={form.customerName}
                    onChange={(e) => setField("customerName", e.target.value)}
                    data-ocid="form-customer-name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="customerAddress">Customer Address</Label>
                  <Textarea
                    id="customerAddress"
                    placeholder="Street, City, State, PIN"
                    rows={2}
                    value={form.customerAddress}
                    onChange={(e) =>
                      setField("customerAddress", e.target.value)
                    }
                    data-ocid="form-customer-address"
                  />
                </div>
              </div>
            </section>

            {/* Line Items */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Line Items
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="text-xs h-7 gap-1.5"
                  data-ocid="add-item-btn"
                >
                  <Plus className="w-3 h-3" />
                  Add Item
                </Button>
              </div>

              {/* Column headers */}
              <div className="grid grid-cols-[1fr_80px_100px_100px_36px] gap-2 mb-1.5 px-0.5">
                {["Description", "Qty", "Rate (₹)", "Amount", ""].map((h) => (
                  <span
                    key={h}
                    className="text-xs text-muted-foreground font-medium"
                  >
                    {h}
                  </span>
                ))}
              </div>

              <div className="space-y-2" data-ocid="items-list">
                {form.items.map((item, i) => (
                  <ItemRow
                    key={`item-${String(i)}`}
                    item={item}
                    index={i}
                    onChange={handleItemChange}
                    onRemove={removeItem}
                    canRemove={form.items.length > 1}
                  />
                ))}
              </div>

              {/* Calculations */}
              <div className="mt-4 border-t border-border pt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{fmt(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">GST Rate</span>
                    <Select
                      value={String(form.gstRate)}
                      onValueChange={(v) => setField("gstRate", Number(v))}
                    >
                      <SelectTrigger
                        className="h-7 w-24 text-xs"
                        data-ocid="gst-rate-select"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GST_RATES.map((r) => (
                          <SelectItem key={r} value={String(r)}>
                            {r}%
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <span className="font-medium">{fmt(gstAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-base font-bold border-t border-border pt-2">
                  <span>Total</span>
                  <span className="text-primary">{fmt(total)}</span>
                </div>
              </div>
            </section>

            {/* Payment Terms */}
            <section>
              <div className="space-y-1.5">
                <Label htmlFor="paymentTerms">
                  Payment Terms{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="paymentTerms"
                  placeholder="e.g. Net 30 days, advance payment required"
                  value={form.paymentTerms}
                  onChange={(e) => setField("paymentTerms", e.target.value)}
                  data-ocid="form-payment-terms"
                />
              </div>
            </section>

            {/* Status */}
            <section>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setField("status", v)}
                >
                  <SelectTrigger
                    className="w-40"
                    data-ocid="form-status-select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </section>
          </div>

          {/* Footer actions */}
          <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewOpen(true)}
              className="gap-1.5"
              data-ocid="preview-btn"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </Button>
            <div className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              data-ocid="cancel-btn"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave()}
              disabled={isPending}
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold gap-1.5"
              data-ocid="save-btn"
            >
              {isPending
                ? "Saving..."
                : isEdit
                  ? "Update Invoice"
                  : "Save Invoice"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <InvoicePreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        invoice={buildInvoice()}
        paymentTerms={form.paymentTerms}
      />
    </>
  );
}

// ── Invoice Preview Dialog ─────────────────────────────────────
interface InvoicePreviewProps {
  open: boolean;
  onClose: () => void;
  invoice: Invoice;
  paymentTerms?: string;
}

function InvoicePreviewDialog({
  open,
  onClose,
  invoice,
  paymentTerms,
}: InvoicePreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${invoice.invoiceNumber}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: system-ui, sans-serif; font-size: 13px; color: #111; padding: 32px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb; margin-bottom: 20px; }
            .biz-name { font-size: 20px; font-weight: 700; }
            .meta { font-size: 11px; color: #666; margin-top: 4px; }
            .inv-title { text-align: right; }
            .inv-num { font-size: 22px; font-weight: 700; color: #f97316; }
            .section { margin-bottom: 20px; }
            .section-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #999; margin-bottom: 6px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f3f4f6; text-align: left; padding: 8px 10px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #666; }
            th.right, td.right { text-align: right; }
            td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
            .totals { margin-top: 16px; display: flex; justify-content: flex-end; }
            .totals-table { width: 240px; }
            .totals-table td { border: none; padding: 4px 0; }
            .grand-total td { font-size: 15px; font-weight: 700; border-top: 2px solid #e5e7eb; padding-top: 8px; }
            .terms { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666; }
            .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #aaa; border-top: 1px solid #e5e7eb; padding-top: 12px; }
          </style>
        </head>
        <body>${content.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border flex-row items-center justify-between">
          <DialogTitle className="text-base font-semibold font-display">
            Invoice Preview
          </DialogTitle>
          <Button
            size="sm"
            onClick={handlePrint}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 mr-6"
            data-ocid="print-btn"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Download PDF
          </Button>
        </DialogHeader>

        <div className="p-6">
          <div
            ref={printRef}
            className="bg-card border border-border rounded-xl p-6 space-y-5"
          >
            {/* Invoice Header */}
            <div className="header flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-border">
              <div>
                <p className="biz-name text-xl font-bold font-display text-foreground">
                  {invoice.businessName || "Your Business"}
                </p>
                {invoice.businessGst && (
                  <p className="meta text-xs text-muted-foreground mt-1">
                    GSTIN: {invoice.businessGst}
                  </p>
                )}
              </div>
              <div className="inv-title sm:text-right">
                <p className="inv-num text-2xl font-bold text-accent">
                  INVOICE
                </p>
                <p className="text-sm font-semibold text-foreground mt-0.5">
                  {invoice.invoiceNumber}
                </p>
                <p className="meta text-xs text-muted-foreground">
                  Date: {invoice.date}
                </p>
                <p className="meta text-xs text-muted-foreground">
                  Due: {invoice.dueDate}
                </p>
              </div>
            </div>

            {/* Customer */}
            <div className="section">
              <p className="section-label text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
                Bill To
              </p>
              <p className="text-sm font-semibold text-foreground">
                {invoice.customerName}
              </p>
              {invoice.customerAddress && (
                <p className="text-xs text-muted-foreground whitespace-pre-line mt-0.5">
                  {invoice.customerAddress}
                </p>
              )}
            </div>

            {/* Items Table */}
            <div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground rounded-l-lg">
                      Description
                    </th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground">
                      Qty
                    </th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground">
                      Rate
                    </th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground rounded-r-lg">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, i) => (
                    <tr
                      key={`preview-item-${String(i)}`}
                      className="border-b border-border/50"
                    >
                      <td className="px-3 py-2.5 text-foreground">
                        {item.description || "—"}
                      </td>
                      <td className="px-3 py-2.5 text-right text-muted-foreground">
                        {item.quantity}
                      </td>
                      <td className="px-3 py-2.5 text-right text-muted-foreground">
                        ₹{item.rate.toLocaleString("en-IN")}
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium text-foreground">
                        ₹{(item.quantity * item.rate).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="totals flex justify-end">
              <div className="totals-table w-60 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{fmt(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    GST ({invoice.gstRate}%)
                  </span>
                  <span className="font-medium">{fmt(invoice.gstAmount)}</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t border-border pt-2 mt-2">
                  <span>Total</span>
                  <span className="text-primary">{fmt(invoice.total)}</span>
                </div>
              </div>
            </div>

            {/* Payment Terms */}
            {paymentTerms && (
              <div className="terms pt-4 border-t border-border">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                  Payment Terms
                </p>
                <p className="text-sm text-muted-foreground">{paymentTerms}</p>
              </div>
            )}

            <div className="footer text-center pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Thank you for your business!
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Invoice Table Row ─────────────────────────────────────────
interface InvoiceRowProps {
  invoice: Invoice;
  index: number;
  onView: (inv: Invoice) => void;
  onEdit: (inv: Invoice) => void;
  onDelete: (id: string) => void;
}

function InvoiceRow({
  invoice,
  index,
  onView,
  onEdit,
  onDelete,
}: InvoiceRowProps) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="border-b border-border hover:bg-muted/30 transition-colors"
      data-ocid={`invoice-row-${invoice.id}`}
    >
      <td className="px-4 py-3 text-sm font-mono font-medium text-primary">
        {invoice.invoiceNumber}
      </td>
      <td className="px-4 py-3 text-sm text-foreground font-medium truncate max-w-[150px]">
        {invoice.customerName}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {invoice.date}
      </td>
      <td className="px-4 py-3 text-sm text-right font-medium text-foreground">
        {fmt(invoice.subtotal)}
      </td>
      <td className="px-4 py-3 text-sm text-right text-muted-foreground">
        {fmt(invoice.gstAmount)}
      </td>
      <td className="px-4 py-3 text-sm text-right font-bold text-foreground">
        {fmt(invoice.total)}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={invoice.status} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 justify-end">
          <button
            type="button"
            onClick={() => onView(invoice)}
            aria-label="View invoice"
            className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            data-ocid={`view-invoice-${invoice.id}`}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(invoice)}
            aria-label="Edit invoice"
            className="p-1.5 rounded-md hover:bg-accent/10 text-muted-foreground hover:text-accent transition-colors"
            data-ocid={`edit-invoice-${invoice.id}`}
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(invoice.id)}
            aria-label="Delete invoice"
            className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            data-ocid={`delete-invoice-${invoice.id}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

// ── Upgrade Prompt ─────────────────────────────────────────────
function UpgradePrompt() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-10 px-6 text-center border border-dashed border-accent/40 rounded-xl bg-accent/5"
      data-ocid="upgrade-prompt"
    >
      <div className="w-12 h-12 rounded-2xl bg-accent/15 flex items-center justify-center mb-3">
        <Crown className="w-6 h-6 text-accent" />
      </div>
      <h3 className="text-base font-bold font-display text-foreground mb-1.5">
        Upgrade to Create More Invoices
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">
        Free plan is limited to {FREE_LIMIT} invoices. Upgrade to Premium for
        unlimited invoices, advanced reports, and priority support.
      </p>
      <Button
        className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold gap-2"
        data-ocid="upgrade-cta"
      >
        <Crown className="w-4 h-4" />
        Upgrade to Premium
      </Button>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function InvoicesPage() {
  const { identity } = useInternetIdentity();
  const { data: invoices = [], isLoading } = useGetInvoices();
  const deleteInvoice = useDeleteInvoice();

  const [formOpen, setFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  // Freemium check — assume free unless profile says premium
  const isFree = true; // plan check handled via profile; default to free for guard
  const atFreeLimit = isFree && invoices.length >= FREE_LIMIT;

  const handleCreateClick = () => {
    if (atFreeLimit) return;
    setEditingInvoice(null);
    setFormOpen(true);
  };

  const handleEdit = (inv: Invoice) => {
    setEditingInvoice(inv);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteInvoice.mutateAsync(id);
      toast.success("Invoice deleted");
    } catch {
      toast.error("Failed to delete invoice");
    }
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingInvoice(null);
  };

  const pendingCount = invoices.filter((i) => i.status === "pending").length;
  const paidTotal = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + i.total, 0);

  return (
    <div className="p-5 lg:p-7 space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Invoices
          </p>
          <h1 className="text-2xl font-bold font-display text-foreground">
            Invoice &amp; GST Generator
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {invoices.length} invoice{invoices.length !== 1 ? "s" : ""} total
            {pendingCount > 0 && (
              <>
                {" "}
                &nbsp;·&nbsp;{" "}
                <span className="text-orange-600 font-medium">
                  {pendingCount} pending
                </span>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {atFreeLimit ? (
            <Button
              disabled
              size="sm"
              className="bg-accent/50 text-accent-foreground font-semibold gap-1.5 cursor-not-allowed"
              title={`Free plan limit of ${FREE_LIMIT} invoices reached`}
              data-ocid="create-invoice-btn-disabled"
            >
              <Plus className="w-4 h-4" />
              Create Invoice
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleCreateClick}
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold gap-1.5"
              data-ocid="create-invoice-btn"
            >
              <Plus className="w-4 h-4" />
              Create Invoice
            </Button>
          )}
        </div>
      </motion.div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total Invoices",
            value: String(invoices.length),
            color: "text-primary",
            bg: "bg-blue-50",
          },
          {
            label: "Pending Amount",
            value: fmt(
              invoices
                .filter((i) => i.status === "pending")
                .reduce((s, i) => s + i.total, 0),
            ),
            color: "text-orange-600",
            bg: "bg-orange-50",
          },
          {
            label: "Collected (Paid)",
            value: fmt(paidTotal),
            color: "text-green-600",
            bg: "bg-green-50",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="border border-border shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} flex-shrink-0`}
                >
                  <FileText className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className={`text-xl font-bold font-display ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Upgrade prompt if at limit */}
      {atFreeLimit && <UpgradePrompt />}

      {/* Invoice List */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="px-5 py-4 pb-3 border-b border-border">
          <CardTitle className="text-sm font-semibold text-foreground">
            All Invoices
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-5 w-28 rounded" />
                  <Skeleton className="h-5 w-36 rounded flex-1" />
                  <Skeleton className="h-5 w-20 rounded" />
                  <Skeleton className="h-5 w-16 rounded" />
                </div>
              ))}
            </div>
          ) : invoices.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 text-center px-6"
              data-ocid="empty-invoices-state"
            >
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-muted-foreground/50" />
              </div>
              <h3 className="text-base font-semibold font-display text-foreground mb-1.5">
                No invoices yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs mb-4">
                Create your first GST-compliant invoice to get started.
              </p>
              <Button
                size="sm"
                onClick={handleCreateClick}
                className="bg-accent hover:bg-accent/90 text-accent-foreground gap-1.5"
                data-ocid="empty-create-btn"
              >
                <Plus className="w-4 h-4" />
                Create Invoice
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {[
                      "Invoice #",
                      "Customer",
                      "Date",
                      "Amount",
                      "GST",
                      "Total",
                      "Status",
                      "Actions",
                    ].map((h, i) => (
                      <th
                        key={h}
                        className={`px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide ${
                          i >= 3 && i <= 5
                            ? "text-right"
                            : i === 7
                              ? "text-right"
                              : "text-left"
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody data-ocid="invoices-table">
                  {invoices.map((inv, i) => (
                    <InvoiceRow
                      key={inv.id}
                      invoice={inv}
                      index={i}
                      onView={setPreviewInvoice}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      {formOpen && (
        <InvoiceFormDialog
          open={formOpen}
          onClose={closeForm}
          initialData={editingInvoice}
          totalCount={invoices.length}
          identity={identity}
        />
      )}

      {/* Preview Dialog (view only) */}
      {previewInvoice && (
        <InvoicePreviewDialog
          open={!!previewInvoice}
          onClose={() => setPreviewInvoice(null)}
          invoice={previewInvoice}
        />
      )}
    </div>
  );
}
