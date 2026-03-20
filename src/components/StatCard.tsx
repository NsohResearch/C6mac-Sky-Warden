import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  delay?: number;
}

export default function StatCard({ label, value, change, changeType = "neutral", icon: Icon, delay = 0 }: StatCardProps) {
  return (
    <div
      className="bg-card rounded-lg p-5 shadow-card hover:shadow-card-hover transition-shadow duration-200 animate-reveal-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
        <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-accent" strokeWidth={2} />
        </div>
      </div>
      <div className="tabular text-2xl font-semibold tracking-tight text-foreground leading-none mb-1">
        {value}
      </div>
      {change && (
        <span className={`text-xs font-medium tabular ${
          changeType === "positive" ? "text-success" :
          changeType === "negative" ? "text-destructive" :
          "text-muted-foreground"
        }`}>
          {change}
        </span>
      )}
    </div>
  );
}
