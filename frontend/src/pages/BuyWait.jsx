import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

function getRecommendation(history, currentPrice) {
  if (history.length < 3) return null

  const avg = history.reduce((s, h) => s + h.price, 0) / history.length
  const last3 = history.slice(-3)
  const risingAll = last3[0].price < last3[1].price && last3[1].price < last3[2].price
  const fallingAll = last3[0].price > last3[1].price && last3[1].price > last3[2].price
  const aboveAvg = ((currentPrice - avg) / avg) * 100

  if (fallingAll || aboveAvg < -5) {
    return {
      label: 'Buy Now',
      emoji: '🟢',
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-700',
      badgeColor: 'bg-green-100 text-green-700',
      reason: fallingAll
        ? 'Price has been dropping — good time to stock up.'
        : `Price is ${Math.abs(aboveAvg).toFixed(1)}% below average — currently a good deal.`,
    }
  }

  if (risingAll || aboveAvg > 10) {
    return {
      label: 'Expect Increase',
      emoji: '🔴',
      color: 'bg-red-50 border-red-200',
      textColor: 'text-red-700',
      badgeColor: 'bg-red-100 text-red-700',
      reason: risingAll
        ? 'Price has been rising 3 periods in a row — may continue to increase.'
        : `Price is ${aboveAvg.toFixed(1)}% above average - consider buying less for now.`,
    }
  }

  return {
    label: 'Watch',
    emoji: '🟡',
    color: 'bg-yellow-50 border-yellow-200',
    textColor: 'text-yellow-700',
    badgeColor: 'bg-yellow-100 text-yellow-700',
    reason: 'Price is near average with no clear trend. Monitor before buying in bulk.',
  }
}

export default function BuyWait({ prices }) {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function loadAll() {
      const results = await Promise.all(
        prices.map(async p => {
          const { data } = await supabase
            .from('price_readings')
            .select('price, scraped_at')
            .eq('commodity', p.commodity)
            .order('scraped_at', { ascending: true })

          const rec = getRecommendation(data || [], p.price)
          return { ...p, recommendation: rec, history: data || [] }
        })
      )
      setRecommendations(results.filter(r => r.recommendation !== null))
      setLoading(false)
    }
    if (prices.length > 0) loadAll()
  }, [prices])

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'buy', label: '🟢 Buy Now' },
    { key: 'watch', label: '🟡 Watch' },
    { key: 'wait', label: '🔴 Expect Increase' },
  ]

  const filtered = recommendations.filter(r => {
    if (filter === 'all') return true
    if (filter === 'buy') return r.recommendation.label === 'Buy Now'
    if (filter === 'watch') return r.recommendation.label === 'Watch'
    if (filter === 'wait') return r.recommendation.label === 'Expect Increase'
    return true
  })

  return (
    <div className="px-4">
      <h2 className="text-lg font-bold text-slate-800 mt-4 mb-1">Bumili o Maghintay?</h2>
      <p className="text-xs text-slate-400 mb-4">Batay sa mga kamakailang trend ng presyo at 6-month averages</p>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer
              ${filter === f.key
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-500 border-slate-200'
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
          Analyzing prices...
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(item => {
            const rec = item.recommendation
            return (
              <div key={item.commodity} className={`rounded-2xl border p-4 ${rec.color}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <div className="font-semibold text-slate-800">{item.display_name}</div>
                      <div className="text-xs text-slate-500">₱{item.price}/{item.unit}</div>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${rec.badgeColor}`}>
                    {rec.emoji} {rec.label}
                  </span>
                </div>
                <p className={`text-sm mt-2 ${rec.textColor}`}>{rec.reason}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}