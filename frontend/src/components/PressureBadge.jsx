export default function PressureBadge({ pct }) {
  if (pct === null || pct === undefined) return null
  const n = parseFloat(pct)

  if (n > 5) return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
      🔴 Mataas
    </span>
  )
  if (n > 0) return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
      🟠 Tumaas
    </span>
  )
  if (n < -5) return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
      🟢 Bumaba
    </span>
  )
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
      ⚪ Stable
    </span>
  )
}