import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useQRScanner } from "@/lib/qr-scanner";
import type { Principal } from "@icp-sdk/core/principal";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ClipboardList,
  History,
  Keyboard,
  RotateCcw,
  Save,
  Shield,
  ShieldAlert,
  ShieldCheck,
  SwitchCamera,
  Trash2,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { QrCheckResult } from "../../backend";
import { useAddQrCheck, useGetQrChecks } from "../../hooks/useBizControl";
import type { QrCheck } from "../../types/bizcontrol";

// ── Safety Analysis ────────────────────────────────────────────

interface ParsedUPI {
  upiId: string;
  merchantName: string;
  amount: number | undefined;
  rawData: string;
}

function parseUPIData(raw: string): ParsedUPI {
  const result: ParsedUPI = {
    upiId: "",
    merchantName: "",
    amount: undefined,
    rawData: raw,
  };
  try {
    if (raw.startsWith("upi://")) {
      const url = new URL(raw.replace("upi://pay?", "https://dummy.com/pay?"));
      result.upiId = url.searchParams.get("pa") ?? "";
      result.merchantName = decodeURIComponent(
        url.searchParams.get("pn") ?? "",
      );
      const am = url.searchParams.get("am");
      if (am) result.amount = Number.parseFloat(am);
    } else {
      // Might be a raw UPI ID
      result.upiId = raw.trim();
    }
  } catch {
    result.upiId = raw.trim();
  }
  return result;
}

function checkSafety(
  upiId: string,
  merchantName: string,
  amount: number | undefined,
): { result: QrCheckResult; reason: string } {
  // SUSPICIOUS checks
  const suspiciousPatterns = [
    /['";<>{}|\\^`]/,
    /select\s+.*\s+from/i,
    /drop\s+table/i,
    /union\s+select/i,
    /insert\s+into/i,
    /script\s*:/i,
    /javascript\s*:/i,
    /\s{3,}/,
  ];
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(upiId) || pattern.test(merchantName)) {
      return {
        result: QrCheckResult.suspicious,
        reason:
          "UPI data contains suspicious patterns that may indicate a phishing or injection attack.",
      };
    }
  }

  const upiFormat = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9]+$/;
  if (upiId && !upiFormat.test(upiId)) {
    return {
      result: QrCheckResult.suspicious,
      reason:
        "UPI ID format is invalid or contains unusual characters. Verify before proceeding.",
    };
  }

  // WARNING checks
  if (!merchantName.trim()) {
    return {
      result: QrCheckResult.warning,
      reason:
        "Merchant name is missing from the QR code. This is unusual for legitimate payment QRs.",
    };
  }
  if (amount !== undefined && amount === 0) {
    return {
      result: QrCheckResult.warning,
      reason:
        "Payment amount is zero. Confirm the actual amount before paying.",
    };
  }

  // SAFE
  return {
    result: QrCheckResult.safe,
    reason:
      "UPI ID format is valid, merchant name is present, and no suspicious patterns detected.",
  };
}

// ── Sub-components ─────────────────────────────────────────────

function SafetyBadge({ result }: { result: QrCheckResult }) {
  if (result === QrCheckResult.safe) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[oklch(var(--success)/0.12)] px-3 py-1 text-sm font-semibold text-[oklch(var(--success))]">
        <ShieldCheck className="h-4 w-4" /> SAFE
      </span>
    );
  }
  if (result === QrCheckResult.warning) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[oklch(var(--accent)/0.12)] px-3 py-1 text-sm font-semibold text-[oklch(var(--accent))]">
        <AlertTriangle className="h-4 w-4" /> WARNING
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[oklch(var(--destructive)/0.12)] px-3 py-1 text-sm font-semibold text-[oklch(var(--destructive))]">
      <ShieldAlert className="h-4 w-4" /> SUSPICIOUS
    </span>
  );
}

function HistoryBadge({ result }: { result: QrCheckResult }) {
  if (result === QrCheckResult.safe)
    return (
      <Badge className="bg-[oklch(var(--success)/0.12)] text-[oklch(var(--success))] hover:bg-[oklch(var(--success)/0.2)] border-0">
        Safe
      </Badge>
    );
  if (result === QrCheckResult.warning)
    return (
      <Badge className="bg-[oklch(var(--accent)/0.12)] text-[oklch(var(--accent))] hover:bg-[oklch(var(--accent)/0.2)] border-0">
        Warning
      </Badge>
    );
  return (
    <Badge className="bg-[oklch(var(--destructive)/0.12)] text-[oklch(var(--destructive))] hover:bg-[oklch(var(--destructive)/0.2)] border-0">
      Suspicious
    </Badge>
  );
}

function formatTs(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleString();
}

// ── Main Page ──────────────────────────────────────────────────

export default function QRScannerPage() {
  const { data: history = [], isLoading: histLoading } = useGetQrChecks();
  const addCheck = useAddQrCheck();

  // Form state
  const [qrDataText, setQrDataText] = useState("");
  const [upiId, setUpiId] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [amount, setAmount] = useState("");
  const [checkResult, setCheckResult] = useState<{
    result: QrCheckResult;
    reason: string;
    upiId: string;
    merchantName: string;
    amount: number | undefined;
    qrData: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"scan" | "manual">("scan");
  const hasProcessedRef = useRef<string>("");

  // QR Scanner
  const {
    videoRef,
    canvasRef,
    qrResults,
    isScanning,
    isActive,
    isSupported,
    error: cameraError,
    isLoading: cameraLoading,
    canStartScanning,
    startScanning,
    stopScanning,
    switchCamera,
    clearResults,
  } = useQRScanner({
    facingMode: "environment",
    scanInterval: 150,
    maxResults: 3,
  });

  // Auto-populate form when QR scanned
  useEffect(() => {
    if (!qrResults.length) return;
    const latest = qrResults[0];
    if (latest.data === hasProcessedRef.current) return;
    hasProcessedRef.current = latest.data;

    const parsed = parseUPIData(latest.data);
    setQrDataText(latest.data);
    setUpiId(parsed.upiId);
    setMerchantName(parsed.merchantName);
    setAmount(parsed.amount !== undefined ? String(parsed.amount) : "");

    const safety = checkSafety(
      parsed.upiId,
      parsed.merchantName,
      parsed.amount,
    );
    setCheckResult({
      ...safety,
      upiId: parsed.upiId,
      merchantName: parsed.merchantName,
      amount: parsed.amount,
      qrData: latest.data,
    });

    stopScanning();
    setActiveTab("manual");
    toast.success("QR code scanned! Review results below.");
  }, [qrResults, stopScanning]);

  const handleManualCheck = useCallback(() => {
    const parsedAmt = amount ? Number.parseFloat(amount) : undefined;
    const safety = checkSafety(upiId, merchantName, parsedAmt);
    setCheckResult({
      ...safety,
      upiId,
      merchantName,
      amount: parsedAmt,
      qrData: qrDataText || upiId,
    });
  }, [upiId, merchantName, amount, qrDataText]);

  const handleSaveToHistory = useCallback(async () => {
    if (!checkResult) return;
    const check: QrCheck = {
      id: crypto.randomUUID(),
      upiId: checkResult.upiId,
      merchantName: checkResult.merchantName,
      result: checkResult.result,
      reason: checkResult.reason,
      qrData: checkResult.qrData,
      checkedAt: BigInt(Date.now()) * BigInt(1_000_000),
      amount: checkResult.amount,
      userId: undefined as unknown as Principal,
    };
    try {
      await addCheck.mutateAsync(check);
      toast.success("Saved to history.");
      setCheckResult(null);
      setQrDataText("");
      setUpiId("");
      setMerchantName("");
      setAmount("");
    } catch {
      toast.error("Failed to save. Please try again.");
    }
  }, [checkResult, addCheck]);

  const handleClearHistory = useCallback(() => {
    toast.info(
      "History is managed on the backend — delete from your profile if needed.",
    );
  }, []);

  const isMobile =
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

  return (
    <div className="flex flex-col gap-6 pb-8 p-5 lg:p-7">
      {/* Hero */}
      <div className="rounded-xl bg-[oklch(var(--sidebar-background))] px-6 py-8 text-[oklch(var(--sidebar-foreground))]">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[oklch(var(--accent)/0.2)]">
            <Shield className="h-5 w-5 text-[oklch(var(--accent))]" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            QR Payment Safety Checker
          </h1>
        </div>
        <p className="text-sm text-[oklch(var(--sidebar-foreground)/0.7)] max-w-xl">
          Verify UPI QR codes before making payments. Scan a QR code or paste
          data manually to instantly detect suspicious patterns, phishing
          attempts, and invalid UPI IDs.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          {[
            {
              icon: (
                <CheckCircle2 className="h-3.5 w-3.5 text-[oklch(var(--success))]" />
              ),
              label: "Format validation",
            },
            {
              icon: (
                <ShieldAlert className="h-3.5 w-3.5 text-[oklch(var(--destructive))]" />
              ),
              label: "Injection detection",
            },
            {
              icon: (
                <History className="h-3.5 w-3.5 text-[oklch(var(--accent))]" />
              ),
              label: "Check history",
            },
          ].map(({ icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-medium"
            >
              {icon}
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Input Modes */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "scan" | "manual")}
      >
        <TabsList className="mb-2" data-ocid="qr-tabs">
          <TabsTrigger value="scan" className="gap-1.5">
            <Camera className="h-4 w-4" />
            Scan QR Code
          </TabsTrigger>
          <TabsTrigger value="manual" className="gap-1.5">
            <Keyboard className="h-4 w-4" />
            Enter Manually
          </TabsTrigger>
        </TabsList>

        {/* ── SCAN TAB ── */}
        <TabsContent value="scan">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Camera className="h-4 w-4 text-[oklch(var(--accent))]" />{" "}
                Camera Scanner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isSupported === false ? (
                <div className="rounded-lg bg-muted p-6 text-center text-muted-foreground">
                  <XCircle className="mx-auto h-8 w-8 mb-2 text-destructive" />
                  <p className="font-medium">Camera not supported</p>
                  <p className="text-xs mt-1">
                    Use the "Enter Manually" tab instead.
                  </p>
                </div>
              ) : (
                <>
                  {/* Video preview */}
                  <div className="relative overflow-hidden rounded-xl bg-muted aspect-video w-full max-w-md mx-auto border border-border">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="h-full w-full object-cover"
                    />
                    {/* Scan overlay */}
                    {isActive && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="relative h-48 w-48">
                          <div className="absolute top-0 left-0 h-6 w-6 border-t-2 border-l-2 border-[oklch(var(--accent))] rounded-tl" />
                          <div className="absolute top-0 right-0 h-6 w-6 border-t-2 border-r-2 border-[oklch(var(--accent))] rounded-tr" />
                          <div className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-[oklch(var(--accent))] rounded-bl" />
                          <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-[oklch(var(--accent))] rounded-br" />
                        </div>
                      </div>
                    )}
                    {!isActive && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/80">
                        <Camera className="h-10 w-10 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground font-medium">
                          Camera inactive
                        </p>
                      </div>
                    )}
                    {cameraError && (
                      <div className="absolute bottom-2 left-2 right-2 rounded bg-destructive/90 px-3 py-1.5 text-xs text-destructive-foreground">
                        {cameraError.message}
                      </div>
                    )}
                  </div>
                  <canvas ref={canvasRef} className="hidden" />

                  <div className="flex flex-wrap gap-2 justify-center">
                    {!isActive ? (
                      <Button
                        onClick={startScanning}
                        disabled={!canStartScanning || cameraLoading}
                        className="btn-action gap-2"
                        data-ocid="qr-start-scan"
                      >
                        <Camera className="h-4 w-4" />
                        {cameraLoading ? "Starting…" : "Start Scanning"}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={stopScanning}
                        disabled={cameraLoading}
                        data-ocid="qr-stop-scan"
                        className="gap-2"
                      >
                        <XCircle className="h-4 w-4" /> Stop Scanning
                      </Button>
                    )}
                    {isMobile && isActive && (
                      <Button
                        variant="outline"
                        onClick={switchCamera}
                        disabled={cameraLoading}
                        className="gap-2"
                      >
                        <SwitchCamera className="h-4 w-4" /> Flip
                      </Button>
                    )}
                    {qrResults.length > 0 && (
                      <Button
                        variant="ghost"
                        onClick={clearResults}
                        size="sm"
                        className="gap-1.5 text-muted-foreground"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Clear scan
                      </Button>
                    )}
                  </div>

                  {isScanning && (
                    <p className="text-center text-xs text-muted-foreground animate-pulse">
                      Scanning for QR codes…
                    </p>
                  )}
                  {qrResults.length > 0 && (
                    <div className="rounded-lg border border-border bg-muted/40 p-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        Last scanned data:
                      </p>
                      <p className="font-mono text-xs break-all text-foreground">
                        {qrResults[0].data}
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── MANUAL TAB ── */}
        <TabsContent value="manual">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-[oklch(var(--accent))]" />{" "}
                Manual Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="qr-raw-data">QR Code Data (optional)</Label>
                <Textarea
                  id="qr-raw-data"
                  placeholder="e.g. upi://pay?pa=merchant@bank&pn=MerchantName&am=500"
                  value={qrDataText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setQrDataText(val);
                    if (val.startsWith("upi://")) {
                      const parsed = parseUPIData(val);
                      setUpiId(parsed.upiId);
                      setMerchantName(parsed.merchantName);
                      setAmount(
                        parsed.amount !== undefined
                          ? String(parsed.amount)
                          : "",
                      );
                    }
                  }}
                  rows={3}
                  className="font-mono text-xs resize-none"
                  data-ocid="qr-raw-input"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="qr-upi-id">UPI ID *</Label>
                  <Input
                    id="qr-upi-id"
                    placeholder="e.g. merchant@bankname"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    data-ocid="qr-upi-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="qr-merchant">Merchant Name</Label>
                  <Input
                    id="qr-merchant"
                    placeholder="e.g. Ramesh Store"
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    data-ocid="qr-merchant-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="qr-amount">Amount (₹, optional)</Label>
                  <Input
                    id="qr-amount"
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="e.g. 500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    data-ocid="qr-amount-input"
                  />
                </div>
              </div>
              <Button
                onClick={handleManualCheck}
                disabled={!upiId.trim()}
                className="btn-action w-full sm:w-auto gap-2"
                data-ocid="qr-check-btn"
              >
                <Shield className="h-4 w-4" /> Check Safety
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Result Card */}
      {checkResult && (
        <Card
          className="border-2"
          style={{
            borderColor:
              checkResult.result === QrCheckResult.safe
                ? "oklch(var(--success)/0.4)"
                : checkResult.result === QrCheckResult.warning
                  ? "oklch(var(--accent)/0.4)"
                  : "oklch(var(--destructive)/0.4)",
          }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-base font-semibold">
                Safety Analysis
              </CardTitle>
              <SafetyBadge result={checkResult.result} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-muted/50 px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1">UPI ID</p>
                <p className="font-mono text-sm font-semibold break-all">
                  {checkResult.upiId || "—"}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1">Merchant</p>
                <p className="text-sm font-semibold truncate">
                  {checkResult.merchantName || "—"}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1">Amount</p>
                <p className="text-sm font-semibold">
                  {checkResult.amount !== undefined
                    ? `₹${checkResult.amount.toFixed(2)}`
                    : "—"}
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
              <p className="text-xs text-muted-foreground mb-1">Assessment</p>
              <p className="text-sm">{checkResult.reason}</p>
            </div>
            <Button
              onClick={handleSaveToHistory}
              disabled={addCheck.isPending}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="qr-save-btn"
            >
              <Save className="h-4 w-4" />
              {addCheck.isPending ? "Saving…" : "Save to History"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* History */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <History className="h-4 w-4 text-[oklch(var(--primary))]" /> Check
              History
            </CardTitle>
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearHistory}
                className="gap-1.5 text-muted-foreground hover:text-destructive"
                data-ocid="qr-clear-history"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear History
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {histLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div
              className="flex flex-col items-center gap-3 py-10 text-center"
              data-ocid="qr-empty-state"
            >
              <div className="rounded-full bg-muted p-4">
                <Shield className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-medium text-muted-foreground">
                No checks yet.
              </p>
              <p className="text-sm text-muted-foreground/70 max-w-xs">
                Scan or enter a payment QR to verify its safety and build your
                check history.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border" data-ocid="qr-history-list">
              {[...history]
                .sort((a, b) => Number(b.checkedAt - a.checkedAt))
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 py-3"
                    data-ocid="qr-history-row"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      {item.result === QrCheckResult.safe ? (
                        <ShieldCheck className="h-4 w-4 text-[oklch(var(--success))]" />
                      ) : item.result === QrCheckResult.warning ? (
                        <AlertTriangle className="h-4 w-4 text-[oklch(var(--accent))]" />
                      ) : (
                        <ShieldAlert className="h-4 w-4 text-[oklch(var(--destructive))]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-semibold truncate">
                          {item.upiId}
                        </span>
                        <HistoryBadge result={item.result} />
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                        <span className="truncate">
                          {item.merchantName || "Unknown merchant"}
                        </span>
                        {item.amount !== undefined && (
                          <span>₹{item.amount.toFixed(2)}</span>
                        )}
                        <span className="ml-auto shrink-0">
                          {formatTs(item.checkedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
