import React from 'react';
import { AlertTriangle, Clock, TrendingDown } from 'lucide-react';

/**
 * Timeline Anomaly Exhibit - 273x Acceleration Visualization
 * 
 * Hardcoded Data:
 * - Court Ordered: 1,095 Days (36 months)
 * - Actual: 4 Days
 * - Acceleration: 273.75x
 * - Unauthorized Discount: $2,347 (17.6%)
 */

const TimelineAnomalyExhibit: React.FC = () => {
  // Hardcoded values
  const COURT_ORDERED_DAYS = 1095; // 36 months
  const ACTUAL_DAYS = 4;
  const ACCELERATION_FACTOR = 273.75; // 1095 / 4
  const UNAUTHORIZED_DISCOUNT = 2347;
  const DISCOUNT_PERCENTAGE = 17.6;

  // Calculate bar widths for visualization (max 100%)
  const courtOrderedWidth = 100;
  const actualWidth = (ACTUAL_DAYS / COURT_ORDERED_DAYS) * 100; // ~0.365%

  return (
    <div className="bg-slate-900 border-2 border-red-500 rounded-lg p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-red-500/30">
        <AlertTriangle className="w-8 h-8 text-red-500" />
        <div>
          <h2 className="text-2xl font-bold text-red-500">TIMELINE ANOMALY</h2>
          <p className="text-slate-400 text-sm">Exhibit: Unauthorized Acceleration of Payment Schedule</p>
        </div>
      </div>

      {/* Acceleration Alert */}
      <div className="bg-red-950/50 border border-red-500 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-red-400" />
            <span className="text-lg font-semibold text-red-400">Acceleration Factor:</span>
          </div>
          <div className="text-4xl font-bold text-red-500">
            {ACCELERATION_FACTOR.toFixed(2)}x
          </div>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="space-y-6 mb-6">
        {/* Court Ordered Timeline */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 font-medium">Court Ordered Schedule</span>
            <span className="text-green-400 font-bold">{COURT_ORDERED_DAYS} Days</span>
          </div>
          <div className="relative h-12 bg-slate-800 rounded overflow-hidden">
            <div 
              className="absolute h-full bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-center transition-all duration-500"
              style={{ width: `${courtOrderedWidth}%` }}
            >
              <span className="text-white font-semibold text-sm">36 MONTHS (AUTHORIZED)</span>
            </div>
          </div>
        </div>

        {/* Actual Timeline */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 font-medium">Actual Schedule (Implemented)</span>
            <span className="text-red-400 font-bold">{ACTUAL_DAYS} Days</span>
          </div>
          <div className="relative h-12 bg-slate-800 rounded overflow-hidden">
            <div 
              className="absolute h-full bg-gradient-to-r from-red-600 to-red-500 flex items-center px-2 transition-all duration-500 animate-pulse"
              style={{ width: `${actualWidth}%`, minWidth: '80px' }}
            >
              <span className="text-white font-semibold text-xs whitespace-nowrap">4 DAYS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Impact */}
      <div className="bg-slate-800/50 rounded-lg p-4 border border-red-500/30">
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-bold text-red-400">UNAUTHORIZED DISCOUNT</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-slate-400 text-sm mb-1">Discount Amount</div>
            <div className="text-3xl font-bold text-red-500">${UNAUTHORIZED_DISCOUNT.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-slate-400 text-sm mb-1">Percentage Reduction</div>
            <div className="text-3xl font-bold text-red-500">{DISCOUNT_PERCENTAGE}%</div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-slate-700">
        <div className="text-center">
          <div className="text-slate-400 text-xs mb-1">ORDERED</div>
          <div className="text-green-400 font-bold">{COURT_ORDERED_DAYS}d</div>
        </div>
        <div className="text-center">
          <div className="text-slate-400 text-xs mb-1">ACTUAL</div>
          <div className="text-red-400 font-bold">{ACTUAL_DAYS}d</div>
        </div>
        <div className="text-center">
          <div className="text-slate-400 text-xs mb-1">VARIANCE</div>
          <div className="text-red-400 font-bold">-{COURT_ORDERED_DAYS - ACTUAL_DAYS}d</div>
        </div>
      </div>

      {/* Legal Citation */}
      <div className="mt-4 text-xs text-slate-500 italic text-center">
        Exhibit Reference: Payment Schedule Deviation Analysis
      </div>
    </div>
  );
};

export default TimelineAnomalyExhibit;
