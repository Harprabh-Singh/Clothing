import { useCallback, useState } from 'react'
import EntryDoor from '../../components/EntryDoor'
import ClosetInterior from '../../components/ClosetInterior'
import NavBar from './navigation/NavBar'
import DoorSequence from './sections/GarmentSequence/DoorSequence'
import ProductGrid from './sections/ProductSection/ProductGrid'
import AboutSection from './sections/AboutSection/AboutSection'
import NewsletterSection from './sections/NewsletterSection/NewsletterSection'
import FooterSection from './sections/FooterSection/FooterSection'

function HomePage({ onEntryPassed }) {
  // the door is the entire focus on load — the navbar fades in and the rest
  // of the homepage mounts only after the entry sequence completes (or skips)
  const [entryPassed, setEntryPassed] = useState(false)
  const handlePassed = useCallback(
    (passed) => {
      setEntryPassed(passed)
      onEntryPassed?.(passed)
    },
    [onEntryPassed],
  )

  return (
    <div className="min-h-screen bg-[var(--color-ink)] text-[var(--color-bone)]">
      <EntryDoor onPassedChange={handlePassed} />
      <div
        className={`transition-opacity duration-700 ${entryPassed ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        aria-hidden={!entryPassed}
      >
        <NavBar />
      </div>
      <main>
        {entryPassed && (
          <>
            <ClosetInterior />
            <DoorSequence />
            <ProductGrid />
            <AboutSection />
            <NewsletterSection />
          </>
        )}
      </main>
      {entryPassed && <FooterSection />}
    </div>
  )
}

export default HomePage
