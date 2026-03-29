interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

const ACCENT_COLORS: Record<string, string> = {
  brand: "border-l-stamp-600",
  green: "border-l-ledger-green",
  amber: "border-l-manila",
  red: "border-l-void-red",
  blue: "border-l-carbon",
  gray: "border-l-ink-400",
};

export default function StatCard({ label, value, sub, color = "brand" }: StatCardProps) {
  const colorKey = color === "indigo" ? "brand" : color;
  const accent = ACCENT_COLORS[colorKey] || ACCENT_COLORS.brand;

  return (
    <div className={`card border-l-4 ${accent} p-5`}>
      <p className="section-heading mb-0">{label}</p>
      <p className="text-3xl font-semibold font-mono text-ink-900 mt-1">
        {value}
      </p>
      {sub && <p className="text-xs text-ink-400 mt-1">{sub}</p>}
    </div>
  );
}
