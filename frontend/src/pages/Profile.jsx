import { supabase } from '../supabase'

export default function Profile({ session, prices, onNavigate }) {
  return (
    <div className="px-4 pt-3">
      <h2 className="text-lg font-bold text-slate-800 mt-2 mb-4">Aking Profile</h2>

      {/* Account info */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
            👤
          </div>
          <div>
            <div className="font-semibold text-slate-800">{session.user.email}</div>
            <div className="text-xs text-slate-400">Member since {new Date(session.user.created_at).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}</div>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-3">
        <button
          onClick={() => onNavigate('alerts')}
          className="w-full flex items-center justify-between px-4 py-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50"
        >
          <div className="flex items-center gap-3">
            <span>⚠️</span>
            <span className="text-sm text-slate-700">Mga Alerto</span>
          </div>
          <span className="text-slate-300">›</span>
        </button>
        <button
          onClick={() => onNavigate('buywait')}
          className="w-full flex items-center justify-between px-4 py-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50"
        >
          <div className="flex items-center gap-3">
            <span>💰</span>
            <span className="text-sm text-slate-700">Bilhin Na o Hintayin?</span>
          </div>
          <span className="text-slate-300">›</span>
        </button>
        <button
          onClick={() => onNavigate('regional')}
          className="w-full flex items-center justify-between px-4 py-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50"
        >
          <div className="flex items-center gap-3">
            <span>🗺️</span>
            <span className="text-sm text-slate-700">Inflation sa Rehiyon</span>
          </div>
          <span className="text-slate-300">›</span>
        </button>
        <button
          onClick={() => onNavigate('basket')}
          className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50"
        >
          <div className="flex items-center gap-3">
            <span>🛒</span>
            <span className="text-sm text-slate-700">Aking Basket</span>
          </div>
          <span className="text-slate-300">›</span>
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={async () => await supabase.auth.signOut()}
        className="w-full py-3 rounded-2xl text-white font-semibold cursor-pointer"
        style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
      >
        Mag-logout
      </button>
    </div>
  )
}