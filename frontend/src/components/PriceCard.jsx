import { CATEGORY_COLORS } from '../constants/categories'

export default function PriceCard({ item, onClick, selected }) {
  const dotColor = CATEGORY_COLORS[item.category] || 'bg-slate-400'
  const isUp = item.pct_change > 0

  return (
    <div
      onClick={() => onClick(item)}
      className={`rounded-2xl p-4 cursor-pointer transition-all border
        ${selected
          ? 'bg-blue-50 border-blue-300 shadow-sm'
          : 'bg-white border-slate-100 active:scale-95'
        }`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-3xl">{item.icon}</span>
        <div className={`w-2 h-2 rounded-full mt-1 ${dotColor}`} />
      </div>

      <div className="text-xs text-slate-500 font-medium leading-tight mb-1">
        {item.display_name}
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold text-slate-900">₱{item.price}</span>
        <span className="text-xs text-slate-400">/{item.unit}</span>
      </div>

      {item.pct_change !== null && item.pct_change !== undefined && (
        <div className={`mt-1.5 text-xs font-semibold ${isUp ? 'text-red-500' : 'text-green-600'}`}>
          {isUp ? '▲' : '▼'} {Math.abs(item.pct_change).toFixed(1)}%
        </div>
      )}
    </div>
  )
}