export default function Header({ lastUpdated }) {
  return (
    <div className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🌾</span>
        <div>
          <div className="font-bold text-lg text-slate-900">Presyo PH</div>
          <div className="text-xs text-slate-400">Basic goods price tracker · NCR</div>
        </div>
      </div>
      {lastUpdated && (
        <div className="text-xs text-slate-400">
          Updated {lastUpdated.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      )}
    </div>
  )
}