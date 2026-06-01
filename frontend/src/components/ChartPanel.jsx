import { useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import PressureBadge from './PressureBadge'
import { useAIExplanation } from '../hooks/useAIExplanation'

export default function ChartPanel({ item, history }) {
  if (!item) return null

  const { explanation, loading, explain } = useAIExplanation()

  useEffect(() => {
    if (item && history.length >= 2) {
      explain(item, history)
    }
  }, [item?.commodity, history.length])

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

      {/* AI Explanation */}
      <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 min-h-12">
        {loading ? (
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse" />
            Sinusuri ng AI...
          </div>
        ) : explanation ? (
          <p>{explanation}</p>
        ) : (
          <p className="text-slate-400">Walang sapat na datos para sa paliwanag.</p>
        )}
      </div>
    </div>
  )
}