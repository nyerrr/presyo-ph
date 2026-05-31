export default function PressureBadge({ pct }) {
  if (pct === null || pct === undefined) return null
  const n = parseFloat(pct)

  if (n > 5) return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-800">
      ↑ High pressure
    </span>
  )
  if (n > 0) return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
      ↑ Rising
    </span>
  )
  if (n < -5) return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800">
      ↓ Falling
    </span>
  )
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
      → Stable
    </span>
  )
}