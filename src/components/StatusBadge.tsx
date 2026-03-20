import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      status: {
        active: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
        error: "bg-destructive/10 text-destructive",
        info: "bg-info/10 text-info",
        neutral: "bg-muted text-muted-foreground",
        approved: "bg-success/10 text-success",
        pending: "bg-warning/10 text-warning",
        denied: "bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: {
      status: "neutral",
    },
  }
);

interface StatusBadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

export default function StatusBadge({ status, children, dot = true, className }: StatusBadgeProps) {
  return (
    <span className={cn(badgeVariants({ status }), className)}>
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full", {
          "bg-success": status === "active" || status === "approved",
          "bg-warning": status === "warning" || status === "pending",
          "bg-destructive": status === "error" || status === "denied",
          "bg-info": status === "info",
          "bg-muted-foreground": status === "neutral",
        })} />
      )}
      {children}
    </span>
  );
}
