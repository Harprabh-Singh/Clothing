/* Final verify: homepage has the click-to-enter sequence that stops at
 * frame 236 and rewinds on any upward scroll; drops bottom = CabinetRoom. */
const puppeteer = require('puppeteer-core')
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE = 'http://localhost:5199'
const OUT = 'tmp_shots'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu-sandbox', '--force-device-scale-factor=1'],
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  page.on('pageerror', (e) => console.log('PAGEERROR:', e.message))

  // ── homepage: sequence present, click-to-enter ─────────────────────────
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2', timeout: 60000 })
  await page.waitForFunction(
    () => document.body.innerText.toLowerCase().includes('click to enter'),
    { timeout: 60000 },
  ).catch(() => console.log('WARN: cue never appeared'))
  const geo = await page.evaluate(() => {
    const el = document.querySelector('[aria-label*="closet door"]')
    return { start: el.getBoundingClientRect().top + window.scrollY,
             height: el.offsetHeight, vh: window.innerHeight }
  })
  const yFor = (f) => geo.start + ((f - 1) / 240) * (geo.height - geo.vh)
  console.log('track:', geo, '· y(236) =', Math.round(yFor(236)))
  await sleep(400)
  await page.screenshot({ path: `${OUT}/fin-01-home-idle.png` })

  // scroll without click → must NOT auto-play
  await page.evaluate((y) => window.scrollTo(0, y), geo.start + 400)
  await sleep(1200)
  const yStill = await page.evaluate(() => window.scrollY)
  console.log('no-click stays:', Math.round(yStill), '(target', Math.round(geo.start + 400) + ')')

  // click → auto-play, must stop at frame 236
  await page.evaluate((y) => window.scrollTo(0, y), geo.start)
  await sleep(400)
  await page.mouse.click(720, 450)
  await sleep(3200)
  await page.screenshot({ path: `${OUT}/fin-02-mid-autoplay.png` })
  await sleep(5500)
  const yEnd = await page.evaluate(() => window.scrollY)
  console.log('END scrollY:', Math.round(yEnd), '· expected y(236):', Math.round(yFor(236)))
  await page.screenshot({ path: `${OUT}/fin-03-stopped-at-236.png` })

  // small scroll up → rewind to frame 1
  await page.evaluate((y) => window.scrollTo(0, y), yFor(230))
  await sleep(700)
  await page.screenshot({ path: `${OUT}/fin-04-rewind-start.png` })
  await sleep(5200)
  const yBack = await page.evaluate(() => window.scrollY)
  console.log('REWIND scrollY:', Math.round(yBack), '· expected y(1):', Math.round(yFor(1)))
  await page.screenshot({ path: `${OUT}/fin-05-back-at-frame1.png` })

  // ── drops page: CabinetRoom at the bottom, no sequence ─────────────────
  await page.goto(`${BASE}/drops`, { waitUntil: 'networkidle2', timeout: 60000 })
  await sleep(1500)
  const dropsHasSeq = await page.evaluate(() =>
    !!document.querySelector('[aria-label*="closet door"]'))
  const dropsHasCabinet = await page.evaluate(() =>
    !!document.querySelector('#cabinet-room'))
  console.log('drops has sequence:', dropsHasSeq, '· drops has cabinet room:', dropsHasCabinet)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await sleep(1500)
  await page.screenshot({ path: `${OUT}/fin-06-drops-bottom-cabinet.png` })

  await browser.close()
  console.log('DONE')
}
run().catch((e) => { console.error('FAILED:', e.message); process.exit(1) })
