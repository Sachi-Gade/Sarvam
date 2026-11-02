import React from 'react';

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = "brand", 
  trend,
  trendType = "neutral",
  onClick 
}) {
  const colorMap = {
    brand: {
      bg: "bg-brand-50",
      text: "text-brand-600",
      border: "border-brand-100",
      pill: "bg-brand-100/70 text-brand-700"
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-100",
      pill: "bg-emerald-100/70 text-emerald-700"
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-100",
      pill: "bg-amber-100/70 text-amber-800"
    },
    rose: {
      bg: "bg-rose-50",
      text: "text-rose-600",
      border: "border-rose-100",
      pill: "bg-rose-100/70 text-rose-700"
    },
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      border: "border-indigo-100",
      pill: "bg-indigo-100/70 text-indigo-700"
    }
  };

  const scheme = colorMap[color] || colorMap.brand;

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-brand-300' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${scheme.bg} ${scheme.text} border ${scheme.border}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3.5 flex items-center gap-2 pt-2.5 border-t border-slate-100 text-xs">
          {trend && (
            <span className={`px-2 py-0.5 rounded-full font-semibold ${
              trendType === "positive" ? "bg-emerald-50 text-emerald-700" :
              trendType === "negative" ? "bg-rose-50 text-rose-700" :
              scheme.pill
            }`}>
              {trend}
            </span>
          )}
          {subtitle && <span className="text-slate-500 truncate">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}

