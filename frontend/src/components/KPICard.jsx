import React from 'react';

const KPICard = ({ title, value, subtitle, icon: Icon, trend }) => {
  return (
    <div className="relative group glass-card glass-card-hover rounded-2xl p-5 shadow-lg overflow-hidden">
      {/* Top Accent Gradient Line */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-sand/30 to-transparent group-hover:via-purple transition-all duration-300"></div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-sand/70">{title}</span>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-forest-900/80 border border-sand/15 text-purple group-hover:bg-purple/20 group-hover:border-purple/40 transition-all">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="text-2xl font-bold tracking-tight text-sand-50 font-mono tabular-nums">
          {value}
        </div>
        {subtitle && (
          <p className="mt-1.5 text-xs text-sand/70 flex items-center gap-1.5">
            {trend && (
              <span className={`font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${
                trend > 0 ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
              }`}>
                {trend > 0 ? `+${trend}%` : `${trend}%`}
              </span>
            )}
            <span className="truncate">{subtitle}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default KPICard;
