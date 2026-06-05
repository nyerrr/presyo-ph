import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const PERIODS = [
  { key: 7, label: '7 days' },
  { key: 30, label: '30 days' },
]

function getTrendLabel(data) {
  if (data.length < 2) return { label: 'No data', color: 'text-slate-400' }
  const first = data[0].price
  const last = data[data.length - 1].price
  const pct = ((last - first) / first) * 100
  if (pct > 3) return { label: '↑ Upward trend', color: 'text-red-500' }
  if (pct < -3) return { label: '↓ Downward trend', color: 'text-green-600' }
  return { label: '→ Stable', color: 'text-slate-500' }
}

export default function Trends({ prices }) {
  const [selected, setSelected] = useState(null)
  const [period, setPeriod] = useState(30)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (prices.length > 0 && !selected) {
      setSelected(prices[0])
    }
  }, [prices])

  useEffect(() => {
    if (!selected) return
    setLoading(true)
    async function load() {
      const from = new Date()
      from.setDate(from.getDate() - period)

      const { data } = await supabase
        .from('price_readings')
        .select('price, scraped_at')
        .eq('commodity', selected.commodity)
        .gte('scraped_at', from.toISOString())
        .order('scraped_at', { ascending: true })

      setHistory(
        data?.map(d => ({
          date: new Date(d.scraped_at).toLocaleDateString('en-PH', {
            month: 'short', day: 'numeric'
          }),
          price: d.price
        })) || []
      )
      setLoading(false)
    }
    load()
  }, [selected, period])

  const trend = getTrendLabel(history)

  return (
    <div className="px-4">
      <h2 className="text-lg font-bold text-slate-800 mt-4 mb-3">Trend ng Presyo</h2>

      {/* Commodity selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {prices.map(p => (
          <button
            key={p.commodity}
            onClick={() => setSelected(p)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer
              ${selected?.commodity === p.commodity
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-500 border-slate-200'
              }`}
          >
            {p.icon} {p.display_name}
          </button>
        ))}
      </div>

      {/* Period toggle */}
      <div className="flex gap-2 mb-4">
        {PERIODS.map(p => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border cursor-pointer
              ${period === p.key
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-500 border-slate-200'
              }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Chart card */}
      {selected && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex justify-between items-start mb-1">
            <div>
              <div className="text-sm text-slate-500">{selected.display_name}</div>
              <div className="text-2xl font-bold text-slate-900">
                ₱{selected.price}
                <span className="text-xs text-slate-400 font-normal ml-1">/{selected.unit}</span>
              </div>
            </div>
            <span className={`text-sm font-semibold ${trend.color}`}>{trend.label}</span>
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                Loading...
              </div>
            ) : history.length > 1 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} domain={['auto', 'auto']} />
                  <Tooltip formatter={(v) => [`₱${v}`, selected.display_name]} contentStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                Not enough data for this period
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}