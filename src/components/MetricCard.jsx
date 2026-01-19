import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
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
    if (delta === null || delta === 0) return 'text-gray-500';
    return delta > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getDeltaIcon = () => {
    if (delta === null || delta === 0) return <Minus size={16} />;
    return delta > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />;
  };

  return (
    <div className="metric-card">
      <div className="flex items-start justify-between mb-3">
        <div className="metric-label">{label}</div>
        {Icon && <Icon size={20} className="text-primary-600 opacity-60" />}
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
