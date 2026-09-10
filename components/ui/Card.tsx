import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  as?: React.ElementType;
}

export function Card({
  children,
  interactive = false,
  className = "",
  as: Component = "div",
  ...props
}: CardProps) {
  const baseClass = interactive ? "ui-card ui-card--interactive" : "ui-card";
  return (
    <Component className={`${baseClass} ${className}`.trim()} {...props}>
      {children}
    </Component>
  );
}
