import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import BigPrint from '../components/BigPrint'
import Choose from '../components/Choose'
import Footer from '../components/Footer'
import Hero from '../components/Hero'
import Intro from '../components/Intro'
import Mask from '../components/Mask'
import Popup from '../components/Popup'
import Preloader from '../components/Preloader'
import Presets from '../components/Presets'
import Slider from '../components/Slider'
import Steps from '../components/Steps'
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
  // Попап заказа: открывают Order в Hero, слоган и Order в Footer.
  const [orderOpen, setOrderOpen] = useState(false)
  const openOrder = useCallback(() => setOrderOpen(true), [])
  const closeOrder = useCallback(() => setOrderOpen(false), [])
  // Плавный скролл; пока идёт прелоудер или открыт попап — прокрутка
  // страницы стоит.
  useSmoothScroll(heroReveal === 'hidden' || orderOpen)
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
          <Hero
            titleRef={heroTitleRef}
            reveal={heroReveal}
            onOrder={openOrder}
          />
          <Intro />
          <Slider />
          <Mask />
          <BigPrint />
          <Choose />
        </div>
        {/* Вторая стопка: на прилипший Presets наезжает Steps, на прилипший
            Steps — Footer. Footer внутри обёртки (и <main>): sticky держится
            только в пределах родителя. Отрицательный margin Presets
            (наложение на конец Choose) схлопывается с обёрткой, поэтому её
            верх = верх Presets (flowTop считает от него). */}
        <div className="Cover-stack">
          <Presets />
          <Steps />
          <Footer onOrder={openOrder} />
        </div>
      </main>
      <Popup open={orderOpen} onClose={closeOrder} />
    </>
  )
}

export default Home
