# 🌾 Presyo PH — Price Tracker

Track basic goods and fuel prices in the Philippines. Data from PSA and DOE, updated automatically.

---

## Project Structure

```
presyo-ph/
├── scraper/               ← Automated data collectors
│   ├── psa-scraper.js     ← PSA food & commodity prices
│   ├── doe-scraper.js     ← DOE weekly fuel prices
│   └── .env.example       ← Copy to .env with your keys
│
├── database/
│   ├── schema.sql         ← Run this first in Supabase
│   └── seed.sql           ← Sample data for development
│
├── .github/workflows/
│   └── scrapers.yml       ← Auto-runs scrapers on schedule
│
└── README.md
```

---

## Setup (Step by Step)

### 1. Create a Supabase project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy your **Project URL** and **service_role key** from Settings → API
3. Open the **SQL Editor** and run `database/schema.sql`
4. Then run `database/seed.sql` to load sample data

### 2. Configure environment variables
```bash
cd scraper
cp .env.example .env
# Edit .env and paste your Supabase URL and key
```

### 3. Test scrapers locally
```bash
cd scraper
npm install
node psa-scraper.js    # Test PSA scraper
node doe-scraper.js    # Test DOE scraper
```

### 4. Set up automatic scheduling (GitHub Actions)
1. Push this repo to GitHub
2. Go to your repo → Settings → Secrets and variables → Actions
3. Add two secrets:
   - `SUPABASE_URL` → your Supabase project URL
   - `SUPABASE_SERVICE_KEY` → your service_role key
4. The scrapers will now run automatically on schedule!

---

## Scraper Schedule

| Scraper | When | Source |
|---------|------|--------|
| PSA Food Prices | 2nd and 16th of each month | psa.gov.ph |
| DOE Fuel Prices | Every Tuesday | doe.gov.ph |

---

## Commodities Tracked

**Grains:** Well-Milled Rice, Regular Milled Rice  
**Meat:** Pork Kasim, Pork Liempo  
**Poultry:** Whole Chicken, Chicken Egg  
**Fish:** Galunggong, Bangus  
**Vegetables:** Tomato, Ampalaya, Baguio Beans, Repolyo  
**Fuel:** Gasoline RON91, Gasoline RON95, Diesel, Kerosene  

---

## Notes

- PSA blocks automated requests with a 403. If the scraper fails, check if PSA's page structure changed.
- The scrapers use a browser User-Agent header to reduce blocking.
- If PSA is blocked, you can manually download their CSV from [OpenSTAT](https://openstat.psa.gov.ph) and import it.