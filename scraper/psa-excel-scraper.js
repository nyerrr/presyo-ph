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

async function filterNewPrices(prices, supabaseUrl, supabaseKey) {
  const today = new Date().toISOString().split('T')[0]
  const filtered = []

  for (const price of prices) {
    const res = await axios.get(
      `${supabaseUrl}/rest/v1/price_readings?commodity=eq.${price.commodity}&region=eq.NCR&scraped_at=gte.${today}T00:00:00&limit=1`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
    )
    if (res.data.length === 0) filtered.push(price)
  }

  console.log(`🔍 ${prices.length - filtered.length} already exist today, inserting ${filtered.length}`)
  return filtered
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

async function updatePriceChanges(prices) {
  const SUPABASE_URL = process.env.SUPABASE_URL
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY

  for (const price of prices) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get previous price
    const prevResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/price_readings?commodity=eq.${price.commodity}&region=eq.NCR&scraped_at=lt.${today.toISOString()}&order=scraped_at.desc&limit=1`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    )

    const prevData = prevResponse.data
    const prevPrice = prevData.length > 0 ? prevData[0].price : price.price
    const pctChange = prevPrice > 0
      ? parseFloat(((price.price - prevPrice) / prevPrice * 100).toFixed(2))
      : 0

    // Upsert into price_changes
    await axios.post(
      `${SUPABASE_URL}/rest/v1/price_changes`,
      {
        commodity: price.commodity,
        region: 'NCR',
        current_price: price.price,
        prev_price: prevPrice,
        pct_change: pctChange,
        scraped_at: price.scraped_at,
      },
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
      }
    )

    console.log(`📊 ${price.commodity}: ${prevPrice} → ${price.price} (${pctChange}%)`)
  }

  console.log('✅ price_changes updated')
}

async function run() {
  try {
    const prices = parsePSAExcel()

    if (prices.length === 0) {
      console.warn('⚠️  No prices found')
      return
    }

    console.log(`✅ Found ${prices.length} prices`)
    const newPrices = await filterNewPrices(prices, process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
    if (newPrices.length > 0) {
      await savePricesToSupabase(newPrices)
    } else {
      console.log('✅ All prices already recorded today — skipping')
    }
  } catch (error) {
    console.error('❌ Scraper error:', error.message)
    process.exit(1)
  }
}

run()