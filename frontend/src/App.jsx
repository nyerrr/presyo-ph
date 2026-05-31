import { useEffect, useState } from 'react'
import { supabase } from './supabase'

function App() {
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPrices() {
      const { data, error } = await supabase
        .from('latest_prices')
        .select('*')
        .order('category')

      if (error) console.error(error)
      else setPrices(data)
      setLoading(false)
    }

    fetchPrices()
  }, [])

  if (loading) return <div style={{color:'white',padding:'2rem'}}>Loading prices...</div>

  return (
    <div style={{color:'white', padding:'2rem'}}>
      <h1>🌾 Presyo PH</h1>
      <p>Current prices of basic goods in the Philippines</p>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px,1fr))', gap:'1rem', marginTop:'2rem'}}>
        {prices.map(p => (
          <div key={p.commodity} style={{background:'#1e1e1e', padding:'1rem', borderRadius:'8px'}}>
            <div style={{fontSize:'2rem'}}>{p.icon}</div>
            <div style={{fontWeight:'bold'}}>{p.display_name}</div>
            <div style={{fontSize:'1.5rem', color:'#4ade80'}}>₱{p.price}</div>
            <div style={{fontSize:'0.8rem', color:'#888'}}>per {p.unit}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App