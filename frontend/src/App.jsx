import { useEffect, useState } from 'react'
import { supabase } from './supabase'

import Header from './components/Header'
import CategoryFilter from './components/CategoryFilter'
import SummaryCards from './components/SummaryCards'
import PriceGrid from './components/PriceGrid'
import ChartPanel from './components/ChartPanel'

import { CATEGORIES } from './constants/categories'

export default function App() {
  const [prices, setPrices] = useState([])
  const [history, setHistory] = useState([])
  const [selected, setSelected] = useState(null)
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  // ---------- LOAD PRICES ----------
  useEffect(() => {
    async function load() {
      const { data: latestData } = await supabase
        .from('latest_prices')
        .select('*')

      const { data: changesData } = await supabase
        .from('price_changes')
        .select('*')

      const changeMap = {}
      changesData?.forEach(c => {
        if (!changeMap[c.commodity]) {
          changeMap[c.commodity] = c.pct_change
        }
      })

      const enriched = latestData?.map(p => ({
        ...p,
        pct_change: changeMap[p.commodity] ?? null
      })) || []

      setPrices(enriched)
      setSelected(enriched[0] || null)

      const dates = latestData?.map(p => new Date(p.scraped_at)) || []
      if (dates.length) {
        setLastUpdated(new Date(Math.max(...dates)))
      }

      setLoading(false)
    }

    load()
  }, [])

  // ---------- LOAD HISTORY ----------
  useEffect(() => {
    if (!selected) return

    async function loadHistory() {
      const { data } = await supabase
        .from('price_readings')
        .select('price, scraped_at')
        .eq('commodity', selected.commodity)
        .order('scraped_at', { ascending: true })
        .limit(20)

      setHistory(
        data?.map(d => ({
          date: new Date(d.scraped_at).toLocaleDateString('en-PH', {
            month: 'short',
            day: 'numeric'
          }),
          price: d.price
        })) || []
      )
    }

    loadHistory()
  }, [selected])

  // ---------- DERIVED DATA ----------
  const filtered =
    category === 'all'
      ? prices
      : prices.filter(p => p.category === category)

  const highPressure = prices.filter(p => p.pct_change > 5).length

  const changedPrices = prices.filter(p => p.pct_change !== null)

  const avgChange =
    changedPrices.length > 0
      ? (
          changedPrices.reduce((s, p) => s + (p.pct_change || 0), 0) /
          changedPrices.length
        ).toFixed(1)
      : 0

  if (loading) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-slate-50">
      <Header lastUpdated={lastUpdated} />

      <div className="max-w-6xl mx-auto p-6">

        <SummaryCards
          total={prices.length}
          avgChange={avgChange}
          highPressure={highPressure}
        />

        <CategoryFilter
          active={category}
          onChange={setCategory}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start">

          <PriceGrid
            prices={filtered}
            selected={selected}
            onSelect={setSelected}
          />

          <ChartPanel
            item={selected}
            history={history}
          />

        </div>
      </div>
    </div>
  )
}