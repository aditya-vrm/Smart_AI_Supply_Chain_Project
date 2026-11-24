import React from 'react';

const KPICard = ({ title, value, subtitle, icon: Icon, trend, color = 'blue' }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-300 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        {Icon && (
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-blue-600">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">
          {value}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-500 flex items-center gap-1.5">
            {trend && (
              <span className={`font-medium ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trend > 0 ? `+${trend}%` : `${trend}%`}
              </span>
            )}
            <span>{subtitle}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default KPICard;
