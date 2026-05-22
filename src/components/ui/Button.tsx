import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "icon";
}

export function Button({
  className,
  variant = "secondary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-md border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" &&
          "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "secondary" &&
          "border-border bg-secondary text-secondary-foreground hover:bg-accent",
        variant === "ghost" && "border-transparent bg-transparent hover:bg-accent",
        variant === "danger" &&
          "border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90",
        size === "sm" && "h-8 px-3",
        size === "md" && "h-10 px-4",
        size === "icon" && "h-9 w-9",
        className,
      )}
      {...props}
    />
  );
}
