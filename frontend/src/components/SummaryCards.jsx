import PressureBadge from './PressureBadge'

export default function SummaryCards({ total, avgChange, highPressure }) {
  return (
    <div className="w-full px-5 py-5 mb-5" style={{
      background: 'linear-gradient(160deg, #1a56a0 0%, #0f3d7a 100%)',
      boxShadow: '0 8px 32px rgba(15, 61, 122, 0.25)'
    }}>
      {/* Top row — hero stat + pressure badge */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-blue-300 mb-2">
            Sinusubaybayan
          </div>
          <div className="text-5xl text-white leading-none" style={{ fontFamily: 'Nunito, sans-serif', fontWeight : '600' }}>
            {total}
          </div>
          <div className="text-xs text-blue-300 mt-2">
            na produkto ang naka-monitor
          </div>
        </div>
        <PressureBadge pct={avgChange} />
      </div>

      {/* Divider */}
      <div className="border-t border-blue-100 mb-4" />

      {/* Bottom stats row */}
      <div className="flex">
        <div className="flex-1 pr-4">
          <div className="text-[10px] uppercase tracking-widest text-blue-300 mb-1.5">
            Avg na pagbabago
          </div>
          <div className={`text-2xl leading-none ${avgChange > 0 ? 'text-red-500' : 'text-green-600'}`} style={{ fontFamily: 'Nunito, sans-serif', fontWeight : '700' }}>
            {avgChange > 0 ? '+' : ''}{avgChange}%
          </div>
          <div className="text-[10px] text-blue-300 mt-1.5">
            vs nakaraang period
          </div>
        </div>

        <div className="flex-1 pl-4 border-l border-blue-100">
          <div className="text-[10px] uppercase tracking-widest text-blue-300 mb-1.5">
            Mataas na presyo
          </div>
          <div className={`text-2xl leading-none ${highPressure > 0 ? 'text-red-500' : 'text-amber-400'}`} style={{ fontFamily: 'Nunito, sans-serif', fontWeight : '700' }}>
            {highPressure}
          </div>
          <div className="text-[10px] text-blue-300 mt-1.5">
            na produkto
          </div>
        </div>
      </div>

    </div>
  )
}