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
    <div className="pb-24 px-4 pt-3">
      <SummaryCards
        total={prices.length}
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