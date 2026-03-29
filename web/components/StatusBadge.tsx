const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  proposed: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  completed: "bg-indigo-100 text-indigo-700",
  archived: "bg-gray-100 text-gray-500",
  sent: "bg-blue-100 text-blue-700",
  viewed: "bg-amber-100 text-amber-700",
  accepted: "bg-green-100 text-green-700",
  declined: "bg-red-100 text-red-700",
  signed: "bg-green-100 text-green-700",
  voided: "bg-red-100 text-red-600",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
  void: "bg-gray-100 text-gray-500",
  pending: "bg-amber-100 text-amber-700",
  in_progress: "bg-blue-100 text-blue-700",
  invoiced: "bg-indigo-100 text-indigo-700",
};

export default function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
