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
import { flowTop } from './flowTop'

gsap.registerPlugin(ScrollTrigger)

// Точка запуска: верх секции дошёл до 30% высоты экрана — секция видна на
// 70% экрана (для секции высотой в экран — наехала на предыдущую на 70%).
const START_VIEWPORT = 0.3

/*
  Когда верх секции доскроллили до START_VIEWPORT, строки всех [data-reveal-lines]
  (и буквы [data-reveal-letters] — по одной, строка за строкой)
  выезжают снизу из-под масок — одной общей очередью по порядку разметки
  (строки следующего блока продолжают stagger предыдущего). При скролле
  назад выше этой точки все строки сразу и одновременно уезжают обратно (не
  обратным проигрыванием: оно начиналось бы с последнего блока и с почти
  неподвижного хвоста expo.out).
  На строки тексты делятся только на время анимации — по раскладке текущей
  ширины, в покое это обычный текст (ресайз переносы не ломает).
*/
export function useScrollLinesReveal(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const texts = gsap.utils.toArray<HTMLElement>(
      '[data-reveal-lines], [data-reveal-letters]',
      root,
    )
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
        // по потоку — секция может прилипать (sticky), см. flowTop
        start: () => flowTop(root) - window.innerHeight * START_VIEWPORT,
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
