import { useState } from 'react'
import PriceGrid from '../components/PriceGrid'
import SummaryCards from '../components/SummaryCards'
import CategoryFilter from '../components/CategoryFilter'
import ChartPanel from '../components/ChartPanel'

export default function Dashboard({ prices, selected, onSelect, avgChange, highPressure, history }) {
  const [category, setCategory] = useState('all')

  const filtered = category === 'all'
    ? prices
    : prices.filter(p => p.category === category)

  return (
    <div>
      <div className="bg-blue-100">
        <SummaryCards
          total={prices.length}
          avgChange={avgChange}
          highPressure={highPressure}
        />
      </div>

      <div className="px-4 pb-24">
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