import { useState, useEffect } from 'react'
import PriceGrid from '../components/PriceGrid'
import SummaryCards from '../components/SummaryCards'
import CategoryFilter from '../components/CategoryFilter'
import ChartPanel from '../components/ChartPanel'

const REGIONS = [
  { key: 'NCR', label: 'NCR' },
  { key: 'CALABARZON', label: 'CALABARZON' },
]

export default function Dashboard({ prices, selected, onSelect, avgChange, highPressure, history, region, onRegionChange }) {
  const [category, setCategory] = useState('all')

  const regionFiltered = prices.filter(p => p.region === region)

  const filtered = category === 'all'
    ? regionFiltered
    : regionFiltered.filter(p => p.category === category)

  // When region changes, find the same commodity in the new region
  // If not found, select the first item in the new region
  useEffect(() => {
    if (!selected) return
    const sameInNewRegion = regionFiltered.find(p => p.commodity === selected.commodity)
    onSelect(sameInNewRegion || regionFiltered[0] || null)
  }, [region])

  return (
    <div className="pb-24 px-4 pt-3">

      {/* Region toggle */}
      <div className="flex gap-2 mb-4">
        {REGIONS.map(r => (
          <button
            key={r.key}
            onClick={() => onRegionChange(r.key)}
            className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all cursor-pointer
              ${region === r.key
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-500 border-slate-200'
              }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <SummaryCards
        total={regionFiltered.length}
        avgChange={avgChange}
        highPressure={highPressure}
      />

      <CategoryFilter
        active={category}
        onChange={setCategory}
      />

      <PriceGrid
        prices={filtered}
        selected={selected}
        onSelect={onSelect}
      />

      {selected && (
        <ChartPanel item={selected} history={history} />
      )}
    </div>
  )
}