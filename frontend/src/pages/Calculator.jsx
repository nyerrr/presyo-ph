import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const MONTH_NAMES = ['', 'Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo',
  'Hulyo', 'Agosto', 'Setyembre', 'Oktubre', 'Nobyembre', 'Disyembre']

export default function Calculator({ prices, session, region, onRegionChange }) {
  const [basket, setBasket] = useState({})
  const [historicalPrices, setHistoricalPrices] = useState({})
  const [compareMonth, setCompareMonth] = useState(1) // January
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Load user's saved basket (most recent session)
  useEffect(() => {
    async function loadBasket() {
      const { data } = await supabase
        .from('user_baskets')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (data && data.length > 0) {
        const saved = {}
        data.forEach(item => {
          saved[item.commodity] = item.quantity
        })
        setBasket(saved)
      }
      setLoading(false)
    }
    loadBasket()
  }, [session])

  

  // Load historical prices for comparison month
  useEffect(() => {
    async function loadHistorical() {
      const { data } = await supabase
        .from('price_readings')
        .select('commodity, price, scraped_at')
        .eq('region', region)
        .gte('scraped_at', `2026-${String(compareMonth).padStart(2, '0')}-01`)
        .lt('scraped_at', `2026-${String(compareMonth + 1).padStart(2, '0')}-01`)
        .order('scraped_at', { ascending: true })
      const historical = {}
      data?.forEach(p => {
        if (!historical[p.commodity]) {
          historical[p.commodity] = p.price
        }
      })
      setHistoricalPrices(historical)
    }
    loadHistorical()
  }, [compareMonth, region])

  async function saveBasket() {
    setSaving(true)
    const entries = Object.entries(basket)
      .filter(([_, qty]) => qty > 0)
      .map(([commodity, quantity]) => ({
        user_id: session.user.id,
        commodity,
        quantity,
        unit: prices.find(p => p.commodity === commodity)?.unit || 'kg'
      }))

    await supabase
      .from('user_baskets')
      .insert(entries) // Use insert for new sessions, not upsert

    setSaving(false)
    alert('Na-save na ang iyong basket!')
  }

  // Calculate totals
  const regionPrices = prices.filter(p => p.region === region)

  let todayTotal = 0
  let thenTotal = 0
  const breakdown = []

  regionPrices.forEach(p => {
    const qty = basket[p.commodity] || 0
    if (qty <= 0) return

    const todayPrice = p.price
    const thenPrice = historicalPrices[p.commodity] || null

    const todayCost = todayPrice * qty
    const thenCost = thenPrice ? thenPrice * qty : null

    todayTotal += todayCost
    if (thenCost) thenTotal += thenCost

    breakdown.push({
      commodity: p.commodity,
      display_name: p.display_name,
      icon: p.icon,
      unit: p.unit,
      qty,
      todayPrice,
      thenPrice,
      todayCost,
      thenCost,
    })
  })

  const diff = todayTotal - thenTotal
  const pctDiff = thenTotal > 0 ? ((diff / thenTotal) * 100).toFixed(1) : null

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
      Nilo-load ang iyong basket...
    </div>
  )

  return (
    <div className="px-4 pt-3">
      <h2 className="text-lg font-bold text-slate-800 mt-2 mb-1">Inflation Calculator</h2>
      <p className="text-xs text-slate-400 mb-4">Ilagay ang dami ng iyong binibili para makita ang epekto ng inflation</p>

      {/* Region toggle */}
        <div className="flex gap-2 mb-4">
        {['NCR', 'CALABARZON'].map(r => (
            <button
            key={r}
            onClick={() => onRegionChange(r)}
            className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all cursor-pointer
                ${region === r
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-500 border-slate-200'
                }`}
            >
            {r}
            </button>
        ))}
        </div>

      {/* Compare month selector */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-4">
        <div className="text-xs text-slate-400 mb-2">Ikumpara sa:</div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[1, 2, 3, 4, 5].map(m => (
            <button
              key={m}
              onClick={() => setCompareMonth(m)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer
                ${compareMonth === m
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-500 border-slate-200'
                }`}
            >
              {MONTH_NAMES[m]}
            </button>
          ))}
        </div>
      </div>

      {/* Result summary */}
      {thenTotal > 0 && todayTotal > 0 && (
        <div className="rounded-2xl p-4 mb-4" style={{
          background: 'linear-gradient(160deg, #1a56a0 0%, #0f3d7a 100%)'
        }}>
          <div className="text-xs text-blue-200 mb-1">Noon ({MONTH_NAMES[compareMonth]} 2026)</div>
          <div className="text-2xl font-extrabold text-white mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
            ₱{thenTotal.toFixed(2)}
          </div>
          <div className="text-xs text-blue-200 mb-1">Ngayon (Hunyo 2026)</div>
          <div className="text-2xl font-extrabold text-white mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
            ₱{todayTotal.toFixed(2)}
          </div>
          <div className="h-px bg-blue-400 opacity-30 mb-3" />
          <div className="flex justify-between items-center">
            <div className="text-xs text-blue-200">Pagkakaiba</div>
            <div className={`text-lg font-extrabold ${diff > 0 ? 'text-red-300' : 'text-green-300'}`}
              style={{ fontFamily: 'Nunito, sans-serif' }}>
              {diff > 0 ? '+' : ''}₱{diff.toFixed(2)} ({pctDiff}%)
            </div>
          </div>
          {diff > 0 && (
            <div className="text-xs text-blue-200 mt-2">
              Sa isang taon, ₱{(diff * 12).toFixed(2)} na dagdag na gastos
            </div>
          )}
        </div>
      )}

      {/* Basket items */}
      <div className="flex flex-col gap-3 mb-4">
        {regionPrices.map(p => (
          <div key={p.commodity} className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{p.icon}</span>
                <div>
                  <div className="text-sm font-medium text-slate-800">{p.display_name}</div>
                  <div className="text-xs text-slate-400">₱{p.price}/{p.unit}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <input
                    type="number"
                    min="0"
                    step={p.unit === 'piece' ? '1' : '0.5'}
                    value={basket[p.commodity] || ''}
                    onChange={e => setBasket(prev => ({
                    ...prev,
                    [p.commodity]: parseFloat(e.target.value) || 0
                    }))}
                    placeholder="0"
                    className="w-16 border border-slate-200 rounded-xl p-2 text-sm text-center focus:outline-none focus:border-blue-400"
                />
                <span className="text-xs text-slate-400">{p.unit}</span>
                </div>
            
            </div>
            {basket[p.commodity] > 0 && (
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Ngayon: ₱{(p.price * basket[p.commodity]).toFixed(2)}</span>
                {historicalPrices[p.commodity] && (
                  <span>Noon: ₱{(historicalPrices[p.commodity] * basket[p.commodity]).toFixed(2)}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Save button */}
      <button
        onClick={saveBasket}
        disabled={saving}
        className="w-full py-3 rounded-2xl text-white font-semibold cursor-pointer disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #1a56a0, #0f3d7a)' }}
      >
        {saving ? 'Sino-save...' : '🛒 I-save ang aking basket'}
      </button>
    </div>
  )
}