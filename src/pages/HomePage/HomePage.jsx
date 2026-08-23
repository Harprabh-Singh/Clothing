import NavBar from './navigation/NavBar'
import StoreExperience from './sections/StoreExperience/StoreExperience'
import FooterSection from './sections/FooterSection/FooterSection'

function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-ink)] text-[var(--color-bone)]">
      <NavBar />
      <StoreExperience />
      <FooterSection />
    </div>
  )
}

export default HomePage
