const axios = require('axios');
const cheerio = require('cheerio');

axios.get('https://fuelprice.ph', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
}).then(r => {
  const $ = cheerio.load(r.data)
  console.log($('body').text().replace(/\s+/g, ' ').slice(0, 3000))
}).catch(e => console.log('Error:', e.message))