import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize    = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  fullWidth?: boolean;
  leftIcon?:  ReactNode;
  rightIcon?: ReactNode;
  children:   ReactNode;
}

export const Button = ({
  variant   = "primary",
  size      = "md",
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className = "",
  ...props
}: ButtonProps) => (
  <button
    className={[
      "btn",
      `btn--${variant}`,
      `btn--${size}`,
      fullWidth ? "btn--full" : "",
      className,
    ].join(" ")}
    {...props}
  >
    {leftIcon}
    {children}
    {rightIcon}
  </button>
);