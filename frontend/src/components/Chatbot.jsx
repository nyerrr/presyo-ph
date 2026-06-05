import { useState, useRef, useEffect } from 'react'
import { supabase } from '../supabase'

const SYSTEM_PROMPT = `Ikaw si "Presyo", isang price tracking assistant para sa Pilipinas.

MAHALAGA: Ikaw ay may REAL-TIME na presyo mula sa PSA at DA CALABARZON. 
LAGING gamitin ang presyo na ibinibigay sa iyo sa ibaba.

Ang mga tanong na DAPAT mong sagutin:
- Presyo ng pagkain, gulay, karne, isda, gasolina
- Bakit mahal o mura ang isang produkto
- Kung dapat bang mag-stock ng pagkain
- Pagkumpara ng presyo sa iba't ibang panahon
- Cost of living at inflation sa Pilipinas
- Anumang tanong tungkol sa pamilihan at pamimili

Ang mga tanong na HINDI mo sasagutin:
- Personal na problema (breakup, relasyon, emosyon)
- Medikal na tanong
- Legal na tanong
- Anumang hindi related sa presyo o pamimili

Magsalita sa Taglish. 2-3 pangungusap lang. Simple at direkta.`

const MAX_MESSAGES = 10
const COOLDOWN_MS = 3000

const OFF_TOPIC_KEYWORDS = [
  'girlfriend', 'boyfriend', 'nalulungkot', 'sakit ng puso',
  'ex ko', 'breakup', 'iniiwan', 'nag-iisa',
  'suicide', 'magpakamatay',
  'i love you', 'miss you', 'sawi', 'heartbroken',
  'nasaktan ako sa', 'galit ako sa kanya',
  'depressed ako', 'anxious ako'
]

function isOffTopic(text) {
  const lower = text.toLowerCase()
  const matched = OFF_TOPIC_KEYWORDS.find(k => lower.includes(k))
  if (matched) console.log('Blocked by keyword:', matched)
  return !!matched
}

export default function Chatbot({ prices, session }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Kamusta! Ako si Presyo 🌾 Tanungin mo ako tungkol sa presyo ng mga bilihin sa Pilipinas!'
    }
  ])
  const [input, setInput] = useState('')
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [displayCount, setDisplayCount] = useState(0)
  const bottomRef = useRef(null)
  const messageCountRef = useRef(0)
  const lastSentRef = useRef(0)

  async function getDailyCount() {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('chat_usage')
      .select('count')
      .eq('user_id', session.user.id)
      .eq('date', today)
      .single()
    return data?.count || 0
  }

  async function incrementDailyCount() {
    const today = new Date().toISOString().split('T')[0]
    await supabase
      .from('chat_usage')
      .upsert({
        user_id: session.user.id,
        date: today,
        count: (await getDailyCount()) + 1
      }, { onConflict: 'user_id,date' })
  }


  useEffect(() => {
    async function loadCount() {
      const count = await getDailyCount()
      messageCountRef.current = count
      setDisplayCount(count)
    }
    if (session) loadCount()
  }, [session])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const priceContext = prices
    .map(p => `${p.display_name} (${p.region}): ₱${p.price}/${p.unit}`)
    .join('\n')

  async function sendMessage() {
    if (!input.trim() || loading) return

    const now = Date.now()

    // Cooldown check
    if (now - lastSentRef.current < COOLDOWN_MS) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sandali lang! Hintayin mong matapos ang aking sagot bago magtanong ulit. 😊'
      }])
      return
    }

    const dailyCount = await getDailyCount()
      if (dailyCount >= MAX_MESSAGES) {
        setShowLimitModal(true)
        return
      }

    // Off-topic check
    if (isOffTopic(input.trim())) {
      setMessages(prev => [...prev,
        { role: 'user', content: input.trim() },
        {
          role: 'assistant',
          content: 'Pasensya na, ang Presyo AI ay para lamang sa mga tanong tungkol sa presyo ng mga bilihin. Para sa personal na usapin, mangyaring kausapin ang isang taong pinagkakatiwalaan mo. 🙏'
        }
      ])
      setInput('')
      return
    }

    // Increment counters
    lastSentRef.current = now
    messageCountRef.current += 1
    await incrementDailyCount()
    setDisplayCount(messageCountRef.current)

    const userMessage = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

   try {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      
      const response = await fetch(
        'https://oucqnulqudoygjspoxoz.supabase.co/functions/v1/chat',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentSession?.access_token}`
          },
          body: JSON.stringify({
            messages: newMessages,
            priceContext
          })
        }
      )
      const data = await response.json()
      const reply = data.choices?.[0]?.message?.content || 'Sorry, hindi ko masagot yan ngayon.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'May error sa connection. Subukan ulit.'
      }])
    }

    setLoading(false)
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-32 right-4 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-transform active:scale-95"
        style={{ background: 'linear-gradient(135deg, #1a56a0, #0f3d7a)' }}
      >
        <span className="text-2xl">🌾</span>
      </button>

      {/* Chat drawer */}
      {open && (
        <div className="fixed inset-0 z-40 flex flex-col" style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}>

          <div className="absolute bottom-16 left-0 right-0 bg-white rounded-t-3xl flex flex-col"
            style={{ height: '75vh' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌾</span>
                <div>
                  <div className="font-bold text-slate-800 text-sm">Presyo AI</div>
                  <div className="text-xs text-green-500 font-medium">● Online</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {displayCount > 0 && (
                  <span className="text-xs text-slate-400">{MAX_MESSAGES - displayCount}/{MAX_MESSAGES}</span>
                )}
                <button onClick={() => setOpen(false)}
                  className="text-slate-400 text-xl cursor-pointer">✕</button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm
                    ${msg.role === 'user'
                      ? 'text-white rounded-br-sm'
                      : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                    }`}
                    style={msg.role === 'user' ? {
                      background: 'linear-gradient(135deg, #1a56a0, #0f3d7a)'
                    } : {}}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 px-3 py-2 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1 items-center h-4">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Message count warning */}
            {displayCount > 7 && displayCount < MAX_MESSAGES && (
              <div className="px-4 pb-1 text-center text-xs text-orange-400">
                {MAX_MESSAGES - displayCount} na tanong na lang ang natitira
              </div>
            )}

            {/* Suggested questions */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
                {[
                  'Magkano ang bigas ngayon?',
                  'Bakit mahal ang gulay?',
                  'Dapat ba akong mag-stock ng pagkain?',
                ].map(q => (
                  <button key={q} onClick={() => setInput(q)}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-blue-200 text-blue-600 bg-blue-50 cursor-pointer">
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 pb-6 pt-2 flex gap-2 border-t border-slate-100">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Magtanong tungkol sa presyo..."
                className="flex-1 px-4 py-2.5 rounded-full border border-slate-200 text-sm focus:outline-none focus:border-blue-400"
                disabled={messageCountRef.current >= MAX_MESSAGES}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim() || messageCountRef.current >= MAX_MESSAGES}
                className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #1a56a0, #0f3d7a)' }}
              >
                <span className="text-white text-sm">→</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Limit reached modal */}
        {showLimitModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="bg-white rounded-3xl p-6 mx-6 text-center shadow-xl">
              <div className="text-4xl mb-3">🌾</div>
              <div className="font-bold text-slate-800 text-lg mb-2">
                Naabot na ang iyong limitasyon!
              </div>
              <div className="text-sm text-slate-500 mb-5">
                10 tanong na ang iyong nagamit ngayon. Bumalik bukas para sa bagong mga tanong!
              </div>
              <button
                onClick={() => {
                  setShowLimitModal(false)
                  setOpen(false)
                }}
                className="w-full py-3 rounded-2xl text-white font-semibold cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #1a56a0, #0f3d7a)' }}
              >
                Sige, babalik ako bukas!
              </button>
            </div>
          </div>
        )}
    </>
  )
}