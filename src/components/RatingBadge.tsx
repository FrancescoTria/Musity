import { SteamLabel, getLabelColor } from "../utils/ratings";

interface RatingBadgeProps {
  label: SteamLabel;
  avg: number;
  count: number;
}

export default function RatingBadge({ label, avg, count }: RatingBadgeProps) {
  const color = getLabelColor(label);
  const pct = Math.round((avg / 10) * 100);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline gap-2">
        <span
          className="font-display text-5xl font-bold leading-none"
          style={{ color: "var(--foreground)" }}
        >
          {avg > 0 ? avg.toFixed(1) : "—"}
        </span>
        {avg > 0 && (
          <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            / 10
          </span>
        )}
      </div>

      {avg > 0 && (
        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background:
                avg >= 7
                  ? "linear-gradient(90deg, #10b981, #34d399)"
                  : avg >= 5
                    ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                    : "linear-gradient(90deg, #ef4444, #f87171)",
            }}
          />
        </div>
      )}

      <span className={`text-base font-semibold ${color}`}>{label}</span>
      <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
        Based on {count} {count === 1 ? "user review" : "user reviews"}
      </span>
    </div>
  );
}
