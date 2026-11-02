import React from 'react';

export default function AlertBadge({ priority, status }) {
  if (priority) {
    const priorityConfig = {
      High: "bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20",
      Medium: "bg-amber-50 text-amber-800 border-amber-200 ring-amber-500/20",
      Low: "bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/20"
    };

    const dotConfig = {
      High: "bg-rose-500 animate-pulse",
      Medium: "bg-amber-500",
      Low: "bg-sky-500"
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${priorityConfig[priority] || priorityConfig.Low}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotConfig[priority] || dotConfig.Low}`}></span>
        {priority} Priority
      </span>
    );
  }

  if (status) {
    const statusConfig = {
      Open: "bg-rose-100 text-rose-800 border-rose-200",
      "In Progress": "bg-brand-100 text-brand-800 border-brand-200",
      Resolved: "bg-emerald-100 text-emerald-800 border-emerald-200"
    };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${statusConfig[status] || statusConfig.Open}`}>
        {status}
      </span>
    );
  }

  return null;
}

