import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { flowTop } from './flowTop'

gsap.registerPlugin(ScrollTrigger)

// Непрозрачность оверлея, когда следующая секция накрыла секцию целиком.
const MAX_OPACITY = 0.5

/*
  Секции внутри rootRef наезжают друг на друга: накрываемая прилипает
  (sticky), следующая за ней наезжает сверху. Для каждого [data-cover-overlay]
  (оверлей внутри накрываемой секции): пока верх следующей секции идёт от
  низа экрана до верха, оверлей темнеет от 0 до MAX_OPACITY. Привязано к
  скроллу (scrub), поэтому при прокрутке назад само откатывается.
*/
export function useCoverOverlay(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const ctx = gsap.context(() => {
      root
        .querySelectorAll<HTMLElement>('[data-cover-overlay]')
        .forEach((overlay) => {
          const cover = overlay.closest('section')?.nextElementSibling
          if (!(cover instanceof HTMLElement)) return

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
        })
    }, root)

    return () => ctx.revert()
  }, [rootRef])
}
