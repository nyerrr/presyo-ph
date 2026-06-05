import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function MyBaskets({ session, prices, onNavigate }) {
  const [basketSessions, setBasketSessions] = useState([])
  const [loadingBasket, setLoadingBasket] = useState(true)
  const [expandedSession, setExpandedSession] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  // Load saved basket sessions
  useEffect(() => {
    loadBaskets()
  }, [session, prices])

  async function loadBaskets() {
    const { data } = await supabase
      .from('user_baskets')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (data) {
      // Group by created_at timestamp
      const sessions = {}
      data.forEach(item => {
        const timestamp = item.created_at
        if (!sessions[timestamp]) {
          sessions[timestamp] = []
        }
        sessions[timestamp].push(item)
      })

      // Convert to array of sessions
      const sessionArray = Object.entries(sessions).map(([timestamp, items]) => ({
        timestamp,
        items,
        total: items.reduce((sum, item) => {
          const price = prices.find(p => p.commodity === item.commodity)?.price || 0
          return sum + (price * item.quantity)
        }, 0)
      }))

      setBasketSessions(sessionArray)
    }
    setLoadingBasket(false)
  }

  async function deleteSession(timestamp) {
    setDeletingId(timestamp)
    
    // Get all items for this session and delete them
    const { data: itemsToDelete } = await supabase
      .from('user_baskets')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('created_at', timestamp)

    if (itemsToDelete && itemsToDelete.length > 0) {
      const ids = itemsToDelete.map(item => item.id)
      
      await supabase
        .from('user_baskets')
        .delete()
        .in('id', ids)
    }

    setDeletingId(null)
    setExpandedSession(null)
    await loadBaskets() // Reload the list
  }

  return (
    <div className="px-4 pt-3">
      <h2 className="text-lg font-bold text-slate-800 mt-2 mb-1">🛒 Aking Basket</h2>
      <p className="text-xs text-slate-400 mb-4">Tingnan at i-manage ang iyong mga na-save na basket</p>

      {!loadingBasket && (
        <>
          {basketSessions.length > 0 ? (
            <div className="space-y-2 mb-4">
              {basketSessions.map(session => {
                const isExpanded = expandedSession === session.timestamp
                const savedDate = new Date(session.timestamp)
                const formattedDate = savedDate.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
                const formattedTime = savedDate.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })

                return (
                  <div key={session.timestamp}>
                    <button
                      onClick={() => setExpandedSession(isExpanded ? null : session.timestamp)}
                      className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-all"
                    >
                      <div className="flex flex-col items-start">
                        <div className="text-sm font-semibold text-slate-800">{formattedDate} • {formattedTime}</div>
                        <div className="text-xs text-slate-400">{session.items.length} item{session.items.length !== 1 ? 's' : ''}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-bold text-blue-600">₱{session.total.toFixed(2)}</div>
                        <span className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                      </div>
                    </button>

                    {/* Expanded session items */}
                    {isExpanded && (
                      <div className="mt-2 ml-3 pl-3 border-l-2 border-slate-200 space-y-2 pb-3">
                        {session.items.map(item => {
                          const priceData = prices.find(p => p.commodity === item.commodity)
                          return (
                            <div key={item.id || item.commodity} className="flex justify-between items-start py-1.5">
                              <div>
                                <div className="text-sm text-slate-700">{priceData?.display_name || item.commodity}</div>
                                <div className="text-xs text-slate-400">{item.quantity} {item.unit}</div>
                              </div>
                              <div className="text-sm font-semibold text-slate-600">
                                ₱{((priceData?.price || 0) * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          )
                        })}
                        
                        {/* Delete button inside expanded view */}
                        <button
                          onClick={() => deleteSession(session.timestamp)}
                          disabled={deletingId === session.timestamp}
                          className="w-full mt-2 py-2 rounded-lg text-sm text-red-600 font-medium border border-red-200 cursor-pointer hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingId === session.timestamp ? 'Sine-delete...' : '🗑️ I-delete ang session'}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center mb-4">
              <div className="text-3xl mb-2">🛒</div>
              <div className="text-sm text-slate-600 font-medium mb-1">Walang na-save na basket</div>
              <div className="text-xs text-slate-400">Lumikha ng basket sa Calculator para i-track ang iyong expenses</div>
            </div>
          )}

          {/* Add new basket button */}
          <button
            onClick={() => onNavigate('calculator')}
            className="w-full py-3 rounded-2xl text-white font-semibold cursor-pointer transition-all"
            style={{ background: 'linear-gradient(135deg, #1a56a0, #0f3d7a)' }}
          >
            + Bagong Basket
          </button>
        </>
      )}

      {loadingBasket && (
        <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
          Nilo-load ang iyong mga basket...
        </div>
      )}
    </div>
  )
}
