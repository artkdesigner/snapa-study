import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { flowTop } from './flowTop'

gsap.registerPlugin(ScrollTrigger)

// Непрозрачность оверлея, когда следующая секция накрыла секцию целиком.
const MAX_OPACITY = 0.5

/*
  Секция прилипает (sticky), следующая за ней наезжает сверху. Пока верх
  следующей секции идёт от низа экрана до верха, [data-cover-overlay] внутри
  этой секции темнеет от 0 до MAX_OPACITY. Привязано к скроллу (scrub),
  поэтому при прокрутке назад само откатывается.
  Хук вызывается в самой накрываемой секции: при её перерисовке (в т.ч.
  горячей перезагрузке в dev) он подхватывает актуальный элемент оверлея.
*/
export function useCoverOverlay(sectionRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const section = sectionRef.current
    const overlay = section?.querySelector('[data-cover-overlay]')
    const cover = section?.nextElementSibling
    if (!section || !overlay || !(cover instanceof HTMLElement)) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        overlay,
        { opacity: 0 },
        {
          opacity: MAX_OPACITY,
          ease: 'none',
          scrollTrigger: {
            // точки — по потоку: накрывающая секция тоже может быть sticky
            start: () => flowTop(cover) - window.innerHeight,
            end: () => flowTop(cover),
            scrub: true,
          },
        },
      )
    }, section)

    return () => ctx.revert()
  }, [sectionRef])
}
