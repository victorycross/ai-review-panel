import type { RiskLevel } from "@/lib/types";
import { RISK_LEVEL_BG } from "@/lib/constants";

interface RiskBadgeProps {
  level: RiskLevel;
  size?: "sm" | "md" | "lg";
}

export function RiskBadge({ level, size = "md" }: RiskBadgeProps) {
  const sizeClass = {
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2 py-0.5 text-xs font-medium",
    lg: "px-3 py-1 text-sm font-semibold",
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded border font-mono ${sizeClass} ${RISK_LEVEL_BG[level]}`}
    >
      {level}
    </span>
  );
}
