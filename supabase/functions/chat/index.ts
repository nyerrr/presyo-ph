import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, priceContext } = await req.json()

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 120,
        messages: [
          {
            role: 'system',
            content: `Ikaw si "Presyo", isang price tracking assistant para sa Pilipinas.

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

Magsalita sa Taglish. 2-3 pangungusap lang. Simple at direkta.

PINAKABAGONG PRESYO NGAYON:
${priceContext}`
          },
          ...messages
        ]
      })
    })

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || 'Sorry, hindi ko masagot yan ngayon.'

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})