import { CountdownTimer } from "@/components/CountdownTimer";
import { GuestbookSection } from "@/components/GuestbookSection";
import { RSVPForm } from "@/components/RSVPForm";
import {
  Calendar,
  Clock,
  Copy,
  Gem,
  Heart,
  Link2,
  MapPin,
  Music,
  Share2,
  Shirt,
  Star,
} from "lucide-react";

/* ── WhatsApp icon SVG ── */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      aria-label="WhatsApp"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>WhatsApp</title>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";

/* ── Floating hearts decoration ── */
const FLOATING_HEARTS = [
  { emoji: "❤️", x: "8%", delay: 0, duration: 6, size: "text-2xl" },
  { emoji: "💕", x: "18%", delay: 1.2, duration: 8, size: "text-lg" },
  { emoji: "🌹", x: "75%", delay: 0.8, duration: 7, size: "text-xl" },
  { emoji: "💍", x: "88%", delay: 2, duration: 9, size: "text-2xl" },
  { emoji: "✨", x: "35%", delay: 1.5, duration: 6.5, size: "text-base" },
  { emoji: "💗", x: "55%", delay: 0.3, duration: 7.5, size: "text-xl" },
  { emoji: "🌸", x: "65%", delay: 2.5, duration: 8, size: "text-lg" },
];

/* ── Greeting Banner ── */
const INVITATION_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : "https://engagement-invitation.ic0.app";

function GreetingBanner() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(INVITATION_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback: select text
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "Akshay & Snehal — Engagement Invitation",
      text: "You are cordially invited to the engagement ceremony of Akshay Gaikwad & Snehal Rokade on 15 March 2026 at GMK Banquets and Lawns, Ravet, Pune. 💍",
      url: INVITATION_URL,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled
      }
    } else {
      handleCopy();
    }
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `💍 *Engagement Invitation* 💍\n\nYou are cordially invited to the engagement ceremony of\n\n*Akshay Gaikwad & Snehal Rokade*\n\n📅 15 March 2026 · 7:00 PM\n📍 GMK Banquets and Lawns, Ravet, Pune\n\n🔗 View Invitation: ${INVITATION_URL}`,
    );
    window.open(
      `https://wa.me/?text=${message}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      data-ocid="greeting.section"
      className="relative z-30 w-full px-4 py-6"
      style={{
        background: "#ffffff",
        borderTop: "1px solid oklch(var(--blush) / 0.35)",
        borderBottom: "1px solid oklch(var(--blush) / 0.25)",
      }}
    >
      {/* Decorative shimmer line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(var(--gold) / 0.7), transparent)",
        }}
      />

      <div className="max-w-3xl mx-auto text-center">
        {/* Tag */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs uppercase tracking-[0.22em] font-medium mb-4"
          style={{
            background: "oklch(var(--wine) / 0.14)",
            border: "1px solid oklch(var(--wine) / 0.35)",
            color: "oklch(var(--wine))",
          }}
        >
          <Heart className="w-3 h-3 fill-current" />
          You're Invited
          <Heart className="w-3 h-3 fill-current" />
        </motion.div>

        {/* Greeting */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-base sm:text-lg leading-relaxed mb-1"
          style={{
            color: "oklch(0.30 0.05 355)",
            fontFamily: "Crimson Pro, serif",
          }}
        >
          With immense joy and blessings,{" "}
          <span style={{ color: "oklch(var(--rose-gold))", fontWeight: 600 }}>
            Gaikwad &amp; Rokade Family
          </span>{" "}
          joyfully invite you to the engagement ceremony of
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="font-display text-xl sm:text-2xl font-semibold mb-4"
          style={{ color: "oklch(0.18 0.04 355)" }}
        >
          Akshay Gaikwad &amp;{" "}
          <span style={{ color: "oklch(var(--wine))" }}>Snehal Rokade</span>
        </motion.p>

        {/* URL share row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          {/* URL pill */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-mono truncate max-w-xs"
            style={{
              background: "oklch(0.99 0.01 355 / 0.85)",
              border: "1px solid oklch(var(--blush) / 0.45)",
              color: "oklch(0.40 0.07 355)",
            }}
          >
            <Link2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{INVITATION_URL}</span>
          </div>

          {/* Copy button */}
          <button
            type="button"
            onClick={handleCopy}
            data-ocid="greeting.copy.button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 hover:opacity-80 active:scale-95"
            style={{
              background: copied
                ? "oklch(0.45 0.15 140 / 0.2)"
                : "oklch(var(--gold) / 0.13)",
              border: `1px solid ${copied ? "oklch(0.55 0.15 140 / 0.5)" : "oklch(var(--gold) / 0.45)"}`,
              color: copied ? "oklch(0.65 0.15 140)" : "oklch(var(--gold))",
            }}
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? "Copied!" : "Copy Link"}
          </button>

          {/* Share button */}
          <button
            type="button"
            onClick={handleShare}
            data-ocid="greeting.share.button"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium transition-all duration-200 hover:opacity-85 active:scale-95"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.55 0.20 250) 0%, oklch(0.45 0.22 265) 100%)",
              color: "white",
              boxShadow: "0 4px 16px -4px oklch(0.50 0.20 255 / 0.45)",
            }}
          >
            <Share2 className="w-3.5 h-3.5" />
            Share Invitation
          </button>

          {/* WhatsApp button */}
          <button
            type="button"
            onClick={handleWhatsApp}
            data-ocid="greeting.whatsapp.button"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium transition-all duration-200 hover:opacity-85 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
              color: "#ffffff",
              boxShadow: "0 4px 16px -4px rgba(37, 211, 102, 0.5)",
            }}
          >
            <WhatsAppIcon className="w-3.5 h-3.5" />
            Share on WhatsApp
          </button>
        </motion.div>
      </div>

      {/* Bottom shimmer line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(var(--blush) / 0.5), transparent)",
        }}
      />
    </motion.div>
  );
}

/* ── Section Heading Component ── */
interface SectionHeadingProps {
  subtitle: string;
  title: string;
  description?: string;
}

function SectionHeading({ subtitle, title, description }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7 }}
      className="text-center mb-14"
    >
      <p
        className="text-sm uppercase tracking-[0.3em] font-medium mb-3"
        style={{ color: "oklch(var(--rose-gold))" }}
      >
        {subtitle}
      </p>
      <h2
        className="font-display mb-4"
        style={{ color: "oklch(0.18 0.04 355)" }}
      >
        {title}
      </h2>
      <div
        className="flex items-center justify-center gap-3 mb-4"
        aria-hidden="true"
      >
        <div
          className="h-px w-16"
          style={{
            background:
              "linear-gradient(90deg, transparent, oklch(var(--rose-gold)))",
          }}
        />
        <Star
          className="w-4 h-4 fill-current"
          style={{ color: "oklch(var(--gold))" }}
        />
        <div
          className="h-px w-16"
          style={{
            background:
              "linear-gradient(90deg, oklch(var(--rose-gold)), transparent)",
          }}
        />
      </div>
      {description && (
        <p
          className="text-lg max-w-xl mx-auto leading-relaxed"
          style={{ color: "oklch(0.40 0.07 355)" }}
        >
          {description}
        </p>
      )}
    </motion.div>
  );
}

/* ── Hero Section ── */
function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={heroRef}
      data-ocid="hero.section"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Parallax background */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 z-0">
        <img
          src="/assets/generated/engagement-bg.dim_1920x1080.jpg"
          alt="Romantic engagement background"
          className="w-full h-full object-cover"
        />
        {/* Layered overlays for depth */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.20 0.05 355 / 0.35) 0%, oklch(0.18 0.04 355 / 0.55) 60%, oklch(0.15 0.04 355 / 0.72) 100%)",
          }}
        />
        {/* Vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 40%, oklch(0.12 0.03 355 / 0.5) 100%)",
          }}
        />
      </motion.div>

      {/* Floating decorative hearts */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {FLOATING_HEARTS.map((h) => (
          <motion.div
            key={`heart-${h.emoji}-${h.x}`}
            className={`absolute bottom-0 ${h.size} select-none`}
            style={{ left: h.x }}
            animate={{
              y: [0, -120, -240],
              opacity: [0, 0.8, 0],
              rotate: [-10, 10, -10],
            }}
            transition={{
              duration: h.duration,
              delay: h.delay,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeOut",
            }}
          >
            {h.emoji}
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <motion.div
        style={{ opacity }}
        className="relative z-20 text-center px-4 sm:px-6 max-w-4xl mx-auto"
      >
        {/* Couple logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
          className="mb-6"
        >
          <img
            src="/assets/generated/couple-logo-transparent.dim_400x400.png"
            alt="Akshay & Snehal monogram"
            className="w-24 h-24 sm:w-32 sm:h-32 mx-auto object-contain drop-shadow-lg animate-float-gentle"
          />
        </motion.div>

        {/* Invitation tag */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-8 text-sm uppercase tracking-[0.25em] font-medium"
          style={{
            background: "oklch(var(--gold) / 0.15)",
            border: "1px solid oklch(var(--gold) / 0.5)",
            color: "oklch(var(--gold))",
          }}
        >
          <Star className="w-3.5 h-3.5 fill-current" />
          Engagement Invitation
          <Star className="w-3.5 h-3.5 fill-current" />
        </motion.div>

        {/* Couple names */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="font-display font-semibold mb-2"
          style={{
            fontSize: "clamp(3rem, 9vw, 7rem)",
            lineHeight: 1.0,
            color: "oklch(0.97 0.005 60)",
            textShadow: "0 2px 12px oklch(0 0 0 / 0.4)",
          }}
        >
          Akshay &amp;{" "}
          <span style={{ color: "oklch(var(--wine))" }}>Snehal</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="font-instrument text-xl sm:text-2xl md:text-3xl mb-8 italic"
          style={{
            color: "oklch(0.90 0.01 60 / 0.85)",
            textShadow: "0 1px 6px oklch(0 0 0 / 0.3)",
          }}
        >
          Gaikwad &amp; Rokade Family invites you! 💍
        </motion.p>

        {/* Date & venue cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
        >
          <div
            className="flex items-center gap-3 px-6 py-3 rounded-2xl glass-card"
            style={{ backdropFilter: "blur(16px)" }}
          >
            <Calendar
              className="w-5 h-5"
              style={{ color: "oklch(var(--gold))" }}
            />
            <span
              className="font-medium text-base"
              style={{ color: "oklch(0.95 0.005 60)" }}
            >
              15 March 2026 · 7:00 PM
            </span>
          </div>
          <a
            href="https://maps.google.com/?q=GMK+Banquets+and+Lawns+Ravet,+Katraj-Dehu+Rd+Bypass,+Ravet,+Pimpri-Chinchwad,+Pune,+Maharashtra+412101"
            target="_blank"
            rel="noopener noreferrer"
            data-ocid="hero.venue.link"
            className="flex items-center gap-3 px-6 py-3 rounded-2xl glass-card hover:opacity-80 transition-opacity"
            style={{ backdropFilter: "blur(16px)" }}
          >
            <MapPin
              className="w-5 h-5"
              style={{ color: "oklch(var(--wine))" }}
            />
            <span
              className="font-medium text-base"
              style={{ color: "oklch(0.95 0.005 60)" }}
            >
              GMK Banquets and Lawns, Ravet, Pune
            </span>
          </a>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            className="flex flex-col items-center gap-2"
          >
            <p
              className="text-xs uppercase tracking-[0.25em]"
              style={{ color: "oklch(var(--wine) / 0.60)" }}
            >
              Scroll to explore
            </p>
            <div
              className="w-px h-8"
              style={{
                background:
                  "linear-gradient(180deg, oklch(var(--wine) / 0.5), transparent)",
              }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ── Countdown Section ── */
function CountdownSection() {
  const targetDate = new Date("2026-03-15T19:00:00+05:30");

  return (
    <section
      data-ocid="countdown.section"
      className="py-20 sm:py-28 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.88 0.09 355) 0%, oklch(0.84 0.11 355) 100%)",
      }}
    >
      {/* Decorative background elements */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, oklch(0.98 0.01 60) 0%, transparent 40%), radial-gradient(circle at 80% 50%, oklch(var(--gold) / 0.4) 0%, transparent 40%)",
        }}
      />

      {/* Petals decoration */}
      {(["🌸-0", "🌷-1", "🌸-2", "🌷-3", "🌸-4"] as const).map((p, i) => (
        <div
          key={p}
          className="absolute top-6 text-2xl opacity-20 animate-drift"
          style={{ left: `${15 + i * 17}%`, animationDelay: `${i * 1.2}s` }}
          aria-hidden="true"
        >
          {p.split("-")[0]}
        </div>
      ))}

      <div className="container max-w-4xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <p
            className="text-sm uppercase tracking-[0.3em] font-medium mb-3"
            style={{ color: "oklch(0.98 0.01 60)" }}
          >
            Time Until the Big Day
          </p>
          <h2
            className="font-display mb-2"
            style={{ color: "oklch(0.99 0.005 30)" }}
          >
            Counting Down
          </h2>
          <p
            className="text-lg"
            style={{ color: "oklch(0.97 0.01 60 / 0.80)" }}
          >
            15 March 2026 · 7:00 PM IST
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <CountdownTimer targetDate={targetDate} />
        </motion.div>
      </div>
    </section>
  );
}

/* ── Event Details Section ── */
function EventDetailsSection() {
  const details = [
    {
      icon: <Calendar className="w-7 h-7" />,
      label: "Date",
      value: "15 March 2026",
      sub: "Sunday",
    },
    {
      icon: <Clock className="w-7 h-7" />,
      label: "Time",
      value: "7:00 PM onwards",
      sub: "IST · Doors open at 6:30 PM",
    },
    {
      icon: <MapPin className="w-7 h-7" />,
      label: "Venue",
      value: "GMK Banquets and Lawns",
      sub: "Katraj-Dehu Rd Bypass, Ravet, Pune",
      link: "https://maps.google.com/?q=GMK+Banquets+and+Lawns+Ravet,+Katraj-Dehu+Rd+Bypass,+Ravet,+Pimpri-Chinchwad,+Pune,+Maharashtra+412101",
    },
    {
      icon: <Shirt className="w-7 h-7" />,
      label: "Dress Code",
      value: "Formal / Traditional",
      sub: "Semi-formal attire welcome",
    },
    {
      icon: <Music className="w-7 h-7" />,
      label: "Programme",
      value: "Ring Ceremony & Dinner",
      sub: "Live music · Dance floor · Photo booth",
    },
    {
      icon: <Gem className="w-7 h-7" />,
      label: "RSVP By",
      value: "10 March 2026",
      sub: "Please confirm your attendance",
    },
  ];

  return (
    <section
      data-ocid="event.details.section"
      className="py-20 sm:py-28 relative"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.97 0.015 355) 0%, oklch(0.95 0.025 355) 100%)",
      }}
    >
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: `
            radial-gradient(circle at 10% 80%, oklch(var(--blush) / 0.15) 0%, transparent 35%),
            radial-gradient(circle at 90% 20%, oklch(var(--gold) / 0.12) 0%, transparent 35%)
          `,
        }}
      />

      <div className="container max-w-5xl mx-auto px-4 relative z-10">
        <SectionHeading
          subtitle="The Details"
          title="Event Information"
          description="Everything you need to know for a wonderful evening of celebration and joy."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {details.map((detail, idx) => {
            const cardContent = (
              <>
                {/* Icon bubble */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: "oklch(var(--wine) / 0.12)",
                    color: "oklch(var(--wine))",
                  }}
                >
                  {detail.icon}
                </div>

                <p
                  className="text-xs uppercase tracking-[0.2em] font-medium mb-1"
                  style={{ color: "oklch(var(--rose-gold))" }}
                >
                  {detail.label}
                </p>
                <h3
                  className="font-display text-xl font-semibold mb-1"
                  style={{ color: "oklch(0.18 0.04 355)" }}
                >
                  {detail.value}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "oklch(0.40 0.07 355)" }}
                >
                  {detail.sub}
                </p>
                {"link" in detail && detail.link && (
                  <p
                    className="text-xs mt-2 font-medium"
                    style={{ color: "oklch(var(--rose-gold))" }}
                  >
                    View on Maps ↗
                  </p>
                )}

                {/* Corner decoration */}
                <div
                  className="absolute top-3 right-4 text-lg opacity-15 animate-shimmer-gold"
                  aria-hidden="true"
                >
                  ✦
                </div>
              </>
            );

            const cardStyle = {
              background:
                "linear-gradient(135deg, oklch(0.99 0.012 355 / 0.92) 0%, oklch(0.97 0.018 355 / 0.88) 100%)",
              border: "1px solid oklch(var(--blush) / 0.35)",
              boxShadow: "0 4px 24px -6px oklch(var(--wine) / 0.12)",
            };

            return "link" in detail && detail.link ? (
              <motion.a
                key={detail.label}
                href={detail.link}
                target="_blank"
                rel="noopener noreferrer"
                data-ocid="event.venue.card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="group relative rounded-3xl p-6 overflow-hidden block hover:opacity-90 transition-opacity"
                style={cardStyle}
              >
                {cardContent}
              </motion.a>
            ) : (
              <motion.div
                key={detail.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="group relative rounded-3xl p-6 overflow-hidden"
                style={cardStyle}
              >
                {cardContent}
              </motion.div>
            );
          })}
        </div>

        {/* Map hint */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 text-center"
        >
          <a
            href="https://maps.google.com/?q=GMK+Banquets+and+Lawns+Ravet,+Katraj-Dehu+Rd+Bypass,+Ravet,+Pimpri-Chinchwad,+Pune,+Maharashtra+412101"
            target="_blank"
            rel="noopener noreferrer"
            data-ocid="event.venue.link"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium hover:opacity-75 transition-opacity"
            style={{
              background: "oklch(var(--wine) / 0.10)",
              color: "oklch(var(--wine))",
              border: "1px solid oklch(var(--wine) / 0.25)",
            }}
          >
            <MapPin className="w-4 h-4" />
            GMK Banquets and Lawns Ravet, Katraj-Dehu Rd Bypass, Ravet,
            Pimpri-Chinchwad, Pune 412101 ↗
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/* ── RSVP Section ── */
function RSVPSection() {
  return (
    <section
      data-ocid="rsvp.section"
      className="py-20 sm:py-28 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.96 0.02 355) 0%, oklch(0.98 0.015 355) 60%, oklch(0.96 0.02 355) 100%)",
      }}
    >
      {/* Decorative elements — soft glows */}
      <div
        className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-[0.18] -translate-x-1/2 -translate-y-1/2"
        style={{ background: "oklch(var(--blush))" }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-[0.15] translate-x-1/3 translate-y-1/3"
        style={{ background: "oklch(var(--rose-gold))" }}
        aria-hidden="true"
      />

      <div className="container max-w-2xl mx-auto px-4 relative z-10">
        <SectionHeading
          subtitle="Join the Celebration"
          title="RSVP"
          description="Please let us know you're coming so we can celebrate together."
        />

        {/* RSVP card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-3xl p-6 sm:p-10 relative overflow-hidden"
          style={{
            background: "oklch(0.99 0.01 355 / 0.92)",
            backdropFilter: "blur(20px)",
            border: "1px solid oklch(var(--blush) / 0.4)",
            boxShadow:
              "0 16px 60px -12px oklch(var(--wine) / 0.12), 0 4px 16px -4px oklch(var(--blush) / 0.20)",
          }}
        >
          {/* Decorative flowers */}
          <div
            className="absolute top-4 right-4 text-4xl opacity-15 animate-float-gentle"
            aria-hidden="true"
          >
            🌸
          </div>
          <div
            className="absolute bottom-4 left-4 text-3xl opacity-10 animate-float-gentle animation-delay-400"
            aria-hidden="true"
          >
            🌹
          </div>

          <RSVPForm />
        </motion.div>
      </div>
    </section>
  );
}

/* ── Guestbook Section ── */
function GuestbookSectionWrapper() {
  return (
    <section
      data-ocid="guestbook.section"
      className="py-20 sm:py-28"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.97 0.015 355) 0%, oklch(0.95 0.025 355) 100%)",
      }}
    >
      <div className="container max-w-3xl mx-auto px-4">
        <SectionHeading
          subtitle="Words of Love"
          title="Guestbook"
          description="Messages from family and friends who are celebrating with us."
        />

        <GuestbookSection />
      </div>
    </section>
  );
}

/* ── Footer Section ── */
function FooterSection() {
  const year = new Date().getFullYear();

  return (
    <footer
      data-ocid="footer.section"
      className="relative overflow-hidden py-16"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.60 0.14 355) 0%, oklch(0.50 0.13 355) 100%)",
      }}
    >
      {/* Background decorations */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 60%, oklch(var(--blush)) 0%, transparent 45%), radial-gradient(circle at 70% 40%, oklch(var(--gold)) 0%, transparent 40%)",
        }}
      />

      {/* Floating petals */}
      {(["🌸-0", "🌷-1", "🌹-2", "💐-3", "🌸-4"] as const).map((p, i) => (
        <div
          key={p}
          className="absolute text-xl opacity-20 animate-drift"
          style={{
            bottom: `${10 + i * 8}%`,
            left: `${10 + i * 18}%`,
            animationDelay: `${i * 1.5}s`,
          }}
          aria-hidden="true"
        >
          {p.split("-")[0]}
        </div>
      ))}

      <div className="container max-w-2xl mx-auto px-4 text-center relative z-10">
        {/* Monogram */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-8"
        >
          <img
            src="/assets/generated/couple-logo-transparent.dim_400x400.png"
            alt="Akshay & Snehal"
            className="w-20 h-20 mx-auto object-contain opacity-90"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="font-display text-3xl sm:text-4xl font-semibold text-white mb-3"
        >
          With love,{" "}
          <span style={{ color: "oklch(var(--blush))" }}>
            Akshay &amp; Snehal
          </span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex justify-center gap-4 my-6 text-2xl"
        >
          {(["💍-0", "❤️-1", "🌹-2", "✨-3", "💕-4"] as const).map((e, i) => (
            <span
              key={e}
              className="animate-float-gentle"
              style={{ animationDelay: `${i * 300}ms` }}
            >
              {e.split("-")[0]}
            </span>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="text-white/50 text-sm mb-6"
          style={{ fontFamily: "Crimson Pro, serif" }}
        >
          15 March 2026 · GMK Banquets and Lawns, Ravet, Pune
        </motion.p>

        {/* Separator */}
        <div
          className="h-px w-32 mx-auto mb-6 opacity-30"
          style={{
            background:
              "linear-gradient(90deg, transparent, oklch(var(--gold)), transparent)",
          }}
        />

        {/* Caffeine attribution */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="text-white/40 text-xs"
        >
          © {year}. Built with{" "}
          <Heart
            className="inline w-3 h-3 fill-current"
            style={{ color: "oklch(var(--blush))" }}
          />{" "}
          using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              typeof window !== "undefined" ? window.location.hostname : "",
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-white/60 transition-colors"
          >
            caffeine.ai
          </a>
        </motion.p>
      </div>
    </footer>
  );
}

/* ── Main Invitation Page ── */
export default function InvitationPage() {
  return (
    <main>
      <HeroSection />
      <CountdownSection />
      <EventDetailsSection />
      <RSVPSection />
      <GuestbookSectionWrapper />
      <GreetingBanner />
      <FooterSection />
    </main>
  );
}
