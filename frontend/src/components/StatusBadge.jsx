import React from 'react';

const StatusBadge = ({ status }) => {
  const norm = (status || '').toUpperCase();
  
  if (norm === 'OPTIMAL' || norm === 'OPTIMAL_STOCK' || norm === 'RESOLVED') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/70 text-emerald-400 border border-emerald-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span>
        {norm === 'RESOLVED' ? 'Resolved' : 'Optimal'}
      </span>
    );
  }
  
  if (norm === 'LOW_STOCK' || norm === 'CRITICAL' || norm === 'ACTIVE') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-950/70 text-rose-400 border border-rose-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5 animate-pulse"></span>
        {norm === 'ACTIVE' ? 'Active Alert' : 'Low Stock'}
      </span>
    );
  }

  if (norm === 'OVERSTOCK' || norm === 'WARNING') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-950/70 text-amber-400 border border-amber-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5"></span>
        Overstock
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
