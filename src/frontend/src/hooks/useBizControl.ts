import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type {
  Alert,
  AlertSettings,
  BusinessProfile,
  Invoice,
  QrCheck,
  Transaction,
} from "../types/bizcontrol";

function useBackend() {
  return useActor(createActor);
}

// ── Transactions ──────────────────────────────────────────────
export function useGetTransactions() {
  const { actor, isFetching } = useBackend();
  return useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTransaction() {
  const { actor } = useBackend();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tx: Transaction) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.addTransaction(tx);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

export function useUpdateTransaction() {
  const { actor } = useBackend();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, tx }: { id: string; tx: Transaction }) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.updateTransaction(id, tx);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

export function useDeleteTransaction() {
  const { actor } = useBackend();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.deleteTransaction(id);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

// ── Invoices ──────────────────────────────────────────────────
export function useGetInvoices() {
  const { actor, isFetching } = useBackend();
  return useQuery<Invoice[]>({
    queryKey: ["invoices"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getInvoices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddInvoice() {
  const { actor } = useBackend();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (invoice: Invoice) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.addInvoice(invoice);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useUpdateInvoice() {
  const { actor } = useBackend();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, invoice }: { id: string; invoice: Invoice }) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.updateInvoice(id, invoice);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useDeleteInvoice() {
  const { actor } = useBackend();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.deleteInvoice(id);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

// ── QR Checks ─────────────────────────────────────────────────
export function useGetQrChecks() {
  const { actor, isFetching } = useBackend();
  return useQuery<QrCheck[]>({
    queryKey: ["qrChecks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getQrChecks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddQrCheck() {
  const { actor } = useBackend();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (check: QrCheck) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.addQrCheck(check);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["qrChecks"] }),
  });
}

// ── Alerts ────────────────────────────────────────────────────
export function useGetAlerts() {
  const { actor, isFetching } = useBackend();
  return useQuery<Alert[]>({
    queryKey: ["alerts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAlerts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMarkAlertRead() {
  const { actor } = useBackend();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.markAlertRead(id);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });
}

export function useDismissAlert() {
  const { actor } = useBackend();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.dismissAlert(id);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });
}

// ── Business Profile ──────────────────────────────────────────
export function useGetBusinessProfile() {
  const { actor, isFetching } = useBackend();
  return useQuery<BusinessProfile | null>({
    queryKey: ["businessProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getBusinessProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveBusinessProfile() {
  const { actor } = useBackend();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: BusinessProfile) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.saveBusinessProfile(profile);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["businessProfile"] }),
  });
}

// ── Alert Settings ────────────────────────────────────────────
export function useGetAlertSettings() {
  const { actor, isFetching } = useBackend();
  return useQuery<AlertSettings | null>({
    queryKey: ["alertSettings"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAlertSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveAlertSettings() {
  const { actor } = useBackend();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: AlertSettings) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.saveAlertSettings(settings);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alertSettings"] }),
  });
}
