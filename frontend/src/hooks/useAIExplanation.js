import { useState } from 'react'

export function useAIExplanation() {
  const [explanation, setExplanation] = useState('')
  const [loading, setLoading] = useState(false)

  async function explain(item, history) {
    if (!item || history.length < 2) return

    setLoading(true)
    setExplanation('')

    const first = history[0].price
    const last = history[history.length - 1].price
    const pct = (((last - first) / first) * 100).toFixed(1)
    const direction = pct > 0 ? 'tumaas' : 'bumaba'

    const prompt = `
Ikaw ay eksperto sa presyo ng pagkain sa Pilipinas.
Sumulat ng 2 maikling pangungusap sa Taglish para sa nanay na namimili.

Produkto: ${item.display_name}
Presyo ngayon: ₱${item.price}/${item.unit}
Dati: ₱${first}/${item.unit}  
Pagbabago: ${pct}% (${direction})
Rehiyon: ${item.region || 'NCR'}

Una: Sabihin ang pagbabago ng presyo sa isang linya.
Pangalawa: Isang praktikal na tip para sa mamimili.
Maximum 30 salita lang. Direkta at simple.
`.trim()

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 100,
          messages: [
            { role: 'user', content: prompt }
          ]
        })
      })

      const data = await response.json()
      const text = data.choices?.[0]?.message?.content || ''
      setExplanation(text)
    } catch (error) {
      console.error('AI error:', error)
      setExplanation('Hindi ma-load ang paliwanag ngayon.')
    }

    setLoading(false)
  }

  return { explanation, loading, explain }
}