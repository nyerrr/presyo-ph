import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const MONTHS = ['', 'Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo',
  'Hulyo', 'Agosto', 'Setyembre', 'Oktubre', 'Nobyembre', 'Disyembre']

function getRateColor(rate) {
  if (rate >= 7) return '#ef4444'
  if (rate >= 5) return '#f97316'
  if (rate >= 3) return '#eab308'
  return '#22c55e'
}

function getRateLabel(rate) {
  if (rate >= 7) return { text: 'Mataas', color: 'text-red-500' }
  if (rate >= 5) return { text: 'Medyo Mataas', color: 'text-orange-500' }
  if (rate >= 3) return { text: 'Katamtaman', color: 'text-yellow-500' }
  return { text: 'Mababa', color: 'text-green-600' }
}

export default function Regional() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(4) // April latest real data

  useEffect(() => {
    async function load() {
      const { data: rows } = await supabase
        .from('regional_inflation')
        .select('*')
        .eq('year', 2026)
        .order('month', { ascending: true })

      setData(rows || [])
      setLoading(false)
    }
    load()
  }, [])

  const monthData = data.filter(d => d.month === selectedMonth)
  const provinces = monthData.filter(d => d.province !== 'CALABARZON' && d.province !== 'Metro Manila')
  const ncr = monthData.find(d => d.province === 'Metro Manila')
  const calabarzon = monthData.find(d => d.province === 'CALABARZON')

  const chartData = provinces.map(p => ({
    name: p.province,
    rate: p.rate,
  }))

  if (ncr) chartData.unshift({ name: 'Metro Manila', rate: ncr.rate })

  const availableMonths = [...new Set(data.map(d => d.month))].sort()

  return (
    <div className="pb-24 px-4 pt-3">
      <h2 className="text-lg font-bold text-slate-800 mt-2 mb-1">Inflation sa Rehiyon</h2>
      <p className="text-xs text-slate-400 mb-4">NCR at CALABARZON - datos mula sa PSA</p>

      {/* Month selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {availableMonths.map(m => (
          <button
            key={m}
            onClick={() => setSelectedMonth(m)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer
              ${selectedMonth === m
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-500 border-slate-200'
              }`}
          >
            {MONTHS[m]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
          Nilo-load...
        </div>
      ) : (
        <>
          {/* NCR vs CALABARZON */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {ncr && (
              <div className="bg-white rounded-2xl border border-slate-100 p-4">
                <div className="text-xs text-slate-400 mb-1">Metro Manila</div>
                <div className="text-3xl font-extrabold text-slate-900" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {ncr.rate}%
                </div>
                <div className={`text-xs font-semibold mt-1 ${getRateLabel(ncr.rate).color}`}>
                  {getRateLabel(ncr.rate).text}
                </div>
              </div>
            )}
            {calabarzon && (
              <div className="bg-white rounded-2xl border border-slate-100 p-4">
                <div className="text-xs text-slate-400 mb-1">CALABARZON</div>
                <div className="text-3xl font-extrabold text-slate-900" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {calabarzon.rate}%
                </div>
                <div className={`text-xs font-semibold mt-1 ${getRateLabel(calabarzon.rate).color}`}>
                  {getRateLabel(calabarzon.rate).text}
                </div>
              </div>
            )}
          </div>

          {/* Bar chart */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-4">
            <div className="text-xs text-slate-400 mb-3">
              Inflation rate bawat probinsya - {MONTHS[selectedMonth]} 2026
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[0, 10]} unit="%" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#475569' }} width={80} />
                <Tooltip formatter={(v) => [`${v}%`, 'Inflation']} contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="rate" radius={[0, 6, 6, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={getRateColor(entry.rate)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Province list */}
          <div className="flex flex-col gap-2">
            {provinces.map(p => {
              const label = getRateLabel(p.rate)
              return (
                <div key={p.province} className="bg-white rounded-2xl border border-slate-100 p-4 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-slate-800">{p.province}</div>
                    <div className={`text-xs font-medium mt-0.5 ${label.color}`}>{label.text}</div>
                  </div>
                  <div className="text-2xl font-extrabold" style={{ fontFamily: 'Nunito, sans-serif', color: getRateColor(p.rate) }}>
                    {p.rate}%
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}