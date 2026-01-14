"use client";
import "../app/globals.css";
export default function Btn({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const baseStyles =
    "px-4 py-2 rounded-full font-medium transition-all shadow-md hover:shadow-lg";
  const variantStyles = {
    primary: "btn-primary",
    sec: "btn-sec",
  };

  return (
    <button
      {...props}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
