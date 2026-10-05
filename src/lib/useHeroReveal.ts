import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { addLinesReveal, visibleTexts } from './linesReveal'

/*
  Появление Hero после прелоудера:
  'hidden' — прелоудер ещё идёт, элементы спрятаны;
  'play'   — Hero-logo → Button → строки Hero-title / Hero-sub-left /
             Hero-sub-right одновременно выезжают снизу из-под масок;
  'static' — без анимации (prefers-reduced-motion).
*/
export type HeroReveal = 'hidden' | 'play' | 'static'

// Тайминги — в макете не заданы, подобраны; крутить здесь (строки — в
// linesReveal.ts).
const FADE_DURATION = 1.2
const FADE_EASE = 'power2.out'

export function useHeroReveal(
  rootRef: RefObject<HTMLElement | null>,
  reveal: HeroReveal,
) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || reveal === 'static') return

    let revertLines = () => {}

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root)
      const logo = q('.Hero-logo')
      const button = q('.Hero-top-right .Button')
      const blocks = q('.Hero-title, .Hero-sub-wrap')

      gsap.set([logo, button, blocks], { autoAlpha: 0 })
      // CSS-переход opacity у Button (hover) сглаживал бы каждый кадр GSAP.
      gsap.set(button, { transition: 'none' })
      if (reveal !== 'play') return

      const tl = gsap.timeline({ onComplete: () => revertLines() })
      // clearProps: после появления убрать инлайновые opacity/visibility —
      // иначе инлайн `opacity: 1` перебивает hover:opacity-70 у Button.
      const shown = { autoAlpha: 1, clearProps: 'opacity,visibility' }
      const fade = { ...shown, duration: FADE_DURATION, ease: FADE_EASE }
      tl.to(logo, fade)
      tl.to(button, { ...fade, clearProps: 'opacity,visibility,transition' })
      tl.set(blocks, shown)
      tl.addLabel('lines')

      // Делим на строки только сейчас: шрифт уже загружен прелоудером, и
      // только видимые на этом брейкпоинте тексты (у Hero-sub-left их два).
      revertLines = addLinesReveal(
        tl,
        visibleTexts(q('[data-reveal-lines]')),
        'lines',
      )
    }, root)

    return () => {
      ctx.revert()
      revertLines()
    }
  }, [rootRef, reveal])
}
