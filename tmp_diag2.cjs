const puppeteer = require('puppeteer-core')
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function main() {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'], defaultViewport: { width: 960, height: 540 } })
  const page = await browser.newPage()
  await page.goto('http://localhost:5199', { waitUntil: 'networkidle0' })
  await sleep(4000)
  for (const yaw of [0, 45, -45, 180]) {
    await page.evaluate((y) => { const r = document.querySelector('section[aria-label] > div > div'); r.style.transform = 'translate3d(0px, 0px, 1200px) rotateY(' + y + 'deg)' }, yaw)
    await sleep(400)
    await page.screenshot({ path: 'tmp_shots/probe-' + (yaw < 0 ? 'neg' : yaw) + '.png' })
  }
  await browser.close()
}
main().catch((e) => { console.error(e); process.exit(1) })
