const puppeteer = require('puppeteer-core')

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox'],
    defaultViewport: { width: 1920, height: 1080 },
  })
  const page = await browser.newPage()
  await page.goto('http://localhost:5199', { waitUntil: 'networkidle0' })
  await page.evaluate(() => sessionStorage.clear())
  await page.reload({ waitUntil: 'networkidle0' })
  await sleep(4500)
  await page.mouse.click(960, 620)
  await sleep(6500)

  // straight down the room from the 003 depth
  await page.evaluate(() => {
    const room = document.querySelector('section[aria-label] > div > div')
    room.style.transform = 'rotateY(0deg) translate3d(0px, 0px, 3200px)'
  })
  await sleep(600)
  await page.screenshot({ path: 'tmp_shots/diag-straight-3200.png' })

  // same depth, yaw -44 (the 003 pose)
  await page.evaluate(() => {
    const room = document.querySelector('section[aria-label] > div > div')
    room.style.transform = 'rotateY(-44deg) translate3d(-200px, 0px, 3200px)'
  })
  await sleep(600)
  await page.screenshot({ path: 'tmp_shots/diag-yaw44-3200.png' })

  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
