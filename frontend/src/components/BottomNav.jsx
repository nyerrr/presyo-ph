const TABS = [
  { key: 'dashboard', label: 'Prices', icon: '🏠' },
  { key: 'trends', label: 'Trends', icon: '📈' },
  { key: 'alerts', label: 'Alerts', icon: '⚠️' },
  { key: 'search', label: 'Search', icon: '🔍' },
  { key: 'buywait', label: 'Buy?', icon: '💰' },
]

export default function BottomNav({ active, onChange }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex z-50">
      {TABS.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 cursor-pointer transition-colors
            ${active === tab.key
              ? 'text-blue-600'
              : 'text-slate-400 hover:text-slate-600'
            }`}
        >
          <span className="text-xl">{tab.icon}</span>
          <span className="text-xs font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}