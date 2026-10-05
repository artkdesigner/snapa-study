import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { splitLines, type SplitLinesResult } from './splitLines'

/*
  Появление Hero после прелоудера:
  'hidden' — прелоудер ещё идёт, элементы спрятаны;
  'play'   — Hero-logo → Button → строки Hero-title / Hero-sub-left /
             Hero-sub-right одновременно выезжают снизу из-под масок;
  'static' — без анимации (prefers-reduced-motion).
*/
export type HeroReveal = 'hidden' | 'play' | 'static'

// Тайминги — в макете не заданы, подобраны; крутить здесь.
const FADE_DURATION = 0.6
const FADE_EASE = 'power2.out'
const LINE_DURATION = 1.2
const LINE_STAGGER = 0.1 // между строками внутри одного блока
const LINE_EASE = 'expo.out'
// Маска строки продлена вниз, чтобы не резать хвосты g/p/y (у Title на
// десктопе line-height 1) — и стартовый сдвиг на столько же больше.
const MASK_BLEED_EM = 0.2

export function useHeroReveal(
  rootRef: RefObject<HTMLElement | null>,
  reveal: HeroReveal,
) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || reveal === 'static') return

    let splits: SplitLinesResult[] = []
    const revertSplits = () => {
      splits.forEach((split) => split.revert())
      splits = []
    }

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root)
      const logo = q('.Hero-logo')
      const button = q('.Hero-top-right .Button')
      const blocks = q('.Hero-title, .Hero-sub-wrap')

      gsap.set([logo, button, blocks], { autoAlpha: 0 })
      if (reveal !== 'play') return

      // Делим на строки только сейчас: шрифт уже загружен прелоудером, и
      // только видимые на этом брейкпоинте тексты (у Hero-sub-left их два).
      const texts = q('[data-reveal-lines]').filter(
        (el) => el.getClientRects().length > 0,
      )
      splits = texts.map((el) => splitLines(el))

      const tl = gsap.timeline({ onComplete: revertSplits })
      // clearProps: после появления убрать инлайновые opacity/visibility —
      // иначе инлайн `opacity: 1` перебивает hover:opacity-70 у Button.
      const shown = { autoAlpha: 1, clearProps: 'opacity,visibility' }
      const fade = { ...shown, duration: FADE_DURATION, ease: FADE_EASE }
      tl.to(logo, fade)
      tl.to(button, fade)
      tl.set(blocks, shown)
      tl.addLabel('lines')

      splits.forEach((split, i) => {
        const bleed =
          parseFloat(getComputedStyle(texts[i]).fontSize) * MASK_BLEED_EM
        gsap.set(split.masks, { paddingBottom: bleed, marginBottom: -bleed })
        tl.set(split.lines, { yPercent: 100, y: bleed }, 0)
        tl.to(
          split.lines,
          {
            yPercent: 0,
            y: 0,
            duration: LINE_DURATION,
            ease: LINE_EASE,
            stagger: LINE_STAGGER,
          },
          'lines',
        )
      })
    }, root)

    return () => {
      ctx.revert()
      revertSplits()
    }
  }, [rootRef, reveal])
}
