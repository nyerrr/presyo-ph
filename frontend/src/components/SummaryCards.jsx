import PressureBadge from './PressureBadge'

export default function SummaryCards({ total, avgChange, highPressure }) {
  return (
    <div className="rounded-2xl p-4 mb-5" style={{
      background: 'linear-gradient(160deg, #1a56a0 0%, #0f3d7a 100%)',
      boxShadow: '0 8px 32px rgba(15, 61, 122, 0.25)'
    }}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-xs text-blue-200 uppercase tracking-wide mb-1">Sinusubaybayan</div>
          <div className="text-5xl font-bold text-white leading-none" style={{ fontFamily: 'Nunito, sans-serif' }}>
            {total}
          </div>
          <div className="text-xs text-blue-200 mt-1">na produkto ang naka-monitor</div>
        </div>
        <PressureBadge pct={avgChange} />
      </div>

      <div className="h-px bg-blue-400 opacity-30 mb-3" />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-blue-200 uppercase tracking-wide mb-1">Avg na Pagbabago</div>
          <div className={`text-2xl font-bold ${avgChange > 0 ? 'text-red-300' : 'text-green-300'}`}
            style={{ fontFamily: 'Nunito, sans-serif' }}>
            {avgChange > 0 ? '+' : ''}{avgChange}%
          </div>
          <div className="text-xs text-blue-200 mt-0.5">vs nakaraang period</div>
        </div>

        <div>
          <div className="text-xs text-blue-200 uppercase tracking-wide mb-1">Mataas na Presyo</div>
          <div className={`text-2xl font-bold ${highPressure > 0 ? 'text-red-300' : 'text-green-300'}`}
            style={{ fontFamily: 'Nunito, sans-serif' }}>
            {highPressure}
          </div>
          <div className="text-xs text-blue-200 mt-0.5">na produkto</div>
        </div>
      </div>
    </div>
  )
}