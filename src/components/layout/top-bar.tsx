export function TopBar({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-white text-xl font-bold">{title}</h1>
        {subtitle && (
          <p className="text-azen-text text-[13px] mt-1">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
