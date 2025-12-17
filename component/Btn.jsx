"use client";


export default function Btn({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  let baseStyles = "text-sm font-medium py-2 rounded-lg transition";

  let variantStyles =
    variant === "primary"
      ? "bg-[#FE5B63] text-white p-4 hover:bg-[#ff6b71] shadow-sm"
      : "border border-[#FE5B63] p-4 text-[#FE5B63] hover:bg-[#fff1f2]";

  return (
    <button
      {...props}
      className={`${baseStyles} ${variantStyles} ${className}`}
    >
      {children}
    </button>
  );
}
