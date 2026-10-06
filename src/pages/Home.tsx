import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import BigPrint from '../components/BigPrint'
import Choose from '../components/Choose'
import Hero from '../components/Hero'
import Intro from '../components/Intro'
import Mask from '../components/Mask'
import Preloader from '../components/Preloader'
import Presets from '../components/Presets'
import Slider from '../components/Slider'
import type { HeroReveal } from '../lib/useHeroReveal'
import { restoreScroll } from '../lib/scrollMemory'
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
  // После перезагрузки — на то место, где остановились (после Lenis, под
  // прелоудером, до первой отрисовки).
  useLayoutEffect(restoreScroll, [])

  return (
    <>
      {heroReveal === 'hidden' && (
        <Preloader targetRef={heroTitleRef} onDone={handlePreloaderDone} />
      )}
      <main>
        {/* Стопка наездов: Hero, Intro, Slider, Mask и BigPrint прилипают
            (sticky), каждая следующая секция (z выше) наезжает на предыдущую, та
            затемняется своим оверлеем (useCoverOverlay в каждой из них).
            Прилипание ограничено обёрткой — дальше стопка уезжает целиком. */}
        <div className="Cover-stack">
          <Hero titleRef={heroTitleRef} reveal={heroReveal} />
          <Intro />
          <Slider />
          <Mask />
          <BigPrint />
          <Choose />
        </div>
        <Presets />
      </main>
    </>
  )
}

export default Home
