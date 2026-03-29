const STATUS_COLORS: Record<string, string> = {
  draft: "border-ink-500 text-ink-500",
  pending: "border-ink-500 text-ink-500",
  proposed: "border-carbon text-carbon",
  sent: "border-carbon text-carbon",
  in_progress: "border-carbon text-carbon",
  viewed: "border-manila text-manila",
  active: "border-ledger-green text-ledger-green",
  accepted: "border-ledger-green text-ledger-green",
  signed: "border-ledger-green text-ledger-green",
  paid: "border-ledger-green text-ledger-green",
  completed: "border-stamp-600 text-stamp-600",
  invoiced: "border-stamp-600 text-stamp-600",
  declined: "border-void-red text-void-red",
  overdue: "border-void-red text-void-red",
  voided: "border-void-red text-void-red",
  void: "border-void-red text-void-red",
  expired: "border-ink-400 text-ink-400",
  archived: "border-ink-400 text-ink-400",
};

const STATUS_ICONS: Record<string, string> = {
  paid: "\u2713",
  signed: "\u2713",
  accepted: "\u2713",
  completed: "\u2713",
  active: "\u25CF",
  in_progress: "\u25CF",
  draft: "\u25CB",
  pending: "\u25CB",
  void: "\u2717",
  voided: "\u2717",
  declined: "\u2717",
  overdue: "\u26A0",
  expired: "\u2014",
  archived: "\u2014",
};

export default function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || "border-ink-500 text-ink-500";
  const icon = STATUS_ICONS[status];
  return (
    <span className={`stamp-badge ${color}`}>
      {icon && <span className="mr-1">{icon}</span>}
      {status.replace(/_/g, " ")}
    </span>
  );
}
