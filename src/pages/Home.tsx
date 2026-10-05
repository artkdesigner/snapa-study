import { useCallback, useRef, useState } from 'react'
import Hero from '../components/Hero'
import Intro from '../components/Intro'
import Preloader from '../components/Preloader'
import Slider from '../components/Slider'
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
        {/* Стопка наездов: Hero и Intro прилипают (sticky), каждая следующая
            секция (z выше) наезжает на предыдущую и затемняет её оверлеем.
            Прилипание ограничено обёрткой — дальше стопка уезжает целиком. */}
        <div ref={coverRef} className="Cover-stack">
          <Hero titleRef={heroTitleRef} reveal={heroReveal} />
          <Intro />
          <Slider />
        </div>
      </main>
    </>
  )
}

export default Home
