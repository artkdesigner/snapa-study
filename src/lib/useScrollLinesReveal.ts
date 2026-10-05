import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { addLinesReveal, visibleTexts } from './linesReveal'

gsap.registerPlugin(ScrollTrigger)

// Когда запускать: верх первого текста дошёл до 85% высоты экрана.
const START = 'top 85%'

/*
  Строки всех [data-reveal-lines] внутри секции один раз выезжают снизу из-под
  масок, когда секция доскроллена до экрана. До этого тексты спрятаны; на
  строки они делятся только в момент запуска — по раскладке текущей ширины.
*/
export function useScrollLinesReveal(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let revertLines = () => {}
    const ctx = gsap.context(() => {}, root)

    ctx.add(() => {
      const texts = gsap.utils.toArray<HTMLElement>('[data-reveal-lines]', root)
      if (!texts.length) return
      gsap.set(texts, { autoAlpha: 0 })

      ScrollTrigger.create({
        trigger: texts[0],
        start: START,
        once: true,
        // ctx.add — чтобы таймлайн, созданный позже, тоже откатился в cleanup
        onEnter: () =>
          ctx.add(() => {
            const tl = gsap.timeline({ onComplete: () => revertLines() })
            tl.set(texts, { autoAlpha: 1, clearProps: 'opacity,visibility' })
            revertLines = addLinesReveal(tl, visibleTexts(texts), 0)
          }),
      })
    })

    return () => {
      ctx.revert()
      revertLines()
    }
  }, [rootRef])
}
