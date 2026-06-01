import fs from 'fs'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'

async function read() {
  const data = new Uint8Array(fs.readFileSync('test.pdf'))
  const doc = await pdfjsLib.getDocument({ data }).promise
  
  let fullText = ''
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    fullText += content.items.map(item => item.str).join(' ') + '\n'
  }

  // Print full text so we can see market names
  console.log(fullText.slice(0, 5000))
}

read().catch(console.error)