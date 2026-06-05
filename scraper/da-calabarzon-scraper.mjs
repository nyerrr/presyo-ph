import fs from 'fs'
import path from 'path'
import axios from 'axios'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
import * as dotenv from 'dotenv'
dotenv.config()

// DA CALABARZON Bantay Presyo PDF URL
// Update this URL to the latest PDF from calabarzon.da.gov.ph/da-calabarzon-bantay-presyo
const PDF_URL = process.env.DA_PDF_URL || 'https://calabarzon.da.gov.ph/path-to-latest.pdf'
const PDF_PATH = './da-calabarzon-latest.pdf'

// Map DA commodity names to our system keys
const COMMODITY_MAP = {
  // Rice
  'well milled': 'rice_well_milled',
  'regular milled': 'rice_regular_milled',
  // Vegetables
  'ampalaya': 'vegetable_ampalaya',
  'tomato': 'vegetable_tomato',
  'eggplant': 'vegetable_eggplant',
  'squash': 'vegetable_squash',
  'carrots, local': 'vegetable_carrot',
  'habichuelas/baguio beans': 'vegetable_baguio_beans',
  'cabbage (rare ball)': 'vegetable_cabbage',
  'red onion, local': 'vegetable_onion_red',
  'pechay': 'vegetable_pechay',
  'spinach': 'vegetable_spinach',
  'okra': 'vegetable_okra',
  'string beans': 'vegetable_string_beans',
  'lettuce': 'vegetable_lettuce',
  'radish': 'vegetable_radish',
  // Meat
  'pork belly (liempo), local': 'pork_liempo',
  'pork picnic (kasim), local': 'pork_kasim',
  'whole chicken, local': 'chicken_whole',
  // Fish
  'galunggong, local': 'fish_galunggong',
  'bangus, large': 'fish_bangus',
  'tilapia': 'fish_tilapia',
  'dalagang bukod': 'fish_dalagang_bukod',
  // Others
  'sugar (brown)': 'sugar_brown',
  'mango (carabao)': 'vegetable_mango',
  'cooking oil (palm)': 'cooking_oil_palm',
}

async function downloadPDF(url) {
  console.log('⬇️  Downloading DA CALABARZON PDF...')
  
  // Convert Google Drive view URL to direct download
  const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
  if (!fileIdMatch) throw new Error('Invalid Google Drive URL')
  
  const fileId = fileIdMatch[1]
  const downloadUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&authuser=0&confirm=t`

  const response = await axios.get(downloadUrl, {
    responseType: 'arraybuffer',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/pdf,*/*',
    },
    maxRedirects: 5,
  })

  fs.writeFileSync(PDF_PATH, response.data)
  console.log('✅ PDF downloaded')
}

async function extractPrices() {
  console.log('📄 Extracting prices from PDF...')
  const data = new Uint8Array(fs.readFileSync(PDF_PATH))
  const doc = await pdfjsLib.getDocument({ data }).promise

  let fullText = ''
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    fullText += content.items.map(item => item.str).join(' ') + '\n'
  }

  return fullText
}

const MARKETS = [
  { name: 'Bacoor Public Market', city: 'Bacoor', province: 'Cavite' },
  { name: 'Siniloan Public Market', city: 'Siniloan', province: 'Laguna' },
  { name: 'Lipa Public Market', city: 'Lipa', province: 'Batangas' },
  { name: 'Tanay Public Market', city: 'Tanay', province: 'Rizal' },
  { name: 'Lucena Public Market', city: 'Lucena', province: 'Quezon' },
]

function parseText(text) {
  const prices = []
  const scrapedAt = new Date().toISOString()
  const lines = text.split(/\s{2,}/)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    const lineLower = line.toLowerCase()

    const commodityKey = Object.keys(COMMODITY_MAP).find(key =>
      lineLower.includes(key)
    )
    if (!commodityKey) continue

    const nextTokens = lines.slice(i + 1, i + 5).join(' ')
    const avgMatch = nextTokens.match(/(\d+\.\d+)/)
    if (!avgMatch) continue

    const avgPrice = parseFloat(avgMatch[1])
    if (isNaN(avgPrice) || avgPrice <= 0) continue

    prices.push({
      commodity: COMMODITY_MAP[commodityKey],
      display_name: line,
      price: avgPrice,
      unit: 'kg',
      region: 'CALABARZON',
      market: 'CALABARZON Average',
      city: null,
      source: 'DA-CALABARZON',
      scraped_at: scrapedAt,
    })
  }

  return prices
}

async function savePricesToSupabase(prices) {
  const SUPABASE_URL = process.env.SUPABASE_URL
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env')
  }

  // Deduplicate — keep only first occurrence of each commodity
  const seen = new Set()
  const deduped = prices.filter(p => {
    if (seen.has(p.commodity)) return false
    seen.add(p.commodity)
    return true
  })

  console.log(`📦 Deduped ${prices.length} → ${deduped.length} prices`)

  const response = await axios.post(
    `${SUPABASE_URL}/rest/v1/price_readings`,
    deduped,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
    }
  )

  console.log(`💾 Saved ${deduped.length} CALABARZON prices to Supabase`)
}

async function run() {
  try {
    // If PDF_URL is set, download it. Otherwise use existing test.pdf
    if (PDF_URL.includes('calabarzon.da.gov.ph/path')) {
      console.log('⚠️  No PDF URL set — using local test.pdf')
      fs.copyFileSync('test.pdf', PDF_PATH)
    } else {
      await downloadPDF(PDF_URL)
    }

    const text = await extractPrices()
    const prices = parseText(text)

    console.log(`✅ Found ${prices.length} prices`)
    prices.forEach(p => console.log(`  ${p.commodity}: ₱${p.price}`))

    if (prices.length > 0) {
      await savePricesToSupabase(prices)
    } else {
      console.warn('⚠️  No prices found — PDF structure may have changed')
    }
  } catch (error) {
    console.error('❌ Scraper error:', error.message)
    process.exit(1)
  }
}

run()