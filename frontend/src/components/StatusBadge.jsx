import React from 'react';

const StatusBadge = ({ status }) => {
  const norm = (status || '').toUpperCase();
  
  if (norm === 'OPTIMAL' || norm === 'OPTIMAL_STOCK' || norm === 'RESOLVED') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
        {norm === 'RESOLVED' ? 'RESOLVED' : 'OPTIMAL'}
      </span>
    );
  }
  
  if (norm === 'LOW_STOCK' || norm === 'CRITICAL' || norm === 'ACTIVE') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-rose-950/60 text-rose-300 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5 animate-ping"></span>
        {norm === 'ACTIVE' ? 'ACTIVE ALERT' : 'CRITICAL LOW'}
      </span>
    );
  }

  if (norm === 'OVERSTOCK' || norm === 'WARNING') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-amber-950/60 text-amber-300 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5"></span>
        OVERSTOCK RISK
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-900 text-slate-300 border border-slate-700">
      {status || 'UNKNOWN'}
    </span>
  );
};

export default StatusBadge;
