const axios = require("axios");
const cheerio = require("cheerio");
require("dotenv").config();

const URL = "https://fuelprice.ph";

async function scrapeFuelPrices() {
  console.log("⛽ Scraping fuelprice.ph...");

  const response = await axios.get(URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    timeout: 15000,
  });

  const $ = cheerio.load(response.data);
  const prices = [];
  const scrapedAt = new Date().toISOString();
  const text = $("body").text().replace(/\s+/g, " ");

  const FUEL_MAP = [
    { pattern: /Unleaded 91 - avg ₱([\d.]+)\/L/i, commodity: "fuel_gasoline_ron91" },
    { pattern: /Premium 95 - avg ₱([\d.]+)\/L/i, commodity: "fuel_gasoline_ron95" },
    { pattern: /Diesel - avg ₱([\d.]+)\/L/i, commodity: "fuel_diesel" },
    { pattern: /Kerosene - avg ₱([\d.]+)\/L/i, commodity: "fuel_kerosene" },
  ]

  for (const fuel of FUEL_MAP) {
    const match = text.match(fuel.pattern)
    if (match) {
      prices.push({
        commodity: fuel.commodity,
        price: parseFloat(match[1]),
        unit: "liter",
        region: "NCR",
        source: "fuelprice.ph",
        scraped_at: scrapedAt,
      })
      console.log(`  ${fuel.commodity}: ₱${match[1]}`)
    }
  }

  console.log(`✅ Found ${prices.length} fuel prices`)
  return prices
}

async function savePricesToSupabase(prices) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env");
  }

  await axios.post(
    `${SUPABASE_URL}/rest/v1/price_readings`,
    prices,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
    }
  );

  console.log(`💾 Saved ${prices.length} fuel prices to Supabase`);
}

async function run() {
  try {
    const prices = await scrapeFuelPrices();
    if (prices.length > 0) {
      await savePricesToSupabase(prices);
    } else {
      console.warn("⚠️  No prices found — page structure may have changed");
    }
  } catch (error) {
    console.error("❌ Scraper error:", error.message);
    process.exit(1);
  }
}

run();  