const CATEGORY_COLORS = {
  grains: 'bg-amber-400',
  meat: 'bg-red-400',
  poultry: 'bg-orange-400',
  fish: 'bg-blue-400',
  vegetables: 'bg-green-400',
  fuel: 'bg-purple-400',
}

export default function PriceCard({ item, onClick, selected }) {
  const dotColor = CATEGORY_COLORS[item.category] || 'bg-slate-400'
  const isUp = item.pct_change > 0

  return (
    <div
      onClick={() => onClick(item)}
      className={`rounded-2xl p-4 cursor-pointer transition-all border
        ${selected
          ? 'bg-blue-50 border-blue-400'
          : 'bg-white border-slate-200 hover:border-slate-300'
        }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="text-2xl mb-1">{item.icon}</div>
          <div className="text-sm text-slate-500 font-medium leading-tight">{item.display_name}</div>
        </div>
        <div className={`w-2 h-2 rounded-full mt-1 ${dotColor}`} />
      </div>

      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-xl font-bold text-slate-900">₱{item.price}</span>
        <span className="text-xs text-slate-400">/{item.unit}</span>
      </div>

      {item.pct_change !== null && item.pct_change !== undefined && (
        <div className={`mt-1.5 text-xs font-medium ${isUp ? 'text-red-500' : 'text-green-600'}`}>
          {isUp ? '▲' : '▼'} {Math.abs(item.pct_change).toFixed(1)}% vs last period
        </div>
      )}
    </div>
  )
}