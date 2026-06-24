import * as React from "react";
import { cn } from "@/src/lib/utils";

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "secondary" | "outline" | "up" | "down";
};

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center text-center leading-none rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2",
        {
          "border-transparent bg-brand text-white": variant === "default",
          "border-transparent bg-bg-main text-text-primary": variant === "secondary",
          "text-text-primary border border-border-color": variant === "outline",
          "border-transparent bg-up text-white": variant === "up",
          "border-transparent bg-down text-white": variant === "down",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
