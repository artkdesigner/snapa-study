import { useCallback, useRef, useState } from 'react'
import Hero from '../components/Hero'
import Intro from '../components/Intro'
import Preloader from '../components/Preloader'
import type { HeroReveal } from '../lib/useHeroReveal'
import { useCoverOverlay } from '../lib/useCoverOverlay'

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function Home() {
  const heroTitleRef = useRef<HTMLHeadingElement>(null)
  const coverRef = useRef<HTMLDivElement>(null)
  useCoverOverlay(coverRef)
  // Сначала прелоудер (Hero спрятан), после него — появление элементов Hero.
  const [heroReveal, setHeroReveal] = useState<HeroReveal>(() =>
    prefersReducedMotion() ? 'static' : 'hidden',
  )
  const handlePreloaderDone = useCallback(() => setHeroReveal('play'), [])

  return (
    <>
      {heroReveal === 'hidden' && (
        <Preloader targetRef={heroTitleRef} onDone={handlePreloaderDone} />
      )}
      <main>
        {/* Hero прилипает, Intro наезжает на него. Обёртка ограничивает
            прилипание этой парой: дальше Hero уезжает вместе с ней. */}
        <div ref={coverRef} className="Hero-cover">
          <Hero titleRef={heroTitleRef} reveal={heroReveal} />
          <Intro />
        </div>
      </main>
    </>
  )
}

export default Home
