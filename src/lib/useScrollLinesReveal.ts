import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  addLinesIn,
  addLinesOut,
  hideLinesNow,
  prepareLines,
  visibleTexts,
  type PreparedLines,
} from './linesReveal'

gsap.registerPlugin(ScrollTrigger)

// Точка запуска: верх секции дошёл до середины экрана — для секции высотой
// в экран это значит, что она наехала на предыдущую наполовину.
const START = 'top 50%'

/*
  Когда верх секции доскроллили до START, строки всех [data-reveal-lines]
  выезжают снизу из-под масок — блоки по порядку разметки, следующий после
  окончания предыдущего. При скролле назад выше START все строки сразу и
  одновременно уезжают обратно (не обратным проигрыванием: оно начиналось бы
  с последнего блока и с почти неподвижного хвоста expo.out).
  На строки тексты делятся только на время анимации — по раскладке текущей
  ширины, в покое это обычный текст (ресайз переносы не ломает).
*/
export function useScrollLinesReveal(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const texts = gsap.utils.toArray<HTMLElement>('[data-reveal-lines]', root)
    if (!texts.length) return

    // Пока идёт анимация в любую сторону — тексты поделены на строки; смена
    // направления на ходу подхватывает строки с того места, где они сейчас.
    let prepared: PreparedLines | null = null
    let tl: gsap.core.Timeline | null = null
    const reset = () => {
      tl?.kill()
      tl = null
      prepared?.revert()
      prepared = null
    }
    const ctx = gsap.context(() => {}, root)

    // ctx.add — чтобы созданное в колбэках скролла откатилось в cleanup.
    const show = () =>
      ctx.add(() => {
        tl?.kill()
        if (!prepared) {
          // Не поделены — значит, тексты спрятаны целиком.
          prepared = prepareLines(visibleTexts(texts))
          hideLinesNow(prepared.blocks)
          gsap.set(texts, { autoAlpha: 1 })
        }
        tl = gsap.timeline({ onComplete: reset })
        addLinesIn(tl, prepared.blocks, 0, { sequence: true })
      })
    const hide = () =>
      ctx.add(() => {
        tl?.kill()
        // Не поделены — значит, тексты стоят целиком, строки на месте.
        prepared ??= prepareLines(visibleTexts(texts))
        tl = gsap.timeline({
          onComplete: () => {
            gsap.set(texts, { autoAlpha: 0 })
            reset()
          },
        })
        addLinesOut(tl, prepared.blocks, 0)
      })

    ctx.add(() => {
      gsap.set(texts, { autoAlpha: 0 })
      ScrollTrigger.create({
        trigger: root,
        start: START,
        onEnter: show,
        onLeaveBack: hide,
      })
    })

    return () => {
      ctx.revert()
      reset()
    }
  }, [rootRef])
}
