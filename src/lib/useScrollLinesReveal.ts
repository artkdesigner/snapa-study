import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { addLinesReveal, visibleTexts } from './linesReveal'

gsap.registerPlugin(ScrollTrigger)

// Точка запуска: верх секции дошёл до середины экрана — для секции высотой
// в экран это значит, что она наехала на предыдущую наполовину.
const START = 'top 50%'

/*
  Строки всех [data-reveal-lines] внутри секции выезжают снизу из-под масок
  (блоки по порядку в разметке: следующий — после окончания предыдущего),
  когда верх секции доскроллили до START, и уезжают обратно, когда скроллят назад
  выше неё. На строки тексты делятся только на время анимации — по раскладке
  текущей ширины, в покое это обычный текст (ресайз переносы не ломает).
*/
export function useScrollLinesReveal(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const texts = gsap.utils.toArray<HTMLElement>('[data-reveal-lines]', root)
    if (!texts.length) return

    let tl: gsap.core.Timeline | null = null
    let revertLines = () => {}
    const ctx = gsap.context(() => {}, root)

    // Таймлайн живёт только пока идёт анимация в одну из сторон.
    const finish = () => {
      revertLines()
      tl?.kill()
      tl = null
    }
    const build = () => {
      const timeline = gsap.timeline({
        paused: true,
        onComplete: finish,
        onReverseComplete: () => {
          gsap.set(texts, { autoAlpha: 0 })
          finish()
        },
      })
      revertLines = addLinesReveal(timeline, visibleTexts(texts), 0, {
        sequence: true,
      })
      return timeline
    }

    // ctx.add — чтобы созданное в колбэках скролла откатилось в cleanup.
    const show = () =>
      ctx.add(() => {
        tl ??= build()
        gsap.set(texts, { autoAlpha: 1 })
        tl.play()
      })
    const hide = () =>
      ctx.add(() => {
        // Текст уже стоит целиком — делим и начинаем с конца анимации.
        tl ??= build().progress(1, true) // true — без onComplete
        tl.reverse()
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
      revertLines()
    }
  }, [rootRef])
}
