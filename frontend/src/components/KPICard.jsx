import React from 'react';

const KPICard = ({ title, value, subtitle, icon: Icon, trend }) => {
  return (
    <div className="relative group bg-[#0D131F]/90 backdrop-blur-md rounded-xl border border-slate-800 p-5 hover:border-slate-700 transition-all duration-300 overflow-hidden shadow-lg shadow-black/40">
      {/* Top Subtle Neon Edge Line */}
      <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent group-hover:via-emerald-400 transition-all"></div>
      
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono tracking-wider uppercase text-slate-400">{title}</span>
        {Icon && (
          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-emerald-400 group-hover:text-emerald-300 group-hover:border-emerald-500/30 transition-all shadow-inner">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums drop-shadow-sm">
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
