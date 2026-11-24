import React from 'react';

const StatusBadge = ({ status }) => {
  const norm = (status || '').toUpperCase();
  
  if (norm === 'OPTIMAL' || norm === 'OPTIMAL_STOCK' || norm === 'RESOLVED') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
        {norm === 'RESOLVED' ? 'Resolved' : 'Optimal Stock'}
      </span>
    );
  }
  
  if (norm === 'LOW_STOCK' || norm === 'CRITICAL' || norm === 'ACTIVE') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
        {norm === 'ACTIVE' ? 'Active' : 'Low Stock Alert'}
      </span>
    );
  }

  if (norm === 'OVERSTOCK' || norm === 'WARNING') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
        Overstock Alert
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
