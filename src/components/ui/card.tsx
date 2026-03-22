export function Card({
  children,
  className = "",
  border,
}: {
  children: React.ReactNode;
  className?: string;
  border?: string;
}) {
  return (
    <div
      className={`bg-azen-card rounded-lg p-4 ${className}`}
      style={{ border: `1px solid ${border || "#1a2340"}` }}
    >
      {children}
    </div>
  );
}
