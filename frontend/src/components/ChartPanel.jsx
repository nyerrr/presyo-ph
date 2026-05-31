import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import PressureBadge from './PressureBadge'

export default function ChartPanel({ item, history }) {
  if (!item) return null

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 mt-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{item.icon}</span>
          <div>
            <div className="font-semibold text-slate-800">{item.display_name}</div>
            <div className="text-xl font-bold text-slate-900">
              ₱{item.price}
              <span className="text-xs text-slate-400 font-normal ml-1">/{item.unit}</span>
            </div>
          </div>
        </div>
        <PressureBadge pct={item.pct_change} />
      </div>

      <div className="text-xs text-slate-400 mb-3">Kasaysayan ng presyo (6 buwan)</div>

      {history.length > 1 ? (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} domain={['auto', 'auto']} />
            <Tooltip
              formatter={(v) => [`₱${v}`, item.display_name]}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
            />
            <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-44 flex items-center justify-center text-slate-400 text-sm">
          Hindi pa sapat ang datos
        </div>
      )}

      {item.pct_change !== null && item.pct_change !== undefined && (
        <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
          <span className="font-semibold">Trend: </span>
          {item.pct_change > 0
            ? `Tumaas ng ${item.pct_change.toFixed(1)}% mula noong nakaraang period. `
            : `Bumaba ng ${Math.abs(item.pct_change).toFixed(1)}% mula noong nakaraang period. `}
          {item.pct_change > 10
            ? 'Mabilis na pagtaas — mag-ingat sa pagbili.'
            : item.pct_change > 0
            ? 'Bahagyang pagtaas.'
            : 'Bumababa ang presyo.'}
        </div>
      )}
    </div>
  )
}