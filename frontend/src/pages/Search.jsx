import { useState } from 'react'
import { supabase } from '../supabase'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Search({ prices }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [history, setHistory] = useState([])
  const [lastWeek, setLastWeek] = useState(null)

  const results = query.trim() === ''
    ? []
    : prices.filter(p =>
        p.display_name.toLowerCase().includes(query.toLowerCase())
      )

  async function selectItem(item) {
    setSelected(item)

    const { data } = await supabase
      .from('price_readings')
      .select('price, scraped_at')
      .eq('commodity', item.commodity)
      .order('scraped_at', { ascending: true })

    const formatted = data?.map(d => ({
      date: new Date(d.scraped_at).toLocaleDateString('en-PH', {
        month: 'short', day: 'numeric'
      }),
      price: d.price
    })) || []

    setHistory(formatted)

    // last week = second to last reading
    if (formatted.length >= 2) {
      setLastWeek(formatted[formatted.length - 2].price)
    } else {
      setLastWeek(null)
    }
  }

  const pctChange = selected && lastWeek
    ? (((selected.price - lastWeek) / lastWeek) * 100).toFixed(1)
    : null

  return (
    <div className="px-4">
      <h2 className="text-lg font-bold text-slate-800 mt-4 mb-3">Hanapin ang Presyo</h2>

      {/* Search input */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        <input
          type="text"
          placeholder="Search commodity (e.g. tomato, rice, pork...)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-400"
        />
      </div>

      {/* Search results */}
      {results.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 mb-4 overflow-hidden">
          {results.map(p => (
            <button
              key={p.commodity}
              onClick={() => selectItem(p)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 cursor-pointer text-left"
            >
              <span className="text-xl">{p.icon}</span>
              <div>
                <div className="text-sm font-medium text-slate-800">{p.display_name}</div>
                <div className="text-xs text-slate-400">₱{p.price}/{p.unit}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Comparison card */}
      {selected && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{selected.icon}</span>
            <div>
              <div className="font-semibold text-slate-800">{selected.display_name}</div>
              <div className="text-xs text-slate-400">per {selected.unit}</div>
            </div>
          </div>

          {/* Today vs last week */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="text-xs text-slate-400 mb-1">Today</div>
              <div className="text-xl font-bold text-slate-900">₱{selected.price}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="text-xs text-slate-400 mb-1">Last period</div>
              <div className="text-xl font-bold text-slate-900">
                {lastWeek ? `₱${lastWeek}` : '—'}
              </div>
            </div>
          </div>

          {pctChange && (
            <div className={`text-sm font-medium mb-4 ${pctChange > 0 ? 'text-red-500' : 'text-green-600'}`}>
              {pctChange > 0 ? '▲' : '▼'} {Math.abs(pctChange)}% vs last period
            </div>
          )}

          {/* Mini chart */}
          {history.length > 1 && (
            <>
              <div className="text-xs text-slate-400 mb-2">Price history</div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={history}>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} domain={['auto', 'auto']} />
                  <Tooltip formatter={(v) => [`₱${v}`]} contentStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      )}

      {query.trim() !== '' && results.length === 0 && (
        <div className="text-center text-slate-400 text-sm mt-8">
          No results for "{query}"
        </div>
      )}
    </div>
  )
}