import type {
  Alert,
  AlertSettings,
  AlertType,
  BusinessProfile,
  Invoice,
  InvoiceItem,
  QrCheck,
  QrCheckResult,
  Transaction,
  TransactionType,
} from "../backend";

// Re-export backend types
export type {
  Alert,
  AlertSettings,
  AlertType,
  BusinessProfile,
  Invoice,
  InvoiceItem,
  QrCheck,
  QrCheckResult,
  Transaction,
  TransactionType,
};

export type PlanType = "free" | "premium";

// Form types
export interface TransactionFormData {
  amount: number;
  description: string;
  category: string;
  transactionType: TransactionType;
  date: string;
  notes: string;
}

export interface InvoiceFormData {
  customerName: string;
  customerAddress: string;
  dueDate: string;
  items: InvoiceItem[];
  gstRate: number;
  status: string;
}

// UI state types
export type BizSection =
  | "dashboard"
  | "transactions"
  | "invoices"
  | "qrscanner"
  | "reports"
  | "alerts"
  | "pricing";

export interface KpiCard {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  variant: "income" | "expense" | "balance" | "accent";
}

export interface NavItem {
  id: BizSection;
  label: string;
  icon: string;
  badge?: number;
}

// Dashboard summary derived from transactions/invoices
export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  profitMargin: number;
  pendingInvoices: number;
  pendingAmount: number;
  recentAlerts: number;
}
