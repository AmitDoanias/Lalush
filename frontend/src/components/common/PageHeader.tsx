interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  badge?: { label: string; color: 'gold' | 'red' | 'green' | 'blue' };
}

export default function PageHeader({ title, subtitle, actions, badge }: PageHeaderProps) {
  const badgeColors = {
    gold: 'bg-gold-100 text-gold-600',
    red: 'bg-red-50 text-danger',
    green: 'bg-emerald-50 text-success',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-semibold text-navy-800">{title}</h1>
          {badge && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeColors[badge.color]}`}>
              {badge.label}
            </span>
          )}
        </div>
        {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
