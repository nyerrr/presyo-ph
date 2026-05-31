import PriceGrid from '../components/PriceGrid'
import SummaryCards from '../components/SummaryCards'
import CategoryFilter from '../components/CategoryFilter'
import ChartPanel from '../components/ChartPanel'
import { useState } from 'react'

export default function Dashboard({ prices, selected, onSelect, avgChange, highPressure, lastUpdated, history }) {
  const [category, setCategory] = useState('all')

  const filtered = category === 'all'
    ? prices
    : prices.filter(p => p.category === category)

  return (
    <div className="pb-20">
      <SummaryCards
        total={prices.length}
        avgChange={avgChange}
        highPressure={highPressure}
      />

      <CategoryFilter
        active={category}
        onChange={setCategory}
      />

      <div className="px-4">
        <PriceGrid
          prices={filtered}
          selected={selected}
          onSelect={onSelect}
        />
      </div>

      {selected && (
        <div className="px-4 mt-4">
          <ChartPanel item={selected} history={history} />
        </div>
      )}
    </div>
  )
}