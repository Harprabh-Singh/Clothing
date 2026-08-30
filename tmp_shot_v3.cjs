/* Re-record: swipe between doors + garment pull-forward (post-fix). */
const puppeteer = require('puppeteer-core')
const fs = require('fs')

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE = 'http://localhost:5199/'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function captureFrames(page, dir, count, intervalMs, actions) {
  fs.rmSync(dir, { recursive: true, force: true })
  fs.mkdirSync(dir, { recursive: true })
  const started = Date.now()
  let shot = 0
  const actQueue = [...(actions || [])]
  for (let i = 0; i < count; i++) {
    const t = Date.now() - started
    while (actQueue.length && t >= actQueue[0].at) {
      await actQueue.shift().run()
    }
    await page.screenshot({ path: `${dir}/f${String(shot++).padStart(3, '0')}.png` })
    const wait = (i + 1) * intervalMs - (Date.now() - started)
    if (wait > 0) await sleep(wait)
  }
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu-sandbox', '--force-device-scale-factor=1'],
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800 })
  page.on('pageerror', (e) => console.log('PAGEERROR:', e.message))

  await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 })
  await sleep(700)
  await page.click('[data-layer="door"]')
  await sleep(4200)

  // RECORDING 1 — swipe SIGNAL → NIGHT RAIN (slow drag, 34 frames)
  await captureFrames(page, 'tmp_rec/swipe', 34, 80, [
    { at: 350, run: async () => {
        await page.mouse.move(640, 400)
        await page.mouse.down()
        for (let s = 1; s <= 14; s++) {
          await page.mouse.move(640 - 38 * s, 400)
          await sleep(40)
        }
        await page.mouse.up()
      } },
  ])
  await page.screenshot({ path: 'tmp_shots/v3b-after-swipe.png' })

  // open interior on NIGHT RAIN, let it settle
  await sleep(700)
  await page.click('#door-open-drop-003')
  await sleep(1600)

  // RECORDING 2 — select garment 0 (pull forward), then step to next
  await captureFrames(page, 'tmp_rec/select', 36, 85, [
    { at: 350, run: () => page.click('#garment-drop-003-0') },
    { at: 2200, run: () => page.click('[aria-label="Next garment"]') },
  ])
  await page.screenshot({ path: 'tmp_shots/v3b-selected-center.png' })

  await browser.close()
  console.log('DONE')
}
run().catch((e) => { console.error('FAILED:', e.message); process.exit(1) })
