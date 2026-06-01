export default function Header({ lastUpdated }) {
  return (
    <div className="bg-gray-100 border-b border-slate-200 px-4 py-3 shadow-md grid grid-cols-3 items-center">
      
      {/* LEFT: LOGO */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">🌾</span>
      </div>

      {/* CENTER: TITLE */}
      <div className="flex flex-col items-center text-center">
        <div className="font-bold text-base text-slate-900 leading-tight">
          PresyOn
        </div>
        <div className="text-xs text-slate-400">
          Mga presyo ngayon
        </div>
      </div>

      {/* RIGHT: DATE */}
      {lastUpdated && (
        <div className="text-xs text-slate-400 text-right">
          <div>Na-update</div>
          <div className="font-medium text-slate-500">
            {lastUpdated.toLocaleDateString('en-PH', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        </div>
      )}
    </div>
  )
}