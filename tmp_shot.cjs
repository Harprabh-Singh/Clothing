const puppeteer = require('puppeteer-core')

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE = 'http://localhost:5199'
const OUT = 'tmp_shots'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--window-size=1920,1080'],
    defaultViewport: { width: 1920, height: 1080 },
  })
  const page = await browser.newPage()
  page.on('pageerror', (e) => console.log('PAGE EXCEPTION:', e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') console.log('PAGE ERROR:', m.text())
  })

  await page.goto(BASE, { waitUntil: 'networkidle0' })
  await page.evaluate(() => sessionStorage.clear())
  await page.reload({ waitUntil: 'networkidle0' })
  await sleep(5000)
  await page.screenshot({ path: `${OUT}/v-1-idle.png` })

  await page.mouse.click(960, 620)
  await sleep(2100)
  await page.screenshot({ path: `${OUT}/v-2-opening.png` })
  await sleep(1400)
  await page.screenshot({ path: `${OUT}/v-3-threshold.png` })
  await sleep(1300)
  await page.screenshot({ path: `${OUT}/v-4-turning.png` })
  await sleep(2400)
  await page.screenshot({ path: `${OUT}/v-5-rest-001.png` })

  // hover focused cabinet
  await page.mouse.move(960, 560)
  await sleep(900)
  await page.screenshot({ path: `${OUT}/v-6-hover.png` })

  // nav to 003 (deeper view)
  await page.evaluate(() => document.querySelector('button[aria-label="View drop 003"]')?.click())
  await sleep(2100)
  await page.screenshot({ path: `${OUT}/v-7-rest-003.png` })

  // nav back to 001
  await page.evaluate(() => document.querySelector('button[aria-label="View drop 001"]')?.click())
  await sleep(2100)

  // skip to homepage
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'skip')
    if (b) b.click()
  })
  await sleep(1200)
  await page.screenshot({ path: `${OUT}/v-8-homepage.png` })

  // mobile viewport sanity
  await page.setViewport({ width: 390, height: 844 })
  await page.goto(BASE, { waitUntil: 'networkidle0' })
  await page.evaluate(() => sessionStorage.clear())
  await page.reload({ waitUntil: 'networkidle0' })
  await sleep(5000)
  await page.screenshot({ path: `${OUT}/v-9-mobile-idle.png` })

  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
