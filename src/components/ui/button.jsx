// src/components/ui/button.jsx
export function Button({ children, disabled, className = "", ...props }) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={`px-3 py-2 rounded ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  );
}