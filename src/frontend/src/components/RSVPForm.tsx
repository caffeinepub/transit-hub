import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Heart, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface RSVPData {
  name: string;
  email: string;
  guests: string;
  meal: string;
  message: string;
}

export function RSVPForm() {
  const [formData, setFormData] = useState<RSVPData>({
    name: "",
    email: "",
    guests: "",
    meal: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<RSVPData>>({});

  function validate(): boolean {
    const newErrors: Partial<RSVPData> = {};
    if (!formData.name.trim()) newErrors.name = "Please enter your name";
    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.guests) newErrors.guests = "Please select number of guests";
    if (!formData.meal) newErrors.meal = "Please select your meal preference";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    // Simulate network delay for polish
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center py-12 px-6"
        data-ocid="rsvp.success_state"
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-ring"
          style={{
            background:
              "linear-gradient(135deg, oklch(var(--blush)), oklch(var(--rose-gold)))",
          }}
        >
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <h3
          className="font-display text-3xl font-semibold mb-3"
          style={{ color: "oklch(var(--deep-text))" }}
        >
          We can't wait to celebrate with you!
        </h3>
        <p
          className="text-lg mb-2"
          style={{ color: "oklch(var(--rose-gold))" }}
        >
          Thank you, <strong>{formData.name}</strong>! 💕
        </p>
        <p className="text-muted-foreground">
          Your RSVP has been received. We'll be in touch soon with all the
          details.
        </p>
        <div className="mt-8 flex justify-center gap-2">
          {(["🌹", "💍", "✨", "💕", "🥂"] as const).map((emoji, i) => (
            <span
              key={emoji}
              className="text-2xl animate-float-gentle"
              style={{ animationDelay: `${i * 200}ms` }}
            >
              {emoji}
            </span>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Name */}
          <div className="space-y-2">
            <Label
              htmlFor="rsvp-name"
              className="text-base font-medium"
              style={{ color: "oklch(var(--blush))" }}
            >
              Your Name *
            </Label>
            <Input
              id="rsvp-name"
              data-ocid="rsvp.name.input"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="h-12 text-base rounded-xl border-blush/30 focus:border-blush focus:ring-blush/20"
              style={{ background: "oklch(0.97 0.02 355 / 0.80)" }}
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "rsvp-name-error" : undefined}
            />
            {errors.name && (
              <p
                id="rsvp-name-error"
                className="text-sm"
                style={{ color: "oklch(var(--destructive))" }}
              >
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label
              htmlFor="rsvp-email"
              className="text-base font-medium"
              style={{ color: "oklch(var(--blush))" }}
            >
              Email Address *
            </Label>
            <Input
              id="rsvp-email"
              data-ocid="rsvp.email.input"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              className="h-12 text-base rounded-xl border-blush/30 focus:border-blush focus:ring-blush/20"
              style={{ background: "oklch(0.97 0.02 355 / 0.80)" }}
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "rsvp-email-error" : undefined}
            />
            {errors.email && (
              <p
                id="rsvp-email-error"
                className="text-sm"
                style={{ color: "oklch(var(--destructive))" }}
              >
                {errors.email}
              </p>
            )}
          </div>

          {/* Guests + Meal row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Number of Guests */}
            <div className="space-y-2">
              <Label
                className="text-base font-medium"
                style={{ color: "oklch(var(--blush))" }}
              >
                Number of Guests *
              </Label>
              <Select
                value={formData.guests}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, guests: val }))
                }
              >
                <SelectTrigger
                  data-ocid="rsvp.guests.select"
                  className="h-12 text-base rounded-xl border-blush/30 focus:border-blush"
                  style={{ background: "oklch(0.97 0.02 355 / 0.80)" }}
                  aria-required="true"
                  aria-invalid={!!errors.guests}
                >
                  <SelectValue placeholder="Select guests" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Guest</SelectItem>
                  <SelectItem value="2">2 Guests</SelectItem>
                  <SelectItem value="3">3 Guests</SelectItem>
                  <SelectItem value="4">4 Guests</SelectItem>
                  <SelectItem value="5+">5+ Guests</SelectItem>
                </SelectContent>
              </Select>
              {errors.guests && (
                <p
                  className="text-sm"
                  style={{ color: "oklch(var(--destructive))" }}
                >
                  {errors.guests}
                </p>
              )}
            </div>

            {/* Meal Preference */}
            <div className="space-y-2">
              <Label
                className="text-base font-medium"
                style={{ color: "oklch(var(--blush))" }}
              >
                Meal Preference *
              </Label>
              <Select
                value={formData.meal}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, meal: val }))
                }
              >
                <SelectTrigger
                  data-ocid="rsvp.meal.select"
                  className="h-12 text-base rounded-xl border-blush/30 focus:border-blush"
                  style={{ background: "oklch(0.97 0.02 355 / 0.80)" }}
                  aria-required="true"
                  aria-invalid={!!errors.meal}
                >
                  <SelectValue placeholder="Select preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vegetarian">🥦 Vegetarian</SelectItem>
                  <SelectItem value="non-vegetarian">
                    🍗 Non-Vegetarian
                  </SelectItem>
                  <SelectItem value="vegan">🌱 Vegan</SelectItem>
                </SelectContent>
              </Select>
              {errors.meal && (
                <p
                  className="text-sm"
                  style={{ color: "oklch(var(--destructive))" }}
                >
                  {errors.meal}
                </p>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label
              htmlFor="rsvp-message"
              className="text-base font-medium"
              style={{ color: "oklch(var(--blush))" }}
            >
              A Message for the Couple
              <span className="text-muted-foreground font-normal ml-1">
                (optional)
              </span>
            </Label>
            <Textarea
              id="rsvp-message"
              data-ocid="rsvp.message.textarea"
              placeholder="Share your warm wishes, a favourite memory, or just say hello! 💕"
              value={formData.message}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, message: e.target.value }))
              }
              rows={4}
              className="text-base rounded-xl border-blush/30 focus:border-blush focus:ring-blush/20 resize-none"
              style={{ background: "oklch(0.97 0.02 355 / 0.80)" }}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            data-ocid="rsvp.submit_button"
            disabled={isSubmitting}
            size="lg"
            className="w-full h-14 text-lg font-semibold rounded-2xl gap-3 transition-all duration-300"
            style={{
              background:
                "linear-gradient(135deg, oklch(var(--wine)) 0%, oklch(var(--rose-gold)) 100%)",
              color: "white",
              boxShadow: "0 8px 32px -4px oklch(var(--wine) / 0.35)",
            }}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin">💍</span>
                Sending your RSVP...
              </>
            ) : (
              <>
                <Heart className="w-5 h-5 fill-current" />
                <span>Confirm Attendance</span>
                <Sparkles className="w-5 h-5" />
              </>
            )}
          </Button>
        </motion.div>
      </AnimatePresence>
    </form>
  );
}
