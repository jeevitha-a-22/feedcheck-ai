import React from 'react';

export const QualityGauge = ({
  score = 85,
  grade = 'Grade A (Optimal)',
  size = 'md',
  className = ''
}) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = 'text-emerald-500 stroke-emerald-500';
  let bgGlow = 'from-emerald-500/10 to-transparent';
  let badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';

  if (score < 60) {
    colorClass = 'text-rose-500 stroke-rose-500';
    bgGlow = 'from-rose-500/10 to-transparent';
    badgeColor = 'bg-rose-50 text-rose-800 border-rose-200';
  } else if (score < 82) {
    colorClass = 'text-amber-500 stroke-amber-500';
    bgGlow = 'from-amber-500/10 to-transparent';
    badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
  }

  return (
    <div className={`flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b ${bgGlow} border border-slate-200/80 shadow-sm relative overflow-hidden ${className}`}>
      {/* SVG Ring Gauge */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 130 130">
          {/* Background circle */}
          <circle
            cx="65"
            cy="65"
            r={radius}
            className="stroke-slate-200"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Active score circle */}
          <circle
            cx="65"
            cy="65"
            r={radius}
            className={`transition-all duration-1000 ease-out ${colorClass}`}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-black text-slate-900 tracking-tight font-sans">
            {score}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Index / 100
          </span>
        </div>
      </div>

      {/* Grade Classification Badge */}
      <div className="mt-4 text-center">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold border shadow-sm ${badgeColor}`}>
          {grade}
        </div>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Feed Quality Index (FQI)
        </p>
      </div>
    </div>
  );
};

export default QualityGauge;
