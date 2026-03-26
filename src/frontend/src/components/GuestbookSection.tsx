import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Quote, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface Wish {
  id: string;
  name: string;
  message: string;
  avatar: string;
  timestamp: string;
}

const initialWishes: Wish[] = [
  {
    id: "1",
    name: "Vilas & Surekha Gaikwad",
    message:
      "From the moment we saw you together, we knew this day would come. Wishing you a lifetime of joy, laughter, and endless love. Can't wait to celebrate with you! 🌹",
    avatar: "V",
    timestamp: "March 1, 2026",
  },
  {
    id: "2",
    name: "Subhash Rokade",
    message:
      "Snehal, my dearest — you deserve every bit of the happiness that Akshay brings to your life. He's a lucky man! Here's to a forever full of beautiful moments and adventures together. Much love! 💕",
    avatar: "S",
    timestamp: "March 3, 2026",
  },
  {
    id: "3",
    name: "Suresh & Lata Patil",
    message:
      "We watched both of you grow up and couldn't be more overjoyed at this beautiful union. May your love story be as grand as the stars above and as warm as the sun that shines. Congratulations, dear children! ✨",
    avatar: "S",
    timestamp: "March 5, 2026",
  },
];

export function GuestbookSection() {
  const [wishes, setWishes] = useState<Wish[]>(initialWishes);
  const [newWish, setNewWish] = useState({ name: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; message?: string }>({});
  const [justAdded, setJustAdded] = useState<string | null>(null);

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!newWish.name.trim()) newErrors.name = "Please enter your name";
    if (!newWish.message.trim()) newErrors.message = "Please write a message";
    else if (newWish.message.trim().length < 10)
      newErrors.message = "Please write at least 10 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const id = String(wishes.length + 1);
    const wish: Wish = {
      id,
      name: newWish.name.trim(),
      message: newWish.message.trim(),
      avatar: newWish.name.trim()[0].toUpperCase(),
      timestamp: new Date().toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };

    setWishes((prev) => [wish, ...prev]);
    setJustAdded(id);
    setNewWish({ name: "", message: "" });
    setIsSubmitting(false);

    setTimeout(() => setJustAdded(null), 3000);
  }

  return (
    <div className="space-y-12">
      {/* Existing wishes */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {wishes.map((wish, idx) => {
            const ocid = `guestbook.item.${idx + 1}` as const;
            return (
              <motion.article
                key={wish.id}
                data-ocid={ocid}
                initial={
                  justAdded === wish.id
                    ? { opacity: 0, y: -20, scale: 0.95 }
                    : { opacity: 0, y: 20 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="relative rounded-3xl p-6 sm:p-8 overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.99 0.01 355 / 0.95) 0%, oklch(0.96 0.03 355 / 0.90) 100%)",
                  border: "1px solid oklch(var(--blush) / 0.30)",
                  boxShadow: "0 4px 24px -8px oklch(var(--blush) / 0.20)",
                }}
              >
                {/* Decorative quote mark */}
                <Quote
                  className="absolute top-4 right-4 w-10 h-10 opacity-10"
                  style={{ color: "oklch(var(--rose-gold))" }}
                />

                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-display font-semibold text-lg shadow-soft"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(var(--wine)), oklch(var(--rose-gold)))",
                    }}
                  >
                    {wish.avatar}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <h4
                        className="font-display font-semibold text-lg"
                        style={{ color: "oklch(var(--deep-text))" }}
                      >
                        {wish.name}
                      </h4>
                      <span
                        className="text-sm"
                        style={{ color: "oklch(var(--rose-gold) / 0.7)" }}
                      >
                        {wish.timestamp}
                      </span>
                    </div>
                    <p
                      className="text-base leading-relaxed"
                      style={{ color: "oklch(0.35 0.05 355)" }}
                    >
                      {wish.message}
                    </p>
                  </div>
                </div>

                {justAdded === wish.id && (
                  <div
                    className="absolute bottom-2 right-4 text-xs font-medium flex items-center gap-1"
                    style={{ color: "oklch(var(--rose-gold))" }}
                  >
                    <Heart className="w-3 h-3 fill-current" />
                    Just added
                  </div>
                )}
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add a wish form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-3xl p-6 sm:p-8"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.98 0.02 355 / 0.92) 0%, oklch(0.95 0.04 355 / 0.88) 100%)",
          border: "1px solid oklch(var(--blush) / 0.35)",
        }}
      >
        <h3
          className="font-display text-xl font-semibold mb-6 flex items-center gap-2"
          style={{ color: "oklch(var(--deep-text))" }}
        >
          <Heart
            className="w-5 h-5 fill-current"
            style={{ color: "oklch(var(--blush))" }}
          />
          Leave Your Wishes
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label
                htmlFor="guestbook-name"
                className="text-sm font-medium"
                style={{ color: "oklch(var(--blush))" }}
              >
                Your Name *
              </Label>
              <Input
                id="guestbook-name"
                data-ocid="guestbook.name.input"
                placeholder="Enter your name"
                value={newWish.name}
                onChange={(e) =>
                  setNewWish((prev) => ({ ...prev, name: e.target.value }))
                }
                className="h-11 rounded-xl border-blush/30"
                style={{
                  background: "oklch(0.98 0.01 355 / 0.90)",
                  color: "oklch(var(--foreground))",
                }}
                aria-required="true"
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p
                  className="text-xs"
                  style={{ color: "oklch(var(--destructive))" }}
                >
                  {errors.name}
                </p>
              )}
            </div>
            <div className="space-y-1 sm:col-span-1 col-span-1">
              {/* Spacer on large screens */}
            </div>
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="guestbook-message"
              className="text-sm font-medium"
              style={{ color: "oklch(var(--blush))" }}
            >
              Your Message *
            </Label>
            <Textarea
              id="guestbook-message"
              data-ocid="guestbook.message.textarea"
              placeholder="Share your heartfelt wishes for Akshay & Snehal... 💕"
              value={newWish.message}
              onChange={(e) =>
                setNewWish((prev) => ({ ...prev, message: e.target.value }))
              }
              rows={3}
              className="rounded-xl border-blush/30 resize-none"
              style={{
                background: "oklch(0.98 0.01 355 / 0.90)",
                color: "oklch(var(--foreground))",
              }}
              aria-required="true"
              aria-invalid={!!errors.message}
            />
            {errors.message && (
              <p
                className="text-xs"
                style={{ color: "oklch(var(--destructive))" }}
              >
                {errors.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            data-ocid="guestbook.submit_button"
            disabled={isSubmitting}
            className="gap-2 rounded-xl px-6 h-11 font-medium"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.72 0.18 20) 0%, oklch(0.60 0.20 350) 100%)",
              color: "white",
              boxShadow: "0 4px 18px -4px oklch(0.65 0.18 10 / 0.45)",
            }}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin text-sm">💕</span>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Share Your Wishes
              </>
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
