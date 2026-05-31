// DOE Fuel Price Scraper
// Runs every Tuesday — DOE releases weekly NCR pump prices
// Sources: https://doe.gov.ph/price-monitoring-charts

const axios = require("axios");
const cheerio = require("cheerio");
require("dotenv").config();

const DOE_URL = "https://doe.gov.ph/price-monitoring-charts?q=retail-pump-prices-metro-manila";

const FUEL_MAP = {
  gasoline: "fuel_gasoline_ron91",
  "premium gasoline": "fuel_gasoline_ron95",
  diesel: "fuel_diesel",
  kerosene: "fuel_kerosene",
};

async function scrapeDOEFuelPrices() {
  console.log("⛽ Scraping DOE fuel prices...");

  const response = await axios.get(DOE_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      Referer: "https://doe.gov.ph/",
    },
    timeout: 15000,
  });

  const $ = cheerio.load(response.data);
  const prices = [];
  const scrapedAt = new Date().toISOString();

  // DOE tables: fuel type | min price | max price | average
  $("table").each((i, table) => {
    $(table).find("tr").each((rowIndex, row) => {
      if (rowIndex === 0) return;

      const cols = $(row).find("td");
      if (cols.length < 3) return;

      const rawName = $(cols[0]).text().trim().toLowerCase();
      const minPrice = parseFloat($(cols[1]).text().replace(/[₱,\s]/g, ""));
      const maxPrice = parseFloat($(cols[2]).text().replace(/[₱,\s]/g, ""));
      const avgPrice = parseFloat($(cols[3])?.text().replace(/[₱,\s]/g, "")) 
        || ((minPrice + maxPrice) / 2);

      const fuelKey = Object.keys(FUEL_MAP).find((key) =>
        rawName.includes(key)
      );

      if (fuelKey && !isNaN(avgPrice)) {
        prices.push({
          commodity: FUEL_MAP[fuelKey],
          display_name: rawName,
          price: avgPrice,
          price_min: minPrice,
          price_max: maxPrice,
          unit: "liter",
          source: "DOE",
          scraped_at: scrapedAt,
        });
      }
    });
  });

  console.log(`✅ Found ${prices.length} fuel prices`);
  return prices;
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
    const prices = await scrapeDOEFuelPrices();
    if (prices.length > 0) {
      await savePricesToSupabase(prices);
    } else {
      console.warn("⚠️  No prices found — DOE page structure may have changed");
    }
  } catch (error) {
    console.error("❌ Scraper error:", error.message);
    process.exit(1);
  }
}

run();