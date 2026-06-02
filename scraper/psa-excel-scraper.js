const XLSX = require('xlsx')
const axios = require('axios')
require('dotenv').config()

const EXCEL_PATH = './psa-latest.xlsx'

// Map PSA commodity names to our system keys
const COMMODITY_MAP = {
  'rice, well milled': 'rice_well_milled',
  'rice, regular milled': 'rice_regular_milled',
  'fresh pork, kasim': 'pork_kasim',
  'fresh pork, liempo': 'pork_liempo',
  'dressed chicken': 'chicken_whole',
  'chicken egg, med. (piece)': 'chicken_egg',
  'bangus': 'fish_bangus',
  'galunggong': 'fish_galunggong',
  'tilapia': 'fish_tilapia',
  'ampalaya': 'vegetable_ampalaya',
  'tomato': 'vegetable_tomato',
  'cabbage': 'vegetable_cabbage',
  'carrots': 'vegetable_carrot',
  'red onion': 'vegetable_onion_red',
}

function parsePSAExcel() {
  console.log('📊 Reading PSA Excel file...')

  const workbook = XLSX.readFile(EXCEL_PATH)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })

  const prices = []
  const scrapedAt = new Date().toISOString()

  // Find NCR row
  const ncrRow = rows.find(row => row[0] === 'NCR')
  if (!ncrRow) {
    console.warn('⚠️  NCR row not found')
    return prices
  }

  console.log('✅ Found NCR row')

  // Parse commodities from NCR row
  // Each commodity appears as: 'NCRCommodity Name', price, 0, prev_price, '', prev_year_price, 0
  for (let i = 2; i < ncrRow.length; i++) {
    const cell = ncrRow[i]
    if (typeof cell !== 'string') continue

    // Remove the NCR prefix
    const rawName = cell.replace(/^NCR/i, '').trim().toLowerCase()

    const commodityKey = Object.keys(COMMODITY_MAP).find(key =>
      rawName.includes(key)
    )
    if (!commodityKey) continue

    // Price is the next cell
    const price = ncrRow[i + 1]
    if (!price || typeof price !== 'number' || price <= 0) continue

    prices.push({
      commodity: COMMODITY_MAP[commodityKey],
      display_name: rawName,
      price: price,
      unit: commodityKey.includes('egg') ? 'piece' : 'kg',
      region: 'NCR',
      source: 'PSA',
      scraped_at: scrapedAt,
    })

    console.log(`  ${COMMODITY_MAP[commodityKey]}: ₱${price}`)
  }

  return prices
}

async function savePricesToSupabase(prices) {
  const SUPABASE_URL = process.env.SUPABASE_URL
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env')
  }

  await axios.post(
    `${SUPABASE_URL}/rest/v1/price_readings`,
    prices,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
    }
  )

  console.log(`💾 Saved ${prices.length} PSA prices to Supabase`)
}

async function run() {
  try {
    const prices = parsePSAExcel()

    if (prices.length === 0) {
      console.warn('⚠️  No prices found')
      return
    }

    console.log(`✅ Found ${prices.length} prices`)
    await savePricesToSupabase(prices)
  } catch (error) {
    console.error('❌ Scraper error:', error.message)
    process.exit(1)
  }
}

run()