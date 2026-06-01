import { useState, useRef, useEffect } from 'react'

const SYSTEM_PROMPT = `Ikaw si "Presyo", isang price tracking assistant para sa Pilipinas.

MAHALAGA: Ikaw ay may REAL-TIME na presyo mula sa PSA at DA CALABARZON. 
HUWAG KAILANMAN sabihing wala kang updated na impormasyon.
LAGING gamitin ang presyo na ibinibigay sa iyo sa ibaba.

Kung tinatanong ang presyo ng isang produkto, DIREKTANG sabihin ang presyo mula sa listahan.
Kung wala sa listahan, sabihin na hindi available sa iyong datos ngayon.

Magsalita sa Taglish. 2-3 pangungusap lang. Simple at direkta.`

export default function ChatBot({ prices }) {
  const [open, setOpen] = useState(false)
  const [lastSent, setLastSent] = useState(0)
  const [messageCount, setMessageCount] = useState(0)
  const MAX_MESSAGES = 10
  const COOLDOWN_MS = 3000
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Kamusta! Ako si Presyo 🌾 Tanungin mo ako tungkol sa presyo ng mga bilihin sa Pilipinas!'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Build price context from current data — NCR only for simplicity
    const priceContext = prices
      .map(p => `${p.display_name} (${p.region}): ₱${p.price}/${p.unit}`)
      .join('\n')

  async function sendMessage() {
    if (!input.trim() || loading) return

    // Rate limiting — cooldown
    const now = Date.now()
    if (now - lastSent < COOLDOWN_MS) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sandali lang! Hintayin mong matapos ang aking sagot bago magtanong ulit. 😊'
      }])
      return
    }

    // Rate limiting — max messages
    if (messageCount >= MAX_MESSAGES) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Naabot na ang limitasyon ng chat ngayon. I-refresh ang page para magsimula ulit. Salamat! 🌾'
      }])
      return
    }

    setLastSent(now)
    setMessageCount(prev => prev + 1)

    const userMessage = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 120,
          messages: [
            {
              role: 'system',
              content: `${SYSTEM_PROMPT}\n\nPINAKABAGONG PRESYO NGAYON:\n${priceContext}`
            },
            ...newMessages
          ]
        })
      })

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
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-transform active:scale-95"
        style={{ background: 'linear-gradient(135deg, #1a56a0, #0f3d7a)' }}
      >
        <span className="text-2xl">🌾</span>
      </button>

      {/* Chat drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}>

          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl flex flex-col"
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
              <button onClick={() => setOpen(false)}
                className="text-slate-400 text-xl cursor-pointer">✕</button>
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
            {/* Message count indicator */}
              {messageCount > 7 && (
                <div className="px-4 pb-1 text-center text-xs text-slate-400">
                  {MAX_MESSAGES - messageCount} na tanong na lang ang natitira
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
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #1a56a0, #0f3d7a)' }}
              >
                <span className="text-white text-sm">→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}