import { useCallback, useRef, useState } from 'react'
import Hero from '../components/Hero'
import Intro from '../components/Intro'
import Preloader from '../components/Preloader'
import type { HeroReveal } from '../lib/useHeroReveal'

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function Home() {
  const heroTitleRef = useRef<HTMLHeadingElement>(null)
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
        <Hero titleRef={heroTitleRef} reveal={heroReveal} />
        <Intro />
      </main>
    </>
  )
}

export default Home
