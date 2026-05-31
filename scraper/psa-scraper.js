// PSA Price Situationer Scraper
// Runs twice a month to collect food commodity prices
// Sources: https://psa.gov.ph/statistics/price-situationer/selected-agri-commodities

const axios = require("axios");
const cheerio = require("cheerio");
require("dotenv").config();

const PSA_URL =
  "https://psa.gov.ph/statistics/price-situationer/selected-agri-commodities";

// Commodity name mappings (PSA label → our standard name)
const COMMODITY_MAP = {
  "well-milled rice": "rice_well_milled",
  "regular milled rice": "rice_regular_milled",
  "pork kasim": "pork_kasim",
  "pork liempo": "pork_liempo",
  "whole chicken": "chicken_whole",
  "chicken egg": "chicken_egg",
  galunggong: "fish_galunggong",
  bangus: "fish_bangus",
  "baguio beans": "vegetable_baguio_beans",
  ampalaya: "vegetable_ampalaya",
  tomato: "vegetable_tomato",
  cabbage: "vegetable_cabbage",
};

async function scrapePSAPrices() {
  console.log("🔍 Scraping PSA prices...");

  const response = await axios.get(PSA_URL, {
    headers: {
      // Mimic a real browser to avoid 403 blocks
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      Referer: "https://psa.gov.ph/",
    },
    timeout: 15000,
  });

  const $ = cheerio.load(response.data);
  const prices = [];
  const scrapedAt = new Date().toISOString();

  // PSA tables have commodity in col 1, current price in col 2, unit in col 3
  $("table").each((tableIndex, table) => {
    $(table)
      .find("tr")
      .each((rowIndex, row) => {
        if (rowIndex === 0) return; // skip header

        const cols = $(row).find("td");
        if (cols.length < 2) return;

        const rawName = $(cols[0]).text().trim().toLowerCase();
        const rawPrice = $(cols[1]).text().trim().replace(/[₱,\s]/g, "");
        const unit = $(cols[2])?.text().trim() || "kg";

        const commodityKey = Object.keys(COMMODITY_MAP).find((key) =>
          rawName.includes(key)
        );

        if (commodityKey && rawPrice && !isNaN(parseFloat(rawPrice))) {
          prices.push({
            commodity: COMMODITY_MAP[commodityKey],
            display_name: rawName,
            price: parseFloat(rawPrice),
            unit,
            source: "PSA",
            scraped_at: scrapedAt,
          });
        }
      });
  });

  console.log(`✅ Found ${prices.length} commodity prices`);
  return prices;
}

async function savePricesToSupabase(prices) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env");
  }

  const response = await axios.post(
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

  console.log(`💾 Saved ${prices.length} prices to Supabase`);
  return response.data;
}

async function run() {
  try {
    const prices = await scrapePSAPrices();
    if (prices.length > 0) {
      await savePricesToSupabase(prices);
    } else {
      console.warn("⚠️  No prices found — PSA page structure may have changed");
    }
  } catch (error) {
    console.error("❌ Scraper error:", error.message);
    process.exit(1);
  }
}

run();