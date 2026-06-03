import { useEffect, useState } from 'react'
import { supabase } from './supabase'

import Header from './components/Header'
import BottomNav from './components/BottomNav'
import Dashboard from './pages/Dashboard'
import Trends from './pages/Trends'
import Alerts from './pages/Alerts'
import Search from './pages/Search'
import BuyWait from './pages/BuyWait'
import Regional from './pages/Regional'
import Chatbot from './components/Chatbot'
import Login from './pages/Login'
import Calculator from './pages/Calculator'
import Profile from './pages/Profile'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  const [prices, setPrices] = useState([])
  const [history, setHistory] = useState([])
  const [selected, setSelected] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [activePage, setActivePage] = useState('dashboard')
  const [region, setRegion] = useState('NCR')

  // =========================
  // AUTH
  // =========================
  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  // =========================
  // LOAD PRICES
  // =========================
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

      const ncrPrices = enriched.filter(p => p.region === 'NCR')
      setSelected(ncrPrices[0] || enriched[0] || null)

      const dates = latestData?.map(p => new Date(p.scraped_at)) || []
      if (dates.length) {
        setLastUpdated(new Date(Math.max(...dates)))
      }

      setLoading(false)
    }

    load()
  }, [])

  // =========================
  // LOAD HISTORY
  // =========================
  useEffect(() => {
    if (!selected) return

    async function loadHistory() {
      const { data } = await supabase
        .from('price_readings')
        .select('price, scraped_at')
        .eq('commodity', selected.commodity)
        .eq('region', selected.region || 'NCR')
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

  // =========================
  // DERIVED DATA
  // =========================
  const changedPrices = prices.filter(p => p.pct_change !== null)

  const avgChange =
    changedPrices.length > 0
      ? (
          changedPrices.reduce((s, p) => s + (p.pct_change || 0), 0) /
          changedPrices.length
        ).toFixed(1)
      : 0

  const highPressure = prices.filter(p => p.pct_change > 5).length

  // =========================
  // LOADING STATE
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="text-4xl mb-3">🌾</div>
          <div className="text-slate-400">Loading prices...</div>
        </div>
      </div>
    )
  }

  // =========================
  // AUTH GUARD
  // =========================
  if (!session) {
    return <Login />
  }

  // =========================
  // PAGE ROUTER
  // =========================
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
            region={region}
            onRegionChange={setRegion}
          />
        )

      case 'trends':
        return <Trends prices={prices.filter(p => p.region === region)} />

      case 'alerts':
        return <Alerts prices={prices.filter(p => p.region === region)} />

      case 'search':
        return <Search prices={prices} />

      case 'buywait':
        return <BuyWait prices={prices.filter(p => p.region === region)} />

      case 'regional':
        return <Regional />
      
      case 'calculator':
        return <Calculator prices={prices} session={session} region={region} onRegionChange={setRegion} />
    
      case 'profile':
        return <Profile session={session} prices={prices} onNavigate={setActivePage} />

      default:
        return (
          <div className="flex items-center justify-center h-64 text-slate-400">
            Coming soon...
          </div>
        )
    }
  }

  // =========================
  // MAIN APP
  // =========================
  return (
    <div className="min-h-screen bg-slate-50">
      <Header lastUpdated={lastUpdated} />
      {renderPage()}
      <BottomNav active={activePage} onChange={setActivePage} />
      <Chatbot prices={prices} />
    </div>
  )
}