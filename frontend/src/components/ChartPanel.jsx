import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import PressureBadge from './PressureBadge'

export default function ChartPanel({ item, history }) {
  if (!item) return null

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sticky top-4">
      <div className="flex justify-between items-start mb-1">
        <div>
          <div className="text-sm text-slate-500">{item.display_name}</div>
          <div className="text-2xl font-bold text-slate-900">
            ₱{item.price}
            <span className="text-xs text-slate-400 font-normal ml-1">/{item.unit}</span>
          </div>
        </div>
        <PressureBadge pct={item.pct_change} />
      </div>

      <div className="text-xs text-slate-400 mb-3">Price history (last 6 months)</div>

      {history.length > 1 ? (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} domain={['auto', 'auto']} />
            <Tooltip
              formatter={(v) => [`₱${v}`, item.display_name]}
              contentStyle={{ fontSize: 12 }}
            />
            <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-44 flex items-center justify-center text-slate-400 text-sm">
          Not enough history yet
        </div>
      )}

      {item.pct_change !== null && item.pct_change !== undefined && (
        <div className="mt-3 p-3 bg-slate-50 rounded-lg text-xs text-slate-600">
          <span className="font-semibold">Trend: </span>
          {item.pct_change > 0
            ? `Up ${item.pct_change.toFixed(1)}% from last period. `
            : `Down ${Math.abs(item.pct_change).toFixed(1)}% from last period. `}
          {item.pct_change > 10
            ? 'Strong upward pressure — prices rising fast.'
            : item.pct_change > 0
            ? 'Mild upward pressure.'
            : 'Prices easing.'}
        </div>
      )}
    </div>
  )
}