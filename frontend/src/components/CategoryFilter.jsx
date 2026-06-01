import { CATEGORIES } from '../constants/categories'

export default function CategoryFilter({ active, onChange }) {
  return (
    <div className="flex gap-2 mb-5 flex-wrap ">
      {CATEGORIES.map(c => (
        <button
          key={c.key}
          onClick={() => onChange(c.key)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer
            ${active === c.key
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
            }`}
        >
          {c.label}
        </button>
      ))}
    </div>
  )
}