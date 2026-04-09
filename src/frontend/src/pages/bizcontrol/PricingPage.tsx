import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  Check,
  ChevronDown,
  ChevronUp,
  Crown,
  Download,
  FileText,
  QrCode,
  Shield,
  Sparkles,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

// ── Feature row ────────────────────────────────────────────────
function FeatureRow({
  label,
  included,
}: {
  label: string;
  included: boolean;
}) {
  return (
    <li className="flex items-center gap-2.5">
      {included ? (
        <Check className="w-4 h-4 text-green-600 shrink-0" />
      ) : (
        <X className="w-4 h-4 text-muted-foreground/40 shrink-0" />
      )}
      <span
        className={`text-sm ${included ? "text-foreground" : "text-muted-foreground/60 line-through"}`}
      >
        {label}
      </span>
    </li>
  );
}

const FREE_FEATURES = [
  { label: "50 transactions / month", included: true },
  { label: "5 invoices / month", included: true },
  { label: "QR payment checker", included: true },
  { label: "Basic analytics", included: true },
  { label: "Export data (CSV / PDF)", included: false },
  { label: "Advanced charts & trends", included: false },
  { label: "Priority smart alerts", included: false },
];

const PREMIUM_FEATURES = [
  { label: "Unlimited transactions", included: true },
  { label: "Unlimited invoices", included: true },
  { label: "QR payment checker", included: true },
  { label: "Full analytics & insights", included: true },
  { label: "Export data (CSV / PDF)", included: true },
  { label: "Advanced charts & trends", included: true },
  { label: "Priority smart alerts", included: true },
  { label: "Business profile management", included: true },
];

const WHY_PREMIUM = [
  {
    icon: TrendingUp,
    iconBg: "bg-green-100",
    iconColor: "text-green-700",
    title: "Grow with Confidence",
    desc: "Unlimited transactions and invoices so your tools grow with your business — no artificial caps.",
  },
  {
    icon: BarChart3,
    iconBg: "bg-blue-100",
    iconColor: "text-primary",
    title: "Deep Business Insights",
    desc: "Advanced charts, profit trends, and category breakdowns help you make smarter financial decisions.",
  },
  {
    icon: Shield,
    iconBg: "bg-orange-100",
    iconColor: "text-accent",
    title: "Stay Alert & Protected",
    desc: "Priority alerts for low balance, unusual spending, and overdue invoices keep you one step ahead.",
  },
];

const FAQS = [
  {
    q: "Can I cancel my premium plan anytime?",
    a: "Yes, you can cancel anytime from your account settings. Your premium features remain active until the end of your billing period.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept all major debit cards, credit cards, and UPI payments through our secure payment gateway.",
  },
  {
    q: "Is my financial data safe?",
    a: "Absolutely. Your data is stored on the Internet Computer blockchain — fully decentralized, encrypted, and owned by you. No third party can access it.",
  },
  {
    q: "What happens to my data if I downgrade?",
    a: "All your existing data is preserved. You'll only lose access to premium features, but your transactions and invoices remain intact.",
  },
];

// ── FAQ Item ───────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        className="w-full flex items-center justify-between gap-3 py-4 text-left"
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-foreground">{q}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <p className="text-sm text-muted-foreground pb-4 leading-relaxed">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  const monthlyPrice = 199;
  const yearlyPrice = 999;
  const yearlyMonthly = Math.round(yearlyPrice / 12);
  const yearlySavings = monthlyPrice * 12 - yearlyPrice;

  return (
    <div className="p-5 lg:p-7 space-y-10">
      {/* Hero header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="text-center max-w-xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-3 py-1 mb-4">
          <Crown className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs font-semibold text-accent uppercase tracking-wide">
            Simple Pricing
          </span>
        </div>
        <h1 className="text-3xl font-bold font-display text-foreground mb-2 leading-tight">
          Choose Your Plan
        </h1>
        <p className="text-muted-foreground text-base">
          Manage your business smarter — start free, upgrade when you're ready.
        </p>
      </motion.div>

      {/* Billing toggle */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex items-center justify-center gap-3"
        data-ocid="billing-toggle"
      >
        <span
          className={`text-sm font-medium transition-colors ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}
        >
          Monthly
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={isYearly}
          onClick={() => setIsYearly((p) => !p)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            isYearly ? "bg-accent" : "bg-muted"
          }`}
          data-ocid="yearly-toggle-switch"
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-card shadow-sm transition-transform ${
              isYearly ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span
          className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${isYearly ? "text-foreground" : "text-muted-foreground"}`}
        >
          Yearly
          {isYearly && (
            <Badge className="bg-green-600 text-white border-0 text-[10px] px-1.5 py-0 h-4 font-semibold">
              Save ₹{yearlySavings.toLocaleString("en-IN")}
            </Badge>
          )}
        </span>
      </motion.div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
        {/* Free plan */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          data-ocid="free-plan-card"
        >
          <Card className="border-2 border-border shadow-sm h-full flex flex-col">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Free
                </p>
                <div className="flex items-end gap-1.5 mb-1">
                  <span className="text-4xl font-bold font-display text-foreground">
                    ₹0
                  </span>
                  <span className="text-sm text-muted-foreground mb-1.5">
                    / month
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Perfect for getting started
                </p>
              </div>

              <Separator className="mb-5" />

              <ul className="space-y-3 flex-1 mb-6">
                {FREE_FEATURES.map((f) => (
                  <FeatureRow key={f.label} {...f} />
                ))}
              </ul>

              <Button
                variant="outline"
                size="lg"
                disabled
                className="w-full font-semibold border-green-500 text-green-700 opacity-80"
                data-ocid="current-plan-btn"
              >
                <Check className="w-4 h-4 mr-2" />
                Current Plan
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Premium plan */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.35 }}
          data-ocid="premium-plan-card"
        >
          <Card className="border-2 border-accent shadow-lg h-full flex flex-col relative overflow-hidden bg-[#0F172A]">
            {/* Popular badge */}
            <div className="absolute top-0 right-0">
              <div className="bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-lg">
                Popular
              </div>
            </div>

            {/* Decorative gradient */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at top right, oklch(0.62 0.18 45 / 0.12), transparent 60%)",
              }}
            />

            <CardContent className="p-6 flex flex-col h-full relative">
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/60">
                    Premium
                  </p>
                  <Crown className="w-3.5 h-3.5 text-yellow-400" />
                </div>
                <div className="flex items-end gap-1.5 mb-1">
                  <span className="text-4xl font-bold font-display text-white">
                    ₹{isYearly ? yearlyMonthly : monthlyPrice}
                  </span>
                  <span className="text-sm text-white/50 mb-1.5">/ month</span>
                </div>
                <p className="text-xs text-white/40">
                  {isYearly
                    ? `Billed annually at ₹${yearlyPrice.toLocaleString("en-IN")}/year`
                    : "Billed monthly"}
                </p>
              </div>

              <div className="border-t border-white/10 mb-5" />

              <ul className="space-y-3 flex-1 mb-6">
                {PREMIUM_FEATURES.map((f) => (
                  <li key={f.label} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-green-400 shrink-0" />
                    <span className="text-sm text-white/80">{f.label}</span>
                  </li>
                ))}
              </ul>

              {isYearly && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-2 bg-green-900/40 border border-green-600/30 rounded-lg px-3 py-2 mb-4"
                  data-ocid="yearly-savings-badge"
                >
                  <Sparkles className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-xs font-semibold text-green-400">
                    Save ₹{yearlySavings.toLocaleString("en-IN")} / year
                  </span>
                </motion.div>
              )}

              <Button
                size="lg"
                className="w-full font-bold bg-accent hover:bg-accent/90 text-accent-foreground text-base shadow-lg gap-2"
                data-ocid="upgrade-now-btn"
              >
                <Zap className="w-4 h-4" />
                Upgrade Now
              </Button>
              <p className="text-xs text-white/30 text-center mt-2">
                Cancel anytime · No hidden fees
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Why Premium section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto"
        data-ocid="why-premium-section"
      >
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold font-display text-foreground mb-1">
            Why Go Premium?
          </h2>
          <p className="text-sm text-muted-foreground">
            Unlock the tools serious business owners rely on
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {WHY_PREMIUM.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
              >
                <Card className="border border-border shadow-sm h-full">
                  <CardContent className="p-5">
                    <div
                      className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center mb-3`}
                    >
                      <Icon className={`w-5 h-5 ${item.iconColor}`} />
                    </div>
                    <h3 className="text-sm font-bold font-display text-foreground mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Feature highlights strip */}
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: FileText, label: "Unlimited Invoices" },
            { icon: Download, label: "Export CSV / PDF" },
            { icon: QrCode, label: "QR Verification" },
            { icon: Shield, label: "Secure & Private" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="flex flex-col items-center gap-2 p-4 bg-muted/30 rounded-xl border border-border text-center"
              >
                <Icon className="w-5 h-5 text-accent" />
                <span className="text-xs font-semibold text-foreground">
                  {item.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* FAQ section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="max-w-2xl mx-auto"
        data-ocid="faq-section"
      >
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold font-display text-foreground mb-1">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-muted-foreground">
            Everything you need to know before upgrading
          </p>
        </div>

        <Card className="border border-border shadow-sm">
          <CardContent className="px-5 py-0">
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} {...faq} />
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* CTA bottom strip */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto"
      >
        <div
          className="rounded-2xl p-6 md:p-8 text-center relative overflow-hidden"
          style={{ backgroundColor: "#0F172A" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 30% 50%, oklch(0.5 0.15 240 / 0.15), transparent 60%), radial-gradient(ellipse at 70% 50%, oklch(0.62 0.18 45 / 0.1), transparent 60%)",
            }}
          />
          <div className="relative">
            <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold font-display text-white mb-2">
              Ready to unlock full potential?
            </h2>
            <p className="text-sm text-white/50 mb-5 max-w-sm mx-auto">
              Join thousands of business owners who manage their finances
              smarter with BizControl Premium.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="font-bold bg-accent hover:bg-accent/90 text-accent-foreground gap-2 px-8"
                data-ocid="cta-upgrade-btn"
              >
                <Zap className="w-4 h-4" />
                Get Premium — ₹{monthlyPrice}/mo
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="font-semibold border-white/20 text-white/70 hover:bg-white/10 hover:text-white gap-2"
                data-ocid="cta-yearly-btn"
                onClick={() => setIsYearly(true)}
              >
                <Sparkles className="w-4 h-4" />
                Save with yearly — ₹{yearlyPrice}/yr
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
