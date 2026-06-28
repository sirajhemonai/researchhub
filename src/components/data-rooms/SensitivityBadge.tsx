import { cn } from "@/lib/utils";

const CONFIG: Record<string, { label: string; className: string }> = {
  low:      { label: "Low",      className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  medium:   { label: "Medium",   className: "bg-amber-100   text-amber-700   border-amber-200"   },
  high:     { label: "High",     className: "bg-orange-100  text-orange-700  border-orange-200"  },
  critical: { label: "Critical", className: "bg-red-100     text-red-700     border-red-200"     },
};

interface SensitivityBadgeProps {
  level: string;
  className?: string;
}

export function SensitivityBadge({ level, className }: SensitivityBadgeProps) {
  const cfg = CONFIG[level] ?? { label: level, className: "bg-slate-100 text-slate-700 border-slate-200" };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        cfg.className,
        className,
      )}
    >
      {cfg.label}
    </span>
  );
}
