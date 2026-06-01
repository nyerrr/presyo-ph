const TABS = [
  { key: 'dashboard', label: 'Presyo', icon: '🏠' },
  { key: 'trends', label: 'Trend', icon: '📈' },
  { key: 'alerts', label: 'Alerto', icon: '⚠️' },
  { key: 'search', label: 'Hanapin', icon: '🔍' },
  { key: 'buywait', label: 'Bilhin?', icon: '💰' },
  { key: 'regional', label: 'Rehiyon', icon: '🗺️' }
]

export default function BottomNav({ active, onChange }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex z-50 shadow-[0_-1px_8px_rgba(0,0,0,0.06)]">
      {TABS.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 cursor-pointer transition-all
            ${active === tab.key
              ? 'text-blue-600'
              : 'text-slate-400 hover:text-slate-500'
            }`}
        >
          <span className={`text-xl transition-transform ${active === tab.key ? 'scale-110' : ''}`}>
            {tab.icon}
          </span>
          <span className={`text-xs font-medium ${active === tab.key ? 'font-semibold' : ''}`}>
            {tab.label}
          </span>
          {active === tab.key && (
            <div className="absolute bottom-0 w-8 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>
      ))}
    </div>
  )
}