import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Alert {
    id: string;
    alertType: AlertType;
    userId: Principal;
    createdAt: bigint;
    isRead: boolean;
    message: string;
}
export interface InvoiceItem {
    rate: number;
    description: string;
    quantity: number;
    amount: number;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Invoice {
    id: string;
    customerName: string;
    status: string;
    total: number;
    businessGst: string;
    userId: Principal;
    date: string;
    createdAt: bigint;
    businessName: string;
    dueDate: string;
    gstAmount: number;
    invoiceNumber: string;
    customerAddress: string;
    gstRate: number;
    items: Array<InvoiceItem>;
    subtotal: number;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Transaction {
    id: string;
    transactionType: TransactionType;
    userId: Principal;
    date: string;
    createdAt: bigint;
    description: string;
    notes: string;
    category: string;
    amount: number;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface QrCheck {
    id: string;
    merchantName: string;
    result: QrCheckResult;
    userId: Principal;
    upiId: string;
    checkedAt: bigint;
    amount?: number;
    reason: string;
    qrData: string;
}
export interface BusinessProfile {
    contactName: string;
    userId: Principal;
    businessName: string;
    email: string;
    gstId: string;
    address: string;
    phone: string;
    planType: string;
}
export interface UserProfile {
    name: string;
}
export interface AlertSettings {
    lowBalanceThreshold: number;
    pendingInvoiceDays: bigint;
    unusualSpendingMultiplier: number;
}
export enum AlertType {
    lowBalance = "lowBalance",
    custom = "custom",
    unusualSpending = "unusualSpending",
    pendingInvoice = "pendingInvoice"
}
export enum QrCheckResult {
    warning = "warning",
    safe = "safe",
    suspicious = "suspicious"
}
export enum TransactionType {
    expense = "expense",
    income = "income"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addInvoice(invoice: Invoice): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    addQrCheck(check: QrCheck): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    addTransaction(tx: Transaction): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    deleteInvoice(id: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deleteTransaction(id: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    dismissAlert(id: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getAlertSettings(): Promise<AlertSettings | null>;
    getAlerts(): Promise<Array<Alert>>;
    getBusinessProfile(): Promise<BusinessProfile | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getInvoices(): Promise<Array<Invoice>>;
    getQrChecks(): Promise<Array<QrCheck>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getTransactions(): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    markAlertRead(id: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    saveAlertSettings(settings: AlertSettings): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    saveBusinessProfile(profile: BusinessProfile): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateInvoice(id: string, invoice: Invoice): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateTransaction(id: string, tx: Transaction): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
}
