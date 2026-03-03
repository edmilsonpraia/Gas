import React from 'react';
import { ArrowTrendingRegular, ArrowTrendingDown16Regular, Subtract16Regular } from '@fluentui/react-icons';
import { NumberFormatter } from '../utils/unitConverter';

/**
 * Card de métrica com valor, label e delta
 */
export default function MetricCard({
  label,
  value,
  unit = '',
  delta = null,
  deltaLabel = '',
  icon: Icon = null,
  decimals = 2
}) {
  const getDeltaColor = () => {
    if (delta === null || delta === 0) return 'text-vs-text-secondary';
    return delta > 0 ? 'text-[#4ec9b0]' : 'text-[#f44747]';
  };

  const getDeltaIcon = () => {
    if (delta === null || delta === 0) return <Subtract16Regular />;
    return delta > 0 ? <ArrowTrendingRegular className="w-4 h-4" /> : <ArrowTrendingDown16Regular />;
  };

  return (
    <div className="metric-card">
      <div className="flex items-start justify-between mb-3">
        <div className="metric-label">{label}</div>
        {Icon && <Icon size={20} className="text-vs-accent opacity-60" />}
      </div>

      <div className="metric-value">
        {NumberFormatter.format(value, decimals)}
        {unit && <span className="text-2xl ml-2 text-gray-600">{unit}</span>}
      </div>

      {delta !== null && (
        <div className={`metric-delta flex items-center gap-1 ${getDeltaColor()}`}>
          {getDeltaIcon()}
          <span>
            {Math.abs(delta).toFixed(decimals)} {deltaLabel}
          </span>
        </div>
      )}
    </div>
  );
}
