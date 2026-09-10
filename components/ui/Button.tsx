import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  asLink?: boolean;
  href?: string;
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const variantClass = variant === "primary" 
    ? "button--primary" 
    : variant === "secondary" 
    ? "button--secondary" 
    : "button--ghost";

  return (
    <button className={`button ${variantClass} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
