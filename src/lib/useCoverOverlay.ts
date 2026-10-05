import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Непрозрачность оверлея, когда Intro накрыл Hero целиком.
const MAX_OPACITY = 0.5

/*
  Пока Intro наезжает на прилипший Hero (верх Intro идёт от низа экрана до
  верха), Hero-overlay темнеет от 0 до MAX_OPACITY. Привязано к скроллу
  (scrub), поэтому при прокрутке назад само откатывается.
*/
export function useCoverOverlay(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current
    const overlay = root?.querySelector('.Hero-overlay')
    const cover = root?.querySelector('.Intro')
    if (!root || !overlay || !cover) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        overlay,
        { opacity: 0 },
        {
          opacity: MAX_OPACITY,
          ease: 'none',
          scrollTrigger: {
            trigger: cover,
            start: 'top bottom',
            end: 'top top',
            scrub: true,
          },
        },
      )
    }, root)

    return () => ctx.revert()
  }, [rootRef])
}
