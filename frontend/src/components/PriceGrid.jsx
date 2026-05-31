import PriceCard from './PriceCard'

export default function PriceGrid({ prices, selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {prices.map(p => (
        <PriceCard
          key={p.commodity}
          item={p}
          onClick={onSelect}
          selected={selected?.commodity === p.commodity}
        />
      ))}
    </div>
  )
}