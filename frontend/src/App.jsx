import { useEffect, useState } from 'react'
import { supabase } from './supabase'

import Header from './components/Header'
import BottomNav from './components/BottomNav'
import Dashboard from './pages/Dashboard'
import Trends from './pages/Trends'
import Alerts from './pages/Alerts'
import Search from './pages/Search'
import BuyWait from './pages/BuyWait'

export default function App() {
  const [prices, setPrices] = useState([])
  const [history, setHistory] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [activePage, setActivePage] = useState('dashboard')

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
      if (dates.length) setLastUpdated(new Date(Math.max(...dates)))

      setLoading(false)
    }
    load()
  }, [])

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
            month: 'short', day: 'numeric'
          }),
          price: d.price
        })) || []
      )
    }
    loadHistory()
  }, [selected])

  const changedPrices = prices.filter(p => p.pct_change !== null)
  const avgChange = changedPrices.length > 0
    ? (changedPrices.reduce((s, p) => s + (p.pct_change || 0), 0) / changedPrices.length).toFixed(1)
    : 0
  const highPressure = prices.filter(p => p.pct_change > 5).length

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="text-4xl mb-3">🌾</div>
        <div className="text-slate-400">Loading prices...</div>
      </div>
    </div>
  )

  function renderPage() {
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard
            prices={prices}
            selected={selected}
            onSelect={setSelected}
            avgChange={avgChange}
            highPressure={highPressure}
            lastUpdated={lastUpdated}
            history={history}
          />
        )
      case 'trends':
        return <Trends prices={prices} />
      case 'alerts':
        return <Alerts prices={prices} />
      case 'search':
        return <Search prices={prices} />
      case 'buywait':
        return <BuyWait prices={prices} />
      default:
        return (
          <div className="flex items-center justify-center h-64 text-slate-400">
            Coming soon...
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header lastUpdated={lastUpdated} />
      <div className="pt-2">
        {renderPage()}
      </div>
      <BottomNav active={activePage} onChange={setActivePage} />
    </div>
  )
}