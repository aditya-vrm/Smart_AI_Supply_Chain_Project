import React from 'react';

const KPICard = ({ title, value, subtitle, icon: Icon, trend }) => {
  return (
    <div className="relative group bg-[#0E1522] rounded-xl border border-slate-800 p-5 hover:border-slate-700 transition-all shadow-md overflow-hidden">
      {/* Top Cobalt Edge Accent */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cobalt to-transparent group-hover:via-neon transition-all duration-300"></div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</span>
        {Icon && (
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-neon group-hover:text-neon group-hover:border-cobalt/50 transition-all">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
          {value}
        </div>
        {subtitle && (
          <p className="mt-1.5 text-xs text-slate-400 flex items-center gap-1.5">
            {trend && (
              <span className={`font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                trend > 0 ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
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
