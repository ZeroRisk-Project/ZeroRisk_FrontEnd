import * as React from "react";
import { cn } from "@/src/shared/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "buy" | "sell";
  size?: "default" | "sm" | "lg" | "icon" | "xs";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-[16px] text-sm font-semibold ring-offset-bg-main transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-brand text-white hover:bg-brand/90": variant === "primary",
            "bg-surface text-text-primary border border-border-color hover:bg-bg-main":
              variant === "secondary",
            "border border-brand text-brand bg-surface hover:bg-brand/10":
              variant === "outline",
            "hover:bg-bg-main": variant === "ghost",
            "bg-up text-white hover:bg-up/90": variant === "buy",
            "bg-down text-white hover:bg-down/90": variant === "sell",
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-[16px] px-3": size === "sm",
            "h-12 rounded-[16px] px-8 text-base": size === "lg",
            "h-10 w-10": size === "icon",
            "h-7 rounded-[12px] px-2.5 text-xs": size === "xs",
          },
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };