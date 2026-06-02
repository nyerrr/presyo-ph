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
    <div>
      <SummaryCards
        total={regionFiltered.length}
        avgChange={avgChange}
        highPressure={highPressure}
        region={region}
        onRegionChange={onRegionChange}
      />

      <div className="px-4">
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
    </div>
  )
}