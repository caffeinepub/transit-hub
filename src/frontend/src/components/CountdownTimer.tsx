import { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(targetDate: Date): TimeLeft {
  const now = new Date().getTime();
  const target = targetDate.getTime();
  const diff = Math.max(target - now, 0);

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

interface CountdownUnitProps {
  value: number;
  label: string;
}

function CountdownUnit({ value, label }: CountdownUnitProps) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl flex items-center justify-center mb-3 overflow-hidden shadow-romantic"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.97 0.01 30) 0%, oklch(0.94 0.03 355) 100%)",
          border: "1px solid oklch(0.85 0.09 355 / 0.4)",
        }}
      >
        {/* Decorative corner accents */}
        <span
          className="absolute top-1 left-1 w-3 h-3 opacity-40"
          style={{ color: "oklch(var(--gold))" }}
        >
          ✦
        </span>
        <span
          className="absolute bottom-1 right-1 w-3 h-3 opacity-40"
          style={{ color: "oklch(var(--gold))" }}
        >
          ✦
        </span>

        <span
          className="font-display font-semibold text-3xl sm:text-4xl md:text-5xl tabular-nums"
          style={{ color: "oklch(var(--wine))" }}
        >
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span
        className="text-xs sm:text-sm uppercase tracking-[0.2em] font-medium"
        style={{ color: "oklch(var(--rose-gold))" }}
      >
        {label}
      </span>
    </div>
  );
}

interface CountdownTimerProps {
  targetDate: Date;
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    getTimeLeft(targetDate),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const isPast =
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0;

  if (isPast) {
    return (
      <div className="text-center py-8">
        <p
          className="font-display text-3xl font-semibold"
          style={{ color: "oklch(var(--wine))" }}
        >
          ✨ The magical day has arrived! ✨
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-center gap-4 sm:gap-6 md:gap-8 flex-wrap">
      <CountdownUnit value={timeLeft.days} label="Days" />

      <div
        className="text-3xl sm:text-4xl md:text-5xl font-display font-light mt-6 sm:mt-7 md:mt-8 animate-pulse"
        style={{ color: "oklch(var(--rose-gold))" }}
      >
        :
      </div>

      <CountdownUnit value={timeLeft.hours} label="Hours" />

      <div
        className="text-3xl sm:text-4xl md:text-5xl font-display font-light mt-6 sm:mt-7 md:mt-8 animate-pulse"
        style={{ color: "oklch(var(--rose-gold))" }}
      >
        :
      </div>

      <CountdownUnit value={timeLeft.minutes} label="Minutes" />

      <div
        className="text-3xl sm:text-4xl md:text-5xl font-display font-light mt-6 sm:mt-7 md:mt-8 animate-pulse"
        style={{ color: "oklch(var(--rose-gold))" }}
      >
        :
      </div>

      <CountdownUnit value={timeLeft.seconds} label="Seconds" />
    </div>
  );
}
