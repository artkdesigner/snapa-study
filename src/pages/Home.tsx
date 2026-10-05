import { useCallback, useRef, useState } from 'react'
import Hero from '../components/Hero'
import Intro from '../components/Intro'
import Mask from '../components/Mask'
import Preloader from '../components/Preloader'
import Slider from '../components/Slider'
import type { HeroReveal } from '../lib/useHeroReveal'
import { useSmoothScroll } from '../lib/useSmoothScroll'

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function Home() {
  const heroTitleRef = useRef<HTMLHeadingElement>(null)
  // Сначала прелоудер (Hero спрятан), после него — появление элементов Hero.
  const [heroReveal, setHeroReveal] = useState<HeroReveal>(() =>
    prefersReducedMotion() ? 'static' : 'hidden',
  )
  const handlePreloaderDone = useCallback(() => setHeroReveal('play'), [])
  // Плавный скролл; пока идёт прелоудер — прокрутка стоит.
  useSmoothScroll(heroReveal === 'hidden')

  return (
    <>
      {heroReveal === 'hidden' && (
        <Preloader targetRef={heroTitleRef} onDone={handlePreloaderDone} />
      )}
      <main>
        {/* Стопка наездов: Hero, Intro и Slider прилипают (sticky), каждая
            следующая секция (z выше) наезжает на предыдущую, та затемняется
            своим оверлеем (useCoverOverlay в Hero, Intro и Slider).
            Прилипание ограничено обёрткой — дальше стопка уезжает целиком. */}
        <div className="Cover-stack">
          <Hero titleRef={heroTitleRef} reveal={heroReveal} />
          <Intro />
          <Slider />
          <Mask />
        </div>
      </main>
    </>
  )
}

export default Home
