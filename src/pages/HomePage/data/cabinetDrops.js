/**
 * cabinetDrops — the single source of truth for the 4 walk-in cabinets.
 *
 * Physical layout:
 *   index 0 — front-left  (largest, focused on arrival)
 *   index 1 — back-left   (behind / smaller)
 *   index 2 — front-right (mirror of front-left)
 *   index 3 — back-right  (mirror of back-left)
 *
 * Swipe order is: 0 → 1 → 2 → 3 → wrap
 *
 * Each item:
 *   id        — maps to products.js for routing to /shop/:id
 *   name      — display name
 *   price     — display price string
 *   frontImg  — existing front-facing product image (used for the
 *               "turned to face you" state)
 *   The profile/side view is rendered from the same frontImg with a
 *   CSS rotateY(72deg) pre-applied inside the cabinet interior so it
 *   reads as a garment hanging in profile on the rod. When selected
 *   it animates rotateY 72→0 (turn to face). No separate side-render
 *   assets needed.
 */
const cabinetDrops = [
  {
    id: 'drop-004',
    label: 'DROP 004',
    name: 'SIGNAL',
    season: 'FW — 26',
    status: 'LIVE NOW',
    accent: '#d8b26a',
    // per-drop color grade — applied to the door art so each swipe reads as a
    // distinct world: SIGNAL stays warm amber, pushed warmer
    grade: 'saturate(1.12) sepia(0.22) brightness(1.02)',
    tint: '#d8b26a',
    doorArt: '/images/cabinets/door-signal.jpg',
    wall: 'left',
    depth: 'front',
    items: [
      { id: '07', name: 'Signal Hoodie',  price: '$112', frontImg: '/images/store/g-07.png' },
      { id: '01', name: 'Riot Shell',     price: '$128', frontImg: '/images/store/g-01.png' },
      { id: '03', name: 'Stencil Jacket', price: '$164', frontImg: '/images/store/g-03.png' },
    ],
  },
  {
    id: 'drop-003',
    label: 'DROP 003',
    name: 'NIGHT RAIN',
    season: 'FW — 25',
    status: 'ARCHIVE',
    accent: '#9db8a4',
    // NIGHT RAIN — cooler, desaturated, blue-sage cast
    grade: 'saturate(0.62) brightness(0.92)',
    tint: '#8fb0c4',
    doorArt: '/images/cabinets/door-nightrain.jpg',
    wall: 'left',
    depth: 'back',
    items: [
      { id: '04', name: 'Bleed Tee',    price: '$54', frontImg: '/images/store/g-04.png' },
      { id: '09', name: 'Nocturne Tee', price: '$48', frontImg: '/images/store/g-09.png' },
      { id: '12', name: 'Tape Shirt',   price: '$64', frontImg: '/images/store/g-12.png' },
    ],
  },
  {
    id: 'drop-002',
    label: 'DROP 002',
    name: 'CONCRETE',
    season: 'SS — 25',
    status: 'ARCHIVE',
    accent: '#c98a5e',
    // CONCRETE — grayer, heavily desaturated stone mood
    grade: 'grayscale(0.5) brightness(0.97)',
    tint: '#9a938a',
    doorArt: '/images/cabinets/door-concrete.jpg',
    wall: 'right',
    depth: 'front',
    items: [
      { id: '02', name: 'Scab Cargo', price: '$96', frontImg: '/images/store/g-02.png' },
      { id: '08', name: 'Melt Jogger', price: '$88', frontImg: '/images/store/g-08.png' },
      { id: '11', name: 'Ash Short',   price: '$58', frontImg: '/images/store/g-11.png' },
    ],
  },
  {
    id: 'drop-001',
    label: 'DROP 001',
    name: 'HARDWARE',
    season: 'SS — 25',
    status: 'SOLD OUT',
    accent: '#8a94a6',
    // HARDWARE — cold steel, slightly brighter, blue-gray cast
    grade: 'saturate(0.78) brightness(1.04)',
    tint: '#8a94a6',
    doorArt: '/images/cabinets/door-hardware.jpg',
    wall: 'right',
    depth: 'back',
    items: [
      { id: '05', name: 'Crack Cap',   price: '$38', frontImg: '/images/store/g-05.png' },
      { id: '06', name: 'Static Bag',  price: '$72', frontImg: '/images/store/g-06.png' },
      { id: '10', name: 'Glue Beanie', price: '$34', frontImg: '/images/store/g-10.png' },
    ],
  },
]

export default cabinetDrops
