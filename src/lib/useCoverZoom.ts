import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { flowTop } from './flowTop'

gsap.registerPlugin(ScrollTrigger)

// Масштаб фона в момент, когда секция только показалась снизу.
const FROM_SCALE = 1.1

/*
  Секция наезжает на предыдущую: пока её верх идёт от низа экрана до верха,
  [data-cover-zoom] внутри неё уменьшается от FROM_SCALE до 1 (обёртке
  нужна обрезка). Привязано к скроллу (scrub), как затемнение накрываемой
  секции (useCoverOverlay), поэтому назад откатывается само.
*/
export function useCoverZoom(sectionRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const section = sectionRef.current
    const target = section?.querySelector('[data-cover-zoom]')
    if (!section || !target) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        target,
        { scale: FROM_SCALE },
        {
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            // по потоку — соседние секции прилипают (sticky), см. flowTop
            start: () => flowTop(section) - window.innerHeight,
            end: () => flowTop(section),
            scrub: true,
          },
        },
      )
    }, section)

    return () => ctx.revert()
  }, [sectionRef])
}
