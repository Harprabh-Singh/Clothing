import NavBar from './navigation/NavBar'
import GarmentSequence from './sections/GarmentSequence/GarmentSequence'
import ProductGrid from './sections/ProductSection/ProductGrid'
import AboutSection from './sections/AboutSection/AboutSection'
import NewsletterSection from './sections/NewsletterSection/NewsletterSection'
import FooterSection from './sections/FooterSection/FooterSection'

function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-ink)] text-[var(--color-bone)]">
      <NavBar />
      <main>
        <GarmentSequence />
        <ProductGrid />
        <AboutSection />
        <NewsletterSection />
      </main>
      <FooterSection />
    </div>
  )
}

export default HomePage
