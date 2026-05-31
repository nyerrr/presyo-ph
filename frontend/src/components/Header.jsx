export default function Header({ lastUpdated }) {
  return (
    <div className="bg-white border-b border-slate-100 px-4 py-3 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🌾</span>
        <div>
          <div className="font-bold text-base text-slate-900 leading-tight">Presyo PH</div>
          <div className="text-xs text-slate-400">Mga presyo ngayon sa NCR</div>
        </div>
      </div>
      {lastUpdated && (
        <div className="text-xs text-slate-400 text-right">
          <div>Na-update</div>
          <div className="font-medium text-slate-500">
            {lastUpdated.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      )}
    </div>
  )
}