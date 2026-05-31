import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

function getAlerts(prices, histories) {
  const alerts = []

  prices.forEach(p => {
    const history = histories[p.commodity] || []
    if (history.length < 3) return

    // Check last 3 readings for consecutive increases
    const last3 = history.slice(-3)
    const risingAll = last3[0].price < last3[1].price && last3[1].price < last3[2].price

    if (risingAll) {
      const pct = ((last3[2].price - last3[0].price) / last3[0].price * 100).toFixed(1)
      alerts.push({
        commodity: p.commodity,
        icon: p.icon,
        name: p.display_name,
        type: 'spike',
        message: `Price has risen 3 periods in a row (+${pct}%)`,
        severity: pct > 10 ? 'high' : 'medium',
      })
    }

    // Check if current price is 10%+ above the average
    const avg = history.reduce((s, h) => s + h.price, 0) / history.length
    const aboveAvg = ((p.price - avg) / avg) * 100
    if (aboveAvg > 10) {
      alerts.push({
        commodity: p.commodity,
        icon: p.icon,
        name: p.display_name,
        type: 'above_avg',
        message: `Currently ${aboveAvg.toFixed(1)}% above 6-month average (avg: ₱${avg.toFixed(2)})`,
        severity: 'medium',
      })
    }
  })

  return alerts
}

const SEVERITY_STYLES = {
  high: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
    label: '🔴 High',
  },
  medium: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-700',
    label: '🟡 Watch',
  },
}

export default function Alerts({ prices }) {
  const [histories, setHistories] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAll() {
      const results = {}
      await Promise.all(
        prices.map(async p => {
          const { data } = await supabase
            .from('price_readings')
            .select('price, scraped_at')
            .eq('commodity', p.commodity)
            .order('scraped_at', { ascending: true })
          results[p.commodity] = data || []
        })
      )
      setHistories(results)
      setLoading(false)
    }
    if (prices.length > 0) loadAll()
  }, [prices])

  const alerts = getAlerts(prices, histories)

  return (
    <div className="pb-24 px-4">
      <h2 className="text-lg font-bold text-slate-800 mt-4 mb-1">Mga Alerto</h2>
      <p className="text-xs text-slate-400 mb-4">Batay sa mga kamakailang pagbabago ng presyo</p>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
          Analyzing prices...
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <div className="text-3xl mb-2">✅</div>
          <div className="font-semibold text-green-700">No alerts right now</div>
          <div className="text-xs text-green-600 mt-1">All prices look stable</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {alerts.map((alert, i) => {
            const style = SEVERITY_STYLES[alert.severity]
            return (
              <div key={i} className={`rounded-2xl border p-4 ${style.bg} ${style.border}`}>
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{alert.icon}</span>
                    <span className="font-semibold text-slate-800">{alert.name}</span>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.badge}`}>
                    {style.label}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}