import PressureBadge from './PressureBadge'

const REGIONS = [
  { key: 'NCR', label: 'NCR' },
  { key: 'CALABARZON', label: 'CALABARZON' },
]

export default function SummaryCards({ total, avgChange, highPressure, region, onRegionChange }) {
  return (
    <div className="mb-5" style={{
      background: 'linear-gradient(160deg, #1a56a0 0%, #0f3d7a 100%)',
      boxShadow: '0 8px 32px rgba(15, 61, 122, 0.25)'
    }}>
      {/* Region toggle */}
      <div className="flex px-4 pt-4 gap-2 mb-4">
        {REGIONS.map(r => (
          <button
            key={r.key}
            onClick={() => onRegionChange(r.key)}
            className={`px-5 py-1.5 rounded-full text-sm font-semibold border transition-all cursor-pointer
              ${region === r.key
                ? 'bg-white text-blue-700 border-white'
                : 'bg-transparent text-blue-200 border-blue-400'
              }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="px-4 pb-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="text-xs text-blue-200 uppercase tracking-wide mb-1">Sinusubaybayan</div>
            <div className="text-5xl font-extrabold text-white leading-none" style={{ fontFamily: 'Nunito, sans-serif' }}>
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
            <div className={`text-2xl font-extrabold ${avgChange > 0 ? 'text-red-300' : 'text-green-300'}`}
              style={{ fontFamily: 'Nunito, sans-serif' }}>
              {avgChange > 0 ? '+' : ''}{avgChange}%
            </div>
            <div className="text-xs text-blue-200 mt-0.5">vs nakaraang period</div>
          </div>

          <div>
            <div className="text-xs text-blue-200 uppercase tracking-wide mb-1">Mataas na Presyo</div>
            <div className={`text-2xl font-extrabold ${highPressure > 0 ? 'text-red-300' : 'text-green-300'}`}
              style={{ fontFamily: 'Nunito, sans-serif' }}>
              {highPressure}
            </div>
            <div className="text-xs text-blue-200 mt-0.5">na produkto</div>
          </div>
        </div>
      </div>
    </div>
  )
}