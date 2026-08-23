// Store drops — each drop is one rail inside the virtual store.
// Drops 004 + 003 hang on WALL A, drops 002 + 001 on WALL B (opposite side).
// Items reference products from src/pages/HomePage/data/products.js by id
// so tapping a garment routes to /shop/:productId.

const drops = [
  {
    id: '004',
    name: 'SIGNAL',
    serifWord: 'loud & clear.',
    season: 'FW — 26',
    status: 'LIVE NOW',
    side: 'A',
    accent: '#ff3ea5',
    note: 'Heavy fleece, split-ink panels and shells cut for bad weather and louder nights.',
    items: [
      { productId: '07', img: '/images/store/g-07.png', ratio: '2/3' },
      { productId: '01', img: '/images/store/g-01.png', ratio: '2/3' },
      { productId: '03', img: '/images/store/g-03.png', ratio: '2/3' },
    ],
  },
  {
    id: '003',
    name: 'NIGHT RAIN',
    serifWord: 'after the rain.',
    season: 'FW — 25',
    status: 'ARCHIVE',
    side: 'A',
    accent: '#2ee6ff',
    note: 'Heavyweight tees with hand-cut graphics and washed finishes, printed in very small runs.',
    items: [
      { productId: '04', img: '/images/store/g-04.png', ratio: '2/3' },
      { productId: '09', img: '/images/store/g-09.png', ratio: '2/3' },
      { productId: '12', img: '/images/store/g-12.png', ratio: '2/3' },
    ],
  },
  {
    id: '002',
    name: 'CONCRETE',
    serifWord: 'street & line.',
    season: 'SS — 25',
    status: 'ARCHIVE',
    side: 'B',
    accent: '#ff6b1a',
    note: 'Drop-cut cargos, tapered joggers and loose shorts built for the street and the train line.',
    items: [
      { productId: '02', img: '/images/store/g-02.png', ratio: '2/3' },
      { productId: '08', img: '/images/store/g-08.png', ratio: '2/3' },
      { productId: '11', img: '/images/store/g-11.png', ratio: '2/3' },
    ],
  },
  {
    id: '001',
    name: 'HARDWARE',
    serifWord: 'carry it well.',
    season: 'SS — 25',
    status: 'SOLD OUT',
    side: 'B',
    accent: '#8a5cff',
    note: 'Caps, beanies and compact carry — the sharp finishing pieces of the uniform.',
    items: [
      { productId: '05', img: '/images/store/g-05.png', ratio: '1/1' },
      { productId: '06', img: '/images/store/g-06.png', ratio: '1/1' },
      { productId: '10', img: '/images/store/g-10.png', ratio: '1/1' },
    ],
  },
]

export default drops
