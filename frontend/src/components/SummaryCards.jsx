import PressureBadge from './PressureBadge'

export default function SummaryCards({ total, avgChange, highPressure }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="text-xs text-slate-400 mb-1">Commodities tracked</div>
        <div className="text-2xl font-bold text-slate-900">{total}</div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="text-xs text-slate-400 mb-1">Avg price change</div>
        <div className={`text-2xl font-bold ${avgChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
          {avgChange > 0 ? '+' : ''}{avgChange}%
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="text-xs text-slate-400 mb-1">High pressure items</div>
        <div className={`text-2xl font-bold ${highPressure > 0 ? 'text-red-600' : 'text-green-600'}`}>
          {highPressure}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="text-xs text-slate-400 mb-1">Inflation pressure</div>
        <div className="mt-2">
          <PressureBadge pct={avgChange} />
        </div>
      </div>
    </div>
  )
}