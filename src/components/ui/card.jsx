// src/components/ui/card.jsx
export function Card({ children, className = "" }) {
  return <div className={`rounded-lg p-4 ${className}`}>{children}</div>;
}

export function CardContent({children, className = ""}) {
  return <div className={className}>{children}</div>;
}

export function CardHeader({ children, className = "" }) {
  return <div className={`p-4 border-b ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = "" }) {
  return (
    <h3 className={`text-lg font-bold leading-tight ${className}`}>
      {children}
    </h3>
  );
}