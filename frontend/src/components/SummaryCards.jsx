import PressureBadge from './PressureBadge'

export default function SummaryCards({ total, avgChange, highPressure }) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-5">
      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <div className="text-xs text-slate-400 mb-1">Sinusubaybayan</div>
        <div className="text-2xl font-bold text-slate-900">{total}</div>
        <div className="text-xs text-slate-400 mt-0.5">na produkto</div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <div className="text-xs text-slate-400 mb-1">Avg na pagbabago</div>
        <div className={`text-2xl font-bold ${avgChange > 0 ? 'text-red-500' : 'text-green-600'}`}>
          {avgChange > 0 ? '+' : ''}{avgChange}%
        </div>
        <div className="text-xs text-slate-400 mt-0.5">vs nakaraang period</div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <div className="text-xs text-slate-400 mb-1">Mataas na presyo</div>
        <div className={`text-2xl font-bold ${highPressure > 0 ? 'text-red-500' : 'text-green-600'}`}>
          {highPressure}
        </div>
        <div className="text-xs text-slate-400 mt-0.5">na produkto</div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <div className="text-xs text-slate-400 mb-2">Inflation pressure</div>
        <PressureBadge pct={avgChange} />
      </div>
    </div>
  )
}