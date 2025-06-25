// src/components/ui/button.jsx
export function Button({ children, ...props }) {
  return (
    <button {...props} className={`px-3 py-2 rounded ${props.className || ""}`}>
      {children}
    </button>
  );
}