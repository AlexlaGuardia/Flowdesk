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

export default function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || "border-ink-500 text-ink-500";
  return (
    <span className={`stamp-badge ${color}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
